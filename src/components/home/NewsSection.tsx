import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, ArrowUpRight, Newspaper } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function NewsSection() {
  const t = useTranslation();
  const { data: posts, isLoading } = usePosts();
  
  // Get only published posts, sorted by date, limit to 3
  const newsItems = (posts || [])
    .filter(post => post.status === 'published')
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
    .slice(0, 3);

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'd. MMMM yyyy', { locale: de });
  };

  if (isLoading) {
    return (
      <section className="relative py-20 md:py-28">
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-primary to-accent" />
        <div className="container">
          <div className="mb-12">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden rounded-none border-2">
                <Skeleton className="h-32" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) {
    return (
      <section className="relative py-20 md:py-28">
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
          </div>
          <Card className="border-dashed border-2 bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Noch keine News veröffentlicht</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

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
                {news.image_url ? (
                  <img 
                    src={news.image_url} 
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Newspaper className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {/* Category badge */}
                {news.category && (
                  <div className="absolute left-4 top-4 rounded-none bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                    {news.category === 'event' ? t.news.categories.event : t.news.categories.club}
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <p className="mb-2 text-sm text-muted-foreground">
                  {formatDate(news.published_at || news.created_at)}
                </p>
                
                <h3 className={`font-bold transition-colors group-hover:text-primary ${
                  index === 0 ? 'mb-3 text-2xl' : 'mb-2 text-lg'
                }`}>
                  {news.title}
                </h3>
                
                {index === 0 && news.excerpt && (
                  <p className="mb-4 text-muted-foreground line-clamp-3">
                    {news.excerpt}
                  </p>
                )}

                <Link 
                  to={`/news/${news.slug}`}
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
