import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContentWithFallback } from '@/hooks/usePageContent';

export default function TouringPage() {
  const t = useTranslation();
  
  const intro = useContentWithFallback('touring', 'intro', {
    title: t.nav.touring,
    subtitle: 'Gemeinsam die schönsten Strecken erleben',
    content: `Die Sparte Motorradtouristik organisiert regelmäßige Ausfahrten durch das 
    Zittauer Gebirge und darüber hinaus. Von gemütlichen Tagestouren bis zu 
    mehrtägigen Fahrten – bei uns steht das gemeinsame Erlebnis im Vordergrund.`,
  });

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          {intro.isLoading ? (
            <>
              <Skeleton className="h-12 w-56 mb-2 bg-primary-foreground/10" />
              <Skeleton className="h-6 w-80 bg-primary-foreground/10" />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
                {intro.title}
              </h1>
              <p className="text-lg text-primary-foreground/80">
                {intro.subtitle}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {intro.isLoading ? (
              <Skeleton className="h-24 w-full mb-8" />
            ) : (
              <div 
                className="mb-8 text-lg text-muted-foreground prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
              />
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Touren</h3>
                  <p className="text-sm text-muted-foreground">
                    Durch das Dreiländereck und die umliegenden Gebirge
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Termine</h3>
                  <p className="text-sm text-muted-foreground">
                    Regelmäßige Ausfahrten von April bis Oktober
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Gemeinschaft</h3>
                  <p className="text-sm text-muted-foreground">
                    Für Anfänger und erfahrene Fahrer gleichermaßen
                  </p>
                </CardContent>
              </Card>
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
