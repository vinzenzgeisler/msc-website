import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentWithFallback } from '@/hooks/usePageContent';

const DEFAULT_PRIVACY_CONTENT = `
<h2>1. Datenschutz auf einen Blick</h2>
<h3>Allgemeine Hinweise</h3>
<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
<h3>Datenerfassung auf dieser Website</h3>
<p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.</p>
<h2>2. Hosting</h2>
<p>Wir hosten die Inhalte unserer Website bei einem europäischen Hosting-Anbieter.</p>
<h2>3. Kontaktformular</h2>
<p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben zur Bearbeitung der Anfrage gespeichert.</p>
<h2>4. Ihre Rechte</h2>
<p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung Ihrer gespeicherten Daten im Rahmen der gesetzlichen Vorgaben.</p>
`;

export default function PrivacyPage() {
  const t = useTranslation();
  const privacy = useContentWithFallback('privacy', 'content', {
    title: t.nav.privacy,
    content: DEFAULT_PRIVACY_CONTENT,
  });

  return (
    <MainLayout>
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {privacy.isLoading ? (
              <>
                <Skeleton className="mb-8 h-10 w-48" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </>
            ) : (
              <>
                <h1 className="mb-8">{privacy.title}</h1>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: privacy.content }}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
