import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';

export default function HistoryPage() {
  const t = useTranslation();

  const timeline = [
    { year: '1990', title: 'Gründung des Vereins', description: 'Der MSC Oberlausitzer Dreiländereck e.V. wird gegründet.' },
    { year: '1995', title: 'Erstes Oberlausitzer Dreieck', description: 'Die erste Ausgabe des legendären Demolaufs findet statt.' },
    { year: '2000', title: 'Ausbau der Vereinsstruktur', description: 'Gründung der Sparten Motorradtouristik, Motocross und Trial.' },
    { year: '2010', title: '15 Jahre Oberlausitzer Dreieck', description: 'Jubiläumsveranstaltung mit Rekordbeteiligung.' },
    { year: '2019', title: 'Letzte Veranstaltung vor Corona', description: 'Das 9. Oberlausitzer Dreieck begeistert tausende Besucher.' },
    { year: '2023', title: 'Neustart nach der Pause', description: 'Erfolgreiche Rückkehr des Oberlausitzer Dreiecks.' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.history}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Tradition und Leidenschaft seit der Gründung
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="relative border-l-2 border-primary/30 pl-8">
              {timeline.map((item, index) => (
                <div key={item.year} className="relative mb-10 last:mb-0">
                  {/* Dot */}
                  <div className="absolute -left-[2.55rem] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                      {item.year}
                    </span>
                    <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
