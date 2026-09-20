import { NewsletterSignupForm } from '@/components/newsletter/NewsletterSignupForm';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { newsletterCopy } from '@/components/newsletter/copy';

export function NewsletterSection() {
  const { locale } = useLanguage();
  const copy = newsletterCopy[locale];
  const content = useContentWithFallback('home', 'newsletter', { title: copy.title, subtitle: copy.subtitle });
  return (
    <section className="py-16">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground shadow-xl md:px-12">
          <div className="racing-stripe absolute inset-0 opacity-20" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">MSC Newsletter</p><h2 className="font-heading text-3xl font-black uppercase md:text-4xl">{content.title}</h2><p className="mt-3 max-w-xl text-primary-foreground/75">{content.subtitle}</p></div>
            <div className="rounded-xl bg-background p-5 text-foreground shadow-lg"><NewsletterSignupForm compact /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
