import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://www.msc-oberlausitz.de';
const POCKETBASE_URL = (process.env.VITE_POCKETBASE_URL || process.env.POCKETBASE_URL || 'https://backend.msc-oberlausitz.de').replace(/\/+$/, '');

const staticPaths = [
  '/',
  '/event',
  '/event/accommodation',
  '/calendar',
  '/news',
  '/club/about',
  '/club/board',
  '/club/history',
  '/club/membership',
  '/sections/touring',
  '/sections/motocross',
  '/sections/trial',
  '/partners/sponsors',
  '/partners/clubs',
  '/contact',
  '/imprint',
  '/privacy',
];

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return `/${String(pathname).replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

function toAbsoluteUrl(pathname) {
  return new URL(normalizePath(pathname), SITE_URL).toString();
}

function toLastmod(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

async function fetchCollection(collectionName) {
  const items = [];
  let page = 1;

  while (true) {
    const url = new URL(`${POCKETBASE_URL}/api/collections/${collectionName}/records`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('perPage', '200');
    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`PocketBase ${collectionName} request failed with ${response.status}: ${body}`);
    }

    const payload = await response.json();
    const pageItems = Array.isArray(payload?.items) ? payload.items : [];
    items.push(...pageItems);

    if (!payload?.totalPages || page >= payload.totalPages || pageItems.length === 0) {
      break;
    }

    page += 1;
  }

  return items;
}

function dedupeBySlug(records) {
  const seen = new Set();

  return records.filter((record) => {
    const slug = String(record?.slug || '').trim();
    if (!slug || seen.has(slug)) {
      return false;
    }

    seen.add(slug);
    return true;
  });
}

function buildUrlEntry(pathname, lastmod) {
  return [
    '  <url>',
    `    <loc>${toAbsoluteUrl(pathname)}</loc>`,
    `    <lastmod>${toLastmod(lastmod)}</lastmod>`,
    '  </url>',
  ].join('\n');
}

async function generateSitemap() {
  const urls = staticPaths.map((pathname) => buildUrlEntry(pathname));

  try {
    const [posts, events] = await Promise.all([
      fetchCollection('posts'),
      fetchCollection('calendarEvents'),
    ]);

    const germanPosts = posts.filter((post) => post?.published === true && post?.locale === 'de');
    const germanEvents = events.filter((event) => event?.published === true && event?.locale === 'de');

    for (const post of dedupeBySlug(germanPosts)) {
      urls.push(buildUrlEntry(`/news/${post.slug}`, post.updated || post.updatedAt || post.created));
    }

    for (const event of dedupeBySlug(germanEvents)) {
      const slug = String(event?.slug || '').trim();
      if (!slug || event?.isMainEvent) {
        continue;
      }

      const internalDetailPath = `/calendar/${slug}`;
      if (event?.detailUrl !== internalDetailPath) {
        continue;
      }

      urls.push(buildUrlEntry(internalDetailPath, event.updated || event.updatedAt || event.created));
    }
  } catch (error) {
    console.warn('[sitemap] dynamic URL fetch failed, writing static sitemap only');
    console.warn(error instanceof Error ? error.message : error);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.resolve(__dirname, '..', 'dist');
  await mkdir(distDir, { recursive: true });
  await writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf8');

  console.log(`[sitemap] wrote ${urls.length} URLs to dist/sitemap.xml`);
}

generateSitemap().catch((error) => {
  console.error('[sitemap] generation failed');
  console.error(error);
  process.exitCode = 1;
});
