import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://www.msc-oberlausitz.de';
const SITE_NAME = 'MSC Oberlausitzer Dreiländereck e.V.';
const SOCIAL_LOGO_URL = `${SITE_URL}/MSC-logo-clean-transparent.png`;
const SOCIAL_LOGO_ALT = 'Logo des MSC Oberlausitzer Dreiländereck e.V.';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectHead(shell, tags) {
  return shell
    .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/i, '')
    .replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
}

async function generateNewsletterPage(distDir, shell) {
  const title = `Newsletter | ${SITE_NAME}`;
  const socialTitle = 'MSC Newsletter';
  const description = 'Termine, Neuigkeiten und Vereinsleben des MSC Oberlausitzer Dreiländereck direkt in dein Postfach.';
  const canonicalUrl = `${SITE_URL}/newsletter`;
  const imageUrl = SOCIAL_LOGO_URL;
  const imageAlt = SOCIAL_LOGO_ALT;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    `<link rel="canonical" href="${canonicalUrl}" />`,
    '<meta property="og:locale" content="de_DE" />',
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escapeHtml(socialTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta property="og:image:secure_url" content="${imageUrl}" />`,
    '<meta property="og:image:type" content="image/png" />',
    '<meta property="og:image:width" content="1254" />',
    '<meta property="og:image:height" content="1254" />',
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`,
  ];

  const outputDir = path.join(distDir, 'newsletter');
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'index.html'), injectHead(shell, tags), 'utf8');
}

function setMetaTag(html, attribute, name, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function useClubLogoForSocialPreview(html) {
  const tags = [
    ['property', 'og:image', SOCIAL_LOGO_URL],
    ['property', 'og:image:secure_url', SOCIAL_LOGO_URL],
    ['property', 'og:image:type', 'image/png'],
    ['property', 'og:image:width', '1254'],
    ['property', 'og:image:height', '1254'],
    ['property', 'og:image:alt', SOCIAL_LOGO_ALT],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:image', SOCIAL_LOGO_URL],
    ['name', 'twitter:image:alt', SOCIAL_LOGO_ALT],
  ];

  return tags.reduce((result, [attribute, name, content]) => setMetaTag(result, attribute, name, content), html);
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
  }));
  return nested.flat();
}

async function normalizeSocialPreviewImages(distDir) {
  const htmlFiles = await findHtmlFiles(distDir);
  await Promise.all(htmlFiles.map(async (htmlPath) => {
    const html = await readFile(htmlPath, 'utf8');
    await writeFile(htmlPath, useClubLogoForSocialPreview(html), 'utf8');
  }));
  return htmlFiles.length;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, '..', 'dist');
const shell = await readFile(path.join(distDir, 'index.html'), 'utf8');
await generateNewsletterPage(distDir, shell);
const normalizedPages = await normalizeSocialPreviewImages(distDir);
console.log(`[static-social-pages] wrote /newsletter and applied the club logo to ${normalizedPages} HTML pages`);
