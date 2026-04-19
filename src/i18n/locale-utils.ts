import { cs, de, enUS, pl as plLocale, type Locale as DateFnsLocale } from 'date-fns/locale';
import type { Locale } from './translations';

export function getHtmlLang(locale: Locale) {
  if (locale === 'cz') return 'cs';
  return locale;
}

export function getDateFnsLocale(locale: Locale): DateFnsLocale {
  switch (locale) {
    case 'cz':
      return cs;
    case 'en':
      return enUS;
    case 'pl':
      return plLocale;
    case 'de':
    default:
      return de;
  }
}

export function localize<T>(locale: Locale, values: Record<Locale, T>): T {
  return values[locale];
}

export function isEnglishLocale(locale: Locale) {
  return locale === 'en';
}
