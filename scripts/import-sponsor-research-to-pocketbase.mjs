import { readFile } from 'node:fs/promises';
import path from 'node:path';

const pocketbaseUrl = process.env.POCKETBASE_URL || process.env.VITE_POCKETBASE_URL || 'https://backend.msc-oberlausitz.de';
const identity = process.env.POCKETBASE_IDENTITY || process.env.CMS_EMAIL || process.env.PB_EMAIL;
const password = process.env.POCKETBASE_PASSWORD || process.env.CMS_PASSWORD || process.env.PB_PASSWORD;

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const includeReview = args.has('--include-review');
const includeLowConfidenceLogos = args.has('--include-low-confidence-logos');
const updateExisting = !args.has('--no-update-existing');
const importFile = process.env.SPONSOR_RESEARCH_FILE || 'docs/sponsor-url-logo-research.json';

const displayNames = {
  'Ansorge Bohrwurm Zittau': 'Ansorge Bohrwurm Zittau',
  'Autohaus Havlat Grossschoenau': 'Autohaus Havlat Großschönau',
  'Autohaus Buechner GmbH Zittau': 'Autohaus Büchner GmbH Zittau',
  'Autopflege Langer Grossschoenau': 'Autopflege Langer Großschönau',
  'Autoservice Engler Schlegel': 'Autoservice Engler Schlegel',
  'Baumanns Eisparadies Leuba': 'Baumanns Eisparadies Leuba',
  'Bergquell-Brauerei Loebau': 'Bergquell-Brauerei Löbau',
  'Brennstoffhandel Lange': 'Brennstoffhandel Lange',
  'Brieger Rechtsanwaelte Zittau': 'Brieger Rechtsanwälte Zittau',
  'City-Fahrschule Krause Zittau': 'City-Fahrschule Krause Zittau',
  'Come back e.V.': 'Come back e.V.',
  'DEKRA Automobil GmbH Bautzen': 'DEKRA Automobil GmbH Bautzen',
  'EVG Neugersdorf': 'EVG Neugersdorf',
  'Ebermann u. Klippel Oderwitz': 'Ebermann u. Klippel Oderwitz',
  'Eichler GmbH & Co KG': 'Eichler GmbH & Co KG',
  'ELLOs GmbH und Co. KG': 'ELLOs GmbH und Co. KG',
  'Fleischerei Kummer Zittau': 'Fleischerei Kummer Zittau',
  'Forstwirtschaftliche Dienstleistungen Volkmar Hamann Waltersdorf': 'Forstwirtschaftliche Dienstleistungen Volkmar Hamann Waltersdorf',
  'Frottana Textil GmbH und Co. KG': 'Frottana Textil GmbH und Co. KG',
  'FS Frank Fritsche Waltersdorf': 'FS Frank Fritsche Waltersdorf',
  'FWH Federnfabrik Hesse Neugersdorf': 'FWH Federnfabrik Hesse Neugersdorf',
  'Garten Landschaftsbau Kommunale Dienstleistungen Frank Laufer Saalendorf': 'Garten & Landschaftsbau, Kommunale Dienstleistungen Frank Laufer Saalendorf',
  'Gaestehaus Am Oberlausitzer Dreieck': 'Gästehaus "Am Oberlausitzer Dreieck"',
  'GEMTEC GmbH Hainewalde': 'GEMTEC GmbH Hainewalde',
  'Geruestbau Kiessling': 'Gerüstbau Kießling',
  'Glaubitz GmbH & Co.KG Zittau': 'Glaubitz GmbH & Co.KG Zittau',
  'Hahmann Zimmermann Werbetechnik': 'Hahmann+Zimmermann Werbetechnik',
  'Herrnhuter Sterne GmbH': 'Herrnhuter Sterne GmbH',
  'HI-Tech Gross GmbH Zittau': 'HI-Tech Groß GmbH Zittau',
  'Hotel und Ausflugsgaststaette Gondelfahrt Jonsdorf': 'Hotel und Ausflugsgaststätte Gondelfahrt Jonsdorf',
  'Hotel Sonnebergbaude Waltersdorf': 'Hotel Sonnebergbaude Waltersdorf',
  'Haeber Aluminiumbau Hainewalde': 'Häber Aluminiumbau Hainewalde',
  'Kaffeeroesterei Waltersdorf': 'Kaffeerösterei Waltersdorf',
  'Kahle Heizung Sanitär GmbH': 'Kahle Heizung-Sanitär GmbH',
  'Kanzlei Mengel Schwitzky Hitziger Beckert Zittau': 'Kanzlei Mengel-Schwitzky-Hitziger-Beckert Zittau',
  'Kaelte Klima Oberlausitz GmbH Leutersdorf': 'Kälte-Klima-Oberlausitz GmbH Leutersdorf',
  'Lackiererei Steffen Jahn Zittau': 'Lackiererei Steffen Jahn Zittau',
  'Mobile Haus Krankenpflege Kroeber GmbH Zittau': 'Mobile Haus-Krankenpflege Kröber GmbH Zittau',
  'Motorradhaus Goldhammer Zittau': 'Motorradhaus Goldhammer Zittau',
  'Oliver Niegisch Oderwitz': 'Oliver Niegisch Oderwitz',
  'Pension Auf der Heide Waltersdorf': 'Pension "Auf der Heide" Waltersdorf',
  'Physiotherapie Wittwer Leutersdorf': 'Physiotherapie Wittwer Leutersdorf',
  'popken-Folienwerk Inh. Jette Moenkemeier e.K.': 'popken-Folienwerk Inh. Jette Mönkemeier e.K.',
  'Pro-Carline Lahwalde': 'Pro-Carline Lahwalde',
  'Reifen Russ Grossschoenau': 'Reifen Russ Großschönau',
  'Reifen Service Hiltscher GmbH': 'Reifen Service Hiltscher GmbH',
  'Rumpf und Schuppe Zittau': 'Rumpf und Schuppe Zittau',
  'Ruebezahlbaude Waltersdorf': 'Rübezahlbaude Waltersdorf',
  'SIGNMAX Spitzkunnersdorf': 'SIGNMAX Spitzkunnersdorf',
  'Sieber Autoteile Grossschoenau': 'Sieber Autoteile Großschönau',
  'Sparkasse Oberlausitz-Niederschlesien': 'Sparkasse Oberlausitz-Niederschlesien',
  'Steguweit und Schulz Nutzfahrzeugservice GmbH': 'Steguweit und Schulz Nutzfahrzeugservice GmbH',
  'Suesswaren Heike Zimmermann Zittau': 'Süßwaren Heike Zimmermann Zittau',
  'Tarrach Schreiber Collegen Zittau': 'Tarrach.Schreiber Collegen Zittau',
  'TDQ GmbH Zittau': 'TDQ GmbH Zittau',
  'Thieme Montageservice': 'Thieme Montageservice',
  'TREUPART Steuerberatung': 'TREUPART Steuerberatung',
  'Volksbank Loebau-Zittau': 'Volksbank Löbau-Zittau',
  'Vogt und Lischke Hochbau GmbH Grossschoenau': 'Vogt und Lischke Hochbau GmbH Großschönau',
  'Webber Brennertechnik GmbH': 'Webber Brennertechnik GmbH',
  'Werkstaette Berndt Grossschoenau': 'Werkstätte Berndt Großschönau',
  'WWG Grossschoenau': 'WWG Großschönau',
  'Zimmerei Jens Vogt Saalendorf': 'Zimmerei Jens Vogt Saalendorf',
  'Zimmerei Ronny Vogt Jonsdorf': 'Zimmerei Ronny Vogt Jonsdorf',
  'Zweiradtechnik Vyhnalek Grosspostwitz': 'Zweiradtechnik Vyhnalek Großpostwitz',
};

