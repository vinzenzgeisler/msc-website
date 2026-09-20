import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { NewsletterSignupForm } from '@/components/newsletter/NewsletterSignupForm';
import { newsletterCopy } from '@/components/newsletter/copy';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useLanguage } from '@/i18n/LanguageContext';

export default function NewsletterPage() {
  const { locale } = useLanguage();
  const copy = newsletterCopy[locale];
  const content = useContentWithFallback('newsletter', 'intro', { title: copy.title, subtitle: copy.subtitle });
  return <MainLayout title={`${content.title} | MSC Newsletter`} description={content.subtitle || copy.subtitle}>
    <PageHeader title={content.title} subtitle={content.subtitle || copy.subtitle} imageUrl={content.header_image_url} imageAlt={content.header_image_alt || content.title} />
    <section className="py-16"><div className="container max-w-xl">
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8"><NewsletterSignupForm /></div>
    </div></section>
  </MainLayout>;
}
