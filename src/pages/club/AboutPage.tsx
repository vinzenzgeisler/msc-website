import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Users, History, Award, ChevronRight, Bike, Target, MapPin } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { RichContent } from '@/components/content/RichContent';

const fallbacks = {
  de: {
    intro: { title: 'Über uns', subtitle: 'Motorsport mit Leidenschaft im Dreiländereck', content: 'Der MSC Oberlausitzer Dreiländereck e.V. ist ein gemeinnütziger Motorsportverein mit Sitz in der Oberlausitz. Seit unserer Gründung im Jahr 2013 verbinden wir die Begeisterung für Motorsport mit der Förderung von Jugendarbeit, Verkehrssicherheit und grenzüberschreitender Zusammenarbeit mit Vereinen in Tschechien und Polen. Unsere Mitglieder sind aktive und ehemalige Motorsportler sowie Freunde des Motorsports aus der gesamten Region.' },
    mission: { title: 'Unsere Mission', content: 'Wir fördern den Motorsport in der Oberlausitz und darüber hinaus. Unser Ziel ist es, eine lebendige Motorsport-Gemeinschaft zu schaffen, die Jung und Alt gleichermaßen begeistert. Dabei legen wir besonderen Wert auf die Jugendförderung, die Erhöhung der Verkehrssicherheit und den Ausbau der Attraktivität unserer Region.' },
    values: { title: 'Unsere Werte', content: '<ul><li><strong>Gemeinschaft</strong> – Motorsport verbindet: Wir sind ein Verein, in dem Zusammenhalt großgeschrieben wird.</li><li><strong>Sicherheit</strong> – Verantwortungsvolles Fahren und Handeln stehen bei uns an erster Stelle.</li><li><strong>Jugendförderung</strong> – Wir investieren in die nächste Generation von Motorsportlern.</li><li><strong>Grenzüberschreitend</strong> – Wir pflegen aktiv Verbindungen zu Motorsportvereinen in Tschechien und Polen.</li><li><strong>Leidenschaft</strong> – Ob auf der MX-Strecke, im Trial-Gelände oder auf Motorradtouren – bei uns dreht sich alles um die Begeisterung für den Motorsport.</li></ul>' },
  },
  cz: {
    intro: { title: 'O nás', subtitle: 'Motorsport s vášní v trojzemí', content: 'MSC Oberlausitzer Dreiländereck e.V. je neziskový motorsportový klub se sídlem v Horní Lužici. Od našeho založení v roce 2013 spojujeme nadšení pro motorsport s podporou mládeže, bezpečnosti silničního provozu a přeshraniční spolupráce s kluby v Čechách a Polsku.' },
    mission: { title: 'Naše mise', content: 'Podporujeme motorsport v Horní Lužici i za jejími hranicemi. Naším cílem je vytvořit živou motorsportovou komunitu, která nadchne mladé i staré.' },
    values: { title: 'Naše hodnoty', content: '<ul><li><strong>Komunita</strong> – Motorsport spojuje.</li><li><strong>Bezpečnost</strong> – Zodpovědná jízda je na prvním místě.</li><li><strong>Podpora mládeže</strong> – Investujeme do další generace motorsportovců.</li><li><strong>Přeshraniční</strong> – Aktivně udržujeme spojení s kluby v Čechách a Polsku.</li><li><strong>Vášeň</strong> – Vše se točí kolem nadšení pro motorsport.</li></ul>' },
  },
  en: {
    intro: { title: 'About Us', subtitle: 'Motorsport with passion in the tri-border region', content: 'MSC Oberlausitzer Dreiländereck e.V. is a non-profit motorsport club based in Upper Lusatia. Since our founding in 2013, we combine the enthusiasm for motorsport with the promotion of youth work, road safety, and cross-border cooperation with clubs in the Czech Republic and Poland.' },
    mission: { title: 'Our Mission', content: 'We promote motorsport in Upper Lusatia and beyond. Our goal is to create a vibrant motorsport community that inspires young and old alike.' },
    values: { title: 'Our Values', content: '<ul><li><strong>Community</strong> – Motorsport connects.</li><li><strong>Safety</strong> – Responsible driving comes first.</li><li><strong>Youth Development</strong> – We invest in the next generation of motorsport athletes.</li><li><strong>Cross-border</strong> – We actively maintain connections with clubs in the Czech Republic and Poland.</li><li><strong>Passion</strong> – Everything revolves around the enthusiasm for motorsport.</li></ul>' },
  },
};

