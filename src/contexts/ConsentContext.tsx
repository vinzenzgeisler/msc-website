import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface ConsentPreferences {
  necessary: true;
  statistics: boolean;
}

interface StoredConsentPreferences extends ConsentPreferences {
  version: number;
  updatedAt: string;
}

interface ConsentContextValue {
  preferences: ConsentPreferences;
  hasStoredConsent: boolean;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  acceptNecessaryOnly: () => void;
  acceptAll: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

const CONSENT_STORAGE_KEY = 'msc_cookie_consent';
const CONSENT_VERSION = 2;

const defaultPreferences: ConsentPreferences = {
  necessary: true,
  statistics: false,
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

function readStoredConsent(): StoredConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  const rawValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredConsentPreferences> | null;
    if (!parsed || parsed.version !== CONSENT_VERSION) {
      return null;
    }

    return {
      version: CONSENT_VERSION,
      updatedAt: String(parsed.updatedAt || new Date().toISOString()),
      necessary: true,
      statistics: Boolean(parsed.statistics),
    };
  } catch {
    return null;
  }
}

function writeStoredConsent(preferences: ConsentPreferences) {
  if (typeof window === 'undefined') return;

  const payload: StoredConsentPreferences = {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    necessary: true,
    statistics: preferences.statistics,
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);
  const [hasStoredConsent, setHasStoredConsent] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const storedConsent = readStoredConsent();
    if (!storedConsent) return;

    setPreferences({
      necessary: true,
      statistics: storedConsent.statistics,
    });
    setHasStoredConsent(true);
  }, []);

  const savePreferences = useCallback((nextPreferences: ConsentPreferences) => {
    const normalizedPreferences = {
      necessary: true as const,
      statistics: Boolean(nextPreferences.statistics),
    };

    setPreferences(normalizedPreferences);
    setHasStoredConsent(true);
    setIsPreferencesOpen(false);
    writeStoredConsent(normalizedPreferences);
  }, []);

  const acceptNecessaryOnly = useCallback(() => {
    savePreferences({
      necessary: true,
      statistics: false,
    });
  }, [savePreferences]);

  const acceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      statistics: true,
    });
  }, [savePreferences]);

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  const value = useMemo<ConsentContextValue>(() => ({
    preferences,
    hasStoredConsent,
    isBannerVisible: !hasStoredConsent,
    isPreferencesOpen,
    acceptNecessaryOnly,
    acceptAll,
    savePreferences,
    openPreferences,
    closePreferences,
  }), [acceptAll, acceptNecessaryOnly, hasStoredConsent, isPreferencesOpen, preferences, savePreferences, openPreferences, closePreferences]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }

  return context;
}
