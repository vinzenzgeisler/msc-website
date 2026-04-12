import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Share2, Facebook, Twitter, Newspaper } from 'lucide-react';
import { usePostBySlug } from '@/hooks/usePosts';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslation();
  const { data: article, isLoading, error } = usePostBySlug(slug || '');

  if (isLoading) {
    return (
      <MainLayout>
        <section className="bg-primary py-12 text-primary-foreground">
          <div className="container">
            <Skeleton className="h-6 w-32 mb-6 bg-primary-foreground/20" />
            <Skeleton className="h-6 w-48 mb-4 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-full max-w-2xl bg-primary-foreground/20" />
          </div>
        </section>
        <section className="py-12">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <Skeleton className="h-64 w-full mb-8 rounded-lg" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (error || !article) {
    return (
      <MainLayout>
        <section className="py-20">
          <div className="container text-center">
            <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="mb-4">Artikel nicht gefunden</h1>
            <p className="mb-8 text-muted-foreground">
              Der gesuchte Artikel existiert nicht oder wurde entfernt.
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Übersicht
              </Link>
            </Button>
          </div>
        </section>
      </MainLayout>
    );
  }

  const categoryLabel = article.category === 'event' ? 'Veranstaltung' : 'Verein';
  const categoryColor = article.category === 'event' 
    ? 'bg-accent text-accent-foreground' 
    : 'bg-primary text-primary-foreground';

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return format(date, 'd. MMMM yyyy', { locale: de });
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="container">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6 text-primary-foreground/80 hover:text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            asChild
          >
            <Link to="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Übersicht
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <span className={`rounded px-3 py-1 text-xs font-bold uppercase ${categoryColor}`}>
                {categoryLabel}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-primary-foreground/80">
              <Calendar className="h-4 w-4" />
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl">{article.title}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {/* Featured Image */}
            <div className="mb-8 flex h-64 items-center justify-center rounded-lg bg-muted md:h-96 overflow-hidden">
              {article.image_url ? (
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Newspaper className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-8 font-medium">
                {article.excerpt}
              </p>
            )}

            {/* Article Content */}
            {article.content && (
              <article 
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}

            {/* Share */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Teilen:</span>
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Alle News anzeigen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