const existingAliases = {
  'Autohaus Havlat Grossschoenau': 'Autohaus Havlat',
  'Bergquell-Brauerei Loebau': 'Bergquell-Brauerei Löbau',
  'DEKRA Automobil GmbH Bautzen': 'Dekra',
  'Ebermann u. Klippel Oderwitz': 'Ebermann & Klippel',
  'Fleischerei Kummer Zittau': 'Fleischerei Kummer',
  'Lackiererei Steffen Jahn Zittau': 'Lack & Karosserie Steffen Jahn',
};

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function canUploadLogo(item) {
  if (!item.selectedLogoCandidateUrl) return false;
  if (includeLowConfidenceLogos) return true;
  return ['high', 'manual', 'medium'].includes(item.selectedLogoConfidence);
}

function filenameForUrl(url, fallbackName, contentType) {
  const extByType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };
  let ext = extByType[String(contentType || '').split(';')[0].toLowerCase()];

  if (!ext) {
    try {
      const urlExt = path.extname(new URL(url).pathname).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(urlExt)) ext = urlExt;
    } catch {
      // Fall back below.
    }
  }

  const slug = normalize(fallbackName).replace(/\s+/g, '-').slice(0, 80) || 'sponsor-logo';
  return `${slug}${ext || '.jpg'}`;
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${pocketbaseUrl}${endpoint}`, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method || 'GET'} ${endpoint} failed with ${response.status}: ${body}`);
  }
  return response;
}

