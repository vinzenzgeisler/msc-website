import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useEmailOtpLogin } from './useEmailOtpLogin';

/** RacePic-Studio-Login fuer bereits geclaimte Fotografenprofile (Paket 2b). */
export default function StudioLoginPage() {
  const navigate = useNavigate();
  const { step, email, pending, error, requestCode, confirmCode } = useEmailOtpLogin();
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');

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
        <p className="mt-2 text-muted-foreground">Anmeldung für Fotograf:innen mit einem per E-Mail zugestellten Code.</p>

        {step === 'enter-email' && (
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

        {step === 'enter-code' && (
          <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Wir haben einen Code an <strong>{email}</strong> gesendet.
            </p>
            <InputOTP maxLength={6} value={codeInput} onChange={setCodeInput}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending || codeInput.length < 6}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Anmelden'}
            </Button>
          </form>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          Noch kein Zugang? Fotograf:innen werden vom MSC persönlich eingeladen.{' '}
          <Link to="/contact" className="underline">
            Kontakt aufnehmen
          </Link>
        </p>
      </section>
    </MainLayout>
  );
}
