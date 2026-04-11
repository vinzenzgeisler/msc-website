import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Award, Users, Calendar, Trophy, Heart, Shield, Zap } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/useSettings';
import { useMembershipBenefits, useMembershipSteps } from '@/hooks/useStructuredContent';
import { Link } from 'react-router-dom';

const BENEFIT_ICONS = [Trophy, Heart, Shield, Zap, Award, Users];

export default function MembershipPage() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  const intro = useContentWithFallback('membership', 'intro', {
    title: t.nav.membership,
    subtitle: 'Mitglied werden',
    content: 'Der MSC Oberlausitzer Dreiländereck e.V. freut sich über jedes neue Mitglied! Ob als aktiver Fahrer oder als Motorsport-Begeisterter – bei uns ist jeder willkommen.',
  });
  const benefitsSection = useContentWithFallback('membership', 'benefits', { title: 'Vorteile einer Mitgliedschaft' });
  const howToJoin = useContentWithFallback('membership', 'how_to_join', { title: 'So werden Sie Mitglied' });
  const cta = useContentWithFallback('membership', 'cta', {
    title: 'Interesse geweckt?',
    content: 'Wir freuen uns auf neue Mitglieder! Nehmen Sie Kontakt auf oder kommen Sie einfach zu einem unserer nächsten Termine vorbei.',
  });
  const { data: benefitsList, isLoading: benefitsLoading } = useMembershipBenefits();
  const { data: steps, isLoading: stepsLoading } = useMembershipSteps();

  return (
    <MainLayout>
      <PageHeader
        title={intro.title}
        subtitle={intro.subtitle || 'Mitglied werden'}
        imageUrl={intro.image_url}
        imageAlt={intro.image_alt || intro.title}
      />

      {/* Intro */}
      {intro.content ? (
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }} />
          </div>
        </section>
      ) : null}

      {/* Benefits */}
      <section className="border-t border-border py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">{benefitsSection.title}</h2>
          {benefitsLoading ? (
            <div className="mx-auto grid max-w-3xl gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : benefitsList && benefitsList.length > 0 ? (
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
              {benefitsList.map((benefit, index) => {
                const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
                return (
                  <Card key={benefit.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="flex gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-accent/20">
                        <Icon className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{benefit.title}</h3>
                        {benefit.description ? <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p> : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                  <Award className="h-10 w-10" />
                  <p>Noch keine Informationen zu den Vorteilen hinterlegt.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* How to join - Timeline */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-3xl font-bold">{howToJoin.title}</h2>
            {stepsLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : steps && steps.length > 0 ? (
              <div className="relative space-y-8 pl-12 before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-0.5 before:bg-primary/20">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="absolute -left-12 top-0 flex h-10 w-10 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      {step.description ? (
                        <div className="mt-2 prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: step.description.replace(/\n/g, '<br />') }} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10" />
                  <p>Noch keine Informationen zur Mitgliedschaft hinterlegt.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA — Racing style */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="racing-stripe h-full w-full" />
        </div>
        <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent opacity-60" />
        <div className="container relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>
            <p className="mx-auto mb-8 max-w-lg text-primary-foreground/80">{cta.content}</p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold" asChild>
                <a href={cta.primary_button_url || `mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}>
                  <Mail className="mr-2 h-5 w-5" />
                  {cta.primary_button_label || 'Kontakt aufnehmen'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Termine ansehen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
