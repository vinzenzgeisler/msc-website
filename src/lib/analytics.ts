export interface AnalyticsEventProps {
  category?: string;
  label?: string;
  value?: number;
  language?: string;
  page_type?: string;
  event_slug?: string;
  cta_position?: string;
  sponsor_tier?: string;
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __MSC_ANALYTICS_ENABLED__?: boolean;
    __MSC_GA_READY__?: boolean;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function getMeasurementId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || '';
}

function sanitizeProps(props: AnalyticsEventProps) {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
}

function inferPageType(pathname: string) {
  if (pathname === '/') return 'home';
  if (pathname === '/event') return 'event';
  if (pathname === '/event/accommodation') return 'event_accommodation';
  if (pathname === '/calendar') return 'calendar';
  if (pathname.startsWith('/calendar/')) return 'calendar_detail';
  if (pathname === '/news') return 'news';
  if (pathname.startsWith('/news/')) return 'news_detail';
  if (pathname === '/club/membership') return 'membership';
  if (pathname.startsWith('/club/')) return 'club';
  if (pathname === '/partners/sponsors') return 'sponsors';
  if (pathname.startsWith('/partners/')) return 'partners';
  if (pathname === '/contact') return 'contact';
  return pathname.replace(/^\/+/, '').replace(/[\/-]+/g, '_') || 'unknown';
}

function inferEventSlug(pathname: string) {
  if (!pathname.startsWith('/calendar/')) return undefined;
  const slug = pathname.split('/')[2];
  return slug || undefined;
}

function getBaseContext(pathname?: string): AnalyticsEventProps {
  if (typeof window === 'undefined') return {};

  const resolvedPathname = pathname || window.location.pathname;
  return {
    language: document.documentElement.lang || undefined,
    page_type: inferPageType(resolvedPathname),
    event_slug: inferEventSlug(resolvedPathname),
  };
}

export function analyticsConfigured() {
  return Boolean(getMeasurementId());
}

export function trackEvent(eventName: string, props: AnalyticsEventProps = {}) {
  if (typeof window === 'undefined') return;
  if (!window.__MSC_ANALYTICS_ENABLED__) return;
  if (!window.__MSC_GA_READY__) return;
  if (typeof window.gtag !== 'function') return;
  const sanitizedProps = sanitizeProps({
    ...getBaseContext(),
    ...props,
  });
  window.gtag('event', eventName, sanitizedProps);
}

export function trackPageView(pathname?: string) {
  if (typeof window === 'undefined') return;
  if (!window.__MSC_ANALYTICS_ENABLED__) return;
  if (!window.__MSC_GA_READY__) return;
  if (typeof window.gtag !== 'function') return;
  const absoluteUrl = pathname
    ? new URL(pathname, window.location.origin).toString()
    : window.location.href;
  window.gtag('event', 'page_view', {
    page_path: pathname || window.location.pathname,
    page_location: absoluteUrl,
    page_title: document.title,
    ...getBaseContext(pathname),
  });
}
