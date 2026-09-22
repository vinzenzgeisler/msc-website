import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmPhotographerSignUp, signInWithPassword, signUpPhotographer } from '@/integrations/racepic/photographerAuth';
import { savePhotographerSession } from '@/integrations/racepic/session';
import { registerMyProfile } from '@/integrations/racepic/client';

const TERMS_VERSION = '2026-09-22';

export default function StudioRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      if (step === 'details') {
        await signUpPhotographer(email, password);
        setStep('confirm');
      } else {
        await confirmPhotographerSignUp(email, code);
        const tokens = await signInWithPassword(email, password);
        savePhotographerSession(tokens);
        await registerMyProfile(displayName, TERMS_VERSION);
        navigate('/racepic/studio');
      }
    } catch { setError(step === 'details' ? 'Registrierung fehlgeschlagen. Prüfe die Angaben oder nutze bei bestehendem Konto den Login.' : 'Bestätigung fehlgeschlagen. Bitte Code prüfen.'); }
    finally { setBusy(false); }
  };

  return <MainLayout title="RacePic Studio – Registrierung" noindex><section className="container flex min-h-[65vh] max-w-md flex-col justify-center py-14">
    <p className="text-xs font-semibold uppercase tracking-widest text-accent">RacePic Studio</p>
    <h1 className="mt-2 font-heading text-3xl font-bold">Als Fotograf:in starten</h1>
    <p className="mt-2 text-sm text-muted-foreground">Erstelle dein Konto. Nach der E-Mail-Bestätigung gibt der MSC deine Events und Uploads frei.</p>
    <form onSubmit={submit} className="mt-7 space-y-4">
      {step === 'details' ? <>
        <div><Label htmlFor="register-name">Anzeigename</Label><Input id="register-name" required minLength={2} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div>
        <div><Label htmlFor="register-email">E-Mail</Label><Input id="register-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
        <div><Label htmlFor="register-password">Passwort</Label><Input id="register-password" type="password" required minLength={12} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /><p className="mt-1 text-xs text-muted-foreground">Mindestens 12 Zeichen.</p></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1" /><span>Ich akzeptiere die <Link className="underline" to="/racepic/studio/bedingungen">Bedingungen für Fotograf:innen</Link>.</span></label>
      </> : <div><Label htmlFor="register-code">Bestätigungscode aus der E-Mail</Label><Input id="register-code" required value={code} onChange={(event) => setCode(event.target.value)} autoComplete="one-time-code" /></div>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy || (step === 'details' && !accepted)}>{busy ? 'Bitte warten…' : step === 'details' ? 'Konto erstellen' : 'E-Mail bestätigen'}</Button>
    </form>
    <p className="mt-5 text-sm text-muted-foreground">Schon registriert? <Link to="/racepic/studio/login" className="underline">Anmelden</Link></p>
  </section></MainLayout>;
}
