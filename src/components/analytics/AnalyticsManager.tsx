import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '@/contexts/ConsentContext';
import { trackPageView } from '@/lib/analytics';

function appendScript(
  id: string,
  src: string,
  onLoad: () => void,
  attributes: Record<string, string> = {},
) {
  if (typeof document === 'undefined') return;
  const existingScript = document.getElementById(id) as HTMLScriptElement | null;
  if (existingScript) {
    if (existingScript.dataset.loaded === 'true') {
      onLoad();
    } else {
      existingScript.addEventListener('load', onLoad, { once: true });
    }
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  script.addEventListener('load', () => {
    script.dataset.loaded = 'true';
    onLoad();
  }, { once: true });

  Object.entries(attributes).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });

  document.head.appendChild(script);
}

export function AnalyticsManager() {
  const { preferences } = useConsent();
  const location = useLocation();
  const hasTrackedInitialPageView = useRef(false);
  const isConfigured = useRef(false);
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__MSC_ANALYTICS_ENABLED__ = preferences.statistics;
    window.__MSC_GA_READY__ = false;
    if (measurementId) {
      window[`ga-disable-${measurementId}`] = !preferences.statistics;
    }

    if (!preferences.statistics || !measurementId) {
      isConfigured.current = false;
      return;
    }

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };
    }

    appendScript(
      'msc-ga4-script',
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
      () => {
        if (isConfigured.current || !window.gtag) return;

        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
          send_page_view: false,
        });

        window.__MSC_GA_READY__ = true;
        isConfigured.current = true;

        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        trackPageView(currentPath);
        hasTrackedInitialPageView.current = true;
      },
    );
  }, [preferences.statistics, measurementId]);

  useEffect(() => {
    if (!preferences.statistics || !measurementId) return;
    if (typeof window === 'undefined') return;
    if (!window.__MSC_GA_READY__) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      trackPageView(currentPath);
      return;
    }

    trackPageView(currentPath);
  }, [location.hash, location.pathname, location.search, measurementId, preferences.statistics]);

  return null;
}
