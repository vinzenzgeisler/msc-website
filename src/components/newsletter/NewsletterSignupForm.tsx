import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/i18n/LanguageContext';
import { fetchNewsletterConfig, subscribeToNewsletter, type NewsletterConfig } from '@/integrations/event-backend/client';
import { trackEvent } from '@/lib/analytics';
import { newsletterCopy, toNewsletterLocale } from './copy';

export function NewsletterSignupForm({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const copy = newsletterCopy[locale];
  const apiLocale = toNewsletterLocale(locale);
  const [config, setConfig] = useState<NewsletterConfig | null>(null);
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validation, setValidation] = useState(false);

  useEffect(() => {
    let active = true;
    fetchNewsletterConfig(apiLocale).then((value) => active && setConfig(value)).catch(() => active && setState('error'));
    return () => { active = false; };
  }, [apiLocale]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!config || !/^\S+@\S+\.\S+$/.test(email) || !accepted) {
      setValidation(true);
      return;
    }
    setValidation(false);
    setState('loading');
    try {
      await subscribeToNewsletter({ email, locale: apiLocale, consentVersion: config.consentVersion, consentAccepted: true, website });
      setState('success');
      setEmail('');
      setAccepted(false);
      trackEvent('newsletter_signup_submit', { category: 'engagement', label: compact ? 'home' : 'newsletter_page' });
    } catch {
      setState('error');
    }
  };

  if (state === 'success') return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center" role="status">
      <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
      <h3 className="font-heading text-xl font-bold">{copy.successTitle}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{copy.success}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className={compact ? 'flex flex-col gap-3 sm:flex-row' : 'space-y-2'}>
        <Label htmlFor={`newsletter-email-${compact ? 'home' : 'page'}`} className={compact ? 'sr-only' : undefined}>{copy.email}</Label>
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id={`newsletter-email-${compact ? 'home' : 'page'}`} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.email} className="h-12 pl-10" disabled={state === 'loading' || config?.enabled === false} />
        </div>
        <Button type="submit" size="lg" className="h-12" disabled={state === 'loading' || !config?.enabled}>
          {state === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{state === 'loading' ? copy.submitting : copy.submit}
        </Button>
      </div>
      <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex items-start gap-3">
        <Checkbox id={`newsletter-consent-${compact ? 'home' : 'page'}`} checked={accepted} onCheckedChange={(value) => setAccepted(value === true)} className="mt-0.5" />
        <Label htmlFor={`newsletter-consent-${compact ? 'home' : 'page'}`} className="text-xs font-normal leading-relaxed text-muted-foreground">
          {config?.consentText || `${copy.privacyPrefix} ${copy.privacySuffix}`} <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">{copy.privacy}</Link>
        </Label>
      </div>
      {validation && <p className="text-sm text-destructive" role="alert">{copy.required}</p>}
      {state === 'error' && <p className="text-sm text-destructive" role="alert">{copy.error}</p>}
    </form>
  );
}
