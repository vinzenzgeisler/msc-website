import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Users, Trophy, Eye } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useSettings } from '@/hooks/useSettings';

export function ClubTeaserSection() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  
  const clubTeaser = useContentWithFallback('home', 'club_teaser', {
    title: settings?.site_name || t.clubTeaser.title,
    subtitle: t.clubTeaser.subtitle,
    content: settings?.description || '',
  });

  const foundingYear = settings?.founding_year || 1984;
  const traditionYears = Math.max(new Date().getFullYear() - foundingYear, 1);
  const stats = [
    {
      icon: Users,
      value: settings?.member_count || '150+',
      label: clubTeaser.stat_one_label || t.clubTeaser.statOneLabel || settings?.member_count_label || 'Mitglieder',
    },
    {
      icon: Trophy,
      value: `${traditionYears}+`,
      label: clubTeaser.stat_two_label || t.clubTeaser.statTwoLabel || settings?.tradition_years_label || 'Jahre Tradition',
    },
    {
      icon: Eye,
      value: '> 6000',
      label: 'Zuschauer',
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Subtle racing stripe background */}
      <div className="absolute inset-0 racing-stripe opacity-30" />
      
      {/* Accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary" />

      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-none border-l-4 border-accent bg-accent/10 px-4 py-2 text-sm font-bold uppercase tracking-wider text-foreground">
              Seit {foundingYear}
            </div>

            {clubTeaser.isLoading ? (
              <>
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-20 w-full mb-8" />
              </>
            ) : (
              <>
                <h2 className="mb-4 text-4xl font-black uppercase leading-[1.08] tracking-[-0.02em] md:text-5xl md:leading-[1.1]">
                  {clubTeaser.title}
                </h2>
                
                <p className="mb-2 text-xl font-semibold text-primary">
                  {clubTeaser.subtitle}
                </p>
                
                <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
                  {clubTeaser.content}
                </p>
              </>
            )}
            
            <Button 
              size="lg" 
              className="group rounded-none font-bold uppercase tracking-wider"
              asChild
            >
              <Link to="/club/about">
                {t.clubTeaser.cta}
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-none border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="absolute -right-6 -top-6 h-12 w-12 rotate-45 bg-primary/10 transition-all group-hover:bg-accent/20" />
                
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                <div className="text-3xl font-black text-foreground md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
