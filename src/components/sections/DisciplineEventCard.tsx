import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { de, cs, enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { getCalendarEventClickTarget } from '@/lib/calendar-event-links';

interface CalendarEvent {
  id: string;
  title: string;
  start_dt: string;
  end_dt?: string | null;
  location?: string | null;
  category?: string | null;
  description?: string | null;
  detail_url?: string | null;
  is_main_event?: boolean;
  slug: string;
}

interface DisciplineEventCardProps {
  event: CalendarEvent;
}

const CATEGORY_LABELS: Record<string, string> = {
  motocross: 'Motocross',
  trial: 'Trial',
  touring: 'Touristik',
  allgemein: 'Allgemein',
  verein: 'Verein',
};

export function DisciplineEventCard({ event }: DisciplineEventCardProps) {
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const dateLocale = locale === 'cz' ? cs : locale === 'en' ? enUS : de;
  const clickTarget = getCalendarEventClickTarget(event);

  const formatEventDate = (startDt: string, endDt?: string | null) => {
    const start = new Date(startDt);
    const end = endDt ? new Date(endDt) : null;

    if (!end) {
      return format(start, 'd. MMMM yyyy', { locale: dateLocale });
    }

    return `${format(start, 'd. MMMM yyyy', { locale: dateLocale })} - ${format(end, 'd. MMMM yyyy', { locale: dateLocale })}`;
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-none border-2 border-border transition-all hover:border-primary hover:shadow-lg ${clickTarget ? 'cursor-pointer' : ''}`}
      onClick={clickTarget ? () => {
        if (clickTarget.startsWith('http')) {
          window.open(clickTarget, '_blank');
        } else {
          navigate(clickTarget);
        }
      } : undefined}
    >
      <CardContent className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-none bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
            {CATEGORY_LABELS[event.category || ''] || event.category || 'Termin'}
          </span>
        </div>

        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatEventDate(event.start_dt, event.end_dt)}
        </div>

        {event.location && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
        )}

        <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          {event.title}
        </h3>

        {event.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        )}
      </CardContent>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
    </Card>
  );
}
