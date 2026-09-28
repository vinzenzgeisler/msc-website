const LOCALE_TAGS: Record<string, string> = { de: 'de-DE', cz: 'cs-CZ', en: 'en-GB', pl: 'pl-PL' };

/**
 * Preisanzeige in Euro. Nur zur Darstellung: Betraege im Manifest oder im Browser sind nie autoritativ, den
 * Preis bestimmt bei jeder Quote der Server. Bewusst ohne Steuerhinweis (Steuermodell noch nicht entschieden).
 */
export const formatEuroCents = (cents: number, locale: string): string =>
  new Intl.NumberFormat(LOCALE_TAGS[locale] ?? 'de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

/** Erlaubte Preisstufen in Cent (Marketplace-Plan: 5, 10, 15 oder 20 Euro). */
export const PRICE_TIERS_CENTS = [500, 1000, 1500, 2000] as const;
