import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Share2, Facebook, Twitter, Newspaper } from 'lucide-react';
import { usePostBySlug } from '@/hooks/usePosts';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatDateSafe } from '@/lib/date';
import { RichContent } from '@/components/content/RichContent';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { getDateFnsLocale, localize } from '@/i18n/locale-utils';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: article, isLoading, error } = usePostBySlug(slug || '');
  const { data: settings } = useSettings();
  const canonicalPath = slug ? `/news/${slug}` : '/news';

  if (isLoading) {
    return (
      <MainLayout
        noindex
        title={localize(locale, { de: 'Artikel lädt', cz: 'Clanek se nacita', en: 'Loading article', pl: 'Ladowanie artykulu' })}
      >
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
      <MainLayout
        noindex
        title={localize(locale, { de: 'Artikel nicht gefunden', cz: 'Clanek nebyl nalezen', en: 'Article not found', pl: 'Nie znaleziono artykulu' })}
      >
        <section className="py-20">
          <div className="container text-center">
            <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="mb-4">{localize(locale, { de: 'Artikel nicht gefunden', cz: 'Clanek nebyl nalezen', en: 'Article not found', pl: 'Nie znaleziono artykulu' })}</h1>
            <p className="mb-8 text-muted-foreground">
              {localize(locale, { de: 'Der gesuchte Artikel existiert nicht oder wurde entfernt.', cz: 'Pozadovany clanek neexistuje nebo byl odstranen.', en: 'The requested article does not exist or has been removed.', pl: 'Szukany artykul nie istnieje lub zostal usuniety.' })}
            </p>
            <Button asChild>
              <Link to="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {localize(locale, { de: 'Zurück zur Übersicht', cz: 'Zpet na prehled', en: 'Back to overview', pl: 'Powrot do przegladu' })}
              </Link>
            </Button>
          </div>
        </section>
      </MainLayout>
    );
  }

  const dateLocale = getDateFnsLocale(locale);

  const categoryLabel =
    article.category === 'event' ? 'Veranstaltung'
    : article.category === 'motocross' ? 'Motocross'
    : article.category === 'trial' ? 'Trial'
    : article.category === 'touring' ? 'Motorradtouristik'
    : 'Verein';

  const displayDate = formatDateSafe(article.display_date, 'd. MMMM yyyy', dateLocale, '');

  const publishedLabel =
    localize(locale, {
      de: 'Veröffentlicht am',
      cz: 'Publikovano',
      en: 'Published on',
      pl: 'Opublikowano',
    });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(article.title);

  const facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
  const twitterShareUrl = 'https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle;
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.image_url ? [article.image_url] : settings?.default_og_image_url ? [settings.default_og_image_url] : undefined,
    datePublished: article.published_at || article.display_date || article.created_at,
    dateModified: article.updated_at,
    mainEntityOfPage: `https://www.msc-oberlausitz.de${canonicalPath}`,
    author: {
      '@type': 'Organization',
      name: settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.',
    },
    publisher: {
      '@type': 'Organization',
      name: settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.',
      logo: settings?.logo_url ? {
        '@type': 'ImageObject',
        url: settings.logo_url,
      } : undefined,
    },
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: shareUrl });
      } catch (err) {
        console.error('Fehler beim Teilen:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success(
        localize(locale, {
          de: 'Link kopiert!',
          cz: 'Odkaz byl zkopirovan!',
          en: 'Link copied!',
          pl: 'Link skopiowany!',
        })
      );
    }
  };

  return (
      <MainLayout
        title={article.title}
        description={article.excerpt || undefined}
        canonicalPath={canonicalPath}
        ogType="article"
        imageUrl={article.image_url || settings?.default_og_image_url || undefined}
        structuredData={articleStructuredData}
      >
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
                {localize(locale, { de: 'Zurück zur Übersicht', cz: 'Zpet na prehled', en: 'Back to overview', pl: 'Powrot do przegladu' })}
              </Link>
            </Button>

            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                {article.category && (
                  <span className="inline-flex items-center gap-1.5 bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                    {categoryLabel}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl">{article.title}</h1>
              {displayDate && (
                <p className="mt-4 text-sm text-primary-foreground/70">
                  {publishedLabel} {displayDate}
                </p>
              )}
            </div>
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

              {/* Article Content */}
              {article.content && (
                <RichContent
                  content={article.content}
                  className="prose-lg prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-muted-foreground prose-li:text-muted-foreground"
                />
              )}

              {/* Share */}
              <div className="mt-12 border-t border-border pt-8">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{localize(locale, { de: 'Teilen:', cz: 'Sdilet:', en: 'Share:', pl: 'Udostepnij:' })}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Auf Facebook teilen"
                    onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl, '_blank')}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Auf X (Twitter) teilen"
                    onClick={() => window.open('https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle, '_blank')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare} title={localize(locale, { de: 'Link kopieren / Teilen', cz: 'Kopirovat odkaz / sdilet', en: 'Copy link / share', pl: 'Kopiuj link / udostepnij' })}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Back Button */}
              <div className="mt-8">
                <Button variant="outline" asChild>
                  <Link to="/news">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {localize(locale, { de: 'Alle News anzeigen', cz: 'Zobrazit vsechny novinky', en: 'Show all news', pl: 'Pokaz wszystkie aktualnosci' })}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
  );
}
