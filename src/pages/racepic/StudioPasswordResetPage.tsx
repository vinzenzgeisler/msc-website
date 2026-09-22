import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmPasswordReset, startPasswordReset } from '@/integrations/racepic/photographerAuth';

export default function StudioPasswordResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'confirm'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (step === 'email') { await startPasswordReset(email); setStep('confirm'); }
      else { await confirmPasswordReset(email, code, password); navigate('/racepic/studio/login'); }
    } catch { setError('Der Vorgang ist fehlgeschlagen. Bitte Angaben und Code prüfen.'); }
    finally { setBusy(false); }
  };
  return <MainLayout title="RacePic Studio – Passwort zurücksetzen" noindex><section className="container flex min-h-[60vh] max-w-md flex-col justify-center py-14"><h1 className="font-heading text-3xl font-bold">Passwort zurücksetzen</h1><p className="mt-2 text-sm text-muted-foreground">Du erhältst einen Bestätigungscode per E-Mail.</p><form className="mt-7 space-y-4" onSubmit={submit}><div><Label htmlFor="reset-email">E-Mail</Label><Input id="reset-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></div>{step === 'confirm' && <><div><Label htmlFor="reset-code">Code</Label><Input id="reset-code" required value={code} onChange={(event) => setCode(event.target.value)} autoComplete="one-time-code" /></div><div><Label htmlFor="reset-password">Neues Passwort</Label><Input id="reset-password" type="password" required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></div></>}{error && <p className="text-sm text-destructive">{error}</p>}<Button className="w-full" type="submit" disabled={busy}>{busy ? 'Bitte warten…' : step === 'email' ? 'Code anfordern' : 'Passwort speichern'}</Button></form><Link to="/racepic/studio/login" className="mt-5 text-sm underline">Zur Anmeldung</Link></section></MainLayout>;
}
