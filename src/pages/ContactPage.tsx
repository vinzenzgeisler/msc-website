import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Mail, Phone, Facebook, Instagram } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.contact}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Wir freuen uns auf Ihre Nachricht
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6 text-2xl font-semibold">Nachricht senden</h2>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.contact.name}</Label>
                      <Input id="name" placeholder="Ihr Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.contact.email}</Label>
                      <Input id="email" type="email" placeholder="ihre@email.de" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t.contact.subject}</Label>
                    <Input id="subject" placeholder="Betreff" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t.contact.message}</Label>
                    <Textarea id="message" placeholder="Ihre Nachricht..." rows={6} />
                  </div>
                  <Button type="submit" className="w-full">
                    {t.contact.send}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold">Kontaktdaten</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Adresse</h3>
                    <p className="text-muted-foreground">
                      MSC Oberlausitzer Dreiländereck e.V.<br />
                      02797 Oybin<br />
                      Sachsen, Deutschland
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">E-Mail</h3>
                    <a 
                      href="mailto:info@msc-oberlausitzer-dreilaendereck.de"
                      className="text-muted-foreground hover:text-primary"
                    >
                      info@msc-oberlausitzer-dreilaendereck.de
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Facebook className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Social Media</h3>
                    <div className="flex gap-4">
                      <a 
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        Facebook
                      </a>
                      <a 
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 flex h-64 items-center justify-center rounded-lg border border-border bg-muted">
                <span className="text-muted-foreground">Karte (Platzhalter)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