async function auth() {
  if (!identity || !password) {
    throw new Error('Missing auth. Set POCKETBASE_IDENTITY and POCKETBASE_PASSWORD, or CMS_EMAIL/CMS_PASSWORD.');
  }

  const body = JSON.stringify({ identity, password });
  const authCollections = ['cms_users', '_superusers'];

  for (const collection of authCollections) {
    const response = await fetch(`${pocketbaseUrl}/api/collections/${collection}/auth-with-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }

    if (response.status !== 400 || collection === authCollections.at(-1)) {
      const errorBody = await response.text();
      throw new Error(`Authentication failed with ${response.status}: ${errorBody}`);
    }
  }

  throw new Error('Authentication failed.');
}

async function listSponsors(token) {
  const items = [];
  let page = 1;

  while (true) {
    const response = await request(`/api/collections/sponsors/records?page=${page}&perPage=200`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    items.push(...data.items);
    if (page >= data.totalPages || data.items.length === 0) break;
    page += 1;
  }

  return items;
}

async function appendLogo(form, logoUrl, sponsorName) {
  const response = await fetch(logoUrl, {
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 sponsor-import' },
  });

  if (!response.ok) {
    throw new Error(`Logo fetch failed with ${response.status}: ${logoUrl}`);
  }

  const contentType = (response.headers.get('content-type') || 'application/octet-stream')
    .split(';')[0]
    .trim()
    .toLowerCase();
  const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
  if (!allowedContentTypes.has(contentType)) {
    throw new Error(`unsupported content type ${contentType}`);
  }

  const buffer = await response.arrayBuffer();
  const file = new Blob([buffer], { type: contentType });
  form.append('logo', file, filenameForUrl(response.url, sponsorName, contentType));
}

async function tryAppendLogo(form, logoUrl, sponsorName) {
  try {
    await appendLogo(form, logoUrl, sponsorName);
    return true;
  } catch (error) {
    console.warn(`WARN logo skipped for ${sponsorName}: ${error.message}`);
    return false;
  }
}

function appendFields(form, item, tier) {
  form.append('name', displayNames[item.sponsor] || item.sponsor);
  form.append('website', item.selectedWebsiteUrl || '');
  form.append('tier', tier);
  form.append('active', 'true');
  form.append('sortOrder', String(item.sortOrder));
}

async function createSponsor(token, item) {
  const form = new FormData();
  appendFields(form, item, 'supporter');
  if (canUploadLogo(item)) {
    await tryAppendLogo(form, item.selectedLogoCandidateUrl, displayNames[item.sponsor] || item.sponsor);
  }

  const response = await request('/api/collections/sponsors/records', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  return response.json();
}

async function updateSponsor(token, existing, item) {
  const form = new FormData();
  let changed = false;

  if (!existing.website && item.selectedWebsiteUrl) {
    form.append('website', item.selectedWebsiteUrl);
    changed = true;
  }

  if (!existing.logo && canUploadLogo(item)) {
    changed = await tryAppendLogo(form, item.selectedLogoCandidateUrl, existing.name) || changed;
  }

  if (!changed) return null;

  const response = await request(`/api/collections/sponsors/records/${existing.id}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  return response.json();
}

const research = JSON.parse(await readFile(importFile, 'utf8'));
const prepared = research.map((item, index) => ({ ...item, sortOrder: 1000 + index }));

if (!apply) {
  console.log('Dry run only. Add --apply after checking this plan.');
}

const token = apply ? await auth() : null;
const existing = apply
  ? await listSponsors(token)
  : await request('/api/collections/sponsors/records?perPage=200').then((response) => response.json()).then((data) => data.items || []);
const existingByName = new Map(existing.map((item) => [normalize(item.name), item]));

const summary = {
  create: 0,
  updateExisting: 0,
  skipExisting: 0,
  skipManualReview: 0,
  skipNoWebsite: 0,
  errors: 0,
};

for (const item of prepared) {
  const displayName = displayNames[item.sponsor] || item.sponsor;
  const aliasName = existingAliases[item.sponsor] || displayName;
  const matchedExisting = existingByName.get(normalize(aliasName)) || existingByName.get(normalize(displayName));

  if (matchedExisting) {
    if (!updateExisting) {
      summary.skipExisting += 1;
      console.log(`SKIP existing ${matchedExisting.name}`);
      continue;
    }

    if (!apply) {
      summary.updateExisting += 1;
      console.log(`WOULD UPDATE existing ${matchedExisting.name}`);
      continue;
    }

    try {
      const result = await updateSponsor(token, matchedExisting, item);
      if (result) {
        summary.updateExisting += 1;
        console.log(`UPDATED existing ${matchedExisting.name}`);
      } else {
        summary.skipExisting += 1;
        console.log(`SKIP existing complete ${matchedExisting.name}`);
      }
    } catch (error) {
      summary.errors += 1;
      console.error(`ERROR updating ${matchedExisting.name}: ${error.message}`);
    }
    continue;
  }

  if (item.needsManualReview && !includeReview) {
    summary.skipManualReview += 1;
    console.log(`SKIP review ${displayName}`);
    continue;
  }

  if (!item.selectedWebsiteUrl && !item.selectedLogoCandidateUrl) {
    summary.skipNoWebsite += 1;
    console.log(`SKIP no asset ${displayName}`);
    continue;
  }

  if (!apply) {
    summary.create += 1;
    console.log(`WOULD CREATE ${displayName} | ${item.selectedWebsiteUrl || ''} | ${canUploadLogo(item) ? 'logo' : 'no-logo'}`);
    continue;
  }

  try {
    const result = await createSponsor(token, item);
    existingByName.set(normalize(result.name), result);
    summary.create += 1;
    console.log(`CREATED ${result.name}`);
  } catch (error) {
    summary.errors += 1;
    console.error(`ERROR creating ${displayName}: ${error.message}`);
  }
}

console.log(JSON.stringify(summary, null, 2));
if (summary.errors > 0) process.exitCode = 1;
