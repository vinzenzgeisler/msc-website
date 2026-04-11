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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ExternalLink, Image } from 'lucide-react';
import { useSponsors, useDeleteSponsor } from '@/hooks/useSponsors';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

const tierConfig: Record<string, { label: string; color: string }> = {
  main: { label: 'Hauptsponsor', color: 'bg-yellow-500' },
  partner: { label: 'Partner', color: 'bg-blue-500' },
  supporter: { label: 'Unterstützer', color: 'bg-gray-500' },
};

export default function SponsorsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sponsors, isLoading, error } = useSponsors();
  const deleteSponsor = useDeleteSponsor();

  const filteredSponsors = sponsors?.filter((sponsor) =>
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteSponsor.mutateAsync(deleteId);
      toast.success('Sponsor gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteId(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Fehler beim Laden der Sponsoren</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sponsoren</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Sponsoren und Partner</p>
        </div>
        <Button asChild>
          <Link to="/admin/sponsors/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Sponsor
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(tierConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-12 rounded-full ${config.color}`} />
                <div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {sponsors?.filter(s => s.tier === key && s.active).length || 0}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sponsor suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Sponsoren</CardTitle>
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
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSponsors.map((sponsor) => {
                  const tier = tierConfig[sponsor.tier];
                  return (
                    <TableRow key={sponsor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${tier?.color}`} />
                          {sponsor.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tier?.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {sponsor.website ? (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            Link
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sponsor.logo_url ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Image className="h-3 w-3" />
                            Vorhanden
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Fehlt
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sponsor.active ? 'default' : 'secondary'}>
                          {sponsor.active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
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
                              <Link to={`/admin/sponsors/${sponsor.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(sponsor.id)}
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

          {!isLoading && filteredSponsors.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Sponsoren gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sponsor löschen?</AlertDialogTitle>
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
