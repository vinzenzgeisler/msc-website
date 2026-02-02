import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

// Mock sponsors data
const sponsors = {
  main: [
    { id: 1, name: 'Havlat', website: 'https://havlat.de' },
    { id: 2, name: 'DEKRA', website: 'https://dekra.de' },
  ],
  partner: [
    { id: 3, name: 'Bergquell', website: 'https://bergquell.de' },
    { id: 4, name: 'Auto-Fit', website: '#' },
    { id: 5, name: 'Kummer', website: '#' },
    { id: 6, name: 'Auto Jahn', website: '#' },
  ],
  supporter: [
    { id: 7, name: 'Sponsor 7', website: '#' },
    { id: 8, name: 'Sponsor 8', website: '#' },
    { id: 9, name: 'Sponsor 9', website: '#' },
    { id: 10, name: 'Sponsor 10', website: '#' },
  ],
};

export default function SponsorsPage() {
  const t = useTranslation();

  const renderSponsorSection = (title: string, items: typeof sponsors.main, size: 'lg' | 'md' | 'sm') => {
    const sizeClasses = {
      lg: 'h-32',
      md: 'h-24',
      sm: 'h-20',
    };

    const gridClasses = {
      lg: 'grid-cols-1 sm:grid-cols-2',
      md: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      sm: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6',
    };

    return (
      <div className="mb-12 last:mb-0">
        <h2 className="mb-6">{title}</h2>
        <div className={`grid gap-4 ${gridClasses[size]}`}>
          {items.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className={`flex items-center justify-center ${sizeClasses[size]} p-4`}>
                  <div className="text-center">
                    <span className="text-lg font-semibold text-muted-foreground group-hover:text-primary">
                      {sponsor.name}
                    </span>
                    <ExternalLink className="mx-auto mt-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.sponsors}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Unsere Partner machen das Oberlausitzer Dreieck möglich
          </p>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16">
        <div className="container">
          {renderSponsorSection('Hauptsponsoren', sponsors.main, 'lg')}
          {renderSponsorSection('Partner', sponsors.partner, 'md')}
          {renderSponsorSection('Unterstützer', sponsors.supporter, 'sm')}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="mb-4">Sponsor werden?</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Werden Sie Partner des MSC Oberlausitzer Dreiländereck und unterstützen Sie 
            den Motorsport im Dreiländereck. Wir bieten attraktive Werbemöglichkeiten.
          </p>
          <a
            href="mailto:sponsoring@msc-oberlausitzer-dreilaendereck.de"
            className="text-primary hover:underline"
          >
            sponsoring@msc-oberlausitzer-dreilaendereck.de
          </a>
        </div>
      </section>
    </MainLayout>
  );
}
