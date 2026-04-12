import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Calendar, Download, FileText, Users } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useSettings } from '@/hooks/useSettings';
import { Link } from 'react-router-dom';

const feeTable = {
  de: {
    title: 'Mitgliedsbeiträge',
    categories: [
      { label: 'Kinder bis 6 Jahre', fee: 'kostenlos' },
      { label: 'Kinder & Jugendliche (6–17 Jahre)', fee: '45,00 €' },
      { label: 'Junge Erwachsene (18–21 Jahre)', fee: '57,00 €' },
      { label: 'Erwachsene (ab 22 Jahre)', fee: '100,00 €' },
      { label: 'Familienbeitrag', fee: '147,00 €' },
    ],
    perYear: '/ Jahr',
  },
  cz: {
    title: 'Členské příspěvky',
    categories: [
      { label: 'Děti do 6 let', fee: 'zdarma' },
      { label: 'Děti a mládež (6–17 let)', fee: '45,00 €' },
      { label: 'Mladí dospělí (18–21 let)', fee: '57,00 €' },
      { label: 'Dospělí (od 22 let)', fee: '100,00 €' },
      { label: 'Rodinný příspěvek', fee: '147,00 €' },
    ],
    perYear: '/ rok',
  },
  en: {
    title: 'Membership Fees',
    categories: [
      { label: 'Children up to 6 years', fee: 'free' },
      { label: 'Children & Youth (6–17 years)', fee: '€45.00' },
      { label: 'Young Adults (18–21 years)', fee: '€57.00' },
      { label: 'Adults (22+ years)', fee: '€100.00' },
      { label: 'Family membership', fee: '€147.00' },
    ],
    perYear: '/ year',
  },
};

const howToJoinContent = {
  de: {
    title: 'So werden Sie Mitglied',
    steps: [
      { title: 'Beitrittserklärung herunterladen', desc: 'Laden Sie das Formular herunter und füllen Sie es aus.' },
      { title: 'Formular einsenden', desc: 'Senden Sie die ausgefüllte Beitrittserklärung per Post an:\nMSC Oberlausitzer Dreiländereck e.V.\nAm Weiher 4\n02791 Oderwitz' },
      { title: 'Willkommen im Verein!', desc: 'Nach Eingang Ihrer Erklärung erhalten Sie eine Bestätigung und können sofort an Vereinsaktivitäten teilnehmen.' },
    ],
    cancelNote: 'Die Kündigung der Mitgliedschaft ist mit einer Frist von 3 Monaten zum Jahresende möglich.',
  },
  cz: {
    title: 'Jak se stát členem',
    steps: [
      { title: 'Stáhněte si přihlášku', desc: 'Stáhněte si formulář a vyplňte jej.' },
      { title: 'Odešlete formulář', desc: 'Vyplněnou přihlášku zašlete poštou na adresu:\nMSC Oberlausitzer Dreiländereck e.V.\nAm Weiher 4\n02791 Oderwitz' },
      { title: 'Vítejte v klubu!', desc: 'Po obdržení vaší přihlášky dostanete potvrzení a můžete se ihned účastnit klubových aktivit.' },
    ],
    cancelNote: 'Členství lze vypovědět s tříměsíční výpovědní lhůtou ke konci roku.',
  },
  en: {
    title: 'How to Join',
    steps: [
      { title: 'Download the application form', desc: 'Download the form and fill it out.' },
      { title: 'Send the form', desc: 'Mail the completed application to:\nMSC Oberlausitzer Dreiländereck e.V.\nAm Weiher 4\n02791 Oderwitz' },
      { title: 'Welcome to the club!', desc: 'After receiving your application, you will receive a confirmation and can immediately participate in club activities.' },
    ],
    cancelNote: 'Membership can be cancelled with 3 months notice before the end of the year.',
  },
};

const ctaContent = {
  de: {
    title: 'Interesse geweckt?',
    content: 'Wir freuen uns auf neue Mitglieder! Mitglieder des MSC können die Motocross-Trainingsstrecke in Hainewalde kostenlos nutzen.',
    contactLabel: 'Kontakt aufnehmen',
    calendarLabel: 'Termine ansehen',
  },
  cz: {
    title: 'Zaujali jsme vás?',
    content: 'Těšíme se na nové členy! Členové MSC mohou zdarma využívat motocrossovou tréninkovou trať v Hainewalde.',
    contactLabel: 'Kontaktujte nás',
    calendarLabel: 'Zobrazit termíny',
  },
  en: {
    title: 'Interested?',
    content: 'We look forward to new members! MSC members can use the motocross training track in Hainewalde free of charge.',
    contactLabel: 'Get in touch',
    calendarLabel: 'View calendar',
  },
};

