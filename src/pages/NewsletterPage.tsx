import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NewsletterSignupForm } from '@/components/newsletter/NewsletterSignupForm';
import { newsletterCopy } from '@/components/newsletter/copy';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { Link } from 'react-router-dom';

export default function NewsletterPage() {
  const { locale } = useLanguage();
  const copy = newsletterCopy[locale];
  const content = useContentWithFallback('newsletter', 'intro', { title: copy.title, subtitle: copy.subtitle });
  return <MainLayout
    title={`${content.title} | MSC Newsletter`}
    description={content.subtitle || copy.subtitle}
    canonicalPath="/newsletter"
    imageUrl="https://www.msc-oberlausitz.de/MSC-logo-clean-transparent.png"
    imageAlt="Logo des MSC Oberlausitzer Dreiländereck e.V."
  >
    <PageHeader title={content.title} subtitle={content.subtitle || copy.subtitle} imageUrl={content.header_image_url} imageAlt={content.header_image_alt || content.title} />
    <section className="py-16"><div className="container max-w-xl">
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <NewsletterSignupForm />
        <div className="mt-6 border-t pt-5 text-sm text-muted-foreground">
          <span>{copy.unsubscribeHint} </span>
          <Link to="/newsletter/unsubscribe" className="font-medium text-foreground underline underline-offset-4 hover:text-accent">
            {copy.unsubscribe}
          </Link>
        </div>
      </div>
    </div></section>
  </MainLayout>;
}
