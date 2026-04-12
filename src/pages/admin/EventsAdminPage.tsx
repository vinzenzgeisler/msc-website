import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, Star, Image, Calendar, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { useCalendarEvents, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { useCmsTranslation } from '@/hooks/useCmsTranslation';
import { LocaleTranslationBox, TranslationTarget } from '@/components/admin/LocaleTranslationBox';
import type { CalendarEvent } from '@/integrations/pocketbase/client';
import { buildSlug } from '@/integrations/pocketbase/client';
import { de } from 'date-fns/locale';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { formatDateSafe } from '@/lib/date';

function toDateTimeInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default function EventsAdminPage() {
  const { data: events, isLoading } = useCalendarEvents(false);
  const updateEvent = useUpdateCalendarEvent();
  const translate = useCmsTranslation();

  const germanEvents = (events || []).filter((event) => event.locale === 'de');
  const mainEvent = germanEvents.find((event) => event.is_main_event);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Oberlausitzer Dreieck</h1>
          <p className="text-muted-foreground">
            Verwalten Sie die Hauptveranstaltung des Vereins
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/events/gallery-archive">
              <Image className="mr-2 h-4 w-4" />
              Galerie &amp; Archiv
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/event" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Vorschau
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : mainEvent ? (
        <MainEventForm event={mainEvent} allEvents={events || []} updateMutation={updateEvent} translate={translate} />
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
                  als Hauptevent, damit er hier bearbeitet werden kann.
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
/*  Inline Edit Form for Main Event                                    */
/* ------------------------------------------------------------------ */

function MainEventForm({
  event,
  allEvents,
  updateMutation,
  translate,
}: {
  event: CalendarEvent;
  allEvents: CalendarEvent[];
  updateMutation: ReturnType<typeof useUpdateCalendarEvent>;
  translate: ReturnType<typeof useCmsTranslation>;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_dt: '',
    end_dt: '',
    location: '',
    contact_email: '',
    registration_url: '',
    published: true,
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      title: event.title || '',
      description: event.description || '',
      start_dt: toDateTimeInputValue(event.start_dt),
      end_dt: toDateTimeInputValue(event.end_dt),
      location: event.location || '',
      contact_email: event.contact_email || '',
      registration_url: event.registration_url || '',
      published: event.published !== false,
    });
    setIsDirty(false);
  }, [event]);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const deSlug = useMemo(
    () => buildSlug(formData.title || event.title || ''),
    [formData.title, event.title],
  );

  const translationStatus = useMemo(() => {
    const map: Record<TranslationTarget, boolean> = { en: false, cz: false };
    if (!deSlug) return map;
    map.en = Boolean(allEvents.find((e) => e.locale === 'en' && e.slug === deSlug));
    map.cz = Boolean(allEvents.find((e) => e.locale === 'cz' && e.slug === deSlug));
    return map;
  }, [allEvents, deSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_dt) {
      toast.error('Bitte Titel und Startdatum ausfüllen');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: event.id,
        title: formData.title,
        slug: buildSlug(formData.title),
        description: formData.description.trim() || null,
        start_dt: new Date(formData.start_dt).toISOString(),
        end_dt: formData.end_dt ? new Date(formData.end_dt).toISOString() : null,
        location: formData.location.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        registration_url: formData.registration_url.trim() || null,
        published: formData.published,
      });
      toast.success('Hauptveranstaltung gespeichert');
      setIsDirty(false);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error));
    }
  };

  const handleTranslateTo = async (targetLocale: TranslationTarget) => {
    const sourceTitle = formData.title.trim();
    const sourceDescription = formData.description.trim();
    if (!sourceTitle) {
      toast.error('Bitte zuerst den deutschen Titel ausfüllen.');
      return;
    }

    try {
      const translated = await translate.mutateAsync({
        sourceLocale: 'de',
        targetLocale,
        context: 'Hauptveranstaltung (Oberlausitzer Dreieck) für die Vereinswebsite',
        fields: { title: sourceTitle, description: sourceDescription },
      });

      const translatedTitle = String(translated.title || '').trim();
      const translatedDescription = String(translated.description || '').trim();

      const existingTranslation = allEvents.find(
        (e) => e.locale === targetLocale && e.slug === deSlug,
      );

      const payload = {
        title: translatedTitle || sourceTitle,
        slug: deSlug,
        description: translatedDescription || sourceDescription || null,
        category: event.category || null,
        start_dt: new Date(formData.start_dt).toISOString(),
        end_dt: formData.end_dt ? new Date(formData.end_dt).toISOString() : null,
        location: formData.location.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        registration_url: formData.registration_url.trim() || null,
        is_main_event: true,
        published: formData.published,
        locale: targetLocale,
      };

      if (existingTranslation) {
        await updateMutation.mutateAsync({ id: existingTranslation.id, ...payload });
      } else {
        // For creating we'd need the create mutation, but since the main event
        // should already exist, we use update. If not found, show error.
        toast.error(`Bitte legen Sie die ${targetLocale.toUpperCase()}-Version erst im Terminkalender an.`);
        return;
      }
      toast.success(`Übersetzung ${targetLocale.toUpperCase()} gespeichert`);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Übersetzung fehlgeschlagen'));
    }
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Info banner */}
      <Card className="border-accent border-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-accent fill-accent flex-shrink-0" />
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateSafe(event.start_dt, 'dd. MMMM yyyy', de)}
                {event.end_dt && ` – ${formatDateSafe(event.end_dt, 'dd. MMMM yyyy', de)}`}
                {event.location && ` · ${event.location}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main form */}
      <Card>
        <CardHeader>
          <CardTitle>Veranstaltungsdetails</CardTitle>
          <CardDescription>Alle Änderungen werden beim Speichern übernommen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="z.B. 12. Oberlausitzer Dreieck"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_dt">Startdatum *</Label>
              <Input
                id="start_dt"
                type="datetime-local"
                value={formData.start_dt}
                onChange={(e) => updateField('start_dt', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_dt">Enddatum</Label>
              <Input
                id="end_dt"
                type="datetime-local"
                value={formData.end_dt}
                onChange={(e) => updateField('end_dt', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="z.B. Saalendorf - Jonsdorf - Waltersdorf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_url">Anmeldeportal-URL</Label>
            <Input
              id="registration_url"
              type="url"
              value={formData.registration_url}
              onChange={(e) => updateField('registration_url', e.target.value)}
              placeholder="https://anmeldung.example.de"
            />
            <p className="text-xs text-muted-foreground">
              Link zum externen Anmeldeportal (wird als „Zur Anmeldung"-Button angezeigt)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Kontakt-E-Mail</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => updateField('contact_email', e.target.value)}
              placeholder="info@msc-dreilaendereck.de"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Weitere Informationen zur Veranstaltung..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Translation */}
      <Card>
        <CardContent className="pt-6">
          <LocaleTranslationBox
            description="DE bleibt führend. EN/CZ werden separat aktualisiert."
            status={translationStatus}
            onTranslate={handleTranslateTo}
            isTranslating={translate.isPending}
            disabled={!deSlug}
          />
        </CardContent>
      </Card>

      {/* Published toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label htmlFor="published" className="font-medium">Veröffentlicht</Label>
          <p className="text-sm text-muted-foreground">Veranstaltung auf der Website anzeigen</p>
        </div>
        <Switch
          id="published"
          checked={formData.published}
          onCheckedChange={(checked) => updateField('published', checked)}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-4 items-center">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            'Speichern'
          )}
        </Button>
        {isDirty && (
          <p className="text-sm text-muted-foreground">Ungespeicherte Änderungen</p>
        )}
      </div>
    </form>
  );
}
