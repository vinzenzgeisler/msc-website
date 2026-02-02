import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale, Translations } from './translations';

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
    if (stored && (stored === 'de' || stored === 'cz' || stored === 'en')) {
      return stored;
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('cs') || browserLang.startsWith('cz')) return 'cz';
    if (browserLang.startsWith('en')) return 'en';
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
    document.documentElement.lang = locale === 'cz' ? 'cs' : locale;
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
