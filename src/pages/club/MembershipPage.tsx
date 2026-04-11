import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, ArrowRight, Award, Users, Calendar } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/useSettings';
import { useMembershipBenefits, useMembershipSteps } from '@/hooks/useStructuredContent';
import { Link } from 'react-router-dom';

export default function MembershipPage() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  const intro = useContentWithFallback('membership', 'intro', {
    title: t.nav.membership,
    subtitle: 'Mitglied werden',
    content: '',
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
      {/* Header */}
      <section className="relative bg-primary py-16 text-primary-foreground">
        {intro.image_url && (
          <div className="absolute inset-0">
            <img src={intro.image_url} alt={intro.image_alt || intro.title} className="h-full w-full object-cover opacity-20" />
          </div>
        )}
        <div className="container relative">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">{intro.title}</h1>
          <p className="text-lg text-primary-foreground/80">{intro.subtitle || 'Mitglied werden'}</p>
        </div>
      </section>

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
            <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
              {benefitsList.map((benefit) => (
                <Card key={benefit.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      {benefit.description ? <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p> : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
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

      {/* How to join */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-8 text-center text-3xl font-bold">{howToJoin.title}</h2>
            {stepsLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : steps && steps.length > 0 ? (
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex gap-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      {step.description ? (
                        <div className="mt-1 prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
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

      {/* CTA */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">{cta.content}</p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <a href={cta.primary_button_url || `mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}>
                  <Mail className="mr-2 h-5 w-5" />
                  {cta.primary_button_label || 'Kontakt aufnehmen'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
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
