import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Filter } from 'lucide-react';

type NewsCategory = 'all' | 'event' | 'club';

// Extended mock news data
const newsArticles = [
  {
    id: 1,
    slug: 'vorbereitung-2026',
    title: 'Vorbereitungen für das 12. Oberlausitzer Dreieck laufen auf Hochtouren',
    excerpt: 'Das Org-Team hat mit den Planungen für die kommende Jubiläumsveranstaltung begonnen. Erste Sponsorengespräche wurden bereits erfolgreich geführt und die Genehmigungen sind beantragt.',
    content: 'Das Org-Team hat mit den Planungen für die kommende Jubiläumsveranstaltung begonnen...',
    date: '2026-01-10',
    category: 'event' as const,
    featured: true,
  },
  {
    id: 2,
    slug: 'jahreshauptversammlung-2026',
    title: 'Einladung zur Jahreshauptversammlung 2026',
    excerpt: 'Wir laden alle Mitglieder herzlich zur ordentlichen Jahreshauptversammlung am 20. Februar 2026 um 18:00 Uhr ins Vereinsheim ein.',
    content: 'Wir laden alle Mitglieder herzlich zur Jahreshauptversammlung...',
    date: '2026-01-05',
    category: 'club' as const,
    featured: false,
  },
  {
    id: 3,
    slug: 'rueckblick-2025',
    title: 'Rückblick: 11. Oberlausitzer Dreieck war voller Erfolg',
    excerpt: 'Mit über 5.000 Besuchern und perfektem Wetter war die Veranstaltung 2025 ein großer Erfolg. Wir danken allen Helfern, Sponsoren und Teilnehmern für zwei unvergessliche Tage.',
    content: 'Mit über 5.000 Besuchern war die Veranstaltung 2025 ein großer Erfolg...',
    date: '2025-09-20',
    category: 'event' as const,
    featured: true,
  },
  {
    id: 4,
    slug: 'neue-mitglieder-willkommen',
    title: 'Neue Mitglieder herzlich willkommen!',
    excerpt: 'Der MSC Oberlausitzer Dreiländereck sucht motorsportbegeisterte Menschen, die Teil unserer Gemeinschaft werden möchten. Ob als aktiver Fahrer oder Helfer – jeder ist willkommen!',
    content: 'Der MSC sucht motorsportbegeisterte Menschen...',
    date: '2025-08-15',
    category: 'club' as const,
    featured: false,
  },
  {
    id: 5,
    slug: 'trial-training-sommer-2025',
    title: 'Trial-Trainings im Sommer gut besucht',
    excerpt: 'Die Trial-Abteilung freut sich über regen Zulauf bei den Sommertrainings. Auch Anfänger sind jederzeit willkommen.',
    content: 'Die Trial-Abteilung freut sich über regen Zulauf...',
    date: '2025-07-28',
    category: 'club' as const,
    featured: false,
  },
  {
    id: 6,
    slug: 'helfer-gesucht-2026',
    title: 'Helfer für das 12. Oberlausitzer Dreieck gesucht',
    excerpt: 'Für die Veranstaltung im September 2026 suchen wir noch engagierte Helfer für verschiedene Bereiche: Streckenposten, Catering, Parkplatz und mehr.',
    content: 'Für die Veranstaltung suchen wir noch Helfer...',
    date: '2025-06-10',
    category: 'event' as const,
    featured: false,
  },
  {
    id: 7,
    slug: 'motorradtouristik-fruehling',
    title: 'Motorradtouristik startet in die Saison',
    excerpt: 'Mit der ersten Ausfahrt des Jahres startet die Touristik-Abteilung in die neue Saison. Mehrere Touren sind bereits geplant.',
    content: 'Mit der ersten Ausfahrt startet die Touristik-Abteilung...',
    date: '2025-04-15',
    category: 'club' as const,
    featured: false,
  },
  {
    id: 8,
    slug: 'sponsoren-2026',
    title: 'Hauptsponsoren für 2026 bestätigt',
    excerpt: 'Wir freuen uns, dass unsere langjährigen Partner Havlat und DEKRA auch 2026 wieder als Hauptsponsoren dabei sind.',
    content: 'Wir freuen uns über die Zusage unserer Hauptsponsoren...',
    date: '2025-03-20',
    category: 'event' as const,
    featured: false,
  },
];

const categoryConfig: Record<NewsCategory, { label: string; color: string }> = {
  all: { label: 'Alle', color: 'bg-muted text-foreground' },
  event: { label: 'Veranstaltung', color: 'bg-accent text-accent-foreground' },
  club: { label: 'Verein', color: 'bg-primary text-primary-foreground' },
};

export default function NewsPage() {
  const t = useTranslation();
  const [activeFilter, setActiveFilter] = useState<NewsCategory>('all');

  const filteredArticles = activeFilter === 'all'
    ? newsArticles
    : newsArticles.filter((article) => article.category === activeFilter);

  const featuredArticle = filteredArticles.find((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured || a !== featuredArticle);

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2">{t.news.title}</h1>
          <p className="text-lg text-primary-foreground/80">
            Neuigkeiten aus dem Verein und rund um die Veranstaltung
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-muted/50 py-4">
        <div className="container">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {(Object.keys(categoryConfig) as NewsCategory[]).map((cat) => (
                <Button
                  key={cat}
                  variant={activeFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(cat)}
                >
                  {categoryConfig[cat].label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {/* Featured Article */}
          {featuredArticle && (
            <Card className="group mb-8 overflow-hidden border-2 border-accent transition-shadow hover:shadow-xl">
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="flex h-64 items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 md:h-auto">
                  <span className="text-muted-foreground">Bild</span>
                </div>
                
                {/* Content */}
                <CardContent className="flex flex-col justify-center p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`rounded px-3 py-1 text-xs font-bold uppercase ${categoryConfig[featuredArticle.category].color}`}>
                      {categoryConfig[featuredArticle.category].label}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(featuredArticle.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <h2 className="mb-4 text-2xl font-bold transition-colors group-hover:text-primary md:text-3xl">
                    {featuredArticle.title}
                  </h2>
                  
                  <p className="mb-6 text-muted-foreground">
                    {featuredArticle.excerpt}
                  </p>
                  
                  <Button className="w-fit gap-2" asChild>
                    <Link to={`/news/${featuredArticle.slug}`}>
                      {t.news.readMore}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          )}

          {/* News Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regularArticles.map((article) => (
              <Card key={article.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                {/* Image */}
                <div className="flex h-40 items-center justify-center bg-muted">
                  <span className="text-muted-foreground">Bild</span>
                </div>
                
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${categoryConfig[article.category].color}`}>
                      {categoryConfig[article.category].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <h3 className="mb-2 line-clamp-2 font-bold transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>
                  
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>
                  
                  <Link 
                    to={`/news/${article.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {t.news.readMore}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
              <p>Keine Artikel in dieser Kategorie gefunden.</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
