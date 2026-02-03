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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Calendar, Star } from 'lucide-react';
import { useCalendarEvents, useDeleteCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import type { CalendarEvent } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export default function EventsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteEvent, setDeleteEvent] = useState<CalendarEvent | null>(null);
  
  // Fetch all events (no locale filter for admin)
  const { data: events, isLoading } = useCalendarEvents(false);
  const deleteEventMutation = useDeleteCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();

  const handleDelete = async () => {
    if (!deleteEvent) return;
    
    try {
      await deleteEventMutation.mutateAsync(deleteEvent.id);
      toast.success('Veranstaltung gelöscht');
    } catch (err) {
      toast.error('Fehler beim Löschen');
    }
    setDeleteEvent(null);
  };

  const handleToggleMainEvent = async (event: CalendarEvent) => {
    try {
      await updateEventMutation.mutateAsync({
        id: event.id,
        is_main_event: !event.is_main_event,
      });
      toast.success(event.is_main_event ? 'Hauptevent entfernt' : 'Als Hauptevent markiert');
    } catch (err) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const filteredEvents = (events || []).filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by main event first, then by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.is_main_event && !b.is_main_event) return -1;
    if (!a.is_main_event && b.is_main_event) return 1;
    return new Date(b.start_dt).getTime() - new Date(a.start_dt).getTime();
  });

  const mainEvent = events?.find(e => e.is_main_event);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veranstaltungen</h1>
          <p className="text-muted-foreground">Verwalten Sie die Hauptveranstaltung und Termine</p>
        </div>
        <Button asChild>
          <Link to="/admin/calendar/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Veranstaltung
          </Link>
        </Button>
      </div>

      {/* Main Event Card */}
      {mainEvent && (
        <Card className="border-accent border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent fill-accent" />
              Hauptveranstaltung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{mainEvent.title}</h3>
                <p className="text-muted-foreground">
                  {format(new Date(mainEvent.start_dt), 'dd. MMMM yyyy', { locale: de })}
                  {mainEvent.end_dt && ` – ${format(new Date(mainEvent.end_dt), 'dd. MMMM yyyy', { locale: de })}`}
                </p>
                {mainEvent.location && (
                  <p className="text-sm text-muted-foreground">{mainEvent.location}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/event" target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Vorschau
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/admin/calendar/${mainEvent.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Veranstaltung suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{events?.length || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Veranstaltungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">
                    {events?.filter(e => e.published).length || 0}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Veröffentlicht</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Star className="h-6 w-6" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">
                    {events?.filter(e => e.is_main_event).length || 0}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Hauptevent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Veranstaltungen</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veranstaltung</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Sprache</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {event.is_main_event && (
                          <Star className="h-4 w-4 text-accent fill-accent" />
                        )}
                        <span className="font-medium">{event.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(event.start_dt), 'dd.MM.yyyy', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {event.locale.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.published ? 'default' : 'secondary'}>
                        {event.published ? 'Veröffentlicht' : 'Entwurf'}
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
                          <DropdownMenuItem onClick={() => handleToggleMainEvent(event)}>
                            <Star className="mr-2 h-4 w-4" />
                            {event.is_main_event ? 'Hauptevent entfernen' : 'Als Hauptevent'}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/calendar/${event.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Bearbeiten
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteEvent(event)}
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

          {!isLoading && sortedEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Veranstaltungen gefunden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteEvent} onOpenChange={() => setDeleteEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Veranstaltung löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
