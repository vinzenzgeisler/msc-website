import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';

export default function PrivacyPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-8">{t.nav.privacy}</h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2>1. Datenschutz auf einen Blick</h2>
              
              <h3>Allgemeine Hinweise</h3>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene 
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
              </p>

              <h3>Datenerfassung auf dieser Website</h3>
              <p>
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
                Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
              </p>

              <h2>2. Hosting</h2>
              <p>
                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
                [Hosting-Anbieter einfügen]
              </p>

              <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
              
              <h3>Datenschutz</h3>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
                Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den 
                gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h3>Hinweis zur verantwortlichen Stelle</h3>
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br />
                MSC Oberlausitzer Dreiländereck e.V.<br />
                02797 Oybin<br />
                E-Mail: info@msc-oberlausitzer-dreilaendereck.de
              </p>

              <h2>4. Datenerfassung auf dieser Website</h2>
              
              <h3>Cookies</h3>
              <p>
                Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine 
                Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden 
                entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder 
                dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
              </p>

              <h3>Kontaktformular</h3>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
                aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
                zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns 
                gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>

              <h2>5. Ihre Rechte</h2>
              <p>
                Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten 
                personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der 
                Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
              </p>

              <p className="text-sm text-muted-foreground">
                Stand: Januar 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
