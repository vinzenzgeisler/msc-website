import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://www.msc-oberlausitz.de';
const POCKETBASE_URL = (process.env.VITE_POCKETBASE_URL || process.env.POCKETBASE_URL || 'https://backend.msc-oberlausitz.de').replace(/\/+$/, '');
const SITE_NAME = 'MSC Oberlausitzer Dreiländereck e.V.';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeSlug(value) {
  const slug = String(value || '').trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
}

function fileUrl(collection, recordId, filename) {
  if (!recordId || !filename) return null;
  return `${POCKETBASE_URL}/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(recordId)}/${encodeURIComponent(filename)}`;
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function fetchCollection(collectionName) {
  const items = [];
  let page = 1;

  while (true) {
    const url = new URL(`${POCKETBASE_URL}/api/collections/${collectionName}/records`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('perPage', '200');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`PocketBase ${collectionName} request failed with ${response.status}`);

    const payload = await response.json();
    const pageItems = Array.isArray(payload?.items) ? payload.items : [];
    items.push(...pageItems);
    if (!payload?.totalPages || page >= payload.totalPages || pageItems.length === 0) break;
    page += 1;
  }

  return items;
}

function buildArticleHead(post, settings) {
  const slug = safeSlug(post.slug);
  if (!slug) return null;

  const siteName = String(settings?.siteName || SITE_NAME).trim() || SITE_NAME;
  const siteTitle = String(settings?.metaTitle || siteName).trim() || siteName;
  const articleTitle = String(post.title || '').trim();
  const socialTitle = String(post.seoTitle || articleTitle).trim();
  const description = String(post.seoDescription || post.excerpt || settings?.metaDescription || '').trim();
  const canonicalUrl = `${SITE_URL}/news/${slug}`;
  const imageUrl = fileUrl('posts', post.id, post.ogImage || post.image) || fileUrl('siteSettings', settings?.id, settings?.defaultOgImage);
  const publishedTime = toIsoDate(post.publishedAt || post.created);
  const modifiedTime = toIsoDate(post.updated);
  const fullTitle = articleTitle === siteTitle ? articleTitle : `${articleTitle} | ${siteTitle}`;
  const imageType = imageUrl?.toLowerCase().endsWith('.png') ? 'image/png' : imageUrl ? 'image/jpeg' : null;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleTitle,
    description: description || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: publishedTime || undefined,
    dateModified: modifiedTime || undefined,
    mainEntityOfPage: canonicalUrl,
    author: { '@type': 'Organization', name: siteName },
    publisher: { '@type': 'Organization', name: siteName },
  };

  const tags = [
    `<title>${escapeHtml(fullTitle)}</title>`,
    description && `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    '<meta property="og:locale" content="de_DE" />',
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    '<meta property="og:type" content="article" />',
    `<meta property="og:title" content="${escapeHtml(socialTitle)}" />`,
    description && `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    imageUrl && `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    imageUrl && `<meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />`,
    imageType && `<meta property="og:image:type" content="${imageType}" />`,
    imageUrl && `<meta property="og:image:alt" content="${escapeHtml(articleTitle)}" />`,
    publishedTime && `<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`,
    modifiedTime && `<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />`,
    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}" />`,
    description && `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    imageUrl && `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    imageUrl && `<meta name="twitter:image:alt" content="${escapeHtml(articleTitle)}" />`,
    `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean);

  return { slug, tags: tags.join('\n    ') };
}

function injectHead(html, articleHead) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/i, '')
    .replace('</head>', `    ${articleHead}\n  </head>`);
}

async function generateSocialPages() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.resolve(scriptDir, '..', 'dist');
  const shell = await readFile(path.join(distDir, 'index.html'), 'utf8');
  const [posts, settingsRecords] = await Promise.all([fetchCollection('posts'), fetchCollection('siteSettings')]);
  const settings = settingsRecords[0];
  let generated = 0;

  for (const post of posts) {
    if (post?.published !== true || post?.locale !== 'de') continue;
    const article = buildArticleHead(post, settings);
    if (!article) continue;

    const outputDir = path.join(distDir, 'news', article.slug);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, 'index.html'), injectHead(shell, article.tags), 'utf8');
    generated += 1;
  }

  console.log(`[social-pages] wrote ${generated} news pages with crawler-visible metadata`);
}

generateSocialPages().catch((error) => {
  console.warn('[social-pages] generation skipped (CMS unreachable at build time)');
  console.warn(error instanceof Error ? error.message : error);
});
