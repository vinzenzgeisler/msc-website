import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// Mock sponsors - will be replaced with database data
const mainSponsors = [
  { id: 1, name: 'Havlat', tier: 'main' },
  { id: 2, name: 'DEKRA', tier: 'main' },
];

const partners = [
  { id: 3, name: 'Bergquell', tier: 'partner' },
  { id: 4, name: 'Auto-Fit', tier: 'partner' },
  { id: 5, name: 'Kummer', tier: 'partner' },
  { id: 6, name: 'Auto Jahn', tier: 'partner' },
];

export function SponsorsSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Subtle diagonal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/30" />
      
      <div className="container relative">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-black uppercase tracking-tight md:text-4xl">
            Partner & Sponsoren
          </h2>
          <p className="text-muted-foreground">
            Danke an alle, die unsere Veranstaltung unterstützen
          </p>
        </div>

        {/* Main Sponsors */}
        <div className="mb-10">
          <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-primary">
            Hauptsponsoren
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {mainSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="group relative flex h-32 w-64 items-center justify-center overflow-hidden rounded-none border-2 border-primary/20 bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                {/* Diagonal accent on hover */}
                <div className="absolute -right-8 -top-8 h-16 w-16 rotate-45 bg-primary/0 transition-all group-hover:bg-primary/10" />
                
                <span className="text-2xl font-black uppercase tracking-wider text-foreground">
                  {sponsor.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-10">
          <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Partner
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {partners.map((sponsor) => (
              <div
                key={sponsor.id}
                className="group flex h-20 items-center justify-center rounded-none border border-border bg-card px-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <span className="text-lg font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                  {sponsor.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            className="group rounded-none font-semibold uppercase tracking-wider"
            asChild
          >
            <Link to="/partners/sponsors">
              Alle Partner ansehen
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
