import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, Calendar, Award, Mail } from 'lucide-react';

export default function MembershipPage() {
  const t = useTranslation();

  const benefits = [
    'Teilnahme an allen Vereinsveranstaltungen',
    'Vergünstigter Eintritt zum Oberlausitzer Dreieck',
    'Zugang zu Trainingsgeländen',
    'Gemeinsame Motorradtouren',
    'Stimmrecht bei Mitgliederversammlungen',
    'Vereinszeitung und Newsletter',
  ];

  const fees = [
    { type: 'Erwachsene', amount: '60 €/Jahr' },
    { type: 'Familien', amount: '90 €/Jahr' },
    { type: 'Jugendliche (bis 18)', amount: '30 €/Jahr' },
    { type: 'Kinder (bis 14)', amount: '15 €/Jahr' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.membership}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Werde Teil unserer Motorsport-Familie!
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Benefits List */}
            <div>
              <h2 className="mb-6">Vorteile einer Mitgliedschaft</h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fees Card */}
            <Card>
              <CardHeader>
                <CardTitle>Mitgliedsbeiträge</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {fees.map((fee) => (
                    <li key={fee.type} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <span>{fee.type}</span>
                      <span className="font-semibold text-primary">{fee.amount}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Interesse geweckt?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
            Schreiben Sie uns eine E-Mail oder kommen Sie zu einer unserer 
            Veranstaltungen. Wir freuen uns auf Sie!
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <a href="mailto:info@msc-oberlausitzer-dreilaendereck.de">
              <Mail className="mr-2 h-5 w-5" />
              Kontakt aufnehmen
            </a>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
