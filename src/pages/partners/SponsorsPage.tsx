import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { useSponsors } from '@/hooks/useSponsors';
import { useSettings } from '@/hooks/useSettings';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { trackEvent } from '@/lib/analytics';
import { SponsorOverview } from '@/components/sponsors/SponsorDisplays';

export default function SponsorsPage() {
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

  return (
    <MainLayout title={intro.title} description={intro.subtitle || undefined}>
      <PageHeader title={intro.title} subtitle={intro.subtitle || undefined} />

      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="space-y-12">
              <div>
                <Skeleton className="mb-6 h-10 w-64" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              </div>
              <div>
                <Skeleton className="mb-6 h-10 w-48" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} className="h-28" />
                  ))}
                </div>
              </div>
            </div>
          ) : error || (!sponsors.main.length && !sponsors.partner.length && !sponsors.supporter.length) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Noch keine Sponsoren eingetragen</p>
            </div>
          ) : (
            <SponsorOverview sponsors={sponsors} />
          )}
        </div>
      </section>

      <section className="bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="mb-4">{cta.title}</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">{cta.content}</p>
          <a
            href={`mailto:${settings?.sponsoring_email || settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}
            onClick={() => trackEvent('contact_click', { category: 'engagement', label: 'sponsoring_email', cta_position: 'sponsors_cta' })}
            className="text-primary hover:underline"
          >
            {settings?.sponsoring_email || settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}
          </a>
        </div>
      </section>
    </MainLayout>
  );
}
