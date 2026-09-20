import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, MailMinus, XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/i18n/LanguageContext';
import { newsletterCopy, toNewsletterLocale } from '@/components/newsletter/copy';
import { requestNewsletterUnsubscribe, unsubscribeFromNewsletter, type NewsletterActionStatus } from '@/integrations/event-backend/client';

export default function NewsletterUnsubscribePage() {
  const { locale, setLocale } = useLanguage();
  const copy = newsletterCopy[locale];
  const tokenHandled = useRef(false);
  const [tokenStatus, setTokenStatus] = useState<NewsletterActionStatus | 'loading' | null>(null);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [requestState, setRequestState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  useEffect(() => {
    if (tokenHandled.current) return;
    tokenHandled.current = true;
    const requestedLocale = new URLSearchParams(window.location.search).get('lang');
    if (requestedLocale === 'de' || requestedLocale === 'en' || requestedLocale === 'cz' || requestedLocale === 'pl') setLocale(requestedLocale);
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) return;
    setTokenStatus('loading');
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    unsubscribeFromNewsletter(token).then((result) => setTokenStatus(result.status)).catch(() => setTokenStatus('invalid'));
  }, [setLocale]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setRequestState('error'); return; }
    setRequestState('loading');
    try { await requestNewsletterUnsubscribe({ email, locale: toNewsletterLocale(locale), website }); setRequestState('sent'); setEmail(''); } catch { setRequestState('error'); }
  };
  const success = tokenStatus === 'unsubscribed' || tokenStatus === 'already_unsubscribed';
  const tokenMessage = tokenStatus === 'unsubscribed' ? copy.unsubscribed : tokenStatus === 'already_unsubscribed' ? copy.alreadyUnsubscribed : tokenStatus === 'expired' ? copy.expired : copy.invalid;
  return <MainLayout title={copy.unsubscribe}><section className="container flex min-h-[55vh] max-w-2xl items-center justify-center py-16"><div className="w-full rounded-2xl border bg-card p-8 shadow-sm">{tokenStatus ? <div className="text-center">{tokenStatus === 'loading' ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" /> : success ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /> : <XCircle className="mx-auto h-12 w-12 text-destructive" />}<h1 className="mt-5 font-heading text-3xl font-black uppercase">{copy.unsubscribe}</h1><p className="mt-3 text-muted-foreground">{tokenStatus === 'loading' ? '…' : tokenMessage}</p></div> : <><MailMinus className="mb-4 h-10 w-10 text-accent" /><h1 className="font-heading text-3xl font-black uppercase">{copy.unsubscribe}</h1><p className="mt-2 text-muted-foreground">{copy.unsubscribeHint}</p>{requestState === 'sent' ? <div className="mt-6 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700">{copy.linkSent}</div> : <form onSubmit={submit} className="mt-6 space-y-4"><Label htmlFor="unsubscribe-email">{copy.email}</Label><Input id="unsubscribe-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /><input type="text" value={website} onChange={(event) => setWebsite(event.target.value)} className="hidden" tabIndex={-1} aria-hidden="true" /><Button disabled={requestState === 'loading'}>{requestState === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{copy.sendLink}</Button>{requestState === 'error' && <p className="text-sm text-destructive">{copy.error}</p>}</form>}</>}</div></section></MainLayout>;
}