export default function AboutPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const lang = (locale === 'cz' || locale === 'en') ? locale : 'de';
  const fb = fallbacks[lang];
  const introBlockTitle =
    lang === 'cz'
      ? 'Kdo jsme'
      : lang === 'en'
        ? 'Who We Are'
        : 'Wer wir sind';

  const intro = useContentWithFallback('about', 'intro', fb.intro);
  const mission = useContentWithFallback('about', 'mission', fb.mission);
  const values = useContentWithFallback('about', 'values', fb.values);

  const quickLinks = [
    { icon: Users, title: t.nav.board, description: intro.primary_button_label || 'Lernen Sie unser Vorstandsteam kennen', path: '/club/board' },
    { icon: History, title: t.nav.history, description: intro.secondary_button_label || 'Die Geschichte unseres Vereins seit 2013', path: '/club/history' },
    { icon: Award, title: t.nav.membership, description: intro.stat_one_label || 'Werden Sie Teil unserer Gemeinschaft', path: '/club/membership' },
  ];

  const sections = [
    { icon: Bike, title: t.nav.motocross, path: '/sections/motocross' },
    { icon: Target, title: t.nav.trial, path: '/sections/trial' },
    { icon: MapPin, title: t.nav.touring, path: '/sections/touring' },
  ];

  return (
    <MainLayout title={intro.title} description={intro.subtitle || undefined}>
      <PageHeader
        title={intro.isLoading ? '...' : intro.title}
        subtitle={intro.subtitle || undefined}
        imageUrl={intro.header_image_url || undefined}
        imageAlt={intro.header_image_alt || intro.title}
      />

      {/* Mission & Values */}
      <section className="border-t border-border bg-muted/20 py-14 md:py-16">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
              <CardContent className="p-8">
                <div className="mb-5 h-1.5 w-14 bg-primary" />
                <h2 className="mb-3 text-2xl font-bold">{introBlockTitle}</h2>
                {intro.isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ) : intro.content ? (
                  <RichContent
                    content={intro.content}
                    className="text-left text-muted-foreground prose-p:leading-8"
                  />
                ) : (
                  <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                )}
              </CardContent>
            </Card>
            <Card className="overflow-hidden border border-primary/10 bg-card text-card-foreground shadow-sm">
              <CardContent className="p-8">
                <div className="mb-5 h-1.5 w-14 bg-accent" />
                <h2 className="mb-4 text-2xl font-bold">{mission.title}</h2>
                {mission.content ? (
                  <RichContent
                    content={mission.content}
                    className="text-left text-muted-foreground prose-p:leading-8"
                  />
                ) : (
                  <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                )}
              </CardContent>
            </Card>
            <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
              <CardContent className="p-8">
                <div className="mb-5 h-1.5 w-14 bg-primary" />
                <h2 className="mb-4 text-2xl font-bold">{values.title}</h2>
                {values.content ? (
                  <RichContent
                    content={values.content}
                    className="text-left text-muted-foreground prose-li:mb-3 prose-li:leading-7"
                  />
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
                className="group relative overflow-hidden border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 transition-colors group-hover:bg-primary/20">
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
                  <div className="mb-4 flex h-16 w-16 items-center justify-center bg-primary/10 transition-colors group-hover:bg-primary/20">
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
