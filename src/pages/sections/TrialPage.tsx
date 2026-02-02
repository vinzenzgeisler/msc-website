import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Calendar, Award } from 'lucide-react';

export default function TrialPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.trial}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Präzision und Geschicklichkeit
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="mb-8 text-lg text-muted-foreground">
              Trial ist die Kunst der Fahrzeugbeherrschung. In unserer Trial-Sparte 
              trainieren wir das Überwinden von natürlichen und künstlichen Hindernissen 
              mit möglichst wenig Fehlerpunkten. Für alle, die Präzision und Technik lieben.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Technik</h3>
                  <p className="text-sm text-muted-foreground">
                    Fokus auf Fahrzeugbeherrschung und Balance
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Training</h3>
                  <p className="text-sm text-muted-foreground">
                    Übungsgelände mit verschiedenen Sektionen
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="font-semibold">Wettbewerbe</h3>
                  <p className="text-sm text-muted-foreground">
                    Teilnahme an regionalen Trial-Veranstaltungen
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
