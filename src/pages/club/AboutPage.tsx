import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Users, History, Award, ChevronRight } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';

export default function AboutPage() {
  const t = useTranslation();
  
  const intro = useContentWithFallback('about', 'intro', {
    title: t.nav.about,
    subtitle: '',
    content: '',
  });
  const mission = useContentWithFallback('about', 'mission', {
    title: 'Unsere Mission',
    content: '',
  });
  const values = useContentWithFallback('about', 'values', {
    title: 'Unsere Werte',
    content: '',
  });

  return (
    <MainLayout>
      {/* Header with optional hero image */}
      <section className="relative bg-primary py-16 text-primary-foreground">
        {intro.image_url && (
          <div className="absolute inset-0">
            <img
              src={intro.image_url}
              alt={intro.image_alt || intro.title}
              className="h-full w-full object-cover opacity-20"
            />
          </div>
        )}
        <div className="container relative">
          {intro.isLoading ? (
            <>
              <Skeleton className="h-12 w-64 mb-2 bg-primary-foreground/10" />
              <Skeleton className="h-6 w-96 bg-primary-foreground/10" />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
                {intro.title}
              </h1>
              {intro.subtitle && (
                <p className="text-lg text-primary-foreground/80">{intro.subtitle}</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {intro.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : intro.content ? (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: intro.content.replace(/\n/g, '<br />') 
                }}
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* Mission & Values as Rich HTML */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="mb-4 text-2xl font-bold">{mission.title || 'Unsere Mission'}</h2>
                {mission.content ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: mission.content.replace(/\n/g, '<br />') }}
                  />
                ) : (
                  <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <h2 className="mb-4 text-2xl font-bold">{values.title || 'Unsere Werte'}</h2>
                {values.content ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: values.content.replace(/\n/g, '<br />') }}
                  />
                ) : (
                  <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links - using CMS button labels */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Users className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{t.nav.board}</h3>
                <p className="mb-4 text-muted-foreground">
                  {intro.primary_button_label || 'Lernen Sie unser Vorstandsteam kennen'}
                </p>
                <Button variant="outline" asChild>
                  <Link to="/club/board">
                    Mehr erfahren
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <History className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{t.nav.history}</h3>
                <p className="mb-4 text-muted-foreground">
                  {intro.secondary_button_label || 'Die Geschichte unseres Vereins'}
                </p>
                <Button variant="outline" asChild>
                  <Link to="/club/history">
                    Mehr erfahren
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Award className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{t.nav.membership}</h3>
                <p className="mb-4 text-muted-foreground">
                  {intro.stat_one_label || 'Werden Sie Teil unserer Gemeinschaft'}
                </p>
                <Button variant="outline" asChild>
                  <Link to="/club/membership">
                    Mehr erfahren
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
