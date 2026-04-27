import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation, useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/i18n/locale-utils';
import { normalizeCanonicalPath, SITE_URL, toAbsoluteUrl } from '@/lib/seo';

type StructuredDataValue = Record<string, unknown> | Array<Record<string, unknown>>;

interface SEOProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  imageUrl?: string | null;
  structuredData?: StructuredDataValue;
}

function normalizeTitle(title: string | undefined, siteTitle: string) {
  const trimmed = String(title || '').trim();
  if (!trimmed || trimmed === siteTitle) {
    return siteTitle;
  }

  return `${trimmed} | ${siteTitle}`;
}

function getDefaultPageTitle(pathname: string, locale: ReturnType<typeof useLanguage>['locale'], t: ReturnType<typeof useTranslation>) {
  if (pathname === '/') {
    return '';
  }

  const pageTitle = localize(locale, {
    de: 'Seite',
    cz: 'Stranka',
    en: 'Page',
    pl: 'Strona',
  });

  const routeTitles: Record<string, string> = {
    '/event': t.nav.event,
    '/event/accommodation': localize(locale, {
      de: 'Übernachtungsmöglichkeiten',
      cz: 'Ubytovani',
      en: 'Accommodation',
      pl: 'Noclegi',
    }),
    '/calendar': t.calendar.title,
    '/news': t.news.title,
    '/contact': t.nav.contact,
    '/club/about': t.nav.about,
    '/club/board': t.nav.board,
    '/club/history': t.nav.history,
    '/club/membership': t.nav.membership,
    '/sections/touring': t.nav.touring,
    '/sections/motocross': t.nav.motocross,
    '/sections/trial': t.nav.trial,
    '/partners/sponsors': t.nav.sponsors,
    '/partners/clubs': t.nav.partnerClubs,
    '/imprint': t.nav.imprint,
    '/privacy': t.nav.privacy,
  };

  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }

  if (pathname.startsWith('/news/')) {
    return t.news.title;
  }

  if (pathname.startsWith('/calendar/')) {
    return t.calendar.title;
  }

  return pageTitle;
}

function getBreadcrumbLabel(pathname: string, locale: ReturnType<typeof useLanguage>['locale'], t: ReturnType<typeof useTranslation>) {
  const labels: Record<string, string> = {
    '/event': t.nav.event,
    '/event/accommodation': localize(locale, {
      de: 'Übernachtungsmöglichkeiten',
      cz: 'Ubytovani',
      en: 'Accommodation',
      pl: 'Noclegi',
    }),
    '/calendar': t.calendar.title,
    '/news': t.news.title,
    '/club': t.nav.club,
    '/club/about': t.nav.about,
    '/club/board': t.nav.board,
    '/club/history': t.nav.history,
    '/club/membership': t.nav.membership,
    '/sections': t.nav.sections,
    '/sections/touring': t.nav.touring,
    '/sections/motocross': t.nav.motocross,
    '/sections/trial': t.nav.trial,
    '/partners': t.nav.partners,
    '/partners/sponsors': t.nav.sponsors,
    '/partners/clubs': t.nav.partnerClubs,
    '/contact': t.nav.contact,
    '/imprint': t.nav.imprint,
    '/privacy': t.nav.privacy,
  };

  return labels[pathname] || null;
}

function buildBreadcrumbStructuredData(pathname: string, title: string, locale: ReturnType<typeof useLanguage>['locale'], t: ReturnType<typeof useTranslation>) {
  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) {
    return null;
  }

  const homeLabel = localize(locale, {
    de: 'Startseite',
    cz: 'Domu',
    en: 'Home',
    pl: 'Strona glowna',
  });

  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeLabel,
      item: SITE_URL,
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const mappedLabel = getBreadcrumbLabel(currentPath, locale, t);
    const isLast = index === segments.length - 1;
    const name = mappedLabel || (isLast ? title : segment);

    itemListElement.push({
      '@type': 'ListItem',
      position: index + 2,
      name,
      item: toAbsoluteUrl(currentPath),
    });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function SEO({
  title,
  description,
  canonicalPath,
  noindex = false,
  ogType = 'website',
  imageUrl,
  structuredData,
}: SEOProps) {
  const { data: settings } = useSettings();
  const { locale } = useLanguage();
  const t = useTranslation();
  const location = useLocation();

  const pathname = normalizeCanonicalPath(canonicalPath || location.pathname);
  const baseTitle = settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.';
  const siteTitle = settings?.meta_title || baseTitle;
  const pageTitle = title || getDefaultPageTitle(pathname, locale, t);
  const fullTitle = normalizeTitle(pageTitle, siteTitle);
  const metaDescription = description || settings?.meta_description || settings?.description || '';
  const canonicalUrl = toAbsoluteUrl(pathname);
  const ogImage = imageUrl || settings?.default_og_image_url || undefined;
  const effectiveNoindex = noindex || (!pathname.startsWith('/admin') && locale !== 'de');
  const robotsContent = effectiveNoindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const structuredDataEntries: Record<string, unknown>[] = [];

  if (!effectiveNoindex && pathname === '/') {
    const sameAs = [settings?.facebook_url, settings?.instagram_url].filter(Boolean);

    structuredDataEntries.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: settings?.site_name || baseTitle,
      url: SITE_URL,
      logo: settings?.logo_url || undefined,
      email: settings?.contact_email || undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    });
  }

  if (!effectiveNoindex) {
    const breadcrumbStructuredData = buildBreadcrumbStructuredData(pathname, pageTitle, locale, t);
    if (breadcrumbStructuredData) {
      structuredDataEntries.push(breadcrumbStructuredData);
    }
  }

  if (structuredData) {
    if (Array.isArray(structuredData)) {
      structuredDataEntries.push(...structuredData);
    } else {
      structuredDataEntries.push(structuredData);
    }
  }

  return (
    <Helmet prioritizeSeoTags>
      <html lang={locale === 'cz' ? 'cs' : locale} />
      <title>{fullTitle}</title>
      {metaDescription ? <meta name="description" content={metaDescription} /> : null}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      <meta
        property="og:locale"
        content={locale === 'de' ? 'de_DE' : locale === 'cz' ? 'cs_CZ' : locale === 'pl' ? 'pl_PL' : 'en_GB'}
      />
      <meta property="og:site_name" content={settings?.site_name || baseTitle} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      {metaDescription ? <meta property="og:description" content={metaDescription} /> : null}
      <meta property="og:url" content={canonicalUrl} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      {metaDescription ? <meta name="twitter:description" content={metaDescription} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {structuredDataEntries.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
}
