import { useCallback, useRef, useState } from 'react';
import {
  abortUpload,
  completeUpload,
  createUpload,
  createUploadBatch,
  listUploadedParts,
  presignUploadParts,
  putWithProgress,
  RacePicApiError,
  type UploadBatch
} from '@/integrations/racepic/client';

/**
 * Studio-Uploader (Paket 3b), siehe docs/memory-bank/racepic-architecture.md Abschnitt D.
 *
 * Bewusste Abweichung vom Architektur-Vorschlag "Uppy (Core, @uppy/aws-s3)": Uppys `AwsS3`-Plugin
 * (v6) erwartet, dass der Client den S3-Key waehlt und der Server nur signiert; unsere API laesst
 * dagegen den Server den Key + (bei grossen Dateien) den Multipart-Upload selbst anlegen (siehe
 * api/src/racepic/uploads.ts) - das ist bewusst so gebaut (serverseitige Kontrolle ueber Groesse/
 * MIME/Kontingent, bevor irgendein S3-Request signiert wird). Ein Adapter zwischen beiden Modellen
 * waere zusaetzliche, schwer lokal testbare Komplexitaet; ein schlanker eigener Uploader passt
 * direkter zur bereits gebauten und mit `cdk synth` verifizierten Backend-API. Uppy kann bei Bedarf
 * spaeter nachgezogen werden, wenn Companion/eine andere Signierstrategie gewuenscht ist.
 *
 * Resume nach Tab-/Seiten-Reload (IndexedDB-Persistenz laut Architekturplan) ist hier noch nicht
 * umgesetzt - nur "Resume waehrend derselben Session" ueber `listUploadedParts` bei erneutem Retry.
 */

const PART_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_CONCURRENT_FILES = 3;

export type UploadItemStatus = 'queued' | 'uploading' | 'done' | 'error';

export type UploadItem = {
  id: string;
  file: File;
  status: UploadItemStatus;
  progress: number; // 0-100
  error: string | null;
  uploadId: string | null;
};

const fileFingerprint = (file: File): string => `${file.name}:${file.size}:${file.lastModified}`;

const errorMessage = (error: unknown): string => {
  if (error instanceof RacePicApiError) {
    switch (error.code) {
      case 'RACEPIC_UPLOAD_DUPLICATE_IN_BATCH':
        return 'Diese Datei wurde in diesem Batch bereits hochgeladen.';
      case 'RACEPIC_UPLOAD_CONTENT_TYPE_UNSUPPORTED':
        return 'Nur JPEG-Dateien werden aktuell unterstützt.';
      case 'RACEPIC_UPLOAD_SIZE_INVALID':
        return 'Datei ist zu groß oder ungültig.';
      case 'RACEPIC_UPLOAD_QUOTA_EXCEEDED':
        return 'Das Upload-Kontingent für dieses Event ist erreicht.';
      default:
        return 'Upload fehlgeschlagen.';
    }
  }
  return 'Upload fehlgeschlagen.';
};

