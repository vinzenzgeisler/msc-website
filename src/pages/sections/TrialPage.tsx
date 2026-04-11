import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Calendar, Award } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useDisciplineHighlights } from '@/hooks/useStructuredContent';

export default function TrialPage() {
  const t = useTranslation();
  const intro = useContentWithFallback('trial', 'intro', { title: t.nav.trial, subtitle: '', content: '' });
  const { data: highlights, isLoading } = useDisciplineHighlights('trial');
  const iconMap: Record<string, typeof Target> = { training: Target, events: Calendar, award: Award, track: Target, community: Award, tour: Calendar };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-32 mb-2 bg-primary-foreground/10" />
              <Skeleton className="h-6 w-64 bg-primary-foreground/10" />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
                {intro.title || t.nav.trial}
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
                { id: 'fallback-1', title: 'Training', description: 'Noch keine Informationen hinterlegt.', icon: 'training' },
                { id: 'fallback-2', title: 'Veranstaltungen', description: 'Noch keine Informationen hinterlegt.', icon: 'events' },
                { id: 'fallback-3', title: t.nav.trial, description: intro.subtitle || 'Noch keine Informationen hinterlegt.', icon: 'award' },
              ]).map((item) => {
                const Icon = iconMap[item.icon] || Award;
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
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
