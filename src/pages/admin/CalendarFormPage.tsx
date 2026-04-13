import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Calendar, MapPin, Bike, Trophy, Star, AlertCircle, Save, FileText, ExternalLink, Mail } from 'lucide-react';
import { useCalendarEvent, useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { useCmsTranslation } from '@/hooks/useCmsTranslation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { buildSlug } from '@/integrations/pocketbase/client';
import { LocaleTranslationBox, TranslationTarget } from '@/components/admin/LocaleTranslationBox';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

const categories = [
  { value: 'allgemein', label: 'Allgemein', icon: Calendar },
  { value: 'event', label: 'Veranstaltung', icon: Trophy },
  { value: 'motocross', label: 'Motocross', icon: Bike },
  { value: 'trial', label: 'Trial', icon: MapPin },
  { value: 'touring', label: 'Touring', icon: Calendar },
];

function toDateTimeInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export default function CalendarFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { data: existingEvent, isLoading: isLoadingEvent } = useCalendarEvent(isEditing ? id : '');
  const { data: allEvents } = useCalendarEvents(false);
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const translate = useCmsTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_dt: '',
    end_dt: '',
    location: '',
    contact_email: '',
    registration_url: '',
    detail_url: '',
    is_main_event: false,
    published: true,
  });
  const [isDirty, setIsDirty] = useState(false);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const deSlug = useMemo(
    () => buildSlug(formData.title || existingEvent?.title || ''),
    [formData.title, existingEvent?.title],
  );

  const translationStatus = useMemo(() => {
    const map: Record<TranslationTarget, boolean> = { en: false, cz: false };
    if (!allEvents || !deSlug) return map;
    map.en = Boolean(allEvents.find((event) => event.locale === 'en' && event.slug === deSlug));
    map.cz = Boolean(allEvents.find((event) => event.locale === 'cz' && event.slug === deSlug));
    return map;
  }, [allEvents, deSlug]);

  const hasGermanBaseRecord = useMemo(
    () => Boolean(allEvents?.find((event) => event.locale === 'de' && event.slug === deSlug)),
    [allEvents, deSlug],
  );

  const existingMainEvent = allEvents?.find(
    (event) => event.is_main_event && event.locale === 'de' && event.id !== id,
  );

  useEffect(() => {
    if (existingEvent) {
      if (existingEvent.locale !== 'de' && allEvents) {
        const germanVariant = allEvents.find(
          (event) => event.locale === 'de' && event.slug === existingEvent.slug,
        );
        if (germanVariant && germanVariant.id !== existingEvent.id) {
          navigate(`/admin/calendar/${germanVariant.id}`);
          return;
        }
      }

      setFormData({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        category: existingEvent.category || '',
        start_dt: toDateTimeInputValue(existingEvent.start_dt),
        end_dt: toDateTimeInputValue(existingEvent.end_dt),
        location: existingEvent.location || '',
        contact_email: existingEvent.contact_email || '',
        registration_url: existingEvent.registration_url || '',
        detail_url: existingEvent.detail_url || '',
        is_main_event: existingEvent.is_main_event || false,
        published: existingEvent.published !== false,
      });
      setIsDirty(false);
    }
  }, [existingEvent, allEvents, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_dt) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    const generatedSlug = buildSlug(formData.title);
    const duplicateSlug = allEvents?.find(
      (event) => event.id !== id && event.locale === 'de' && event.slug === generatedSlug,
    );
    if (duplicateSlug) {
      toast.error('Für diesen Titel existiert bereits ein deutscher Termin.');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        slug: generatedSlug,
        description: formData.description.trim() || null,
        category: formData.category || null,
        start_dt: new Date(formData.start_dt).toISOString(),
        end_dt: formData.end_dt ? new Date(formData.end_dt).toISOString() : null,
        location: formData.location.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        registration_url: formData.registration_url.trim() || null,
        detail_url: formData.detail_url.trim() || null,
        is_main_event: formData.is_main_event,
        published: formData.published,
        locale: 'de',
      };

      if (isEditing) {
        await updateEvent.mutateAsync({ id, ...eventData });
        toast.success('Deutscher Termin aktualisiert');
      } else {
        await createEvent.mutateAsync(eventData);
        toast.success('Deutscher Termin erstellt');
      }
      setIsDirty(false);
      navigate('/admin/calendar');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error));
    }
  };

  const handleTranslateTo = async (targetLocale: TranslationTarget) => {
    if (!formData.title || !formData.start_dt) {
      toast.error('Bitte erst deutschen Termin speichern (Titel + Startdatum).');
      return;
    }

    if (!hasGermanBaseRecord) {
      toast.error('Bitte zuerst den deutschen Termin speichern.');
      return;
    }

    const sourceTitle = formData.title.trim();
    const sourceDescription = formData.description.trim();
    if (!sourceTitle && !sourceDescription) {
      toast.error('Es gibt keinen deutschen Text zum Übersetzen.');
      return;
    }

    try {
      const translated = await translate.mutateAsync({
        sourceLocale: 'de',
        targetLocale,
        context: 'Kalendertermin oder Veranstaltung für die Vereinswebsite',
        fields: { title: sourceTitle, description: sourceDescription },
      });

      const translatedTitle = String(translated.title || '').trim();
      const translatedDescription = String(translated.description || '').trim();
      if (!translatedTitle && !translatedDescription) {
        toast.error('DeepL hat keine verwertbaren Texte geliefert.');
        return;
      }

      const existingTranslation = allEvents?.find(
        (event) => event.locale === targetLocale && event.slug === deSlug,
      );

      const payload = {
        title: translatedTitle || sourceTitle,
        slug: deSlug,
        description: translatedDescription || sourceDescription || null,
        category: formData.category || null,
        start_dt: new Date(formData.start_dt).toISOString(),
        end_dt: formData.end_dt ? new Date(formData.end_dt).toISOString() : null,
        location: formData.location.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        registration_url: formData.registration_url.trim() || null,
        detail_url: formData.detail_url.trim() || null,
        is_main_event: formData.is_main_event,
        published: formData.published,
        locale: targetLocale,
      };

      if (existingTranslation) {
        await updateEvent.mutateAsync({ id: existingTranslation.id, ...payload });
      } else {
        await createEvent.mutateAsync(payload);
      }
      toast.success(`Übersetzung ${targetLocale.toUpperCase()} gespeichert`);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Übersetzung fehlgeschlagen'));
    }
  };

  const isSubmitting = createEvent.isPending || updateEvent.isPending;

  if (isEditing && isLoadingEvent) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Termin bearbeiten' : 'Neuer Termin'}</h1>
          <p className="text-muted-foreground text-sm">Bearbeitung erfolgt immer in Deutsch (DE)</p>
        </div>
      </div>

      {/* Sticky save bar */}
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

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Basic info */}
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
                  placeholder="Weitere Informationen zum Termin..."
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

          {/* Contact & Registration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                Anmeldung &amp; Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration_url">Anmelde-URL</Label>
                <Input
                  id="registration_url"
                  type="url"
                  value={formData.registration_url}
                  onChange={(e) => updateField('registration_url', e.target.value)}
                  placeholder="https://anmeldung.example.de"
                />
                <p className="text-xs text-muted-foreground">Wird als „Zur Anmeldung"-Button angezeigt</p>
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

        {/* Right column: sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="font-medium">Veröffentlicht</Label>
                  <p className="text-xs text-muted-foreground">Termin im Kalender anzeigen</p>
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

          {/* Category */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Main Event */}
          <Card className="border-accent/50 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <Label htmlFor="is_main_event" className="font-medium">Hauptevent</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auf der Startseite mit Countdown
                    </p>
                  </div>
                </div>
                <Switch
                  id="is_main_event"
                  checked={formData.is_main_event}
                  onCheckedChange={(checked) => updateField('is_main_event', checked)}
                  disabled={!!existingMainEvent && !formData.is_main_event}
                />
              </div>
              {existingMainEvent && !formData.is_main_event && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>„{existingMainEvent.title}"</strong> ist bereits Hauptevent.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Translations */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Übersetzungen</CardTitle>
            </CardHeader>
            <CardContent>
              <LocaleTranslationBox
                description="DE bleibt führend. EN/CZ werden separat erzeugt."
                status={translationStatus}
                onTranslate={handleTranslateTo}
                isTranslating={translate.isPending}
                disabled={!deSlug || !hasGermanBaseRecord}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
