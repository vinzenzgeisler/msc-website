import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentWithFallback } from '@/hooks/usePageContent';

const DEFAULT_IMPRINT_CONTENT = `
<h2>Angaben gemäß § 5 TMG</h2>
<p>
  MSC Oberlausitzer Dreiländereck e.V.<br />
  02797 Oybin<br />
  Sachsen, Deutschland
</p>

<h2>Vertreten durch</h2>
<p>
  1. Vorsitzender: [Name]<br />
  2. Vorsitzender: [Name]
</p>

<h2>Kontakt</h2>
<p>
  E-Mail: info@msc-oberlausitzer-dreilaendereck.de
</p>

<h2>Registereintrag</h2>
<p>
  Eintragung im Vereinsregister.<br />
  Registergericht: Amtsgericht Zittau<br />
  Registernummer: VR [Nummer]
</p>

<h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
<p>
  [Name des Verantwortlichen]<br />
  [Adresse]
</p>

<h2>Streitschlichtung</h2>
<p>
  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
    https://ec.europa.eu/consumers/odr
  </a>
</p>
<p>
  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
  Verbraucherschlichtungsstelle teilzunehmen.
</p>

<h2>Haftung für Inhalte</h2>
<p>
  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen 
  Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind 
  wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte 
  fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine 
  rechtswidrige Tätigkeit hinweisen.
</p>

<h2>Haftung für Links</h2>
<p>
  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir 
  keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
  Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
  Anbieter oder Betreiber der Seiten verantwortlich.
</p>

<h2>Urheberrecht</h2>
<p>
  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
  unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, 
  Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
  bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
</p>
`;

export default function ImprintPage() {
  const t = useTranslation();
  const imprint = useContentWithFallback('imprint', 'content', {
    title: t.nav.imprint,
    content: DEFAULT_IMPRINT_CONTENT,
  });

  return (
    <MainLayout>
      <PageHeader title={imprint.title} />

      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {imprint.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: imprint.content }} />
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
