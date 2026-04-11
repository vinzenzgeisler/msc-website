import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Calendar, MapPin, Bike, Trophy, Star, AlertCircle } from 'lucide-react';
import { useCalendarEvent, useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { useCmsTranslation } from '@/hooks/useCmsTranslation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    is_main_event: false,
    published: true,
  });

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
        is_main_event: existingEvent.is_main_event || false,
        published: existingEvent.published !== false,
      });
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
        registration_url: (formData as any).registration_url?.trim() || null,
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
        fields: {
          title: sourceTitle,
          description: sourceDescription,
        },
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
        registration_url: (formData as any).registration_url?.trim() || null,
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? 'Termin bearbeiten' : 'Neuer Termin'}</h1>
          <p className="text-muted-foreground">Bearbeitung erfolgt immer in Deutsch (DE)</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deutscher Hauptinhalt</CardTitle>
          <CardDescription>Füllen Sie die Pflichtfelder (*) aus</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="z.B. 12. Oberlausitzer Dreieck"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_dt">Startdatum *</Label>
                <Input
                  id="start_dt"
                  type="datetime-local"
                  value={formData.start_dt}
                  onChange={(e) => setFormData({ ...formData, start_dt: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_dt">Enddatum</Label>
                <Input
                  id="end_dt"
                  type="datetime-local"
                  value={formData.end_dt}
                  onChange={(e) => setFormData({ ...formData, end_dt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="z.B. Saalendorf - Jonsdorf - Waltersdorf"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Kontakt-E-Mail</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="info@msc-dreilaendereck.de"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Weitere Informationen zum Termin..."
                rows={4}
              />
            </div>

            <LocaleTranslationBox
              description="DE bleibt führend. EN/CZ werden separat erzeugt (zuerst DE speichern)."
              status={translationStatus}
              onTranslate={handleTranslateTo}
              isTranslating={translate.isPending}
              disabled={!deSlug || !hasGermanBaseRecord}
            />

            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <Label htmlFor="is_main_event" className="text-base font-medium">Hauptevent</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Zeigt dieses deutsche Event auf der Startseite mit Countdown an
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="is_main_event"
                    checked={formData.is_main_event}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_main_event: checked })}
                    disabled={!!existingMainEvent && !formData.is_main_event}
                  />
                </div>
                {existingMainEvent && !formData.is_main_event ? (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>„{existingMainEvent.title}"</strong> ist bereits als deutsches Hauptevent gesetzt.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="published" className="font-medium">Veröffentlicht</Label>
                <p className="text-sm text-muted-foreground">Termin im Kalender anzeigen</p>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/calendar')}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