export function useStudioUploader(eventId: string, licenseId: string) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const batchRef = useRef<UploadBatch | null>(null);
  const runningRef = useRef(false);

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: UploadItem[] = Array.from(files)
      .filter((file) => file.type === 'image/jpeg')
      .map((file) => ({ id: `${fileFingerprint(file)}-${crypto.randomUUID()}`, file, status: 'queued', progress: 0, error: null, uploadId: null }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const ensureBatch = useCallback(async (): Promise<UploadBatch> => {
    if (batchRef.current) return batchRef.current;
    const { batch } = await createUploadBatch(eventId, licenseId);
    batchRef.current = batch;
    return batch;
  }, [eventId, licenseId]);

  const uploadSingle = async (item: UploadItem, uploadUrl: string) => {
    await putWithProgress(uploadUrl, item.file, 'image/jpeg', (loaded, total) => updateItem(item.id, { progress: Math.round((loaded / total) * 100) }));
  };

  const uploadMultipart = async (item: UploadItem, uploadId: string) => {
    const totalParts = Math.ceil(item.file.size / PART_SIZE_BYTES);
    const partNumbers = Array.from({ length: totalParts }, (_, index) => index + 1);
    // Session-Resume: bereits hochgeladene Teile (z. B. nach einem Retry) nicht erneut senden.
    const alreadyUploaded = await listUploadedParts(uploadId).then(
      (result) => new Map<number, string>(result.parts.map((part) => [part.partNumber, part.eTag]))
    );
    const remaining = partNumbers.filter((partNumber) => !alreadyUploaded.has(partNumber));
    const presigned: { partNumber: number; url: string }[] = remaining.length > 0 ? (await presignUploadParts(uploadId, remaining)).parts : [];
    const presignedByNumber = new Map<number, string>(presigned.map((part) => [part.partNumber, part.url]));

    const completedParts = new Map(alreadyUploaded);
    let bytesDone = [...alreadyUploaded.keys()].reduce((sum, partNumber) => sum + Math.min(PART_SIZE_BYTES, item.file.size - (partNumber - 1) * PART_SIZE_BYTES), 0);

    for (const partNumber of remaining) {
      const url = presignedByNumber.get(partNumber);
      if (!url) continue;
      const start = (partNumber - 1) * PART_SIZE_BYTES;
      const chunk = item.file.slice(start, Math.min(start + PART_SIZE_BYTES, item.file.size));
      const previousBytesDone = bytesDone;
      const eTag = await putWithProgress(url, chunk, 'image/jpeg', (loaded) => {
        updateItem(item.id, { progress: Math.round(((previousBytesDone + loaded) / item.file.size) * 100) });
      });
      if (!eTag) throw new Error('MISSING_ETAG');
      completedParts.set(partNumber, eTag);
      bytesDone += chunk.size;
    }

    return partNumbers.map((partNumber) => ({ partNumber, eTag: completedParts.get(partNumber)! }));
  };

  const processItem = useCallback(
    async (item: UploadItem) => {
      updateItem(item.id, { status: 'uploading', progress: 0, error: null });
      try {
        const batch = await ensureBatch();
        const { upload, uploadUrl, s3UploadId } = await createUpload(batch.id, {
          name: item.file.name,
          type: 'image/jpeg',
          size: item.file.size,
          fingerprint: fileFingerprint(item.file)
        });
        updateItem(item.id, { uploadId: upload.id });

        if (s3UploadId) {
          const parts = await uploadMultipart(item, upload.id);
          await completeUpload(upload.id, parts);
        } else if (uploadUrl) {
          await uploadSingle(item, uploadUrl);
          await completeUpload(upload.id);
        } else {
          throw new Error('NO_UPLOAD_TARGET');
        }
        updateItem(item.id, { status: 'done', progress: 100 });
      } catch (error) {
        updateItem(item.id, { status: 'error', error: errorMessage(error) });
      }
    },
    [ensureBatch, updateItem]
  );

  const start = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      // Worker-Pool ueber einen gemeinsamen Index statt ueber den React-State zu iterieren - der
      // waere hier nur eine Momentaufnahme zum Zeitpunkt des Aufrufs und wuerde sich waehrend der
      // laufenden Uploads nicht aktualisieren.
      const queue = items.filter((item) => item.status === 'queued');
      let cursor = 0;
      const worker = async () => {
        while (cursor < queue.length) {
          const item = queue[cursor];
          cursor += 1;
          await processItem(item);
        }
      };
      await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_FILES, queue.length) }, () => worker()));
    } finally {
      runningRef.current = false;
    }
  }, [items, processItem]);

  const retry = useCallback(
    (id: string) => {
      // Direkt fuer dieses eine Item erneut ausfuehren statt ueber start() - dessen Queue-Snapshot
      // wuerde den gerade zurueckgesetzten Status wegen React's asynchronem State-Update sonst
      // noch nicht sehen.
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      const resetItem: UploadItem = { ...item, status: 'queued', error: null, progress: 0 };
      setItems((prev) => prev.map((entry) => (entry.id === id ? resetItem : entry)));
      void processItem(resetItem);
    },
    [items, processItem]
  );

  const removeQueued = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id || item.status !== 'queued'));
  }, []);

  const cancel = useCallback(async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (item?.uploadId && item.status === 'uploading') {
      await abortUpload(item.uploadId).catch(() => undefined);
    }
  }, [items]);

  const stats = {
    total: items.length,
    done: items.filter((item) => item.status === 'done').length,
    failed: items.filter((item) => item.status === 'error').length,
    uploading: items.filter((item) => item.status === 'uploading').length
  };

  return { items, addFiles, start, retry, removeQueued, cancel, stats };
}
