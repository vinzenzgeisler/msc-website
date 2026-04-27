import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Building2 } from 'lucide-react';
import { useSponsors } from '@/hooks/useSponsors';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/i18n/locale-utils';
import { trackEvent } from '@/lib/analytics';

export function SponsorsSection() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: sponsors, isLoading, error } = useSponsors();
  const sectionContent = useContentWithFallback('home', 'sponsors', {
    title: localize(locale, {
      de: 'Partner & Sponsoren',
      cz: 'Partneri a sponzori',
      en: 'Partners & Sponsors',
      pl: 'Partnerzy i sponsorzy',
    }),
    subtitle: localize(locale, {
      de: 'Danke an alle, die unseren Verein unterstützen',
      cz: 'Dekuji vsem, kdo podporuji nas klub',
      en: 'Thanks to everyone supporting our club',
      pl: 'Dziekujemy wszystkim, ktorzy wspieraja nasz klub',
    }),
  });

  const mainSponsors = (sponsors || []).filter(s => s.tier === 'main' && s.active);
  const partners = (sponsors || []).filter(s => s.tier === 'partner' && s.active);
  const supporters = (sponsors || []).filter(s => s.tier === 'supporter' && s.active);

  if (isLoading) {
    return (
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="container">
          <div className="mb-12 text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render section if no sponsors and there was an error (e.g., table doesn't exist)
  if (error && (!sponsors || sponsors.length === 0)) {
    return null;
  }

  // Show empty state if no sponsors yet
  if (!sponsors || sponsors.length === 0) {
    return (
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/30" />
        
        <div className="container relative">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-black uppercase tracking-tight md:text-4xl">
              {sectionContent.title}
            </h2>
            <p className="text-muted-foreground">
              {sectionContent.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{localize(locale, {
              de: 'Noch keine Sponsoren eingetragen',
              cz: 'Zatim nebyli zadani zadni sponzori',
              en: 'No sponsors added yet',
              pl: 'Nie dodano jeszcze sponsorow',
            })}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Subtle diagonal background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/30" />
      
      <div className="container relative">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-black uppercase tracking-tight md:text-4xl">
            {sectionContent.title}
          </h2>
          <p className="text-muted-foreground">
            {sectionContent.subtitle}
          </p>
        </div>

        {/* Main Sponsors */}
        {mainSponsors.length > 0 && (
          <div className="mb-10">
            <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-primary">
              {t.nav.mainSponsors}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:mx-auto sm:max-w-3xl sm:grid-cols-2 lg:grid-cols-3">
              {mainSponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website || '#'}
                  target={sponsor.website ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={() => sponsor.website && trackEvent('sponsor_click', { category: 'outbound', label: `home_main:${sponsor.name}` })}
                  className="group relative flex h-28 w-full items-center justify-center overflow-hidden rounded-none border-2 border-primary/20 bg-card p-4 transition-all hover:border-primary hover:shadow-lg sm:h-36 sm:p-6 lg:h-48 lg:p-10"
                >
                  {/* Diagonal accent on hover */}
                  <div className="absolute -right-8 -top-8 h-16 w-16 rotate-45 bg-primary/0 transition-all group-hover:bg-primary/10" />
                  
                  {sponsor.logo_url ? (
                    <img 
                      src={sponsor.logo_url} 
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-black uppercase tracking-wider text-foreground">
                      {sponsor.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Partners */}
        {partners.length > 0 && (
          <div className="mb-10">
            <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Partner
            </p>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {partners.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website || '#'}
                  target={sponsor.website ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={() => sponsor.website && trackEvent('sponsor_click', { category: 'outbound', label: `home_partner:${sponsor.name}` })}
                  className="group flex h-32 items-center justify-center rounded-none border border-border bg-card px-6 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  {sponsor.logo_url ? (
                    <img 
                      src={sponsor.logo_url} 
                      alt={sponsor.name}
                      className="max-h-24 max-w-full object-contain grayscale transition-all group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                      {sponsor.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Supporters */}
        {supporters.length > 0 && (
          <div className="mb-10">
            <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Unterstützer
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {supporters.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website || '#'}
                  target={sponsor.website ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={() => sponsor.website && trackEvent('sponsor_click', { category: 'outbound', label: `home_supporter:${sponsor.name}` })}
                  className="flex min-h-12 items-center justify-center rounded-none border border-border bg-card px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground hover:shadow-sm"
                >
                  {sponsor.name}
                </a>
              ))}
            </div>
          </div>
        )}

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
