import type { Sponsor } from '@/integrations/pocketbase/client';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ExternalLink, Handshake, HeartHandshake, Star } from 'lucide-react';

type SponsorTileSize = 'hero' | 'logo' | 'compact';

interface SponsorTileProps {
  sponsor: Sponsor;
  size?: SponsorTileSize;
  ctaPosition: string;
  className?: string;
}

const sponsorsWithDarkLogoSurface = new Set([
  'Autopflege Langer Großschönau',
  'Pro-Carline Lahwalde',
  'Rumpf und Schuppe Zittau',
]);

function SponsorTile({ sponsor, size = 'logo', ctaPosition, className }: SponsorTileProps) {
  const linked = Boolean(sponsor.website);
  const usesDarkLogoSurface = Boolean(sponsor.logo_url) && sponsorsWithDarkLogoSurface.has(sponsor.name);
  const content = (
    <>
      <div className="absolute -right-10 -top-10 h-20 w-20 rotate-45 bg-accent/0 transition-colors group-hover:bg-accent/20" />
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        {sponsor.logo_url ? (
          <img
            src={sponsor.logo_url}
            alt={sponsor.name}
            loading="lazy"
            className={cn(
              'max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]',
              size === 'hero' && 'max-h-24 sm:max-h-28',
              size === 'logo' && 'max-h-16',
              size === 'compact' && 'max-h-10',
            )}
          />
        ) : (
          <span
            className={cn(
              'line-clamp-3 text-balance font-semibold leading-tight text-foreground transition-colors group-hover:text-primary',
              size === 'hero' && 'text-lg sm:text-xl',
              size === 'logo' && 'text-sm sm:text-base',
              size === 'compact' && 'text-xs sm:text-sm',
            )}
          >
            {sponsor.name}
          </span>
        )}
        {linked && (
          <ExternalLink
            className={cn(
              'h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100',
              usesDarkLogoSurface ? 'text-white/70' : 'text-muted-foreground',
            )}
          />
        )}
      </div>
    </>
  );

  const baseClassName = cn(
    'group relative flex w-full overflow-hidden border bg-card p-3 transition-all hover:border-primary hover:shadow-md',
    size === 'hero' && 'h-36 border-2 border-primary/25 sm:h-44 sm:p-6',
    size === 'logo' && 'h-28 border-border sm:h-32 sm:p-5',
    size === 'compact' && 'h-20 border-border sm:h-24',
    usesDarkLogoSurface && 'border-neutral-700 bg-neutral-900 hover:border-primary hover:bg-neutral-900',
    className,
  );

  if (!linked) {
    return <div className={baseClassName}>{content}</div>;
  }

  return (
    <a
      href={sponsor.website || undefined}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('sponsor_click', {
        category: 'outbound',
        label: `${ctaPosition}:${sponsor.name}`,
        sponsor_tier: sponsor.tier,
        cta_position: ctaPosition,
      })}
      className={baseClassName}
      aria-label={`${sponsor.name} Website oeffnen`}
    >
      {content}
    </a>
  );
}

interface SponsorGroupProps {
  title: string;
  sponsors: Sponsor[];
  size: SponsorTileSize;
  ctaPosition: string;
  icon: typeof Star;
}

export function SponsorGroup({ title, sponsors, size, ctaPosition, icon: Icon }: SponsorGroupProps) {
  if (sponsors.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{sponsors.length} Eintraege</p>
        </div>
      </div>

      <div
        className={cn(
          'grid gap-3',
          size === 'hero' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          size === 'logo' && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
          size === 'compact' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        )}
      >
        {sponsors.map((sponsor) => (
          <SponsorTile key={sponsor.id} sponsor={sponsor} size={size} ctaPosition={ctaPosition} />
        ))}
      </div>
    </section>
  );
}

interface SponsorOverviewProps {
  sponsors: {
    main: Sponsor[];
    partner: Sponsor[];
    supporter: Sponsor[];
  };
}

export function SponsorOverview({ sponsors }: SponsorOverviewProps) {
  return (
    <div className="space-y-12">
      <SponsorGroup
        title="Hauptsponsoren"
        sponsors={sponsors.main}
        size="hero"
        ctaPosition="sponsors_main_grid"
        icon={Star}
      />
      <SponsorGroup
        title="Partner"
        sponsors={sponsors.partner}
        size="logo"
        ctaPosition="sponsors_partner_grid"
        icon={Handshake}
      />
      <SponsorGroup
        title="Unterstuetzer"
        sponsors={sponsors.supporter}
        size="compact"
        ctaPosition="sponsors_supporter_grid"
        icon={HeartHandshake}
      />
    </div>
  );
}

interface MainSponsorCarouselProps {
  sponsors: Sponsor[];
  title: string;
  subtitle?: string;
  ctaPosition: string;
}

export function MainSponsorCarousel({ sponsors, title, subtitle, ctaPosition }: MainSponsorCarouselProps) {
  if (sponsors.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-bold uppercase tracking-widest text-primary">{title}</p>
          {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <Carousel opts={{ align: 'start', loop: sponsors.length > 3 }} className="w-full px-10 sm:px-12">
        <CarouselContent className="-ml-3">
          {sponsors.map((sponsor) => (
            <CarouselItem key={sponsor.id} className="pl-3 basis-full sm:basis-1/2 lg:basis-1/3">
              <SponsorTile sponsor={sponsor} size="logo" ctaPosition={ctaPosition} className="h-28 sm:h-32" />
            </CarouselItem>
          ))}
        </CarouselContent>
        {sponsors.length > 1 && (
          <>
            <CarouselPrevious className="left-0 border-primary text-primary" />
            <CarouselNext className="right-0 border-primary text-primary" />
          </>
        )}
      </Carousel>
    </div>
  );
}
