import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';

// Mock news data
const newsArticles = [
  {
    id: 1,
    slug: 'vorbereitung-2026',
    title: 'Vorbereitungen für das 12. Oberlausitzer Dreieck laufen',
    excerpt: 'Das Org-Team hat mit den Planungen für die kommende Veranstaltung begonnen. Erste Sponsorengespräche wurden bereits geführt.',
    date: '2026-01-10',
    category: 'event',
    coverImage: null,
  },
  {
    id: 2,
    slug: 'jahreshauptversammlung-2026',
    title: 'Einladung zur Jahreshauptversammlung',
    excerpt: 'Wir laden alle Mitglieder herzlich zur Jahreshauptversammlung am 20. Februar ein. Tagesordnung und weitere Infos hier.',
    date: '2026-01-05',
    category: 'club',
    coverImage: null,
  },
  {
    id: 3,
    slug: 'rueckblick-2025',
    title: 'Rückblick: 11. Oberlausitzer Dreieck war voller Erfolg',
    excerpt: 'Mit über 5.000 Besuchern war die Veranstaltung 2025 ein großer Erfolg. Wir danken allen Helfern, Sponsoren und Teilnehmern.',
    date: '2025-09-20',
    category: 'event',
    coverImage: null,
  },
  {
    id: 4,
    slug: 'neue-mitglieder-willkommen',
    title: 'Neue Mitglieder herzlich willkommen!',
    excerpt: 'Der MSC sucht motorsportbegeisterte Menschen, die Teil unserer Gemeinschaft werden möchten. Jetzt Mitglied werden!',
    date: '2025-08-15',
    category: 'club',
    coverImage: null,
  },
];

export default function NewsPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.news.title}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Neuigkeiten aus dem Verein und rund um die Veranstaltung
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2">
            {newsArticles.map((article) => (
              <Card key={article.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                {/* Image Placeholder */}
                <div className="flex h-48 items-center justify-center bg-muted">
                  <span className="text-muted-foreground">Bild</span>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <Badge variant={article.category === 'event' ? 'default' : 'secondary'}>
                      {t.news.categories[article.category as keyof typeof t.news.categories]}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <h2 className="mb-2 text-xl font-semibold group-hover:text-primary">
                    {article.title}
                  </h2>
                  
                  <p className="mb-4 text-muted-foreground">
                    {article.excerpt}
                  </p>
                  
                  <Button variant="link" className="h-auto p-0" asChild>
                    <Link to={`/news/${article.slug}`}>
                      {t.news.readMore}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
