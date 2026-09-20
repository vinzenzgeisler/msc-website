import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { newsletterCopy } from '@/components/newsletter/copy';
import { confirmNewsletterSubscription, type NewsletterActionStatus } from '@/integrations/event-backend/client';

export default function NewsletterConfirmPage() {
  const { locale, setLocale } = useLanguage();
  const copy = newsletterCopy[locale];
  const started = useRef(false);
  const [status, setStatus] = useState<NewsletterActionStatus | 'loading'>('loading');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const requestedLocale = new URLSearchParams(window.location.search).get('lang');
    if (requestedLocale === 'de' || requestedLocale === 'en' || requestedLocale === 'cz' || requestedLocale === 'pl') setLocale(requestedLocale);
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    if (!token) { setStatus('invalid'); return; }
    confirmNewsletterSubscription(token).then((result) => setStatus(result.status)).catch(() => setStatus('invalid'));
  }, [setLocale]);
  const successful = status === 'confirmed' || status === 'already_confirmed';
  const message = status === 'confirmed' ? copy.confirmed : status === 'already_confirmed' ? copy.alreadyConfirmed : status === 'expired' ? copy.expired : copy.invalid;
  return <MainLayout title="Newsletter bestätigen"><section className="container flex min-h-[55vh] max-w-2xl items-center justify-center py-16"><div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">{status === 'loading' ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" /> : successful ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /> : <XCircle className="mx-auto h-12 w-12 text-destructive" />}<h1 className="mt-5 font-heading text-3xl font-black uppercase">Newsletter</h1><p className="mt-3 text-muted-foreground">{status === 'loading' ? '…' : message}</p>{status !== 'loading' && <Button asChild className="mt-6"><Link to="/">Startseite</Link></Button>}</div></section></MainLayout>;
}
