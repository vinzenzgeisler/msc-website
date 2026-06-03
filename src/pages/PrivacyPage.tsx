import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { RichContent } from '@/components/content/RichContent';

const DEFAULT_PRIVACY_CONTENT = `
<h3>1. Verantwortlicher</h3>
<p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
<p><strong>MSC Oberlausitzer Dreiländereck e. V.</strong><br />
Am Weiher 4<br />
02791 Oderwitz<br />
E-Mail: info@msc-oberlausitzer-dreilaendereck.eu</p>

<h3>2. Allgemeine Hinweise zur Datenverarbeitung</h3>
<p>Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Wir verarbeiten Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
<p>Die Nutzung unserer Website ist grundsätzlich ohne Angabe personenbezogener Daten möglich. Sofern auf unserer Website personenbezogene Daten erhoben werden, erfolgt dies nur, soweit dies technisch erforderlich ist oder Sie uns diese Daten freiwillig mitteilen, beispielsweise im Rahmen einer Kontaktaufnahme.</p>

<h3>3. Zwecke und Rechtsgrundlagen der Verarbeitung</h3>
<p>Wir verarbeiten personenbezogene Daten ausschließlich, wenn hierfür eine gesetzliche Grundlage besteht. Die Verarbeitung erfolgt insbesondere zu folgenden Zwecken:</p>
<ul>
  <li>zur technischen Bereitstellung und sicheren Nutzung der Website</li>
  <li>zur Bearbeitung von Anfragen</li>
  <li>zur Sicherstellung der Stabilität und Sicherheit unserer Systeme</li>
  <li>zur Erfüllung gesetzlicher Verpflichtungen</li>
  <li>zur statistischen Auswertung der Website-Nutzung, sofern Sie eingewilligt haben</li>
</ul>
<p>Rechtsgrundlagen der Verarbeitung sind insbesondere:</p>
<ul>
  <li><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> bei einer erteilten Einwilligung</li>
  <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> zur Durchführung vorvertraglicher Maßnahmen oder vertraglicher Leistungen</li>
  <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> zur Erfüllung rechtlicher Verpflichtungen</li>
  <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> auf Grundlage berechtigter Interessen, insbesondere an einem sicheren und funktionsfähigen Internetauftritt</li>
</ul>

<h3>4. Kontaktaufnahme</h3>
<p>Wenn Sie uns per E-Mail oder über ein Kontaktformular kontaktieren, verarbeiten wir die von Ihnen mitgeteilten Daten ausschließlich zur Bearbeitung Ihrer Anfrage und für mögliche Anschlussfragen.</p>
<p>Die Verarbeitung erfolgt je nach Inhalt der Anfrage auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO oder Art. 6 Abs. 1 lit. f DSGVO.</p>
<p>Die Daten werden gelöscht, sobald Ihre Anfrage abschließend bearbeitet wurde und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>

<h3>5. Server-Logfiles</h3>
<p>Beim Aufruf unserer Website werden durch den Hosting-Anbieter automatisch Informationen erfasst, die Ihr Browser übermittelt. Dies sind insbesondere:</p>
<ul>
  <li>Browsertyp und Browserversion</li>
  <li>verwendetes Betriebssystem</li>
  <li>Referrer-URL</li>
  <li>Hostname des zugreifenden Rechners</li>
  <li>Uhrzeit der Serveranfrage</li>
  <li>IP-Adresse</li>
</ul>
<p>Diese Daten werden verarbeitet, um den technischen Betrieb der Website sicherzustellen, die Systemsicherheit zu gewährleisten und Fehler zu analysieren.</p>
<p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren, stabilen und fehlerfreien Bereitstellung unserer Website.</p>

<h3>6. Cookies und Einwilligungsverwaltung</h3>
<p>Unsere Website kann Cookies sowie vergleichbare technische Speichermechanismen verwenden. Ein Teil dieser Speicherungen ist technisch erforderlich, um die Website ordnungsgemäß bereitzustellen und Ihre Datenschutzentscheidung zu speichern.</p>
<p>Ihre Auswahl zu den Datenschutz- und Statistik-Einstellungen wird lokal in Ihrem Browser gespeichert, damit wir Ihre Entscheidung bei späteren Besuchen berücksichtigen können. Diese Speicherung ist technisch erforderlich, um die gewählte Einwilligung zuverlässig umzusetzen.</p>
<p>Soweit technisch nicht erforderliche Cookies oder vergleichbare Technologien eingesetzt werden, erfolgt dies nur auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.</p>
<p>Sie können Ihre Browser-Einstellungen so konfigurieren, dass Sie über das Setzen von Cookies informiert werden, Cookies nur im Einzelfall erlauben oder Cookies generell ausschließen. Bitte beachten Sie, dass dadurch einzelne Funktionen der Website eingeschränkt sein können.</p>

<h3>7. Google Analytics</h3>
<p>Sofern Sie ausdrücklich eingewilligt haben, verwenden wir Google Analytics 4, einen Webanalysedienst von Google, um die Nutzung unserer Website statistisch auszuwerten. Ohne Ihre Einwilligung wird Google Analytics nicht geladen.</p>
<p>Dabei können insbesondere Informationen über aufgerufene Seiten, verwendete Endgeräte, Browserinformationen, Spracheinstellungen sowie Interaktionen mit Inhalten oder Schaltflächen verarbeitet werden. Die Verarbeitung erfolgt ausschließlich auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.</p>
<p>Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Es kann nicht ausgeschlossen werden, dass in diesem Zusammenhang auch eine Übermittlung an Google LLC in den USA erfolgt.</p>

<h3>8. Lokale Schriftarten</h3>
<p>Die auf dieser Website verwendeten Schriftarten werden lokal von unserem eigenen Server geladen. Es werden keine Schriftarten von externen Drittanbietern wie Google Fonts nachgeladen.</p>

<h3>9. SSL- bzw. TLS-Verschlüsselung</h3>
<p>Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile Ihres Browsers mit <code>https://</code> beginnt.</p>

<h3>10. Weitergabe von Daten an Dritte</h3>
<p>Eine Übermittlung Ihrer personenbezogenen Daten an Dritte erfolgt nur, wenn:</p>
<ul>
  <li>Sie ausdrücklich eingewilligt haben</li>
  <li>die Weitergabe zur Erfüllung vertraglicher oder gesetzlicher Pflichten erforderlich ist</li>
  <li>wir rechtlich dazu verpflichtet sind</li>
  <li>ein berechtigtes Interesse besteht und keine überwiegenden schutzwürdigen Interessen entgegenstehen</li>
</ul>

<h3>11. Speicherdauer</h3>
<p>Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen Verarbeitungszwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.</p>
<p>Sobald der Zweck der Verarbeitung entfällt und keine gesetzlichen Aufbewahrungspflichten mehr bestehen, werden die Daten gelöscht oder gesperrt.</p>

<h3>12. Ihre Rechte</h3>
<p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen insbesondere folgende Rechte:</p>
<ul>
  <li>Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten</li>
  <li>Recht auf Berichtigung unrichtiger Daten</li>
  <li>Recht auf Löschung</li>
  <li>Recht auf Einschränkung der Verarbeitung</li>
  <li>Recht auf Widerspruch gegen die Verarbeitung</li>
  <li>Recht auf Datenübertragbarkeit</li>
  <li>Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft</li>
</ul>
<p>Zur Ausübung Ihrer Rechte können Sie uns jederzeit unter der oben genannten E-Mail-Adresse kontaktieren.</p>

<h3>13. Beschwerderecht bei einer Aufsichtsbehörde</h3>
<p>Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.</p>

<h3>14. Datensicherheit</h3>
<p>Wir treffen technische und organisatorische Maßnahmen, um Ihre personenbezogenen Daten vor Verlust, unbefugtem Zugriff, Manipulation und sonstigen unberechtigten Eingriffen zu schützen.</p>
<p>Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.</p>

<h3>15. Aktualität und Änderung dieser Datenschutzerklärung</h3>
<p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder Änderungen unserer Website und damit verbundenen Verarbeitungen abbildet.</p>
<p>Es gilt jeweils die auf dieser Website veröffentlichte aktuelle Fassung.</p>
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
