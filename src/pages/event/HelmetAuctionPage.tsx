import { FormEvent, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Expand, Gavel } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EventSubnav } from '@/components/event/EventSubnav';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchPublicAuction, submitAuctionBid } from '@/integrations/event-backend/client';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  de: { pageTitle: 'Helm-Versteigerung', meta: 'Auf den Helm von Didier Grams bieten.', kicker: 'Ein echtes Stück Motorsport', fallbackTitle: 'Der Helm von Didier Grams', fallbackDescription: 'Biete auf den Helm von Didier Grams.', preparing: 'Die Versteigerung wird vorbereitet.', highest: 'Aktuelles Höchstgebot', next: 'Nächstes Gebot mindestens', ended: 'Die Versteigerung ist beendet.', success: 'Gebot erfolgreich abgegeben', bindingBid: 'Dein verbindliches Gebot:', name: 'Name', contact: 'Kontaktmöglichkeit', email: 'E-Mail', phone: 'Telefon', amount: 'Dein Gebot in EUR', confirmStart: 'Ich bestätige, dass mein Gebot über', confirmEnd: 'verbindlich ist und ich den Helm im Zuschlagsfall bezahle.', enteredAmount: 'den eingegebenen Betrag', terms: 'Versteigerungsbedingungen', submit: 'Verbindliches Gebot abgeben', submitAmount: 'Verbindlich bieten:', pending: 'Gebot wird übermittelt…', genericError: 'Das Gebot konnte nicht angenommen werden. Bitte prüfe den aktuellen Mindestbetrag.', termsChanged: 'Die Bedingungen wurden inzwischen geändert. Bitte lies sie erneut und bestätige dein Gebot.', imageAlt: 'Helm von Didier Grams', expand: 'Helmbild vergrößern' },
  en: { pageTitle: 'Helmet auction', meta: "Bid on Didier Grams' helmet.", kicker: 'A genuine piece of motorsport', fallbackTitle: "Didier Grams' helmet", fallbackDescription: "Place a bid on Didier Grams' helmet.", preparing: 'The auction is being prepared.', highest: 'Current highest bid', next: 'Next minimum bid', ended: 'The auction has ended.', success: 'Bid submitted successfully', bindingBid: 'Your binding bid:', name: 'Name', contact: 'Contact option', email: 'Email', phone: 'Phone', amount: 'Your bid in EUR', confirmStart: 'I confirm that my bid of', confirmEnd: 'is binding and that I will pay for the helmet if I win.', enteredAmount: 'the entered amount', terms: 'Auction terms', submit: 'Submit binding bid', submitAmount: 'Binding bid:', pending: 'Submitting bid…', genericError: 'The bid could not be accepted. Please check the current minimum.', termsChanged: 'The terms have changed. Please read them again and confirm your bid.', imageAlt: 'Helmet of Didier Grams', expand: 'Enlarge helmet image' },
  cz: { pageTitle: 'Aukce helmy', meta: 'Přihazujte na helmu Didiera Gramse.', kicker: 'Skutečný kus motorsportu', fallbackTitle: 'Helma Didiera Gramse', fallbackDescription: 'Přihazujte na helmu Didiera Gramse.', preparing: 'Aukce se připravuje.', highest: 'Aktuální nejvyšší nabídka', next: 'Další minimální nabídka', ended: 'Aukce byla ukončena.', success: 'Nabídka byla úspěšně odeslána', bindingBid: 'Vaše závazná nabídka:', name: 'Jméno', contact: 'Kontaktní možnost', email: 'E-mail', phone: 'Telefon', amount: 'Vaše nabídka v EUR', confirmStart: 'Potvrzuji, že moje nabídka ve výši', confirmEnd: 'je závazná a v případě výhry helmu zaplatím.', enteredAmount: 'zadané částky', terms: 'Podmínky aukce', submit: 'Odeslat závaznou nabídku', submitAmount: 'Závazně nabídnout:', pending: 'Nabídka se odesílá…', genericError: 'Nabídku nebylo možné přijmout. Zkontrolujte aktuální minimum.', termsChanged: 'Podmínky se změnily. Přečtěte si je znovu a nabídku potvrďte.', imageAlt: 'Helma Didiera Gramse', expand: 'Zvětšit obrázek helmy' },
  pl: { pageTitle: 'Aukcja kasku', meta: 'Złóż ofertę na kask Didiera Gramsa.', kicker: 'Prawdziwy kawałek motorsportu', fallbackTitle: 'Kask Didiera Gramsa', fallbackDescription: 'Złóż ofertę na kask Didiera Gramsa.', preparing: 'Aukcja jest przygotowywana.', highest: 'Aktualna najwyższa oferta', next: 'Następna minimalna oferta', ended: 'Aukcja została zakończona.', success: 'Oferta została pomyślnie złożona', bindingBid: 'Twoja wiążąca oferta:', name: 'Imię i nazwisko', contact: 'Sposób kontaktu', email: 'E-mail', phone: 'Telefon', amount: 'Twoja oferta w EUR', confirmStart: 'Potwierdzam, że moja oferta w wysokości', confirmEnd: 'jest wiążąca i zapłacę za kask w przypadku wygranej.', enteredAmount: 'wpisanej kwoty', terms: 'Warunki aukcji', submit: 'Złóż wiążącą ofertę', submitAmount: 'Wiążąca oferta:', pending: 'Wysyłanie oferty…', genericError: 'Oferta nie mogła zostać przyjęta. Sprawdź aktualną kwotę minimalną.', termsChanged: 'Warunki uległy zmianie. Przeczytaj je ponownie i potwierdź ofertę.', imageAlt: 'Kask Didiera Gramsa', expand: 'Powiększ zdjęcie kasku' }
} as const;

