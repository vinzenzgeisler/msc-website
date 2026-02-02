import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Trophy } from 'lucide-react';

export default function MotocrossPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.motocross}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Action und Adrenalin im Gelände
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="mb-8 text-lg text-muted-foreground">
              Unsere Motocross-Sparte bietet Training und Fahrpraxis auf 
              unserer vereinseigenen Strecke. Ob Anfänger oder Fortgeschrittener – 
              bei uns findest du die perfekte Umgebung, um deine Fähigkeiten zu verbessern.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Strecke</h3>
                  <p className="text-sm text-muted-foreground">
                    Vereinseigene Motocross-Strecke im Dreiländereck
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Training</h3>
                  <p className="text-sm text-muted-foreground">
                    Regelmäßige Trainingszeiten nach Absprache
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Veranstaltungen</h3>
                  <p className="text-sm text-muted-foreground">
                    Teilnahme an regionalen Wettbewerben
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
