import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useDisciplineHighlights } from '@/hooks/useStructuredContent';

export default function TouringPage() {
  const t = useTranslation();
  const intro = useContentWithFallback('touring', 'intro', { title: t.nav.touring, subtitle: '', content: '' });
  const { data: highlights, isLoading } = useDisciplineHighlights('touring');
  const iconMap: Record<string, typeof MapPin> = { training: MapPin, events: Calendar, award: Users, track: MapPin, community: Users, tour: Calendar };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-56 mb-2 bg-primary-foreground/10" />
              <Skeleton className="h-6 w-80 bg-primary-foreground/10" />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
                {intro.title || t.nav.touring}
              </h1>
              <p className="text-lg text-primary-foreground/80">
                {intro.subtitle || ''}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {isLoading ? (
              <Skeleton className="h-24 w-full mb-8" />
            ) : (
              <div 
                className="mb-8 text-lg text-muted-foreground prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: (intro.content || '').replace(/\n/g, '<br />') }}
              />
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {(highlights && highlights.length > 0 ? highlights : [
                { id: 'fallback-1', title: 'Touren', description: 'Noch keine Informationen hinterlegt.', icon: 'tour' },
                { id: 'fallback-2', title: 'Gemeinschaft', description: 'Noch keine Informationen hinterlegt.', icon: 'community' },
                { id: 'fallback-3', title: t.nav.touring, description: intro.subtitle || 'Noch keine Informationen hinterlegt.', icon: 'award' },
              ]).map((item) => {
                const Icon = iconMap[item.icon] || Users;
                return (
                  <Card key={item.id}>
                    <CardContent className="p-6 text-center">
                      <Icon className="mx-auto mb-3 h-10 w-10 text-primary" />
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Button asChild>
                <Link to="/calendar">Alle Termine ansehen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
