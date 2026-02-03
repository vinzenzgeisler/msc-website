import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Calendar, Users, Trophy, Wrench } from 'lucide-react';
import { useCalendarEvent, useCreateCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_dt: '',
    end_dt: '',
    location: '',
  });

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        category: existingEvent.category || '',
        start_dt: existingEvent.start_dt ? format(new Date(existingEvent.start_dt), "yyyy-MM-dd'T'HH:mm") : '',
        end_dt: existingEvent.end_dt ? format(new Date(existingEvent.end_dt), "yyyy-MM-dd'T'HH:mm") : '',
        location: existingEvent.location || '',
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
        locale: 'de', // Default locale
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
                placeholder="z.B. Jahreshauptversammlung"
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
                placeholder="z.B. Vereinsheim"
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
