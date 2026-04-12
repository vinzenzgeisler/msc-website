import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { useMediaFiles } from '@/hooks/useMedia';
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
  const { data: mediaFiles, isLoading } = useMediaFiles();

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mediaFiles || [];

    return (mediaFiles || []).filter((file) =>
      file.file_name.toLowerCase().includes(query) ||
      (file.alt_text || '').toLowerCase().includes(query),
    );
  }, [mediaFiles, search]);

  const handleSelect = async (fileUrl: string, fileName: string, altText?: string | null, id?: string) => {
    // If caller only needs the URL (e.g. RichTextEditor), skip download
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
      if (!response.ok) {
        throw new Error(`Fetch failed with ${response.status}`);
      }

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <ImageIcon className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bild aus Medien auswählen</DialogTitle>
          <DialogDescription>
            Bestehende Bilder aus der Medienverwaltung übernehmen.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nach Dateiname oder Alt-Text suchen..."
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-[60vh] pr-4">
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
                    {selectingId === file.id ? (
                      <div className="pt-1 text-xs text-primary">Wird übernommen...</div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
