import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pb } from '@/integrations/pocketbase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SEO } from '@/components/layout/SEO';
import { Loader2, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await pb.collection('cms_users').requestPasswordReset(email);
      setSuccess(true);
    } catch (error) {
      setError((error as Error).message);
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <>
        <SEO title="Passwort vergessen" noindex />
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
          <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <CardTitle>E-Mail gesendet</CardTitle>
              <CardDescription>
                Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts gesendet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Bitte überprüfe deinen Posteingang und klicke auf den Link in der E-Mail.
                Falls du keine E-Mail erhalten hast, überprüfe auch deinen Spam-Ordner.
              </p>
              <Link to="/admin/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zum Login
                </Button>
              </Link>
            </CardContent>
          </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Passwort vergessen" noindex />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Passwort vergessen?</h1>
          <p className="text-muted-foreground">MSC Oberlausitzer Dreiländereck e.V.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
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
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Senden...
                  </>
                ) : (
                  'Link senden'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/admin/login" className="hover:text-primary">
            <ArrowLeft className="inline mr-1 h-3 w-3" />
            Zurück zum Login
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
