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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { usePosts, useDeletePost } from '@/hooks/usePosts';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { formatDateSafe } from '@/lib/date';

export default function NewsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: posts, isLoading, error } = usePosts(false);
  const deletePost = useDeletePost();
  const allPosts = posts || [];
  const germanPosts = allPosts.filter((post) => post.locale === 'de');

  const filteredNews = germanPosts.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const source = allPosts.find((post) => post.id === deleteId);
      const variantIds = source
        ? allPosts.filter((post) => post.slug === source.slug).map((post) => post.id)
        : [deleteId];

      for (const recordId of variantIds) {
        await deletePost.mutateAsync(recordId);
      }

      toast.success('Artikel gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteId(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Fehler beim Laden der Artikel</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-muted-foreground">Verwalten Sie alle News-Artikel</p>
        </div>
        <Button asChild>
          <Link to="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Artikel
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Artikel suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Alle ({germanPosts.length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Veröffentlicht ({germanPosts.filter((post) => post.status === 'published').length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Entwürfe ({germanPosts.filter((post) => post.status === 'draft').length})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Artikel</CardTitle>
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
                  <TableHead>Übersetzungen</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge
                          variant={allPosts.some((post) => post.slug === article.slug && post.locale === 'en') ? 'default' : 'outline'}
                          className="uppercase"
                        >
                          EN
                        </Badge>
                        <Badge
                          variant={allPosts.some((post) => post.slug === article.slug && post.locale === 'cz') ? 'default' : 'outline'}
                          className="uppercase"
                        >
                          CZ
                        </Badge>
                        <Badge
                          variant={allPosts.some((post) => post.slug === article.slug && post.locale === 'pl') ? 'default' : 'outline'}
                          className="uppercase"
                        >
                          PL
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category || 'Allgemein'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={article.status === 'published' ? 'default' : 'secondary'}
                      >
                        {article.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateSafe(article.display_date, 'dd.MM.yyyy', de)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/news/${article.slug}`} target="_blank">
                              <Eye className="mr-2 h-4 w-4" />
                              Vorschau
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/news/${article.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(article.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredNews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Artikel gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
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
