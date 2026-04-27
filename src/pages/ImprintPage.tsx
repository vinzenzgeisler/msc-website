import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage, useTranslation } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { RichContent } from '@/components/content/RichContent';

const FUNDING_TITLE: Record<string, string> = {
  de: 'Förderhinweis',
  en: 'Funding Notice',
  cz: 'Informace o financování',
  pl: 'Informacja o dofinansowaniu',
};

const DEFAULT_IMPRINT_CONTENT = `
<h2>Angaben gemäß § 5 TMG</h2>
<p>
  MSC Oberlausitzer Dreiländereck e.V.<br />
  Am Weiher 4<br />
  02791 Oderwitz
</p>

<h2>Kontakt</h2>
<p>
  E-Mail: <a href="mailto:info@msc-oberlausitzer-dreilaendereck.eu">info@msc-oberlausitzer-dreilaendereck.eu</a>
</p>

<p>Webmaster: Jürgen Augustin</p>

<h2>Haftungsausschluss</h2>

<h3>Haftung für Inhalte</h3>
<p>
  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
</p>

<h3>Haftung für Links</h3>
<p>
  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
</p>

<h3>Urheberrecht</h3>
<p>
  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
</p>

<h2>Förderhinweis</h2>
<p>
  Das zugrunde liegende Vorhaben wurde im Rahmen einer Förderung aus dem Europäischen Landwirtschaftsfonds für die Entwicklung des ländlichen Raums (ELER) unterstützt. Zuständig für die Durchführung der ELER-Förderung im Freistaat Sachsen ist das Sächsische Staatsministerium für Energie, Klimaschutz, Umwelt und Landwirtschaft, Referat Förderstrategie, ELER-Verwaltungsbehörde.
</p>
`;

const DEFAULT_FUNDING_CONTENT = `
<p>
  Das zugrunde liegende Vorhaben wurde im Rahmen einer Förderung aus dem Europäischen Landwirtschaftsfonds für die Entwicklung des ländlichen Raums (ELER) unterstützt. Zuständig für die Durchführung der ELER-Förderung im Freistaat Sachsen ist das Sächsische Staatsministerium für Energie, Klimaschutz, Umwelt und Landwirtschaft, Referat Förderstrategie, ELER-Verwaltungsbehörde.
</p>
`;

export default function ImprintPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const fundingTitle = FUNDING_TITLE[locale] || FUNDING_TITLE.de;
  const imprint = useContentWithFallback('imprint', 'content', {
    title: 'Impressum',
    content: DEFAULT_IMPRINT_CONTENT,
  });
  const funding = useContentWithFallback('imprint', 'funding', {
    title: fundingTitle,
    content: DEFAULT_FUNDING_CONTENT,
  });
  // Section can be deactivated in CMS by clearing the content field.
  const fundingContent = funding.hasDbContent ? funding.content : DEFAULT_FUNDING_CONTENT;
  const showFunding = !funding.isLoading && fundingContent.trim().length > 0;

  return (
    <MainLayout>
      <PageHeader title={imprint.title} />

      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-8">
            {imprint.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
                <RichContent content={imprint.content} className="prose-lg prose-p:text-muted-foreground prose-li:text-muted-foreground" />
              </div>
            )}

            {showFunding && (
              <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
                <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-wider">
                  {funding.title || fundingTitle}
                </h2>
                <RichContent content={fundingContent} className="prose-lg prose-p:text-muted-foreground prose-li:text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
