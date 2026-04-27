import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Building2 } from 'lucide-react';
import { useSponsors } from '@/hooks/useSponsors';
import { useSettings } from '@/hooks/useSettings';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { trackEvent } from '@/lib/analytics';

export default function SponsorsPage() {
  const t = useTranslation();
  const { data: allSponsors, isLoading, error } = useSponsors();
  const { data: settings } = useSettings();
  const intro = useContentWithFallback('sponsors', 'intro', {
    title: 'Sponsoren & Partner',
    subtitle: 'Ohne unsere Partner wäre der Motorsport im Dreiländereck nicht möglich',
  });
  const cta = useContentWithFallback('sponsors', 'cta', {
    title: 'Sponsor werden?',
    content: 'Werden Sie Partner des MSC Oberlausitzer Dreiländereck und unterstützen Sie den Motorsport in der Region. Ob als Hauptsponsor, Partner oder Unterstützer – wir bieten attraktive Gegenleistungen und eine engagierte Gemeinschaft.',
  });

  const sponsors = {
    main: (allSponsors || []).filter(s => s.tier === 'main' && s.active),
    partner: (allSponsors || []).filter(s => s.tier === 'partner' && s.active),
    supporter: (allSponsors || []).filter(s => s.tier === 'supporter' && s.active),
  };

  const renderSponsorSection = (title: string, items: typeof sponsors.main, size: 'lg' | 'md' | 'sm') => {
    if (items.length === 0) return null;
    const sizeClasses = { lg: 'h-28 sm:h-32', md: 'h-24', sm: 'h-20' };
    const gridClasses = {
      lg: 'grid-cols-2 md:grid-cols-3',
      md: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
      sm: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    };

    return (
      <div className="mb-12 last:mb-0">
        <h2 className="mb-6">{title}</h2>
        <div className={`grid gap-4 ${gridClasses[size]}`}>
          {items.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.website || '#'}
              target={sponsor.website ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={() => sponsor.website && trackEvent('sponsor_click', { category: 'outbound', label: `sponsors_page:${sponsor.name}` })}
              className="group"
            >
              <Card className="transition-shadow hover:shadow-lg">
                <CardContent className={`flex items-center justify-center ${sizeClasses[size]} p-4`}>
                  {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="text-center">
                      <span className="text-lg font-semibold text-muted-foreground group-hover:text-primary">{sponsor.name}</span>
                      {sponsor.website && <ExternalLink className="mx-auto mt-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <MainLayout title={intro.title} description={intro.subtitle || undefined}>
      <PageHeader title={intro.title} subtitle={intro.subtitle || undefined} />

      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="space-y-12">
              <div><Skeleton className="h-8 w-48 mb-6" /><div className="grid grid-cols-2 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>
            </div>
          ) : error || (!sponsors.main.length && !sponsors.partner.length && !sponsors.supporter.length) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Noch keine Sponsoren eingetragen</p>
            </div>
          ) : (
            <>
              {renderSponsorSection('Hauptsponsoren', sponsors.main, 'lg')}
              {renderSponsorSection('Partner', sponsors.partner, 'md')}
              {renderSponsorSection('Unterstützer', sponsors.supporter, 'sm')}
            </>
          )}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="mb-4">{cta.title}</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">{cta.content}</p>
          <a
            href={`mailto:${settings?.sponsoring_email || settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}
            onClick={() => trackEvent('contact_click', { category: 'engagement', label: 'sponsoring_email' })}
            className="text-primary hover:underline"
          >
            {settings?.sponsoring_email || settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}
          </a>
        </div>
      </section>
    </MainLayout>
  );
}
