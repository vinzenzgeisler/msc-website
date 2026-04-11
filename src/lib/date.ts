import { format } from 'date-fns';
import type { Locale } from 'date-fns';

export function toValidDate(value?: string | number | Date | null): Date | null {
  if (value === null || value === undefined || value === '') return null;

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getSafeTimestamp(value?: string | number | Date | null, fallback = 0) {
  return toValidDate(value)?.getTime() ?? fallback;
}

export function formatDateSafe(
  value: string | number | Date | null | undefined,
  pattern: string,
  locale?: Locale,
  fallback = 'Unbekannt',
) {
  const parsed = toValidDate(value);
  if (!parsed) return fallback;

  return format(parsed, pattern, locale ? { locale } : undefined);
}
