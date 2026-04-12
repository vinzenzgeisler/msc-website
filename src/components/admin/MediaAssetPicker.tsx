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
import { Image as ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { useMediaFiles, useUploadMediaFile } from '@/hooks/useMedia';
import { pb } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';

interface MediaAssetPickerProps {
  onSelect: (file: File, altText?: string) => void;
  /** When provided, called with the raw URL instead of downloading as File */
  onSelectUrl?: (url: string, altText?: string) => void;
  buttonLabel?: string;
  /** Render a custom trigger instead of the default button */
  trigger?: React.ReactNode;
}

export function MediaAssetPicker({ onSelect, onSelectUrl, buttonLabel = 'Aus Medien wählen', trigger }: MediaAssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: mediaFiles, isLoading, refetch } = useMediaFiles();

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mediaFiles || [];

    return (mediaFiles || []).filter((file) =>
      file.file_name.toLowerCase().includes(query) ||
      (file.alt_text || '').toLowerCase().includes(query),
    );
  }, [mediaFiles, search]);

  const handleSelect = async (fileUrl: string, fileName: string, altText?: string | null, id?: string) => {
    if (onSelectUrl) {
      setSelectingId(id || fileName);
      onSelectUrl(fileUrl, altText || fileName.replace(/\.[^.]+$/, ''));
      setOpen(false);
      setSearch('');
      setSelectingId(null);
      toast.success('Bild aus Medien übernommen');
      return;
    }

    try {
      setSelectingId(id || fileName);
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(`Fetch failed with ${response.status}`);

      const blob = await response.blob();
      const pickedFile = new File([blob], fileName, {
        type: blob.type || 'application/octet-stream',
      });

      onSelect(pickedFile, altText || fileName.replace(/\.[^.]+$/, ''));
      setOpen(false);
      setSearch('');
      toast.success('Bild aus Medien übernommen');
    } catch (error) {
      console.error('Media selection failed:', error);
      toast.error('Bild konnte nicht aus Medien übernommen werden');
    } finally {
      setSelectingId(null);
    }
  };

  const handleUploadAndSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Nur Bilddateien erlaubt');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bild darf max. 10 MB groß sein');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', file.name.replace(/\.[^.]+$/, ''));

      const record = await pb.collection('media').create(formData);
      const url = pb.files.getURL(record, record.file);
      const alt = record.alt || file.name.replace(/\.[^.]+$/, '');

      await refetch();

      if (onSelectUrl) {
        onSelectUrl(url, alt);
        setOpen(false);
        toast.success('Bild hochgeladen und eingefügt');
      } else {
        onSelect(file, alt);
        setOpen(false);
        toast.success('Bild hochgeladen und übernommen');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  }, [onSelect, onSelectUrl, refetch]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) handleUploadAndSelect(files[0]);
    e.target.value = '';
  }, [handleUploadAndSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadAndSelect(file);
  }, [handleUploadAndSelect]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline">
            <ImageIcon className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bild auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie ein vorhandenes Bild oder laden Sie ein neues hoch.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse">Medienbibliothek</TabsTrigger>
            <TabsTrigger value="upload">Hochladen</TabsTrigger>
          </TabsList>

          {/* Browse existing media */}
          <TabsContent value="browse" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nach Dateiname oder Alt-Text suchen..."
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[50vh] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Keine Bilder gefunden
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="overflow-hidden rounded-lg border bg-card text-left transition hover:border-primary hover:shadow-sm"
                      onClick={() => handleSelect(file.file_url, file.file_name, file.alt_text, file.id)}
                      disabled={selectingId === file.id}
                    >
                      <div className="aspect-[4/3] bg-muted">
                        <img
                          src={file.file_url}
                          alt={file.alt_text || file.file_name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="space-y-1 p-3">
                        <p className="truncate text-sm font-medium">{file.file_name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {file.alt_text || 'Kein Alt-Text'}
                        </p>
                        {selectingId === file.id && (
                          <div className="pt-1 text-xs text-primary">Wird übernommen...</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Upload new */}
          <TabsContent value="upload">
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-muted p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Bild hierher ziehen</p>
                    <p className="text-sm text-muted-foreground mt-1">oder klicken zum Auswählen</p>
                    <p className="text-xs text-muted-foreground mt-2">Max. 10 MB · JPG, PNG, WebP, GIF</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Datei auswählen
                  </Button>
                </div>
              )}

              {/* Invisible click target for the whole drop zone */}
              {!uploading && (
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={onFileChange}
                  tabIndex={-1}
                />
              )}
            </div>

            {/* Hidden ref-based input for the button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
