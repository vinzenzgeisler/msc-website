import { useState, useEffect } from 'react';
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
import { ArrowLeft, Loader2, Calendar, Users, Trophy, Wrench, Star, AlertCircle } from 'lucide-react';
import { useCalendarEvent, useCalendarEvents, useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

const categories = [
  { value: 'verein', label: 'Verein', icon: Users },
  { value: 'veranstaltung', label: 'Veranstaltung', icon: Trophy },
  { value: 'training', label: 'Training', icon: Calendar },
  { value: 'orgteam', label: 'Org-Team', icon: Wrench },
];

export default function CalendarFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { data: existingEvent, isLoading: isLoadingEvent } = useCalendarEvent(isEditing ? id : '');
  const { data: allEvents } = useCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();

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

  // Check if there's already a main event
  const existingMainEvent = allEvents?.find(e => e.is_main_event && e.id !== id);

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        category: existingEvent.category || '',
        start_dt: existingEvent.start_dt ? format(new Date(existingEvent.start_dt), "yyyy-MM-dd'T'HH:mm") : '',
        end_dt: existingEvent.end_dt ? format(new Date(existingEvent.end_dt), "yyyy-MM-dd'T'HH:mm") : '',
        location: existingEvent.location || '',
        contact_email: existingEvent.contact_email || '',
        is_main_event: existingEvent.is_main_event || false,
        published: existingEvent.published !== false,
      });
    }
  }, [existingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start_dt) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        start_dt: new Date(formData.start_dt).toISOString(),
        end_dt: formData.end_dt ? new Date(formData.end_dt).toISOString() : null,
        location: formData.location || null,
        contact_email: formData.contact_email || null,
        is_main_event: formData.is_main_event,
        published: formData.published,
        locale: 'de',
      };

      if (isEditing) {
        await updateEvent.mutateAsync({ id, ...eventData });
        toast.success('Termin aktualisiert');
      } else {
        await createEvent.mutateAsync(eventData);
        toast.success('Termin erstellt');
      }
      navigate('/admin/calendar');
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Termin bearbeiten' : 'Neuer Termin'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Bearbeiten Sie die Termindaten' : 'Erstellen Sie einen neuen Termin'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Termindaten</CardTitle>
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
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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

            {/* Main Event Toggle */}
            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <Label htmlFor="is_main_event" className="text-base font-medium">
                        Hauptevent
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Zeigt dieses Event auf der Startseite mit Countdown an
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
                
                {existingMainEvent && !formData.is_main_event && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>„{existingMainEvent.title}"</strong> ist bereits als Hauptevent gesetzt.
                      Entfernen Sie dort zuerst die Markierung, um dieses Event als Hauptevent zu setzen.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Published Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="published" className="font-medium">Veröffentlicht</Label>
                <p className="text-sm text-muted-foreground">
                  Termin im Kalender anzeigen
                </p>
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
