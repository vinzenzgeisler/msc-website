import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, FileText, Loader2, Plus, Search, Upload } from 'lucide-react';
import { Download as DownloadRecord } from '@/integrations/pocketbase/client';
import { useCreateDownload, useDownloads } from '@/hooks/useDownloads';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

interface DownloadAssetPickerProps {
  onSelect: (download: DownloadRecord) => void;
  buttonLabel?: string;
  trigger?: React.ReactNode;
  uploadCategory?: string;
}

export function DownloadAssetPicker({
  onSelect,
  buttonLabel = 'Dokument auswählen',
  trigger,
  uploadCategory = 'allgemein',
}: DownloadAssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: downloads, isLoading } = useDownloads();
  const createDownload = useCreateDownload();

  const filteredDownloads = useMemo(() => {
    const query = search.trim().toLowerCase();
    const available = downloads || [];

    if (!query) return available;

    return available.filter((download) =>
      download.title.toLowerCase().includes(query)
      || (download.file_name || '').toLowerCase().includes(query)
      || (download.category || '').toLowerCase().includes(query),
    );
  }, [downloads, search]);

  const handleSelect = useCallback((download: DownloadRecord) => {
    setSelectingId(download.id);
    onSelect(download);
    setOpen(false);
    setSearch('');
    setSelectingId(null);
    toast.success('Dokument übernommen');
  }, [onSelect]);

  const handleUpload = useCallback(async (file: File, titleOverride?: string) => {
    const resolvedTitle = (titleOverride || uploadTitle || file.name.replace(/\.[^.]+$/, '')).trim();

    if (!resolvedTitle) {
      toast.error('Bitte einen Titel eingeben');
      return;
    }

    try {
      const created = await createDownload.mutateAsync({
        title: resolvedTitle,
        file,
        category: uploadCategory,
      });
      onSelect(created);
      setUploadTitle('');
      setUploadFile(null);
      setOpen(false);
      toast.success('Dokument hochgeladen und übernommen');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Upload fehlgeschlagen'));
    }
  }, [createDownload, onSelect, uploadCategory, uploadTitle]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    if (file && !uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
    e.target.value = '';
  }, [uploadTitle]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  }, [uploadTitle]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Dokument auswählen</DialogTitle>
          <DialogDescription>
            Vorhandene Downloads übernehmen oder ein neues Dokument direkt hochladen.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse">Vorhandene Dokumente</TabsTrigger>
            <TabsTrigger value="upload">Hochladen</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nach Titel, Dateiname oder Kategorie suchen..."
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[50vh] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : filteredDownloads.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Keine Dokumente gefunden
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredDownloads.map((download) => (
                    <button
                      key={download.id}
                      type="button"
                      className="rounded-lg border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
                      onClick={() => handleSelect(download)}
                      disabled={selectingId === download.id}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-3">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate text-sm font-medium">{download.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {download.file_name || 'Ohne Dateiname'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {download.category || 'ohne Kategorie'} · {download.file_type?.toUpperCase() || 'DATEI'}
                          </p>
                          {selectingId === download.id ? (
                            <div className="pt-1 text-xs text-primary">Wird übernommen...</div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titel</label>
              <Input
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="z. B. Ausschreibung 2026"
                className="max-w-xl"
              />
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {createDownload.isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Dokument hierher ziehen</p>
                    <p className="mt-1 text-sm text-muted-foreground">oder klicken zum Auswählen</p>
                  </div>
                  {uploadFile ? (
                    <p className="text-sm text-muted-foreground">{uploadFile.name}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, ODT, JPG, PNG, ZIP, TXT</p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Datei auswählen
                    </Button>
                    <Button
                      type="button"
                      disabled={!uploadFile || !uploadTitle.trim()}
                      onClick={() => uploadFile && handleUpload(uploadFile)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Hochladen und übernehmen
                    </Button>
                  </div>
                </div>
              )}

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.odt,.jpg,.jpeg,.png,.webp,.zip,.txt"
              className="hidden"
              onChange={onFileChange}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
