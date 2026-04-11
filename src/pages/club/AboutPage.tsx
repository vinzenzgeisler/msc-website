import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Users, History, Award, ChevronRight, Bike, Target, MapPin } from 'lucide-react';
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

  const heroImage = intro.image_url || heroAbout;

  const quickLinks = [
    { icon: Users, title: t.nav.board, description: intro.primary_button_label || 'Lernen Sie unser Vorstandsteam kennen', path: '/club/board' },
    { icon: History, title: t.nav.history, description: intro.secondary_button_label || 'Die Geschichte unseres Vereins', path: '/club/history' },
    { icon: Award, title: t.nav.membership, description: intro.stat_one_label || 'Werden Sie Teil unserer Gemeinschaft', path: '/club/membership' },
  ];

  const sections = [
    { icon: Bike, title: t.nav.motocross, path: '/sections/motocross' },
    { icon: Target, title: t.nav.trial, path: '/sections/trial' },
    { icon: MapPin, title: t.nav.touring, path: '/sections/touring' },
  ];

  return (
    <MainLayout>
      {/* Hero with image */}
      <section className="relative min-h-[340px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={intro.image_alt || intro.title} className="h-full w-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
        <div className="container relative z-10 pb-10 pt-24">
          {intro.isLoading ? (
            <>
              <Skeleton className="h-12 w-64 mb-2 bg-foreground/10" />
              <Skeleton className="h-6 w-96 bg-foreground/10" />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">{intro.title}</h1>
              {intro.subtitle && <p className="text-lg text-muted-foreground">{intro.subtitle}</p>}
            </>
          )}
        </div>
      </section>

      {/* About Content */}
      {(intro.isLoading || intro.content) && (
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
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }} />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Values */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
              <CardContent className="p-8">
                <h2 className="mb-4 text-2xl font-bold">{mission.title || 'Unsere Mission'}</h2>
                {mission.content ? (
                  <div className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: mission.content.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-primary-foreground/70">Noch keine Inhalte hinterlegt.</p>
                )}
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <h2 className="mb-4 text-2xl font-bold">{values.title || 'Unsere Werte'}</h2>
                {values.content ? (
                  <div className="prose dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: values.content.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sektionen */}
      <section className="border-t border-border py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">Unsere Sektionen</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((section) => (
              <Link key={section.path} to={section.path}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{section.title}</h3>
                    <span className="text-sm text-muted-foreground">Mehr erfahren →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {quickLinks.map((link) => (
              <Card key={link.path} className="group transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <link.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{link.title}</h3>
                  <p className="mb-4 text-muted-foreground">{link.description}</p>
                  <Button variant="outline" asChild>
                    <Link to={link.path}>Mehr erfahren<ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
