import { Link } from 'react-router-dom';
import { MailCheck, ShieldCheck } from 'lucide-react';
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
    <section className="py-16"><div className="container grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <div className="flex gap-4"><MailCheck className="mt-1 h-7 w-7 shrink-0 text-accent" /><div><h2 className="font-heading text-xl font-bold">Double-Opt-in</h2><p className="mt-1 text-sm text-muted-foreground">{copy.success}</p></div></div>
        <div className="flex gap-4"><ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-accent" /><div><h2 className="font-heading text-xl font-bold">Datenschutz</h2><p className="mt-1 text-sm text-muted-foreground">{copy.privacySuffix} <Link to="/newsletter/unsubscribe" className="underline">{copy.unsubscribe}</Link>.</p></div></div>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8"><NewsletterSignupForm /></div>
    </div></section>
  </MainLayout>;
}
