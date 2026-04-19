import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale, Translations } from './translations';
import { getHtmlLang } from './locale-utils';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'msc-language';

function getInitialLocale(): Locale {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'de' || stored === 'cz' || stored === 'en' || stored === 'pl')) {
      return stored;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('cs') || browserLang.startsWith('cz')) return 'cz';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('pl')) return 'pl';
  }
  
  return 'de'; // Default to German
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  useEffect(() => {
    // Update HTML lang attribute
    document.documentElement.lang = getHtmlLang(locale);
  }, [locale]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
