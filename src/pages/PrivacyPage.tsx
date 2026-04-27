import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { RichContent } from '@/components/content/RichContent';

const DEFAULT_PRIVACY_CONTENT = `
<h2>1. Datenschutz auf einen Blick</h2>
<h3>Allgemeine Hinweise</h3>
<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

<h3>Datenerfassung auf dieser Website</h3>
<p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:<br /><br />
MSC Oberlausitzer Dreiländereck e.V.<br />
02797 Oybin<br />
E-Mail: info@msc-oberlausitzer-dreilaendereck.de</p>

<p><strong>Wie erfassen wir Ihre Daten?</strong><br />
Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen, z.B. über unser Kontaktformular. Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst (z.B. Browser, Betriebssystem, Uhrzeit des Seitenaufrufs).</p>

<h2>2. Hosting</h2>
<p>Wir hosten die Inhalte unserer Website bei einem europäischen Hosting-Anbieter. Beim Besuch unserer Website erfasst der Server automatisch technische Daten (Server-Logfiles), die Ihr Browser übermittelt. Dies sind u.a. Browsertyp/-version, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners und die Uhrzeit der Serveranfrage.</p>

<h2>3. Kontaktformular</h2>
<p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.</p>

<h2>4. Einwilligungsverwaltung</h2>
<p>Wir speichern Ihre Auswahl zu Datenschutz- und Statistik-Einstellungen lokal in Ihrem Browser, damit wir Ihre Entscheidung bei späteren Besuchen berücksichtigen können. Diese Speicherung ist technisch erforderlich, um die gewählte Einwilligung zuverlässig umzusetzen.</p>

<h2>5. Statistik mit Google Analytics</h2>
<p>Sofern Sie ausdrücklich einwilligen, verwenden wir Google Analytics 4, einen Webanalysedienst von Google, um die Nutzung unserer Website auszuwerten. Dabei messen wir beispielsweise Seitenaufrufe sowie Interaktionen wie Kontaktanfragen, Download-Klicks, Sponsor-Klicks oder Event-Anmeldungen. Ohne Ihre Einwilligung wird Google Analytics nicht geladen.</p>
<p>Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Es kann nicht ausgeschlossen werden, dass Daten auch an Google LLC in den USA übermittelt werden. Weitere Informationen finden Sie in den Datenschutzhinweisen von Google.</p>

<h2>6. Lokale Schriftarten</h2>
<p>Die auf dieser Website verwendeten Schriftarten werden lokal von unserem eigenen Server geladen. Es werden keine Schriftarten von externen Drittanbietern wie Google Fonts nachgeladen.</p>

<h2>7. Ihre Rechte</h2>
<p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger sowie den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.</p>

<h2>8. Widerspruch gegen Werbe-E-Mails</h2>
<p>Der Nutzung von im Rahmen der Impressumspflicht veröffentlichten Kontaktdaten zur Übersendung von nicht ausdrücklich angeforderter Werbung und Informationsmaterialien wird hiermit widersprochen. Die Betreiber der Seiten behalten sich ausdrücklich rechtliche Schritte im Falle der unverlangten Zusendung von Werbeinformationen vor.</p>
`;

export default function PrivacyPage() {
  const t = useTranslation();
  const privacy = useContentWithFallback('privacy', 'content', {
    title: 'Datenschutzerklärung',
    content: DEFAULT_PRIVACY_CONTENT,
  });

  return (
    <MainLayout>
      <PageHeader title={privacy.title} />

      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {privacy.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : (
              <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
                <RichContent content={privacy.content} className="prose-lg prose-p:text-muted-foreground prose-li:text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
