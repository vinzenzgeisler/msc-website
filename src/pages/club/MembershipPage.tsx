import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/useSettings';
import { useMembershipBenefits, useMembershipSteps } from '@/hooks/useStructuredContent';

export default function MembershipPage() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  const intro = useContentWithFallback('membership', 'intro', {
    title: t.nav.membership,
    subtitle: 'Mitglied werden',
    content: '',
  });
  const benefits = useContentWithFallback('membership', 'benefits', {
    title: 'Vorteile einer Mitgliedschaft',
  });
  const howToJoin = useContentWithFallback('membership', 'how_to_join', {
    title: 'So werden Sie Mitglied',
  });
  const cta = useContentWithFallback('membership', 'cta', {
    title: 'Interesse geweckt?',
    content: 'Schreiben Sie uns eine E-Mail. Wir freuen uns auf Sie!',
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
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {intro.title}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {intro.subtitle || 'Mitglied werden'}
          </p>
        </div>
      </section>

      {intro.content ? (
        <section className="py-10">
          <div className="container">
            <div
              className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </section>
      ) : null}

      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6">{benefits.title}</h2>
              {benefitsLoading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : benefitsList && benefitsList.length > 0 ? (
                <div className="grid gap-4">
                  {benefitsList.map((benefit) => (
                    <Card key={benefit.id}>
                      <CardContent className="flex gap-4 p-5">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <h3 className="font-semibold">{benefit.title}</h3>
                          {benefit.description ? <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p> : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Noch keine Informationen zu den Vorteilen hinterlegt.</p>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{howToJoin.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stepsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ) : steps && steps.length > 0 ? (
                  steps.map((step, index) => (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{step.title}</h3>
                        {step.description ? (
                          <div
                            className="mt-1 prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: step.description.replace(/\n/g, '<br />') }}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Noch keine Informationen zur Mitgliedschaft hinterlegt.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - styled as accent banner instead of full primary */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            {cta.content}
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <a href={cta.primary_button_url || `mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}>
              <Mail className="mr-2 h-5 w-5" />
              {cta.primary_button_label || 'Kontakt aufnehmen'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
