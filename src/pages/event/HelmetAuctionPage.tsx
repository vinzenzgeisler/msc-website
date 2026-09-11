import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Gavel } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EventSubnav } from '@/components/event/EventSubnav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchPublicAuction, submitAuctionBid } from '@/integrations/event-backend/client';
import { useLanguage } from '@/i18n/LanguageContext';

const money = (cents: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export default function HelmetAuctionPage() {
  const { locale } = useLanguage();
  const queryClient = useQueryClient();
  const auction = useQuery({ queryKey: ['public-auction'], queryFn: fetchPublicAuction, retry: false });
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [success, setSuccess] = useState<number | null>(null);
  const bid = useMutation({ mutationFn: ({ eventId, payload }: { eventId: string; payload: Parameters<typeof submitAuctionBid>[1] }) => submitAuctionBid(eventId, payload), onSuccess: async (_, variables) => { setSuccess(variables.payload.amountCents); await queryClient.invalidateQueries({ queryKey: ['public-auction'] }); } });
  const data = auction.data;
  const text = (values: Record<string, string> | undefined, fallback: string) => values?.[locale] || values?.de || fallback;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!data || !accepted) return;
    bid.mutate({ eventId: data.eventId, payload: { bidderName: name, contactType, contactValue: contact, amountCents: Math.round(Number(amount.replace(',', '.')) * 100), acceptedBinding: true, termsVersion: data.termsVersion, clientSubmissionKey: crypto.randomUUID(), website: '' } });
  };
  return <MainLayout title="Helm-Versteigerung" description="Auf den Helm von Didier Grams bieten." canonicalPath="/event/helm-versteigerung"><EventSubnav/><div className="container max-w-5xl py-8 md:py-12">
    {!data ? <div className="rounded-xl border p-8 text-center"><Gavel className="mx-auto h-10 w-10 text-muted-foreground"/><h1 className="mt-4 text-2xl font-bold">Helm-Versteigerung</h1><p className="mt-2 text-muted-foreground">Die Versteigerung wird vorbereitet.</p></div> : <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <section><p className="text-sm font-bold text-primary">Ein echtes Stück Motorsport</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{text(data.titleI18n, 'Der Helm von Didier Grams')}</h1><p className="mt-4 text-muted-foreground">{text(data.descriptionI18n, 'Biete auf den Helm von Didier Grams.')}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{data.videoUrl && <video src={data.videoUrl} poster={data.imageUrl ?? undefined} muted loop playsInline controls preload="metadata" className="aspect-[9/16] max-h-[560px] w-full rounded-xl bg-black object-cover"/>}{data.imageUrl && <button type="button" className="overflow-hidden rounded-xl bg-muted"><img src={data.imageUrl} alt="Helm von Didier Grams" className="h-full min-h-72 w-full object-cover" decoding="async"/></button>}</div></section>
      <aside className="lg:sticky lg:top-32 lg:self-start"><div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6"><p className="text-sm text-muted-foreground">Aktuelles Höchstgebot</p><p className="mt-1 text-4xl font-black">{data.currentHighestCents == null ? '–' : money(data.currentHighestCents)}</p><p className="mt-1 text-sm text-muted-foreground">Nächstes Gebot mindestens {money(data.nextMinimumCents)}</p>{data.status === 'closed' ? <p className="mt-6 rounded-lg bg-muted p-4 font-semibold">Die Versteigerung ist beendet.</p> : success !== null ? <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-800"><CheckCircle2 className="h-6 w-6"/><strong className="mt-2 block">Gebot erfolgreich abgegeben</strong><p className="text-sm">Dein verbindliches Gebot: {money(success)}</p></div> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block space-y-1"><Label>Name</Label><Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)}/></label><fieldset><legend className="text-sm font-medium">Kontaktmöglichkeit</legend><div className="mt-2 flex gap-4 text-sm"><label><input type="radio" checked={contactType === 'email'} onChange={() => setContactType('email')}/> E-Mail</label><label><input type="radio" checked={contactType === 'phone'} onChange={() => setContactType('phone')}/> Telefon</label></div><Input className="mt-2" required type={contactType === 'email' ? 'email' : 'tel'} value={contact} onChange={(e) => setContact(e.target.value)}/></fieldset><label className="block space-y-1"><Label>Dein Gebot in EUR</Label><Input required type="number" min={data.nextMinimumCents / 100} step={data.minIncrementCents / 100} value={amount} onChange={(e) => setAmount(e.target.value)}/></label><label className="flex items-start gap-3 text-sm"><input className="mt-1 h-4 w-4" type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)}/><span>Ich bestätige, dass mein Gebot über {amount ? money(Math.round(Number(amount.replace(',', '.')) * 100)) : 'den eingegebenen Betrag'} verbindlich ist und ich den Helm im Zuschlagsfall bezahle.</span></label>{text(data.termsI18n, '') && <details className="text-sm text-muted-foreground"><summary className="cursor-pointer font-medium">Versteigerungsbedingungen</summary><p className="mt-2 whitespace-pre-line">{text(data.termsI18n, '')}</p></details>}{bid.isError && <p className="text-sm text-destructive">Das Gebot konnte nicht angenommen werden. Bitte prüfe den aktuellen Mindestbetrag.</p>}<Button className="h-12 w-full text-base" disabled={bid.isPending || !accepted}>{bid.isPending ? 'Gebot wird geprüft…' : `Verbindliches Gebot${amount ? ` über ${amount} €` : ''} abgeben`}</Button></form>}</div></aside>
    </div>}
  </div></MainLayout>;
}
