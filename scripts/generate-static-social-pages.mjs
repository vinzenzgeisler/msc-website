import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://www.msc-oberlausitz.de';
const SITE_NAME = 'MSC Oberlausitzer Dreiländereck e.V.';

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
  const imageUrl = `${SITE_URL}/social/newsletter.png`;
  const imageAlt = 'Newsletter des MSC Oberlausitzer Dreiländereck e.V.';
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
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
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

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, '..', 'dist');
const shell = await readFile(path.join(distDir, 'index.html'), 'utf8');
await generateNewsletterPage(distDir, shell);
console.log('[static-social-pages] wrote /newsletter with crawler-visible metadata');