const introFallbacks = {
  de: {
    title: 'Mitglied werden',
    subtitle: 'Werden Sie Teil unserer Motorsport-Familie',
    content: 'Der MSC Oberlausitzer Dreiländereck e.V. freut sich über jedes neue Mitglied! Ob als aktiver Fahrer oder als Motorsport-Begeisterter – bei uns ist jeder willkommen. Unsere Mitglieder profitieren von vergünstigten Trainingsgebühren, exklusiven Vereinsveranstaltungen und einer starken Gemeinschaft rund um den Motorsport.',
  },
  cz: {
    title: 'Staňte se členem',
    subtitle: 'Staňte se součástí naší motorsportové rodiny',
    content: 'MSC Oberlausitzer Dreiländereck e.V. se těší na každého nového člena! Ať už jako aktivní jezdec nebo nadšenec do motorsportu – u nás je vítán každý.',
  },
  en: {
    title: 'Become a Member',
    subtitle: 'Join our motorsport family',
    content: 'MSC Oberlausitzer Dreiländereck e.V. welcomes every new member! Whether as an active rider or a motorsport enthusiast – everyone is welcome.',
  },
};

export default function MembershipPage() {
  const { locale } = useLanguage();
  const { data: settings } = useSettings();
  const lang = (locale === 'cz' || locale === 'en') ? locale : 'de';

  const intro = useContentWithFallback('membership', 'intro', introFallbacks[lang]);
  const declarationDoc = useContentWithFallback('membership', 'declaration_document', {});
  const statuteDoc = useContentWithFallback('membership', 'statute_document', {});

  const fees = feeTable[lang];
  const join = howToJoinContent[lang];
  const cta = ctaContent[lang];

  return (
    <MainLayout>
      <PageHeader
        title={intro.title}
        subtitle={intro.subtitle || introFallbacks[lang].subtitle}
        imageUrl={intro.image_url}
        imageAlt={intro.image_alt || intro.title}
      />

      {/* Intro */}
      {intro.content && (
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }} />
          </div>
        </section>
      )}

      {/* Fee Table */}
      <section className="border-t border-border py-16">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">{fees.title}</h2>
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {fees.categories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-lg font-bold text-primary">
                        {cat.fee} {cat.fee !== 'kostenlos' && cat.fee !== 'zdarma' && cat.fee !== 'free' ? fees.perYear : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-3xl font-bold">{join.title}</h2>
            <div className="relative space-y-8 pl-12 before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-0.5 before:bg-primary/20">
              {join.steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-12 top-0 flex h-10 w-10 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground whitespace-pre-line">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {declarationDoc.primary_button_url ? (
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <a href={declarationDoc.primary_button_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-5 w-5" />
                    {declarationDoc.title || (lang === 'de' ? 'Beitrittserklärung herunterladen' : lang === 'cz' ? 'Stáhnout přihlášku' : 'Download application form')}
                  </a>
                </Button>
              ) : declarationDoc.image_url ? (
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <a href={declarationDoc.image_url} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-5 w-5" />
                    {declarationDoc.title || (lang === 'de' ? 'Beitrittserklärung herunterladen' : lang === 'cz' ? 'Stáhnout přihlášku' : 'Download application form')}
                  </a>
                </Button>
              ) : null}

              {statuteDoc.primary_button_url ? (
                <Button size="lg" variant="outline" asChild>
                  <a href={statuteDoc.primary_button_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-5 w-5" />
                    {statuteDoc.title || (lang === 'de' ? 'Vereinssatzung' : lang === 'cz' ? 'Stanovy spolku' : 'Club statutes')}
                  </a>
                </Button>
              ) : statuteDoc.image_url ? (
                <Button size="lg" variant="outline" asChild>
                  <a href={statuteDoc.image_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-5 w-5" />
                    {statuteDoc.title || (lang === 'de' ? 'Vereinssatzung' : lang === 'cz' ? 'Stanovy spolku' : 'Club statutes')}
                  </a>
                </Button>
              ) : null}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground italic">{join.cancelNote}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
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
                <a href={`mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}>
                  <Mail className="mr-2 h-5 w-5" />
                  {cta.contactLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  {cta.calendarLabel}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
