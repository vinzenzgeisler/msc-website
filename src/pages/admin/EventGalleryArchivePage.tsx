import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Image,
  Archive,
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Loader2,
  Save,
  X,
  ImagePlus,
} from 'lucide-react';
import {
  useMediaAlbums,
  useMediaFiles,
  useUploadMediaFile,
  useDeleteMediaFile,
  useCreateMediaAlbum,
} from '@/hooks/useMedia';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import {
  useEventArchives,
  useCreateEventArchive,
  useUpdateEventArchive,
  useDeleteEventArchive,
} from '@/hooks/useEventArchive';
import type { MediaFile, MediaAlbum, EventArchive } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

/* ================================================================== */
/*  Main Page                                                         */
/* ================================================================== */

export default function EventGalleryArchivePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Galerie &amp; Archiv</h1>
          <p className="text-muted-foreground">
            Fotos vom aktuellen Event und vergangene Veranstaltungen
          </p>
        </div>
      </div>

      <Tabs defaultValue="gallery">
        <TabsList>
          <TabsTrigger value="gallery" className="gap-2">
            <Image className="h-4 w-4" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="archive" className="gap-2">
            <Archive className="h-4 w-4" />
            Archiv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          <GalleryTab />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ArchiveTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================================================================== */
/*  Gallery Tab – image upload grid for the current main event        */
/* ================================================================== */

