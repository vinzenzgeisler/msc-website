import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  const { data: settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    if (!settings) return;

    // Title
    const baseTitle = settings.site_name || 'MSC Oberlausitzer Dreiländereck e.V.';
    const metaTitle = settings.meta_title || baseTitle;
    document.title = title ? `${title} | ${metaTitle}` : metaTitle;

    // Meta Description
    const metaDesc = description || settings.meta_description || settings.description || '';
    if (metaDesc) {
      let metaDescTag = document.querySelector('meta[name="description"]');
      if (!metaDescTag) {
        metaDescTag = document.createElement('meta');
        metaDescTag.setAttribute('name', 'description');
        document.head.appendChild(metaDescTag);
      }
      metaDescTag.setAttribute('content', metaDesc);
    }

    // Meta Keywords
    if (settings.meta_keywords) {
      let metaKeywordsTag = document.querySelector('meta[name="keywords"]');
      if (!metaKeywordsTag) {
        metaKeywordsTag = document.createElement('meta');
        metaKeywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywordsTag);
      }
      metaKeywordsTag.setAttribute('content', settings.meta_keywords);
    }

    // Favicon (Browser Tab Logo)
    if (settings.logo_url) {
      const iconSelectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]', 'link[rel="apple-touch-icon"]'];
      iconSelectors.forEach(selector => {
        let tag = document.querySelector(selector);
        if (tag) {
          tag.setAttribute('href', settings.logo_url!);
        } else if (selector === 'link[rel="icon"]') {
          // Erzeuge ein standard Icon-Tag, falls noch gar keines existiert
          tag = document.createElement('link');
          tag.setAttribute('rel', 'icon');
          tag.setAttribute('href', settings.logo_url!);
          document.head.appendChild(tag);
        }
      });
    }
    
    // Open Graph (Für Social Media Vorschaubilder & Links)
    const ogTags = [
      { property: 'og:title', content: document.title },
      { property: 'og:description', content: metaDesc },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: settings.default_og_image_url || '' }
    ];

    ogTags.forEach(({ property, content }) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); }
      tag.setAttribute('content', content);
    });
  }, [settings, title, description, location.pathname]);

  return null;
}