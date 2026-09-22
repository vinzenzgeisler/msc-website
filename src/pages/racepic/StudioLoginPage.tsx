import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useEmailOtpLogin } from './useEmailOtpLogin';
import { signInWithPassword } from '@/integrations/racepic/photographerAuth';
import { savePhotographerSession } from '@/integrations/racepic/session';

/** RacePic-Studio-Login fuer bereits geclaimte Fotografenprofile (Paket 2b). */
export default function StudioLoginPage() {
  const navigate = useNavigate();
  const { step, email, pending, error, requestCode, confirmCode } = useEmailOtpLogin();
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [mode, setMode] = useState<'code' | 'password'>('code');
  const [password, setPassword] = useState('');
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault(); setPasswordPending(true); setPasswordError('');
    try { savePhotographerSession(await signInWithPassword(emailInput, password)); navigate('/racepic/studio'); }
    catch { setPasswordError('Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.'); }
    finally { setPasswordPending(false); }
  };

  const handleEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await requestCode(emailInput);
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await confirmCode(codeInput);
    if (ok) navigate('/racepic/studio');
  };

  return (
    <MainLayout title="RacePic Studio – Login" noindex>
      <section className="container flex min-h-[60vh] max-w-md flex-col justify-center py-16">
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight">RacePic Studio</h1>
        <p className="mt-2 text-muted-foreground">Melde dich mit E-Mail-Code oder Passwort an.</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1 text-sm">
          <button type="button" className={`rounded-lg p-2 ${mode === 'code' ? 'bg-background shadow' : ''}`} onClick={() => setMode('code')}>E-Mail-Code</button>
          <button type="button" className={`rounded-lg p-2 ${mode === 'password' ? 'bg-background shadow' : ''}`} onClick={() => setMode('password')}>Passwort</button>
        </div>

        {mode === 'code' && step === 'enter-email' && (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="racepic-login-email">E-Mail-Adresse</Label>
              <Input
                id="racepic-login-email"
                type="email"
                required
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Code anfordern'}
            </Button>
          </form>
        )}

        {mode === 'code' && step === 'enter-code' && (
          <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Wir haben einen Code an <strong>{email}</strong> gesendet.
            </p>
            {/* Cognito EMAIL_OTP-Codes sind 8-stellig, nicht 6 (Bug gefunden 2026-09-22: Nutzer
                konnte den vollen Code nicht eingeben, da das Feld nach 6 Zeichen blockierte). */}
            <InputOTP maxLength={8} value={codeInput} onChange={setCodeInput}>
              <InputOTPGroup>
                {Array.from({ length: 8 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending || codeInput.length < 8}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Anmelden'}
            </Button>
          </form>
        )}

        {mode === 'password' && <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-4">
          <div><Label htmlFor="racepic-password-email">E-Mail-Adresse</Label><Input id="racepic-password-email" type="email" required autoComplete="email" value={emailInput} onChange={(event) => setEmailInput(event.target.value)} /></div>
          <div><Label htmlFor="racepic-password">Passwort</Label><Input id="racepic-password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <Button type="submit" className="w-full" disabled={passwordPending}>{passwordPending ? 'Meldet an…' : 'Anmelden'}</Button>
          <Link to="/racepic/studio/passwort-vergessen" className="block text-right text-sm underline">Passwort vergessen?</Link>
        </form>}

        <p className="mt-8 text-sm text-muted-foreground">
          Noch kein Zugang? <Link to="/racepic/studio/registrieren" className="underline">Als Fotograf:in registrieren</Link>.
        </p>
      </section>
    </MainLayout>
  );
}
