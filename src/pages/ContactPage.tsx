import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation, useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Mail, Facebook, Instagram, Share2, Loader2, CheckCircle } from 'lucide-react';
import { pb } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { RichContent } from '@/components/content/RichContent';
import { localize } from '@/i18n/locale-utils';
import { trackEvent } from '@/lib/analytics';

export default function ContactPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: settings } = useSettings();
  const intro = useContentWithFallback('contact', 'intro', {
    title: t.nav.contact,
    subtitle: localize(locale, {
      de: 'Wir freuen uns auf deine Nachricht',
      cz: 'Těšíme se na tvou zprávu',
      en: 'We look forward to your message',
      pl: 'Czekamy na twoja wiadomosc',
    }),
  });
  const infoContent = useContentWithFallback('contact', 'info', { content: '' });
  const mapContent = useContentWithFallback('contact', 'map', {
    title: settings?.contact_map_label || '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error(localize(locale, {
        de: 'Bitte füllen Sie alle Felder aus',
        cz: 'Vyplnte prosim vsechna pole',
        en: 'Please fill in all fields',
        pl: 'Prosze wypelnic wszystkie pola',
      }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(localize(locale, {
        de: 'Ungültige E-Mail-Adresse',
        cz: 'Neplatna e-mailova adresa',
        en: 'Invalid email address',
        pl: 'Nieprawidlowy adres e-mail',
      }));
      return;
    }
    setIsSubmitting(true);
    try {
      await pb.send('/api/cms/contact', { method: 'POST', body: formData });
      trackEvent('contact_form_submit', {
        category: 'engagement',
        label: 'contact_page',
        cta_position: 'contact_form',
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success(t.contact.success);
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      toast.error(localize(locale, {
        de: 'Fehler beim Senden. Bitte versuchen Sie es später erneut.',
        cz: 'Chyba pri odesilani. Zkuste to prosim pozdeji.',
        en: 'Error sending message. Please try again later.',
        pl: 'Blad podczas wysylania. Sprobuj ponownie pozniej.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title={intro.title} description={intro.subtitle || undefined}>
      <PageHeader
        title={intro.title}
        subtitle={intro.subtitle || undefined}
        imageUrl={intro.header_image_url || undefined}
        imageAlt={intro.header_image_alt || intro.title}
      />

      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6 text-2xl font-semibold">
                  {localize(locale, {
                    de: 'Nachricht senden',
                    cz: 'Odeslat zpravu',
                    en: 'Send Message',
                    pl: 'Wyslij wiadomosc',
                  })}
                </h2>
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {localize(locale, {
                        de: 'Nachricht gesendet!',
                        cz: 'Zprava odeslana!',
                        en: 'Message sent!',
                        pl: 'Wiadomosc wyslana!',
                      })}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {localize(locale, {
                        de: 'Wir werden uns so schnell wie möglich bei dir melden.',
                        cz: 'Ozveme se ti co nejdriv.',
                        en: 'We will get back to you as soon as possible.',
                        pl: 'Odezwiemy sie do ciebie tak szybko, jak to mozliwe.',
                      })}
                    </p>
                    <Button onClick={() => setIsSuccess(false)}>
                      {localize(locale, {
                        de: 'Weitere Nachricht senden',
                        cz: 'Odeslat dalsi zpravu',
                        en: 'Send another message',
                        pl: 'Wyslij kolejna wiadomosc',
                      })}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.contact.name} *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={localize(locale, { de: 'Dein Name', cz: 'Tvoje jmeno', en: 'Your name', pl: 'Twoje imie' })} maxLength={100} required disabled={isSubmitting} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.contact.email} *</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={localize(locale, { de: 'deine@email.de', cz: 'tvuj@email.cz', en: 'your@email.com', pl: 'twoj@email.pl' })} maxLength={255} required disabled={isSubmitting} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t.contact.subject} *</Label>
                      <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder={localize(locale, { de: 'Betreff', cz: 'Predmet', en: 'Subject', pl: 'Temat' })} maxLength={200} required disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t.contact.message} *</Label>
                      <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder={localize(locale, { de: 'Deine Nachricht...', cz: 'Tvoje zprava...', en: 'Your message...', pl: 'Twoja wiadomosc...' })} rows={6} maxLength={5000} required disabled={isSubmitting} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{localize(locale, { de: 'Wird gesendet...', cz: 'Odesilani...', en: 'Sending...', pl: 'Wysylanie...' })}</>) : t.contact.send}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-6 text-2xl font-semibold">
                {localize(locale, {
                  de: 'Kontaktdaten',
                  cz: 'Kontaktni udaje',
                  en: 'Contact Information',
                  pl: 'Dane kontaktowe',
                })}
              </h2>
              {infoContent.content ? (
                <RichContent content={infoContent.content} className="mb-6 text-muted-foreground" />
              ) : null}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3"><MapPin className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">{localize(locale, { de: 'Adresse', cz: 'Adresa', en: 'Address', pl: 'Adres' })}</h3>
                    <p className="text-muted-foreground">
                      {settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'}<br />
                      {settings?.address || '02797 Oybin'}<br />
                      Sachsen, {localize(locale, { de: 'Deutschland', cz: 'Nemecko', en: 'Germany', pl: 'Niemcy' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3"><Mail className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">E-Mail</h3>
                    <a href={`mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.eu'}`} className="text-muted-foreground hover:text-primary">
                      {settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.eu'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3"><Share2 className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">Social Media</h3>
                    <div className="mt-4 flex items-center gap-4">
                      {settings?.facebook_url ? (
                        <a
                          href={settings.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          aria-label="Facebook"
                          onClick={() => trackEvent('social_click', { category: 'outbound', label: 'facebook_contact' })}
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      ) : null}
                      {settings?.instagram_url ? (
                        <a
                          href={settings.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          aria-label="Instagram"
                          onClick={() => trackEvent('social_click', { category: 'outbound', label: 'instagram_contact' })}
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
