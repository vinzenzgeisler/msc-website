import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Pencil, Star, Image, Calendar, AlertTriangle } from 'lucide-react';
import { useCalendarEvents, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import type { CalendarEvent } from '@/integrations/pocketbase/client';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { formatDateSafe } from '@/lib/date';

export default function EventsAdminPage() {
  const { data: events, isLoading } = useCalendarEvents(false);
  const updateEventMutation = useUpdateCalendarEvent();

  const germanEvents = (events || []).filter((event) => event.locale === 'de');
  const mainEvent = germanEvents.find((event) => event.is_main_event);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hauptveranstaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Hauptveranstaltung des Vereins
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/events/gallery-archive">
            <Image className="mr-2 h-4 w-4" />
            Galerie &amp; Archiv
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : mainEvent ? (
        <MainEventCard event={mainEvent} updateMutation={updateEventMutation} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Kein Hauptevent ausgewählt</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Markieren Sie einen Termin im{' '}
                  <Link to="/admin/calendar" className="text-primary underline">
                    Terminkalender
                  </Link>{' '}
                  als Hauptevent, damit er hier angezeigt wird.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/admin/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Zum Terminkalender
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main-Event Card                                                    */
/* ------------------------------------------------------------------ */

function MainEventCard({
  event,
  updateMutation,
}: {
  event: CalendarEvent;
  updateMutation: ReturnType<typeof useUpdateCalendarEvent>;
}) {
  return (
    <Card className="border-accent border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent fill-accent" />
          Hauptveranstaltung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Title & date */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{event.title}</h3>
              <p className="text-muted-foreground">
                {formatDateSafe(event.start_dt, 'dd. MMMM yyyy', de)}
                {event.end_dt &&
                  ` – ${formatDateSafe(event.end_dt, 'dd. MMMM yyyy', de)}`}
              </p>
              {event.location && (
                <p className="text-sm text-muted-foreground">{event.location}</p>
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
                <Link to={`/admin/calendar/${event.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </Link>
              </Button>
            </div>
          </div>

          {/* Registration URL */}
          <div className="rounded-lg border p-3 bg-muted/30">
            <Label className="text-xs font-medium text-muted-foreground">
              Anmeldeportal-URL
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="https://anmeldung.example.com"
                defaultValue={event.registration_url || ''}
                onBlur={async (e) => {
                  const newUrl = e.target.value.trim();
                  if (newUrl !== (event.registration_url || '')) {
                    try {
                      await updateMutation.mutateAsync({
                        id: event.id,
                        registration_url: newUrl || null,
                      });
                      toast.success('Anmeldeportal-URL gespeichert');
                    } catch (error) {
                      toast.error(
                        getPocketBaseErrorMessage(error, 'Fehler beim Speichern'),
                      );
                    }
                  }
                }}
                className="flex-1"
              />
              {event.registration_url && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
