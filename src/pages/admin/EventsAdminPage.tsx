import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Eye,
  Star,
  Image,
  Calendar,
  AlertTriangle,
  Loader2,
  Save,
  ExternalLink,
  MapPin,
  Mail,
  Globe,
  FileText,
  Images,
  Archive,
} from 'lucide-react';
import { useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
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
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const translate = useCmsTranslation();

  const germanEvents = (events || []).filter((event) => event.locale === 'de');
  const mainEvent = germanEvents.find((event) => event.is_main_event);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : mainEvent ? (
        <MainEventForm
          event={mainEvent}
          allEvents={events || []}
          createMutation={createEvent}
          updateMutation={updateEvent}
          translate={translate}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold">Oberlausitzer Dreieck</h1>
        <p className="text-muted-foreground">Verwalten Sie die Hauptveranstaltung des Vereins</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Kein Hauptevent ausgewählt</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                Markieren Sie einen Termin im{' '}
                <Link to="/admin/calendar" className="text-primary underline font-medium">
                  Terminkalender
                </Link>{' '}
                als Hauptevent, damit er hier bearbeitet werden kann.
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Zum Terminkalender
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline Edit Form                                                   */
/* ------------------------------------------------------------------ */

function MainEventForm({
  event,
  allEvents,
  createMutation,
  updateMutation,
  translate,
}: {
  event: CalendarEvent;
  allEvents: CalendarEvent[];
  createMutation: ReturnType<typeof useCreateCalendarEvent>;
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
    const map: Record<TranslationTarget, boolean> = { en: false, cz: false, pl: false };
    if (!deSlug) return map;
    map.en = Boolean(allEvents.find((e) => e.locale === 'en' && e.slug === deSlug));
    map.cz = Boolean(allEvents.find((e) => e.locale === 'cz' && e.slug === deSlug));
    map.pl = Boolean(allEvents.find((e) => e.locale === 'pl' && e.slug === deSlug));
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
      toast.success('Änderungen gespeichert');
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
        await createMutation.mutateAsync(payload);
      }
      toast.success(`Übersetzung ${targetLocale.toUpperCase()} gespeichert`);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Übersetzung fehlgeschlagen'));
    }
  };

  const isSubmitting = updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Hero header with title, status, and quick actions ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Star className="h-6 w-6 text-accent fill-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {formatDateSafe(event.start_dt, 'dd. MMMM yyyy', de)}
              {event.end_dt && ` – ${formatDateSafe(event.end_dt, 'dd. MMMM yyyy', de)}`}
              {event.location && ` · ${event.location}`}
            </p>
          </div>
        </div>

        {/* Quick action buttons – prominent and always visible */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/old" target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Vorschau
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/events/gallery-archive">
              <Images className="mr-2 h-4 w-4" />
              Galerie
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/events/gallery-archive">
              <Archive className="mr-2 h-4 w-4" />
              Archiv
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Sticky save bar ── */}
      {isDirty && (
        <div className="sticky top-0 z-30 bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
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
      )}

      {/* ── Two-column layout on larger screens ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column: main form */}
        <div className="space-y-6">
          {/* Title & Description */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
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
                  placeholder="z.B. 12. Oberlausitzer Dreieck"
                  required
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

          {/* Date & Location */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Datum &amp; Ort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Ort
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="z.B. Saalendorf - Jonsdorf - Waltersdorf"
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration & Contact */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                Anmeldung &amp; Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration_url">Anmeldeportal-URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="registration_url"
                    type="url"
                    value={formData.registration_url}
                    onChange={(e) => updateField('registration_url', e.target.value)}
                    placeholder="https://anmeldung.example.de"
                    className="flex-1"
                  />
                  {formData.registration_url && (
                    <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                      <a href={formData.registration_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Wird als „Zur Anmeldung"-Button auf der Eventseite angezeigt
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Kontakt-E-Mail
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => updateField('contact_email', e.target.value)}
                  placeholder="info@msc-dreilaendereck.de"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: sidebar with status, translations, save */}
        <div className="space-y-6">
          {/* Publish status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="font-medium">Veröffentlicht</Label>
                  <p className="text-xs text-muted-foreground">Auf der Website sichtbar</p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => updateField('published', checked)}
                />
              </div>

              <div className="pt-2">
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
              </div>
            </CardContent>
          </Card>

          {/* Translations */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Übersetzungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocaleTranslationBox
                description="DE führend. EN/CZ/PL separat."
                status={translationStatus}
                onTranslate={handleTranslateTo}
                isTranslating={translate.isPending}
                disabled={!deSlug}
              />
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                <Link to="/admin/events/gallery-archive">
                  <Images className="mr-2 h-4 w-4" />
                  Fotogalerie verwalten
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                <Link to="/admin/events/gallery-archive">
                  <Archive className="mr-2 h-4 w-4" />
                  Vergangene Events (Archiv)
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                <Link to="/old" target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Eventseite ansehen
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
