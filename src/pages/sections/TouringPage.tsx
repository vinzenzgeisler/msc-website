import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TouringPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.touring}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Gemeinsam die schönsten Strecken erleben
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <p className="mb-8 text-lg text-muted-foreground">
              Die Sparte Motorradtouristik organisiert regelmäßige Ausfahrten durch das 
              Zittauer Gebirge und darüber hinaus. Von gemütlichen Tagestouren bis zu 
              mehrtägigen Fahrten – bei uns steht das gemeinsame Erlebnis im Vordergrund.
            </p>

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
