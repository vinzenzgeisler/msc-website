import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pb } from '@/integrations/pocketbase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SEO } from '@/components/layout/SEO';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('code') || '';
    setResetToken(token);
    setIsValidSession(Boolean(token));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);

    try {
      await pb.collection('cms_users').confirmPasswordReset(resetToken, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <>
        <SEO title="Passwort zurücksetzen" noindex />
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!isValidSession) {
    return (
      <>
        <SEO title="Ungültiger Reset-Link" noindex />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
          <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4 mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <CardTitle>Ungültiger Link</CardTitle>
              <CardDescription>
                Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/admin/forgot-password')}
              >
                Neuen Link anfordern
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <SEO title="Passwort geändert" noindex />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
          <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <CardTitle>Passwort geändert</CardTitle>
              <CardDescription>
                Dein Passwort wurde erfolgreich geändert. Du wirst in Kürze zum Login weitergeleitet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => navigate('/admin/login')}
              >
                Zum Login
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Passwort zurücksetzen" noindex />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Neues Passwort</h1>
          <p className="text-muted-foreground">MSC Oberlausitzer Dreiländereck e.V.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Gib dein neues Passwort ein.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  'Passwort speichern'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
