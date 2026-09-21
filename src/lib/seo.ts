export const SITE_URL = 'https://www.msc-oberlausitz.de';
export const SOCIAL_LOGO_URL = `${SITE_URL}/MSC-logo-clean-transparent.png`;
export const SOCIAL_LOGO_ALT = 'Logo des MSC Oberlausitzer Dreiländereck e.V.';

export function normalizePath(pathname?: string | null) {
  if (!pathname) return '/';

  const [path] = String(pathname).split(/[?#]/, 1);
  if (!path || path === '/') return '/';

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.replace(/\/+$/, '') || '/';
}

export function toAbsoluteUrl(pathname?: string | null) {
  return new URL(normalizePath(pathname), SITE_URL).toString();
}

export function isInternalUrl(value?: string | null) {
  const candidate = String(value || '').trim();
  return candidate.startsWith('/');
}

export function normalizeCanonicalPath(pathname?: string | null) {
  return normalizePath(pathname);
}
