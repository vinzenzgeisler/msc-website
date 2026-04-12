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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Calendar, Trophy, Bike, MapPin, Star } from 'lucide-react';
import { useCalendarEvents, useDeleteCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { formatDateSafe } from '@/lib/date';

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  allgemein: { label: 'Allgemein', color: 'bg-blue-500', icon: Calendar },
  event: { label: 'Veranstaltung', color: 'bg-green-500', icon: Trophy },
  motocross: { label: 'Motocross', color: 'bg-orange-500', icon: Bike },
  trial: { label: 'Trial', color: 'bg-purple-500', icon: MapPin },
  touring: { label: 'Touring', color: 'bg-sky-500', icon: Calendar },
};

export default function CalendarAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: events, isLoading, error } = useCalendarEvents(false);
  const deleteEvent = useDeleteCalendarEvent();
  const germanEvents = (events || []).filter((event) => event.locale === 'de');

  const filteredEvents = germanEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const source = germanEvents.find((event) => event.id === deleteId);
      const variantIds = source
        ? (events || []).filter((event) => event.slug === source.slug).map((event) => event.id)
        : [deleteId];

      for (const recordId of variantIds) {
        await deleteEvent.mutateAsync(recordId);
      }
      toast.success('Termin gelöscht');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Löschen'));
    }
    setDeleteId(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Fehler beim Laden der Termine</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Terminkalender</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Vereinstermine</p>
        </div>
        <Button asChild>
          <Link to="/admin/calendar/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Termin
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
                placeholder="Termin suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                Alle ({germanEvents.length})
              </Badge>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Badge
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(key)}
                >
                  {config.label} ({germanEvents.filter((event) => event.category === key).length})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Termine</CardTitle>
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
                  <TableHead>Termin</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const category = event.category ? categoryConfig[event.category] : null;
                  const Icon = category?.icon || Calendar;
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${category?.color || 'bg-gray-400'}`} />
                          <div>{event.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Icon className="h-3 w-3" />
                            {category.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDateSafe(event.start_dt, 'dd.MM.yyyy', de)}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {event.location || '-'}
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
                              <Link to={`/admin/calendar/${event.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Bearbeiten
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(event.id)}
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

          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Termine gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin löschen?</AlertDialogTitle>
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
