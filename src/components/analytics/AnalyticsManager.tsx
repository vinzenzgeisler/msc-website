import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '@/contexts/ConsentContext';
import { trackPageView } from '@/lib/analytics';

function appendScript(id: string, src: string, attributes: Record<string, string> = {}) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.defer = true;

  Object.entries(attributes).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });

  document.head.appendChild(script);
}

export function AnalyticsManager() {
  const { preferences } = useConsent();
  const location = useLocation();
  const hasTrackedInitialPageView = useRef(false);
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__MSC_ANALYTICS_ENABLED__ = preferences.statistics;
    if (measurementId) {
      window[`ga-disable-${measurementId}`] = !preferences.statistics;
    }

    if (!preferences.statistics || !measurementId) {
      return;
    }

    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    if (!window.gtag) {
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    }

    appendScript('msc-ga4-script', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }, [preferences.statistics, measurementId]);

  useEffect(() => {
    if (!preferences.statistics || !measurementId) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      const timer = window.setTimeout(() => trackPageView(currentPath), 150);
      return () => window.clearTimeout(timer);
    }

    trackPageView(currentPath);
  }, [location.hash, location.pathname, location.search, measurementId, preferences.statistics]);

  return null;
}
