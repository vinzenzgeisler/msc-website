import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation, useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Filter, Newspaper, Pin } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { formatDateSafe, getSafeTimestamp } from '@/lib/date';
import { useSettings } from '@/hooks/useSettings';
import { getDateFnsLocale, localize } from '@/i18n/locale-utils';

// Map database categories to display categories
const dbCategoryMap: Record<string, string> = {
  'verein': 'club',
  'event': 'allgemein',
  'motocross': 'motocross',
  'trial': 'trial',
  'touring': 'touring',
};

type NewsCategory = 'all' | 'club' | 'allgemein' | 'motocross' | 'trial' | 'touring';

export default function NewsPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<NewsCategory>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: posts, isLoading } = usePosts();
  const { data: settings } = useSettings(); // ← neu
  const intro = useContentWithFallback('news', 'intro', {
    title: t.news.title,
    subtitle: localize(locale, {
      de: 'Neuigkeiten aus dem Verein und rund um die Veranstaltung',
      cz: 'Novinky z klubu a kolem akce',
      en: 'News from the club and around the event',
      pl: 'Aktualnosci z klubu i z wydarzenia',
    }),
  });

  const categoryConfig: Record<NewsCategory, { label: string; color: string }> = {
    all: { label: localize(locale, { de: 'Alle', cz: 'Vse', en: 'All', pl: 'Wszystkie' }), color: 'bg-muted/50 text-foreground border-l-4 border-muted-foreground' },
    club: { label: t.news.categories.club, color: 'border-l-4 border-primary bg-primary/15 text-primary dark:text-primary-foreground dark:bg-primary/30' },
    allgemein: { label: localize(locale, { de: 'Allgemein', cz: 'Obecne', en: 'General', pl: 'Ogolne' }), color: 'border-l-4 border-secondary bg-secondary/15 text-secondary-foreground' },
    motocross: { label: 'Motocross', color: 'border-l-4 border-accent bg-accent/15 text-accent dark:text-accent' },
    trial: { label: 'Trial', color: 'border-l-4 border-accent bg-accent/15 text-accent dark:text-accent' },
    touring: { label: t.nav.touring, color: 'border-l-4 border-accent bg-accent/15 text-accent dark:text-accent' },
  };

  const dateLocale = getDateFnsLocale(locale);

  // Get only published posts - sorted by is_pinned first, then by date
  const publishedPosts = (posts || [])
    .filter(post => post.status === 'published')
    .sort((a, b) => {
      // Pinned posts first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then by date
      const timeA = getSafeTimestamp(a.display_date);
      const timeB = getSafeTimestamp(b.display_date);
      return timeB - timeA;
    });

  const filteredArticles = activeFilter === 'all'
    ? publishedPosts
    : publishedPosts.filter((article) => {
        const mappedCategory = dbCategoryMap[article.category || ''] || article.category;
        return mappedCategory === activeFilter || article.category === activeFilter;
      });

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);
  const currentPageParam = Number(searchParams.get('page') || '1');
  const currentPage = Number.isFinite(currentPageParam) && currentPageParam > 0 ? Math.floor(currentPageParam) : 1;
  const totalPages = regularArticles.length <= 5
    ? 1
    : 1 + Math.ceil((regularArticles.length - 5) / 6);
  const paginatedArticles = useMemo(() => {
    if (currentPage === 1) {
      return regularArticles.slice(0, 5);
    }

    const startIndex = 5 + (currentPage - 2) * 6;
    return regularArticles.slice(startIndex, startIndex + 6);
  }, [currentPage, regularArticles]);

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    if (page <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(page));
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setPage(1);
  }, [activeFilter, locale]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatDate = (dateStr?: string | null, short = false) => {
    const formatStr = short ? 'd. MMM yyyy' : 'd. MMMM yyyy';
    return formatDateSafe(dateStr, formatStr, dateLocale, '');
  };

  const getCategoryColor = (category: string | null) => {
    const mapped = dbCategoryMap[category || ''] || category;
    return categoryConfig[mapped as NewsCategory]?.color || 'bg-muted text-foreground';
  };

  const getCategoryLabel = (category: string | null) => {
    const mapped = dbCategoryMap[category || ''] || category;
    return categoryConfig[mapped as NewsCategory]?.label || category || 'Allgemein';
  };

  return (
      <>
        <Helmet>
          <title>{intro.title} – {settings?.site_name || 'MSC'}</title>
          <meta name="description" content={intro.subtitle || ''} />
          <meta property="og:title" content={`${intro.title} – ${settings?.site_name || 'MSC'}`} />
          <meta property="og:description" content={intro.subtitle || ''} />
          {settings?.default_og_image_url && (
            <meta property="og:image" content={settings.default_og_image_url} />
          )}
          <meta property="og:type" content="website" />
        </Helmet>
        
        <MainLayout title={intro.title} description={intro.subtitle || undefined}>
          {/* Header */}
          <section className="bg-primary py-16 text-primary-foreground">
            <div className="container">
              <h1 className="mb-2">{intro.title}</h1>
              <p className="text-lg text-primary-foreground/80">{intro.subtitle}</p>
            </div>
          </section>

          {/* Filters */}
          <section className="border-b border-border bg-muted/50 py-4">
            <div className="container">
              <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {(['all', 'club', 'motocross', 'trial', 'touring'] as NewsCategory[]).map((cat) => (
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
              {isLoading ? (
                <>
                  {/* Featured skeleton */}
                  <Card className="mb-8 overflow-hidden border-2">
                    <div className="grid md:grid-cols-2">
                      <Skeleton className="h-64" />
                      <div className="p-8">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <Skeleton className="h-8 w-full mb-4" />
                        <Skeleton className="h-20 w-full mb-6" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </Card>
                  {/* Grid skeleton */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-40" />
                        <CardContent className="p-5">
                          <Skeleton className="h-4 w-24 mb-3" />
                          <Skeleton className="h-6 w-full mb-2" />
                          <Skeleton className="h-12 w-full mb-4" />
                          <Skeleton className="h-4 w-20" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Featured Article */}
                  {featuredArticle && currentPage === 1 && (
                    <Link to={`/news/${featuredArticle.slug}`} className="group mb-8 block overflow-hidden rounded-lg border-2 border-accent bg-card transition-shadow hover:shadow-xl">
                      <div className="grid md:grid-cols-2">
                        {/* Image */}
                        <div className="aspect-[16/9] md:aspect-auto md:h-full bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                          {featuredArticle.image_url ? (
                            <img 
                              src={featuredArticle.image_url} 
                              alt={featuredArticle.title}
                              className="w-full h-full object-cover object-center"
                              loading="lazy"
                            />
                          ) : (
                            <Newspaper className="h-16 w-16 text-muted-foreground" />
                          )}
                          {featuredArticle.is_pinned && (
                            <Badge className="absolute top-4 left-4 gap-1 bg-accent">
                              <Pin className="h-3 w-3" />
                              {localize(locale, { de: 'Angeheftet', cz: 'Pripnuto', en: 'Pinned', pl: 'Przypiete' })}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col justify-center p-8">
                          <div className="mb-4 flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${getCategoryColor(featuredArticle.category)}`}>
                              {getCategoryLabel(featuredArticle.category)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {t.news.publishedOn} {formatDate(featuredArticle.display_date)}
                            </span>
                          </div>
                          
                          <h2 className="mb-4 text-2xl font-bold transition-colors group-hover:text-primary md:text-3xl">
                            {featuredArticle.title}
                          </h2>
                          
                          {featuredArticle.excerpt && (
                            <p className="mb-6 text-muted-foreground line-clamp-3">
                              {featuredArticle.excerpt}
                            </p>
                          )}
                          
                          <span className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                            {t.news.readMore}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* News Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedArticles.map((article) => (
                      <Link key={article.id} to={`/news/${article.slug}`} className="group block overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
                        {/* Image */}
                        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                          {article.image_url ? (
                            <img 
                              src={article.image_url} 
                              alt={article.title}
                              className="w-full h-full object-cover object-center"
                              loading="lazy"
                            />
                          ) : (
                            <Newspaper className="h-8 w-8 text-muted-foreground" />
                          )}
                          {article.is_pinned && (
                            <Badge className="absolute top-2 left-2 gap-1 bg-accent text-xs">
                              <Pin className="h-3 w-3" />
                            </Badge>
                          )}
                        </div>
                        
                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-3">
                            <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getCategoryColor(article.category)}`}>
                              {getCategoryLabel(article.category)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {t.news.publishedOn} {formatDate(article.display_date, true)}
                            </span>
                          </div>
                          
                          <h3 className="mb-2 line-clamp-2 font-bold transition-colors group-hover:text-primary">
                            {article.title}
                          </h3>
                          
                          {article.excerpt && (
                            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                              {article.excerpt}
                            </p>
                          )}
                          
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                            {t.news.readMore}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        {localize(locale, { de: 'Zurück', cz: 'Zpet', en: 'Previous', pl: 'Wstecz' })}
                      </Button>

                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          onClick={() => setPage(page)}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        {localize(locale, { de: 'Weiter', cz: 'Dalsi', en: 'Next', pl: 'Dalej' })}
                      </Button>
                    </div>
                  )}

                  {filteredArticles.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
                      <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>
                        {localize(locale, {
                          de: 'Keine Artikel gefunden.',
                          cz: 'Zadne clanky nenalezeny.',
                          en: 'No articles found.',
                          pl: 'Nie znaleziono artykulow.',
                        })}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </MainLayout>
    </>
  );
}
