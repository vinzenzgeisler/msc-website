import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, History, Award, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.about}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Motorsport mit Leidenschaft im Dreiländereck
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              Der MSC Oberlausitzer Dreiländereck e.V. ist ein traditionsreicher 
              Motorsportverein im Herzen des Zittauer Gebirges. Mit unseren drei 
              Sparten – Motorradtouristik, Motocross und Trial – bieten wir für 
              jeden Motorsportbegeisterten das passende Angebot.
            </p>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              Unser Höhepunkt ist das jährliche „Oberlausitzer Dreieck", ein 
              Demolauf für historische und moderne Renn- und Sportfahrzeuge auf 
              der legendären 5,9 km langen Bergstrecke zwischen Saalendorf, 
              Jonsdorf und Waltersdorf.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Als Verein leben wir nicht nur den Motorsport, sondern auch die 
              Gemeinschaft. Regelmäßige Treffen, gemeinsame Ausfahrten und unsere 
              Vereinsveranstaltungen schweißen uns zusammen.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Users className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">{t.nav.board}</h3>
                <p className="mb-4 text-muted-foreground">
                  Lernen Sie unser Vorstandsteam kennen
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
                  Die Geschichte unseres Vereins
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
                  Werden Sie Teil unserer Gemeinschaft
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
