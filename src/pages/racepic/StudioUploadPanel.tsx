import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchLicenses, fetchMyEventAccess, type LicenseOption, type PhotographerEventAccess } from '@/integrations/racepic/client';
import { useStudioUploader } from './useStudioUploader';

/** Batch-Upload-Panel im Studio-Dashboard (Paket 3b), siehe useStudioUploader.ts fuer die Logik. */
export default function StudioUploadPanel() {
  const [events, setEvents] = useState<PhotographerEventAccess[]>([]);
  const [licenses, setLicenses] = useState<LicenseOption[]>([]);
  const [eventId, setEventId] = useState<string>('');
  const [licenseId, setLicenseId] = useState<string>('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([fetchMyEventAccess(), fetchLicenses()])
      .then(([eventsResult, licensesResult]) => {
        setEvents(eventsResult.events);
        const freeLicenses = licensesResult.licenses.filter((license) => license.pricingKind === 'FREE');
        setLicenses(freeLicenses);
        if (eventsResult.events.length === 1) setEventId(eventsResult.events[0].eventId);
        if (freeLicenses.length > 0) setLicenseId(freeLicenses[0].id);
      })
      .catch(() => setLoadError(true));
  }, []);

  const uploader = useStudioUploader(eventId, licenseId);
  const ready = eventId.length > 0 && licenseId.length > 0;

  const onFilesSelected = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || !ready) return;
      uploader.addFiles(fileList);
    },
    [ready, uploader]
  );

  if (loadError) {
    return <p className="text-destructive">Events/Lizenzen konnten nicht geladen werden.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Event</label>
          <Select value={eventId} onValueChange={setEventId} disabled={events.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={events.length === 0 ? 'Kein Event freigeschaltet' : 'Event wählen'} />
            </SelectTrigger>
            <SelectContent>
              {events.map((item) => (
                <SelectItem key={item.eventId} value={item.eventId}>
                  {item.eventName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Lizenz</label>
          <Select value={licenseId} onValueChange={setLicenseId} disabled={licenses.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Lizenz wählen" />
            </SelectTrigger>
            <SelectContent>
              {licenses.map((license) => (
                <SelectItem key={license.id} value={license.id}>
                  {license.title.de ?? license.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <label
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center ${ready ? 'cursor-pointer hover:border-accent' : 'cursor-not-allowed opacity-50'}`}
      >
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <span className="font-medium">JPEG-Dateien hierher ziehen oder klicken</span>
        <span className="text-sm text-muted-foreground">Bis zu 80 MB pro Datei</span>
        <input
          type="file"
          accept="image/jpeg"
          multiple
          disabled={!ready}
          className="hidden"
          onChange={(event) => {
            onFilesSelected(event.target.files);
            event.target.value = '';
          }}
        />
      </label>

      {uploader.items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {uploader.stats.done} / {uploader.stats.total} hochgeladen
              {uploader.stats.failed > 0 && `, ${uploader.stats.failed} fehlgeschlagen`}
            </p>
            <Button onClick={() => uploader.start()} disabled={uploader.stats.uploading > 0}>
              {uploader.stats.uploading > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload starten'}
            </Button>
          </div>

          <ul className="space-y-2">
            {uploader.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  {item.status === 'uploading' && <Progress value={item.progress} className="mt-1 h-1.5" />}
                  {item.status === 'error' && <p className="mt-1 text-xs text-destructive">{item.error}</p>}
                </div>
                {item.status === 'done' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                {item.status === 'error' && (
                  <Button size="sm" variant="outline" onClick={() => uploader.retry(item.id)}>
                    <AlertCircle className="mr-1 h-4 w-4" /> Erneut
                  </Button>
                )}
                {item.status === 'queued' && (
                  <Button size="icon" variant="ghost" onClick={() => uploader.removeQueued(item.id)} aria-label="Entfernen">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
