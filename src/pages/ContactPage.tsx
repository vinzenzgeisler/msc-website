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

export default function ContactPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: settings } = useSettings();
  const intro = useContentWithFallback('contact', 'intro', {
    title: t.nav.contact,
    subtitle:
      locale === 'de'
        ? 'Wir freuen uns auf deine Nachricht'
        : locale === 'cz'
          ? 'Těšíme se na tvou zprávu'
          : 'We look forward to your message',
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
      toast.error(locale === 'de' ? 'Bitte füllen Sie alle Felder aus' : locale === 'cz' ? 'Vyplňte prosím všechna pole' : 'Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(locale === 'de' ? 'Ungültige E-Mail-Adresse' : locale === 'cz' ? 'Neplatná e-mailová adresa' : 'Invalid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      await pb.send('/api/cms/contact', { method: 'POST', body: formData });
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success(t.contact.success);
    } catch (error: unknown) {
      console.error('Contact form error:', error);
      toast.error(locale === 'de' ? 'Fehler beim Senden. Bitte versuchen Sie es später erneut.' : locale === 'cz' ? 'Chyba při odesílání. Zkuste to prosím později.' : 'Error sending message. Please try again later.');
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
                  {locale === 'de' ? 'Nachricht senden' : locale === 'cz' ? 'Odeslat zprávu' : 'Send Message'}
                </h2>
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {locale === 'de' ? 'Nachricht gesendet!' : locale === 'cz' ? 'Zpráva odeslána!' : 'Message sent!'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {locale === 'de' ? 'Wir werden uns so schnell wie möglich bei Ihnen melden.' : locale === 'cz' ? 'Ozveme se vám co nejdříve.' : 'We will get back to you as soon as possible.'}
                    </p>
                    <Button onClick={() => setIsSuccess(false)}>
                      {locale === 'de' ? 'Weitere Nachricht senden' : locale === 'cz' ? 'Odeslat další zprávu' : 'Send another message'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.contact.name} *</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={locale === 'de' ? 'Ihr Name' : locale === 'cz' ? 'Vaše jméno' : 'Your name'} maxLength={100} required disabled={isSubmitting} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.contact.email} *</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={locale === 'de' ? 'ihre@email.de' : locale === 'cz' ? 'vas@email.cz' : 'your@email.com'} maxLength={255} required disabled={isSubmitting} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t.contact.subject} *</Label>
                      <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder={locale === 'de' ? 'Betreff' : locale === 'cz' ? 'Předmět' : 'Subject'} maxLength={200} required disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t.contact.message} *</Label>
                      <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder={locale === 'de' ? 'Ihre Nachricht...' : locale === 'cz' ? 'Vaše zpráva...' : 'Your message...'} rows={6} maxLength={5000} required disabled={isSubmitting} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{locale === 'de' ? 'Wird gesendet...' : locale === 'cz' ? 'Odesílání...' : 'Sending...'}</>) : t.contact.send}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-6 text-2xl font-semibold">
                {locale === 'de' ? 'Kontaktdaten' : locale === 'cz' ? 'Kontaktní údaje' : 'Contact Information'}
              </h2>
              {infoContent.content ? (
                <RichContent content={infoContent.content} className="mb-6 text-muted-foreground" />
              ) : null}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3"><MapPin className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">{locale === 'de' ? 'Adresse' : locale === 'cz' ? 'Adresa' : 'Address'}</h3>
                    <p className="text-muted-foreground">
                      {settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'}<br />
                      {settings?.address || '02797 Oybin'}<br />
                      Sachsen, {locale === 'de' ? 'Deutschland' : locale === 'cz' ? 'Německo' : 'Germany'}
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
