import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

// Mock news data - will be replaced with database data
const newsItems = [
  {
    id: 1,
    date: '2026-01-15',
    title: 'Planungen für das 12. Oberlausitzer Dreieck laufen',
    excerpt: 'Die Vorbereitungen für unsere Jubiläumsveranstaltung sind in vollem Gange. Das Org-Team trifft sich regelmäßig...',
    category: 'event',
    image: null,
  },
  {
    id: 2,
    date: '2025-12-20',
    title: 'Rückblick Weihnachtsfeier 2025',
    excerpt: 'Bei unserer traditionellen Weihnachtsfeier kamen wieder über 60 Mitglieder zusammen...',
    category: 'club',
    image: null,
  },
  {
    id: 3,
    date: '2025-11-10',
    title: 'Neue Trial-Sektion eröffnet',
    excerpt: 'Ab sofort steht unseren Trial-Fahrern ein erweitertes Übungsgelände zur Verfügung...',
    category: 'club',
    image: null,
  },
];

export function NewsSection() {
  const t = useTranslation();

  return (
    <section className="relative py-20 md:py-28">
      {/* Racing accent line */}
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-primary to-accent" />

      <div className="container">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              {t.nav.news}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Aktuelles aus dem Vereinsleben
            </p>
          </div>
          <Button 
            variant="outline" 
            className="group rounded-none font-semibold uppercase tracking-wider"
            asChild
          >
            <Link to="/news">
              Alle News
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {newsItems.map((news, index) => (
            <Card 
              key={news.id}
              className={`group relative overflow-hidden rounded-none border-2 border-border transition-all hover:border-primary hover:shadow-xl ${
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              {/* Image placeholder */}
              <div className={`relative bg-muted ${index === 0 ? 'h-48 lg:h-64' : 'h-32'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground">Bild</span>
                </div>
                {/* Category badge */}
                <div className="absolute left-4 top-4 rounded-none bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                  {t.news.categories[news.category as keyof typeof t.news.categories]}
                </div>
              </div>

              <CardContent className="p-6">
                <p className="mb-2 text-sm text-muted-foreground">
                  {new Date(news.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                
                <h3 className={`font-bold transition-colors group-hover:text-primary ${
                  index === 0 ? 'mb-3 text-2xl' : 'mb-2 text-lg'
                }`}>
                  {news.title}
                </h3>
                
                {index === 0 && (
                  <p className="mb-4 text-muted-foreground">
                    {news.excerpt}
                  </p>
                )}

                <Link 
                  to={`/news/${news.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  Weiterlesen
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </CardContent>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