function GalleryTab() {
  const { data: events } = useCalendarEvents(false);
  const { data: albums, isLoading: albumsLoading } = useMediaAlbums();
  const createAlbum = useCreateMediaAlbum();
  const uploadFile = useUploadMediaFile();
  const deleteFile = useDeleteMediaFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);

  const mainEvent = (events || []).find((e) => e.locale === 'de' && e.is_main_event);

  // Find or derive album slug from main event
  const albumSlug = mainEvent ? `event-${mainEvent.slug}` : null;
  const album = albums?.find((a) => a.slug === albumSlug);

  const { data: files, isLoading: filesLoading } = useMediaFiles(album?.id);

  const ensureAlbum = useCallback(async () => {
    if (album) return album.id;
    if (!mainEvent) return null;

    const newAlbum = await createAlbum.mutateAsync({
      title: `Galerie: ${mainEvent.title}`,
      slug: `event-${mainEvent.slug}`,
      description: null,
      cover_image_url: null,
      images: [],
      locale: 'de',
    });
    return newAlbum.id;
  }, [album, mainEvent, createAlbum]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const albumId = await ensureAlbum();
    if (!albumId) {
      toast.error('Kein Hauptevent aktiv');
      return;
    }

    for (const file of Array.from(fileList)) {
      try {
        await uploadFile.mutateAsync({ file, albumId });
      } catch (error) {
        toast.error(getPocketBaseErrorMessage(error, `Fehler bei ${file.name}`));
      }
    }
    toast.success(`${fileList.length} Bild(er) hochgeladen`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFile.mutateAsync(deleteTarget);
      toast.success('Bild gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteTarget(null);
  };

  const isUploading = uploadFile.isPending || createAlbum.isPending;
  const isLoading = albumsLoading || filesLoading;

  if (!mainEvent) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <ImagePlus className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Kein Hauptevent aktiv – bitte zuerst im Terminkalender eines markieren.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Fotogalerie: {mainEvent.title}
          </CardTitle>
          <CardDescription>
            Laden Sie Bilder vom aktuellen Event hoch. Diese werden auf der Veranstaltungsseite angezeigt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload area */}
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-6"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUpload(e.dataTransfer.files);
            }}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Bilder hierher ziehen oder <span className="text-primary underline">auswählen</span>
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>

          {/* Image grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : files && files.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file) => (
                <div key={file.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={file.file_url}
                    alt={file.alt_text || ''}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteTarget(file)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Noch keine Bilder hochgeladen</p>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bild löschen?</AlertDialogTitle>
            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================================================================== */
/*  Archive Tab – past main events                                    */
/* ================================================================== */

function ArchiveTab() {
  const { data: archives, isLoading } = useEventArchives();
  const { data: albums } = useMediaAlbums();
  const createArchive = useCreateEventArchive();
  const updateArchive = useUpdateEventArchive();
  const deleteArchive = useDeleteEventArchive();
  const createAlbum = useCreateMediaAlbum();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const handleCreateNew = async (data: { title: string; year: number; description: string }) => {
    try {
      // Auto-create a linked album
      const albumSlug = `archive-${data.year}`;
      let existingAlbum = albums?.find((a) => a.slug === albumSlug);

      if (!existingAlbum) {
        existingAlbum = await createAlbum.mutateAsync({
          title: `Archiv: ${data.title}`,
          slug: albumSlug,
          description: null,
          cover_image_url: null,
          images: [],
          locale: 'de',
        });
      }

      await createArchive.mutateAsync({
        title: data.title,
        year: data.year,
        description: data.description || null,
        album_id: existingAlbum.id,
        sort_order: data.year,
        locale: 'de',
      });
      toast.success('Archiv-Eintrag erstellt');
      setShowNew(false);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Erstellen'));
    }
  };

  const handleUpdate = async (id: string, data: { title: string; year: number; description: string }) => {
    try {
      await updateArchive.mutateAsync({
        id,
        title: data.title,
        year: data.year,
        description: data.description || null,
        sort_order: data.year,
      });
      toast.success('Archiv-Eintrag aktualisiert');
      setEditingId(null);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteArchive.mutateAsync(deleteId);
      toast.success('Archiv-Eintrag gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                Vergangene Veranstaltungen
              </CardTitle>
              <CardDescription>
                Archiv aller bisherigen Oberlausitzer Dreieck Veranstaltungen
              </CardDescription>
            </div>
            <Button onClick={() => setShowNew(true)} disabled={showNew}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Eintrag
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New entry form */}
          {showNew && (
            <ArchiveEntryForm
              onSave={handleCreateNew}
              onCancel={() => setShowNew(false)}
              isPending={createArchive.isPending || createAlbum.isPending}
            />
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {/* List */}
          {!isLoading && archives && archives.length > 0 && (
            <div className="space-y-3">
              {archives.map((archive) =>
                editingId === archive.id ? (
                  <ArchiveEntryForm
                    key={archive.id}
                    initial={archive}
                    onSave={(data) => handleUpdate(archive.id, data)}
                    onCancel={() => setEditingId(null)}
                    isPending={updateArchive.isPending}
                  />
                ) : (
                  <ArchiveEntryCard
                    key={archive.id}
                    archive={archive}
                    album={albums?.find((a) => a.id === archive.album_id)}
                    onEdit={() => setEditingId(archive.id)}
                    onDelete={() => setDeleteId(archive.id)}
                  />
                ),
              )}
            </div>
          )}

          {!isLoading && (!archives || archives.length === 0) && !showNew && (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Noch keine Archiv-Einträge vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiv-Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Eintrag wird entfernt. Das verknüpfte Fotoalbum bleibt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================================================================== */
/*  Archive Entry Card (read-only)                                    */
/* ================================================================== */

function ArchiveEntryCard({
  archive,
  album,
  onEdit,
  onDelete,
}: {
  archive: EventArchive;
  album?: MediaAlbum;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photoCount = album?.images?.length || 0;

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
      {/* Cover image */}
      <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
        {album?.cover_image_url ? (
          <img src={album.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Archive className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">{archive.title}</h4>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{archive.year}</span>
        </div>
        {archive.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{archive.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {photoCount} {photoCount === 1 ? 'Foto' : 'Fotos'}
          {album && (
            <> · <Link to={`/admin/media`} className="text-primary underline">Album verwalten</Link></>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>Bearbeiten</Button>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Archive Entry Form (create/edit)                                  */
/* ================================================================== */

function ArchiveEntryForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: { title: string; year: number; description: string | null };
  onSave: (data: { title: string; year: number; description: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [year, setYear] = useState(initial?.year || new Date().getFullYear());
  const [description, setDescription] = useState(initial?.description || '');

  return (
    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{initial ? 'Eintrag bearbeiten' : 'Neuer Archiv-Eintrag'}</h4>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <div className="space-y-1">
          <Label htmlFor="archive-title" className="text-xs">Titel *</Label>
          <Input
            id="archive-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. 11. Oberlausitzer Dreieck"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="archive-year" className="text-xs">Jahr *</Label>
          <Input
            id="archive-year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={1990}
            max={2100}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="archive-desc" className="text-xs">Kurzbeschreibung</Label>
        <Textarea
          id="archive-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optionale Beschreibung zur Veranstaltung..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Abbrechen</Button>
        <Button
          size="sm"
          disabled={!title || !year || isPending}
          onClick={() => onSave({ title, year, description })}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Speichern
        </Button>
      </div>
    </div>
  );
}
