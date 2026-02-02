import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

// Mock partner clubs
const partnerClubs = [
  { id: 1, name: 'MC Oybin', location: 'Oybin', website: '#' },
  { id: 2, name: 'ADAC Sachsen', location: 'Dresden', website: '#' },
  { id: 3, name: 'MSC Zittau', location: 'Zittau', website: '#' },
  { id: 4, name: 'Motorsportclub Görlitz', location: 'Görlitz', website: '#' },
];

export default function PartnerClubsPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.partnerClubs}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Gemeinsam für den Motorsport in der Region
          </p>
        </div>
      </section>

      {/* Partner Clubs */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            {partnerClubs.map((club) => (
              <a
                key={club.id}
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="transition-shadow hover:shadow-lg">
                  <CardContent className="flex items-center gap-6 p-6">
                    {/* Logo Placeholder */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {club.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold group-hover:text-primary">
                        {club.name}
                      </h3>
                      <p className="text-muted-foreground">{club.location}</p>
                    </div>
                    
                    <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
