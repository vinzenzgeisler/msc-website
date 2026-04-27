import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Link as LinkIcon, Loader2, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDownload, useDownload, useUpdateDownload } from '@/hooks/useDownloads';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

const categories = [
  { value: 'event', label: 'Event / /event Downloads' },
  { value: 'verein', label: 'Verein' },
  { value: 'allgemein', label: 'Allgemein' },
] as const;

export default function DownloadsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const { data: existingDownload, isLoading: isLoadingDownload } = useDownload(isEditing ? id! : '');
  const createDownload = useCreateDownload();
  const updateDownload = useUpdateDownload();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'event',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!existingDownload) return;

    setFormData({
      title: existingDownload.title || '',
      description: existingDownload.description || '',
      category: existingDownload.category || 'event',
    });
    setFile(null);
    setIsDirty(false);
  }, [existingDownload]);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
  };

  const isSubmitting = createDownload.isPending || updateDownload.isPending;
  const currentFileName = useMemo(() => {
    if (file) return file.name;
    return existingDownload?.file_name || null;
  }, [existingDownload?.file_name, file]);

  const handleCopyUrl = async () => {
    if (!existingDownload?.file_url) return;

    try {
      await navigator.clipboard.writeText(existingDownload.file_url);
      toast.success('URL kopiert');
    } catch {
      toast.error('URL konnte nicht kopiert werden');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Bitte einen Titel eingeben');
      return;
    }

    if (!isEditing && !file) {
      toast.error('Bitte eine Datei auswählen');
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        file,
      };

      if (isEditing && id) {
        await updateDownload.mutateAsync({ id, ...payload });
        toast.success('Datei aktualisiert');
      } else {
        await createDownload.mutateAsync(payload);
        toast.success('Datei erstellt');
      }

      setIsDirty(false);
      navigate('/admin/downloads');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  if (isEditing && isLoadingDownload) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/downloads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Datei bearbeiten' : 'Neue Datei'}</h1>
          <p className="text-sm text-muted-foreground">
            Dateien mit Kategorie `event` erscheinen automatisch unten auf `/event` in der Sektion Downloads.
          </p>
        </div>
      </div>

      {isDirty ? (
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
          <p className="text-sm font-medium text-accent-foreground">Ungespeicherte Änderungen</p>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Grunddaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="z. B. Ausschreibung 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Optionale Zusatzinfo zum Dokument"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-muted-foreground" />
                Datei
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">{isEditing ? 'Datei ersetzen' : 'Datei hochladen'} {!isEditing ? '*' : ''}</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.odt,.jpg,.jpeg,.png,.webp,.zip,.txt"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setIsDirty(true);
                  }}
                />
              </div>

              {currentFileName ? (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium">Aktuelle Datei</p>
                  <p className="mt-1 break-all text-sm text-muted-foreground">{currentFileName}</p>
                  {existingDownload?.file_url ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleCopyUrl}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        URL kopieren
                      </Button>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href={existingDownload.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Öffnen
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Kategorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                `event` blendet das Dokument automatisch in der Download-Sektion auf `/event` ein.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Button type="submit" className="w-full" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Änderungen speichern
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
