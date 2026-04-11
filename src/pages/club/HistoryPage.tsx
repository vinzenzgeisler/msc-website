import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useHistoryTimelineEntries } from '@/hooks/useStructuredContent';

export default function HistoryPage() {
  const t = useTranslation();
  const intro = useContentWithFallback('history', 'intro', {
    title: t.nav.history,
    subtitle: 'Geschichte des Vereins',
    content: '',
  });
  const { data: timelineEntries, isLoading } = useHistoryTimelineEntries();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.history}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {intro.subtitle || 'Geschichte des Vereins'}
          </p>
        </div>
      </section>

      {intro.content ? (
        <section className="py-10">
          <div className="container">
            <div
              className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </section>
      ) : null}

      {/* Timeline */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : timelineEntries && timelineEntries.length > 0 ? (
              <div className="space-y-8">
                {timelineEntries.map((entry) => (
                  <div key={entry.id} className="grid gap-4 border-l-2 border-primary/30 pl-6 md:grid-cols-[120px_1fr]">
                    <div className="text-lg font-black text-primary">{entry.year_label}</div>
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold">{entry.title}</h2>
                      {entry.image_url ? (
                        <img src={entry.image_url} alt={entry.title} className="h-48 w-full rounded-lg object-cover" />
                      ) : null}
                      {entry.description ? (
                        <div
                          className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: entry.description.replace(/\n/g, '<br />') }}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Noch keine Chronik hinterlegt.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
