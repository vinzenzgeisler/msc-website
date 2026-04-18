import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Plus, Search, FolderOpen, Image, Upload, Trash2, MoreHorizontal,
  Grid, List, Loader2, ArrowLeft, Save, Link as LinkIcon, FileText,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  useMediaAlbums, useMediaFiles, useUploadMediaFile, useDeleteMediaFile,
  useDeleteMediaAlbum, useCreateMediaAlbum,
} from '@/hooks/useMedia';
import type { MediaAlbum, MediaFile } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

export default function MediaAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null);
  const [deleteFile, setDeleteFile] = useState<MediaFile | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumSlug, setNewAlbumSlug] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumFileInputRef = useRef<HTMLInputElement>(null);

  const { data: albums, isLoading: albumsLoading } = useMediaAlbums();
  const { data: files, isLoading: filesLoading } = useMediaFiles();
  const { data: albumFiles, isLoading: albumFilesLoading } = useMediaFiles(selectedAlbumId || undefined);
  const uploadFile = useUploadMediaFile();
  const deleteMediaFile = useDeleteMediaFile();
  const deleteAlbum = useDeleteMediaAlbum();
  const createAlbum = useCreateMediaAlbum();

  const selectedAlbum = albums?.find((a) => a.id === selectedAlbumId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    for (const file of Array.from(selectedFiles)) {
      try {
        await uploadFile.mutateAsync({ file });
        toast.success(`${file.name} hochgeladen`);
      } catch (error) {
        toast.error(getPocketBaseErrorMessage(error, 'Upload fehlgeschlagen'));
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAlbumFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length || !selectedAlbumId) return;

    for (const file of Array.from(selectedFiles)) {
      try {
        await uploadFile.mutateAsync({ file, albumId: selectedAlbumId });
        toast.success(`${file.name} hochgeladen`);
      } catch (error) {
        toast.error(getPocketBaseErrorMessage(error, 'Upload fehlgeschlagen'));
      }
    }
    if (albumFileInputRef.current) albumFileInputRef.current.value = '';
  };

  const handleDeleteFile = async () => {
    if (!deleteFile) return;
    try {
      await deleteMediaFile.mutateAsync(deleteFile);
      toast.success('Datei gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteFile(null);
  };

  const handleDeleteAlbum = async () => {
    if (!deleteAlbumId) return;
    try {
      await deleteAlbum.mutateAsync(deleteAlbumId);
      toast.success('Album gelöscht');
      if (selectedAlbumId === deleteAlbumId) setSelectedAlbumId(null);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteAlbumId(null);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) return;
    try {
      const album = await createAlbum.mutateAsync({
        title: newAlbumTitle.trim(),
        slug: newAlbumSlug.trim() || newAlbumTitle.trim(),
        description: newAlbumDescription.trim(),
        locale: 'de',
        cover_image_url: null,
        images: [],
      });
      toast.success('Album erstellt');
      setShowCreateAlbum(false);
      setNewAlbumTitle('');
      setNewAlbumSlug('');
      setNewAlbumDescription('');
      setSelectedAlbumId(album.id);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Erstellen'));
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL kopiert');
    } catch {
      toast.error('URL konnte nicht kopiert werden');
    }
  };

  const isImageFile = (file: MediaFile) => {
    const t = (file.file_type || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(t)) return true;
    return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.file_name || '');
  };

  const filteredAlbums = albums?.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  const filteredFiles = files?.filter((f) =>
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase()),
  ) || [];

  // ── Album Detail View ──
  if (selectedAlbumId && selectedAlbum) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedAlbumId(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{selectedAlbum.title}</h1>
            {selectedAlbum.description && (
              <p className="text-muted-foreground">{selectedAlbum.description}</p>
            )}
            <Badge variant="secondary" className="mt-1">Slug: {selectedAlbum.slug}</Badge>
          </div>
          <Button onClick={() => albumFileInputRef.current?.click()} disabled={uploadFile.isPending}>
            {uploadFile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Bilder hochladen
          </Button>
          <input
            ref={albumFileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleAlbumFileUpload}
          />
        </div>

        {albumFilesLoading ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : albumFiles && albumFiles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {albumFiles.map((file) => (
              <div key={file.id} className="group relative">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={file.file_url}
                    alt={file.alt_text || file.file_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setDeleteFile(file)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs truncate">{file.alt_text || file.file_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Image className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Noch keine Bilder in diesem Album</p>
            <Button onClick={() => albumFileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Bilder hochladen
            </Button>
          </div>
        )}

        {/* Delete File Dialog */}
        <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Datei löschen?</AlertDialogTitle>
              <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground">
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ── Main View ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medien</h1>
          <p className="text-muted-foreground">Verwalten Sie Bilder und Galerien</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateAlbum(true)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Neues Album
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadFile.isPending}>
            {uploadFile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Hochladen
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                {albumsLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{albums?.length || 0}</p>}
                <p className="text-sm text-muted-foreground">Alben</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Image className="h-6 w-6" />
              </div>
              <div>
                {filesLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{files?.length || 0}</p>}
                <p className="text-sm text-muted-foreground">Dateien gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Image className="h-6 w-6" />
              </div>
              <div>
                {filesLoading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{files?.filter((f) => f.album_id).length || 0}</p>}
                <p className="text-sm text-muted-foreground">In Alben</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="albums" className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="albums">Alben</TabsTrigger>
            <TabsTrigger value="all">Alle Dateien</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex border rounded-md">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="albums">
          {albumsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <CardContent className="pt-4"><Skeleton className="h-5 w-3/4" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAlbums.map((album) => (
                <Card
                  key={album.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAlbumId(album.id)}
                >
                  <div className="aspect-video bg-muted relative">
                    {album.cover_image_url ? (
                      <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium line-clamp-1">{album.title}</h3>
                        <p className="text-sm text-muted-foreground">{album.description || 'Keine Beschreibung'}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedAlbumId(album.id); }}>
                            Öffnen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteAlbumId(album.id); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Album Card */}
              <Card
                className="overflow-hidden border-dashed hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setShowCreateAlbum(true)}
              >
                <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Neues Album</span>
                </div>
              </Card>
            </div>
          )}

          {!albumsLoading && filteredAlbums.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Keine Alben gefunden</div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Alle Dateien</CardTitle>
              <CardDescription>Alle hochgeladenen Medien</CardDescription>
            </CardHeader>
            <CardContent>
              {filesLoading ? (
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="group relative">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img src={file.file_url} alt={file.alt_text || file.file_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setDeleteFile(file)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-1 text-xs truncate">{file.file_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img src={file.file_url} alt={file.alt_text || file.file_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.file_type} • {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '-'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">Details</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteFile(file)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}

              {!filesLoading && filteredFiles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">Keine Dateien gefunden</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Album Dialog */}
      <Dialog open={showCreateAlbum} onOpenChange={setShowCreateAlbum}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Album erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel *</Label>
              <Input
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                placeholder="z.B. Motocross Galerie"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={newAlbumSlug}
                onChange={(e) => setNewAlbumSlug(e.target.value)}
                placeholder="z.B. motocross (wird automatisch generiert)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Der Slug wird verwendet, um das Album mit einer Seite zu verknüpfen.
              </p>
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Input
                value={newAlbumDescription}
                onChange={(e) => setNewAlbumDescription(e.target.value)}
                placeholder="Optionale Beschreibung"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAlbum(false)}>Abbrechen</Button>
            <Button onClick={handleCreateAlbum} disabled={!newAlbumTitle.trim() || createAlbum.isPending}>
              {createAlbum.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Album Dialog */}
      <AlertDialog open={!!deleteAlbumId} onOpenChange={() => setDeleteAlbumId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Album löschen?</AlertDialogTitle>
            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAlbum} className="bg-destructive text-destructive-foreground">Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete File Dialog */}
      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datei löschen?</AlertDialogTitle>
            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground">Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
