import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Download, FileText, FileImage, File, Link as LinkIcon } from 'lucide-react';
import { useDownloads, useDeleteDownload } from '@/hooks/useDownloads';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

const getFileTypeConfig = (fileType: string | null) => {
  if (fileType?.includes('pdf')) return { label: 'PDF', icon: FileText, color: 'text-red-500' };
  if (fileType?.includes('image')) return { label: 'Bild', icon: FileImage, color: 'text-blue-500' };
  return { label: 'Datei', icon: File, color: 'text-gray-500' };
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DownloadsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: downloads, isLoading, error } = useDownloads();
  const deleteDownload = useDeleteDownload();

  const filteredDownloads = downloads?.filter((download) =>
    download.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteDownload.mutateAsync(deleteId);
      toast.success('Datei gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteId(null);
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL kopiert');
    } catch {
      toast.error('URL konnte nicht kopiert werden');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Fehler beim Laden der Downloads</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Downloads</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Download-Dateien</p>
        </div>
        <Button asChild>
          <Link to="/admin/downloads/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Datei
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{downloads?.length || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Dateien</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Download className="h-6 w-6" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">
                    {downloads?.filter(d => d.file_type?.includes('pdf')).length || 0}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">PDF-Dokumente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">
                    {formatFileSize(downloads?.reduce((sum, d) => sum + (d.file_size || 0), 0) || 0)}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Gesamtgröße</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Datei suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Dateien</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.map((download) => {
                  const fileType = getFileTypeConfig(download.file_type);
                  const Icon = fileType.icon;
                  return (
                    <TableRow key={download.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${fileType.color}`} />
                          {download.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{fileType.label}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(download.file_size)}</TableCell>
                      <TableCell>
                        {download.category ? (
                          <Badge variant="secondary">{download.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyUrl(download.file_url)}>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              URL kopieren
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={download.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Herunterladen
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/downloads/${download.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(download.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredDownloads.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Dateien gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datei löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
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