const localeTags = { de: 'de-DE', en: 'en-GB', cz: 'cs-CZ', pl: 'pl-PL' } as const;
const pageTitles = { de: 'Didier-Grams-Helmauktion', en: 'Didier Grams helmet auction', cz: 'Aukce helmy Didiera Gramse', pl: 'Aukcja kasku Didiera Gramsa' } as const;

export default function HelmetAuctionPage() {
  const { locale } = useLanguage();
  const c = { ...copy[locale], pageTitle: pageTitles[locale] };
  const money = (cents: number) => new Intl.NumberFormat(localeTags[locale], { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const queryClient = useQueryClient();
  const auction = useQuery({ queryKey: ['public-auction'], queryFn: fetchPublicAuction, retry: false });
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const submissionKey = useRef(crypto.randomUUID());
  const bid = useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: Parameters<typeof submitAuctionBid>[1] }) => submitAuctionBid(eventId, payload),
    onSuccess: async (_, variables) => {
      setSuccess(variables.payload.amountCents);
      submissionKey.current = crypto.randomUUID();
      await queryClient.invalidateQueries({ queryKey: ['public-auction'] });
    },
    onError: async (error) => {
      if (error instanceof Error && error.message === 'AUCTION_TERMS_CHANGED') {
        setAccepted(false);
        await queryClient.invalidateQueries({ queryKey: ['public-auction'] });
      }
    }
  });
  const data = auction.data;
  const text = (values: Record<string, string> | undefined, fallback: string) => values?.[locale] || values?.de || fallback;
  const amountCents = Math.round(Number(amount.replace(',', '.')) * 100);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!data || !accepted || !Number.isFinite(amountCents) || amountCents < data.nextMinimumCents) return;
    bid.mutate({ eventId: data.eventId, payload: { bidderName: name, contactType, contactValue: contact, amountCents, acceptedBinding: true, termsVersion: data.termsVersion, clientSubmissionKey: submissionKey.current, website: '' } });
  };
  const errorMessage = bid.error instanceof Error && bid.error.message === 'AUCTION_TERMS_CHANGED' ? c.termsChanged : c.genericError;

  return <MainLayout title={c.pageTitle} description={c.meta} canonicalPath="/event/helm-versteigerung"><EventSubnav/><div className="container max-w-5xl py-8 md:py-12">
    {!data ? <div className="rounded-xl border p-8 text-center"><Gavel className="mx-auto h-10 w-10 text-muted-foreground"/><h1 className="mt-4 text-2xl font-bold">{c.pageTitle}</h1><p className="mt-2 text-muted-foreground">{c.preparing}</p></div> : <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <section><p className="text-sm font-bold text-primary">{c.kicker}</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{text(data.titleI18n, c.fallbackTitle)}</h1><p className="mt-4 text-muted-foreground">{text(data.descriptionI18n, c.fallbackDescription)}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{data.videoUrl && <video src={data.videoUrl} poster={data.imageUrl ?? undefined} muted loop playsInline controls preload="metadata" className="aspect-[9/16] max-h-[560px] w-full rounded-xl bg-black object-cover"/>}{data.imageUrl && <button type="button" aria-label={c.expand} onClick={() => setImageOpen(true)} className="group relative overflow-hidden rounded-xl bg-muted"><img src={data.imageUrl} alt={c.imageAlt} className="h-full min-h-72 w-full object-cover" loading="lazy" decoding="async"/><span className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white"><Expand className="h-4 w-4"/></span></button>}</div></section>
      <aside className="lg:sticky lg:top-32 lg:self-start"><div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"><p className="text-sm text-muted-foreground">{c.highest}</p><p className="mt-1 text-4xl font-black">{data.currentHighestCents == null ? '–' : money(data.currentHighestCents)}</p><p className="mt-1 text-sm text-muted-foreground">{c.next} {money(data.nextMinimumCents)}</p>{data.status === 'closed' ? <p className="mt-6 rounded-lg bg-muted p-4 font-semibold">{c.ended}</p> : success !== null ? <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800"><CheckCircle2 className="h-6 w-6"/><strong className="mt-2 block">{c.success}</strong><p className="text-sm">{c.bindingBid} {money(success)}</p></div> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block space-y-1"><Label>{c.name}</Label><Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)}/></label><fieldset><legend className="text-sm font-medium">{c.contact}</legend><div className="mt-2 flex gap-4 text-sm"><label><input type="radio" checked={contactType === 'email'} onChange={() => setContactType('email')}/> {c.email}</label><label><input type="radio" checked={contactType === 'phone'} onChange={() => setContactType('phone')}/> {c.phone}</label></div><Input className="mt-2" required type={contactType === 'email' ? 'email' : 'tel'} value={contact} onChange={(e) => setContact(e.target.value)}/></fieldset><label className="block space-y-1"><Label>{c.amount}</Label><Input required type="number" min={data.nextMinimumCents / 100} step={data.minIncrementCents / 100} value={amount} onChange={(e) => setAmount(e.target.value)}/></label><label className="flex items-start gap-3 text-sm"><input className="mt-1 h-4 w-4" type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)}/><span>{c.confirmStart} {amount ? money(amountCents) : c.enteredAmount} {c.confirmEnd}</span></label>{text(data.termsI18n, '') && <details className="text-sm text-muted-foreground"><summary className="cursor-pointer font-medium">{c.terms}</summary><p className="mt-2 whitespace-pre-line">{text(data.termsI18n, '')}</p></details>}{bid.isError && <p className="text-sm text-destructive">{errorMessage}</p>}<Button className="h-12 w-full text-base" disabled={bid.isPending || !accepted}>{bid.isPending ? c.pending : amount ? `${c.submitAmount} ${money(amountCents)}` : c.submit}</Button></form>}</div></aside>
    </div>}
    <Dialog open={imageOpen} onOpenChange={setImageOpen}><DialogContent className="max-w-5xl border-0 bg-black p-2">{data?.imageUrl && <img src={data.imageUrl} alt={c.imageAlt} className="max-h-[88vh] w-full object-contain"/>}</DialogContent></Dialog>
  </div></MainLayout>;
}
