import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Clock } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useHistoryTimelineEntries } from '@/hooks/useStructuredContent';
import heroHistory from '@/assets/hero-history.jpg';

export default function HistoryPage() {
  const t = useTranslation();
  const intro = useContentWithFallback('history', 'intro', {
    title: t.nav.history,
    subtitle: 'Geschichte des Vereins',
    content: '',
  });
  const { data: timelineEntries, isLoading } = useHistoryTimelineEntries();
  const heroImage = intro.image_url || heroHistory;

  return (
    <MainLayout>
      {/* Hero with image */}
      <section className="relative min-h-[300px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={intro.image_alt || intro.title} className="h-full w-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
        <div className="container relative z-10 pb-10 pt-24">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {intro.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {intro.subtitle || 'Geschichte des Vereins'}
          </p>
        </div>
      </section>

      {intro.content ? (
        <section className="py-12">
          <div className="container">
            <div
              className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </section>
      ) : null}

      {/* Timeline */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : timelineEntries && timelineEntries.length > 0 ? (
              <div className="relative space-y-12 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
                {timelineEntries.map((entry) => (
                  <div key={entry.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <span className="inline-block rounded bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        {entry.year_label}
                      </span>
                      <h2 className="text-xl font-bold">{entry.title}</h2>
                      {entry.image_url ? (
                        <img src={entry.image_url} alt={entry.title} className="h-48 w-full rounded-lg object-cover" loading="lazy" />
                      ) : null}
                      {entry.description ? (
                        <div
                          className="prose dark:prose-invert max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: entry.description.replace(/\n/g, '<br />') }}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                  <History className="h-12 w-12" />
                  <p className="text-lg font-medium">Noch keine Chronik hinterlegt.</p>
                  <p className="text-sm">Die Vereinsgeschichte kann im Admin-Bereich gepflegt werden.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
