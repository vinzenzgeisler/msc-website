export interface AnalyticsEventProps {
  category?: string;
  label?: string;
  value?: number;
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

export function analyticsConfigured() {
  return Boolean(getMeasurementId());
}

export function trackEvent(eventName: string, props: AnalyticsEventProps = {}) {
  if (typeof window === 'undefined') return;
  if (!window.__MSC_ANALYTICS_ENABLED__) return;
  if (!window.__MSC_GA_READY__) return;
  if (typeof window.gtag !== 'function') return;
  const sanitizedProps = sanitizeProps(props);
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
  });
}
