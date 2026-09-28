import { Trophy } from 'lucide-react';
import { EventSubnav } from '@/components/event/EventSubnav';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  de: {
    kicker: 'Auktion beendet',
    title: 'Der Didier-Grams-Helm ist übergeben',
    intro: 'Der signierte Helm von Didier Grams hat einen neuen Besitzer. Vielen Dank an alle, die sich an der Versteigerung beteiligt haben.',
    winner: 'Gewinner',
    bid: 'Höchstgebot',
    helmetAlt: 'Signierter Helm von Didier Grams',
    handoverAlt: 'David Träber bei der Übergabe des signierten Helms',
  },
  en: {
    kicker: 'Auction closed',
    title: 'The Didier Grams helmet has been handed over',
    intro: 'The signed helmet of Didier Grams has a new owner. Thank you to everyone who took part in the auction.',
    winner: 'Winner',
    bid: 'Winning bid',
    helmetAlt: 'Signed helmet of Didier Grams',
    handoverAlt: 'David Träber receiving the signed helmet',
  },
  cz: {
    kicker: 'Aukce ukončena',
    title: 'Helma Didiera Gramse byla předána',
    intro: 'Podepsaná helma Didiera Gramse má nového majitele. Děkujeme všem, kteří se aukce zúčastnili.',
    winner: 'Vítěz',
    bid: 'Vítězná nabídka',
    helmetAlt: 'Podepsaná helma Didiera Gramse',
    handoverAlt: 'David Träber při předání podepsané helmy',
  },
  pl: {
    kicker: 'Aukcja zakończona',
    title: 'Kask Didiera Gramse został przekazany',
    intro: 'Podpisany kask Didiera Gramse ma nowego właściciela. Dziękujemy wszystkim uczestnikom aukcji.',
    winner: 'Zwycięzca',
    bid: 'Zwycięska oferta',
    helmetAlt: 'Podpisany kask Didiera Gramse',
    handoverAlt: 'David Träber podczas przekazania podpisanego kasku',
  },
} as const;

export default function HelmetAuctionPage() {
  const { locale } = useLanguage();
  const content = copy[locale];

  return (
    <MainLayout title={content.title} description={content.intro} canonicalPath="/event/helm-versteigerung">
      <EventSubnav phase="post" />
      <div className="container max-w-5xl py-10 md:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center bg-accent text-accent-foreground">
            <Trophy className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-5 text-sm font-bold uppercase tracking-wider text-primary">{content.kicker}</p>
          <h1 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-5xl">{content.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{content.intro}</p>
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 border border-border bg-card">
            <div className="border-r border-border p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{content.winner}</p>
              <p className="mt-2 text-xl font-black sm:text-2xl">David Träber</p>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{content.bid}</p>
              <p className="mt-2 text-xl font-black text-primary sm:text-2xl">333,00 €</p>
            </div>
          </div>
        </header>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 md:gap-6">
          <img
            src="/media/didier-grams-helm-2026.webp"
            alt={content.helmetAlt}
            className="aspect-[3/4] h-full w-full object-cover"
          />
          <img
            src="/media/helmauktion-uebergabe-2026.jpeg"
            alt={content.handoverAlt}
            className="aspect-[3/4] h-full w-full object-cover"
          />
        </div>
      </div>
    </MainLayout>
  );
}
