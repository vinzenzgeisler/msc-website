import { mkdir, writeFile } from 'node:fs/promises';

const sponsors = [
  'Ansorge Bohrwurm Zittau',
  'Autohaus Havlat Grossschoenau',
  'Autohaus Buechner GmbH Zittau',
  'Autopflege Langer Grossschoenau',
  'Autoservice Engler Schlegel',
  'Baumanns Eisparadies Leuba',
  'Bergquell-Brauerei Loebau',
  'Brennstoffhandel Lange',
  'Brieger Rechtsanwaelte Zittau',
  'City-Fahrschule Krause Zittau',
  'Come back e.V.',
  'DEKRA Automobil GmbH Bautzen',
  'EVG Neugersdorf',
  'Ebermann u. Klippel Oderwitz',
  'Eichler GmbH & Co KG',
  'ELLOs GmbH und Co. KG',
  'Fleischerei Kummer Zittau',
  'Forstwirtschaftliche Dienstleistungen Volkmar Hamann Waltersdorf',
  'Frottana Textil GmbH und Co. KG',
  'FS Frank Fritsche Waltersdorf',
  'FWH Federnfabrik Hesse Neugersdorf',
  'Garten Landschaftsbau Kommunale Dienstleistungen Frank Laufer Saalendorf',
  'Gaestehaus Am Oberlausitzer Dreieck',
  'GEMTEC GmbH Hainewalde',
  'Geruestbau Kiessling',
  'Glaubitz GmbH & Co.KG Zittau',
  'Hahmann Zimmermann Werbetechnik',
  'Herrnhuter Sterne GmbH',
  'HI-Tech Gross GmbH Zittau',
  'Hotel und Ausflugsgaststaette Gondelfahrt Jonsdorf',
  'Hotel Sonnebergbaude Waltersdorf',
  'Haeber Aluminiumbau Hainewalde',
  'Kaffeeroesterei Waltersdorf',
  'Kahle Heizung Sanitär GmbH',
  'Kanzlei Mengel Schwitzky Hitziger Beckert Zittau',
  'Kaelte Klima Oberlausitz GmbH Leutersdorf',
  'Lackiererei Steffen Jahn Zittau',
  'Mobile Haus Krankenpflege Kroeber GmbH Zittau',
  'Motorradhaus Goldhammer Zittau',
  'Oliver Niegisch Oderwitz',
  'Pension Auf der Heide Waltersdorf',
  'Physiotherapie Wittwer Leutersdorf',
  'popken-Folienwerk Inh. Jette Moenkemeier e.K.',
  'Pro-Carline Lahwalde',
  'Reifen Russ Grossschoenau',
  'Reifen Service Hiltscher GmbH',
  'Rumpf und Schuppe Zittau',
  'Ruebezahlbaude Waltersdorf',
  'SIGNMAX Spitzkunnersdorf',
  'Sieber Autoteile Grossschoenau',
  'Sparkasse Oberlausitz-Niederschlesien',
  'Steguweit und Schulz Nutzfahrzeugservice GmbH',
  'Suesswaren Heike Zimmermann Zittau',
  'Tarrach Schreiber Collegen Zittau',
  'TDQ GmbH Zittau',
  'Thieme Montageservice',
  'TREUPART Steuerberatung',
  'Volksbank Loebau-Zittau',
  'Vogt und Lischke Hochbau GmbH Grossschoenau',
  'Webber Brennertechnik GmbH',
  'Werkstaette Berndt Grossschoenau',
  'WWG Grossschoenau',
  'Zimmerei Jens Vogt Saalendorf',
  'Zimmerei Ronny Vogt Jonsdorf',
  'Zweiradtechnik Vyhnalek Grosspostwitz',
];

const blockedHosts = [
  '11880.com',
  'bing.com',
  'branchenbuch',
  'bundesanzeiger',
  'autohausradar',
  'companyhouse',
  'cylex',
  'dastelefonbuch',
  'dasoertliche',
  'de-sachsen',
  'facebook.com',
  'firmenwissen',
  'gelbeseiten',
  'google.',
  'instagram.com',
  'kennstdueinen',
  'kompass.com',
  'kununu.com',
  'linkedin.com',
  'mapcarta.com',
  'marktplatz-mittelstand',
  'meinestadt.de',
  'northdata',
  'opencorporates',
  'provenexpert',
  'saxony-hotels',
  'saxonyhotelsweb',
  'sellwerk',
  'stadtbranchenbuch',
  'tripadvisor',
  'ubernachtung.de',
  'werkenntdenbesten',
  'wikipedia.org',
  'yelp.',
  'youtube.com',
];

const manualOverrides = {
  'Autohaus Havlat Grossschoenau': {
    websiteUrl: 'https://www.autohaus-havlat.de/',
    logoUrl: 'https://assets.volkswagen.com//is/image/cso/logo_40673?Zml0PWNyb3AsMSZmbXQ9anBlZyZxbHQ9Nzkmd2lkPTI5OSZoZWk9Mjk5JmJmYz1vZmYmMWE0Ng==',
    note: 'Vanity-Domain leitet auf die offizielle Volkswagen-Haendlerseite.',
  },
  'Autohaus Buechner GmbH Zittau': {
    websiteUrl: 'https://www.ambestenbuechner.de/',
    logoUrl: 'https://www.ambestenbuechner.de/assets/logo-0e7324c53e7911e7b2692c4b938c46aec4a58b3f447f75a0d7b188850abecf0f.png',
  },
  'Autopflege Langer Grossschoenau': {
    websiteUrl: 'https://www.autopflege-langer.de/',
    logoUrl: 'https://image.jimcdn.com/app/cms/image/transf/dimension=869x10000:format=png/path/sa1ad8760c5d53819/image/ic76644c66a1e8d15/version/1490627254/image.png',
  },
  'Autoservice Engler Schlegel': {
    websiteUrl: 'https://www.autoservice-schlegel.de/',
    logoUrl: null,
    note: 'Die offizielle Website verwendet nur eine Textmarke und kein eigenes Bildlogo.',
  },
  'Baumanns Eisparadies Leuba': {
    websiteUrl: 'https://www.baumanns.de/',
    logoUrl: 'https://www.baumanns.de/fileadmin2023/_processed_/d/5/csm_251022_logo_baumanns_0e8d58fa61.png',
  },
  'Brieger Rechtsanwaelte Zittau': {
    websiteUrl: 'https://www.rechtsanwaelte-brieger.de/',
    logoUrl: null,
    note: 'Offizielle Website gefunden, aber kein klares Logo-Bild im HTML.',
  },
  'DEKRA Automobil GmbH Bautzen': {
    websiteUrl: 'https://www.dekra.de/de/bautzen/',
    logoUrl: null,
    note: 'Offizielle Standortseite; Logo wird inline als SVG/Data-URI gerendert.',
  },
  'EVG Neugersdorf': {
    websiteUrl: 'https://www.evg-holz.de/',
    logoUrl: 'https://www.evg-holz.de/config/1148/logo.png',
  },
  'Eichler GmbH & Co KG': {
    websiteUrl: 'https://www.eichler-sachsen.de/',
    logoUrl: 'https://www.eichler-sachsen.de/wp-content/uploads/2018/05/logo-eichler.png',
  },
  'ELLOs GmbH und Co. KG': {
    websiteUrl: 'http://die-ellos.de/',
    logoUrl: 'http://die-ellos.de/pic/logo.gif',
    note: 'Offizielle lokale Elektroteam-Seite nutzt aktuell kein sauberes HTTPS.',
  },
  'Forstwirtschaftliche Dienstleistungen Volkmar Hamann Waltersdorf': {
    websiteUrl: null,
    logoUrl: null,
    note: 'Keine offizielle Website gefunden; nur Branchenverzeichnisse.',
  },
  'Hahmann Zimmermann Werbetechnik': {
    websiteUrl: 'https://mann2.de/',
    logoUrl: 'https://mann2.de/wp/wp-content/themes/mann2/images/mann2-logo.svg',
    note: 'Hahmann & Zimmermann tritt online als MANN2 auf.',
  },
  'Hotel Sonnebergbaude Waltersdorf': {
    websiteUrl: 'https://sonnebergbaude.de/',
    logoUrl: 'https://sonnebergbaude.de/wp/wp-content/themes/sbb/images/logo-sonnebergbaude.svg',
  },
  'Hotel und Ausflugsgaststaette Gondelfahrt Jonsdorf': {
    websiteUrl: 'https://www.hotel-gondelfahrt.de/de/home-2/',
    logoUrl: 'https://www.hotel-gondelfahrt.de/wp-content/themes/gofa_v1/library/images/logo_home_big@2x.png',
  },
  'GEMTEC GmbH Hainewalde': {
    websiteUrl: 'https://www.gemtec.de/',
    logoUrl: 'https://www.gemtec.de/wp-content/uploads/2017/01/Logo-2.png',
  },
  'Glaubitz GmbH & Co.KG Zittau': {
    websiteUrl: 'https://www.glaubitz-autodienst.de/',
    logoUrl: 'https://www.glaubitz-autodienst.de/api/image/image-cache/mitsubishi_partnerseiten/6118/6118.jpg?width=125&height=60&t=1574264120',
  },
  'Kaffeeroesterei Waltersdorf': {
    websiteUrl: 'https://www.kaffeeroesterei-zittauergebirge.de/',
    logoUrl: 'https://image.jimcdn.com/app/cms/image/transf/dimension=198x10000:format=png/path/sdf59a6e4c38e1197/image/i12ec1314ff2159ca/version/1641727280/image.png',
  },
  'Mobile Haus Krankenpflege Kroeber GmbH Zittau': {
    websiteUrl: 'https://www.haus-krankenpflege.de/',
    logoUrl: 'https://onecdn.io/media/0ff42ca8-19e8-4394-9213-58e220f20108/md2x',
  },
  'Pension Auf der Heide Waltersdorf': {
    websiteUrl: 'https://www.gasthofaufderheide.de/',
    logoUrl: 'https://www.gasthofaufderheide.de/images/logo.jpg',
  },
  'Pro-Carline Lahwalde': {
    websiteUrl: 'https://procarline.de/',
    logoUrl: 'https://procarline.de/wp-content/uploads/procarline-25jahre-logo-weiss-2.png',
  },
  'Reifen Service Hiltscher GmbH': {
    websiteUrl: 'https://www.hiltscher.com/home/reifen/',
    logoUrl: 'https://www.hiltscher.com/wp-content/uploads/2023/11/hiltscher_logo4.jpg',
  },
  'Rumpf und Schuppe Zittau': {
    websiteUrl: 'https://www.rumpf-schuppe.de/',
    logoUrl: 'https://static.wixstatic.com/media/c058cb_e279d0bde68f443dad8df29ced29398d~mv2.png/v1/crop/x_0,y_75,w_1775,h_331/fill/w_820,h_154,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/c058cb_e279d0bde68f443dad8df29ced29398d~mv2.png',
  },
  'Ruebezahlbaude Waltersdorf': {
    websiteUrl: 'https://www.hotel-im-naturpark.de/de/urlaub-ruebezahlbaude/ruebezahlbaude-im-zittauer-gebirge',
    logoUrl: 'https://www.hotel-im-naturpark.de/files/www/responsive/logo.png',
  },
  'SIGNMAX Spitzkunnersdorf': {
    websiteUrl: 'https://www.signmax.de/',
    logoUrl: 'https://www.signmax.de/wp-content/uploads/2024/02/adminlogo_signmax.svg',
  },
  'Sparkasse Oberlausitz-Niederschlesien': {
    websiteUrl: 'https://www.sparkasse-oberlausitz-niederschlesien.de/de/home.html',
    logoUrl: 'https://www.sparkasse-oberlausitz-niederschlesien.de/content/dam/myif/sk-oberlausitz-niederschlesien/work/bilder/nbf-logos/logo_rot.svg',
  },
  'Tarrach Schreiber Collegen Zittau': {
    websiteUrl: 'https://tsc-steuerberater.de/',
    logoUrl: 'https://tsc-steuerberater.de/wp-content/uploads/2026/07/Logo-Tarrach.svg',
  },
  'TDQ GmbH Zittau': {
    websiteUrl: 'https://tqd-werkstoffpruefung.de/',
    logoUrl: null,
    note: 'Suchtreffer deuten auf TQD Technische Qualitaetssicherung Dreilaendereck GmbH; Sponsor-Schreibweise TDQ bitte pruefen.',
  },
  'Volksbank Loebau-Zittau': {
    websiteUrl: 'https://www.vb-loebau-zittau.de/startseite.html',
    logoUrl: 'https://atruvia.scene7.com/is/image/atruvia/vb%2048%2048',
  },
  'Werkstaette Berndt Grossschoenau': {
    websiteUrl: 'https://berndt.gmbh/',
    logoUrl: 'https://berndt.gmbh/wp/wp-content/themes/berndt/images/logo-berndt-gmbh.svg',
  },
  'WWG Grossschoenau': {
    websiteUrl: 'https://www.w-w-g.net/',
    logoUrl: 'https://www.w-w-g.net/wp-content/uploads/go-x/u/5216dce8-ba80-4b24-b4c9-e1b1fb4d22b2/w180,h180,rtfit,bgdde1e5,el1,ex1,fpng/image.png?v=1773938852155',
    note: 'Wohnbau und Waermeversorgung Grossschoenau GmbH.',
  },
  'Zweiradtechnik Vyhnalek Grosspostwitz': {
    websiteUrl: 'https://shop.bz-motorrad.de/',
    logoUrl: 'https://i0.wp.com/shop.bz-motorrad.de/wp-content/uploads/2021/02/Vhy-Logo-yamaharot-1400x256-1.png?fit=1020%2C187&ssl=1',
  },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function stripTags(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number.parseInt(dec, 10)));
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function keywordSet(value) {
  const stop = new Set(['gmbh', 'kg', 'co', 'und', 'ev', 'e', 'k', 'inh', 'zittau', 'grossschoenau', 'loebau', 'loebau', 'bautzen', 'oderwitz', 'waltersdorf', 'jonsdorf', 'leuba', 'schlegel', 'neugersdorf', 'hainewalde', 'saalendorf', 'leutersdorf', 'spitzkunnersdorf', 'grosspostwitz']);
  return normalize(value)
    .split(' ')
    .filter((part) => part.length > 2 && !stop.has(part));
}

function scoreUrl(url, sponsor, title = '', snippet = '') {
  let score = 0;
  const host = new URL(url).hostname.replace(/^www\./, '');
  const haystack = normalize(`${host} ${url} ${title} ${snippet}`);
  const keywords = keywordSet(sponsor);

  for (const word of keywords) {
    if (haystack.includes(word)) score += 12;
    if (normalize(host).includes(word)) score += 18;
  }

  if (blockedHosts.some((blocked) => host.includes(blocked) || url.includes(blocked))) score -= 80;
  if (/\/(impressum|kontakt|datenschutz|standorte?)\/?$/i.test(url)) score -= 4;
  if (/https?:\/\/[^/]+\/?$/i.test(url)) score += 8;
  if (host.endsWith('.de')) score += 6;
  if (url.includes('facebook.com') || url.includes('instagram.com')) score -= 40;

  return score;
}

function absoluteUrl(value, baseUrl) {
  if (!value) return null;
  const decodedValue = decodeHtml(value);
  if (decodedValue.startsWith('data:') || decodedValue.startsWith('blob:')) return null;
  try {
    return new URL(decodedValue, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractMeta(html, baseUrl) {
  const candidates = [];
  const metaRe = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(metaRe)) {
    const key = match[1].toLowerCase();
    const url = absoluteUrl(match[2], baseUrl);
    if (!url) continue;
    if (key.includes('image')) {
      candidates.push({ url, source: key, score: key.includes('og:image') ? 70 : 60 });
    }
  }
  return candidates;
}

function extractLinks(html, baseUrl) {
  const candidates = [];
  const linkRe = /<link[^>]+rel=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(linkRe)) {
    const rel = match[1].toLowerCase();
    const url = absoluteUrl(match[2], baseUrl);
    if (!url) continue;
    if (rel.includes('icon')) {
      candidates.push({ url, source: rel, score: rel.includes('apple') ? 38 : 32 });
    }
  }
  return candidates;
}

function extractImages(html, baseUrl, sponsor) {
  const candidates = [];
  const sponsorWords = keywordSet(sponsor);
  const imgRe = /<img\b[^>]*>/gi;
  for (const tagMatch of html.matchAll(imgRe)) {
    const tag = tagMatch[0];
    const srcMatch = tag.match(/\s(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const url = absoluteUrl(srcMatch[1], baseUrl);
    if (!url) continue;
    const alt = tag.match(/\salt=["']([^"']*)["']/i)?.[1] || '';
    const haystack = normalize(`${url} ${alt}`);
    let score = 20;
    if (haystack.includes('logo')) score += 45;
    if (haystack.includes('brand')) score += 12;
    if (haystack.includes('header')) score += 10;
    for (const word of sponsorWords) {
      if (haystack.includes(word)) score += 7;
    }
    if (haystack.includes('person') || haystack.includes('team') || haystack.includes('gallery')) score -= 12;
    candidates.push({ url, source: `img${alt ? ` alt=${decodeHtml(alt)}` : ''}`, score });
  }
  return candidates;
}

function dedupeCandidates(candidates) {
  const byUrl = new Map();
  for (const candidate of candidates) {
    const existing = byUrl.get(candidate.url);
    if (!existing || candidate.score > existing.score) byUrl.set(candidate.url, candidate);
  }
  return [...byUrl.values()].sort((a, b) => b.score - a.score).slice(0, 5);
}

async function searchSponsor(sponsor) {
  const query = `${sponsor} offizielle Website Logo`;
  const response = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      'user-agent': 'Mozilla/5.0 sponsor-research',
    },
  });
  const html = await response.text();
  const results = [];
  const resultRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(resultRe)) {
    let href = decodeHtml(match[1]);
    try {
      const parsed = new URL(href, 'https://duckduckgo.com');
      const uddg = parsed.searchParams.get('uddg');
      if (uddg) href = uddg;
    } catch {
      continue;
    }
    if (!href.startsWith('http')) continue;
    const title = decodeHtml(stripTags(match[2]));
    const snippet = decodeHtml(stripTags(match[3]));
    try {
      const score = scoreUrl(href, sponsor, title, snippet);
      results.push({ url: href, title, snippet, score });
    } catch {
      continue;
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 8);
}

async function researchLogo(websiteUrl, sponsor) {
  try {
    const response = await fetch(websiteUrl, {
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 sponsor-research' },
      signal: AbortSignal.timeout(12000),
    });
    const finalUrl = response.url;
    const html = await response.text();
    return {
      finalUrl,
      logoCandidates: dedupeCandidates([
        ...extractMeta(html, finalUrl),
        ...extractLinks(html, finalUrl),
        ...extractImages(html, finalUrl, sponsor),
      ]),
      fetchStatus: response.status,
    };
  } catch (error) {
    return {
      finalUrl: websiteUrl,
      logoCandidates: [],
      fetchStatus: null,
      fetchError: error instanceof Error ? error.message : String(error),
    };
  }
}

const output = [];

for (const [index, sponsor] of sponsors.entries()) {
  console.log(`[${index + 1}/${sponsors.length}] ${sponsor}`);
  const searchResults = await searchSponsor(sponsor);
  const best = searchResults[0] || null;
  const override = manualOverrides[sponsor] || null;
  const logoResearch = override?.websiteUrl
    ? await researchLogo(override.websiteUrl, sponsor)
    : best
      ? await researchLogo(best.url, sponsor)
      : null;
  const selectedWebsiteUrl = override
    ? override.websiteUrl
    : logoResearch?.finalUrl || best?.url || null;
  const selectedLogoCandidateUrl = override && 'logoUrl' in override
    ? override.logoUrl
    : logoResearch?.logoCandidates?.[0]?.url || null;
  output.push({
    sponsor,
    selectedWebsiteUrl,
    selectedWebsiteConfidence: override
      ? (override.websiteUrl ? 'manual' : 'none')
      : best
        ? (best.score >= 45 ? 'high' : best.score >= 20 ? 'medium' : 'low')
        : 'none',
    selectedLogoCandidateUrl,
    selectedLogoCandidateSource: override && 'logoUrl' in override
      ? 'manual_override'
      : logoResearch?.logoCandidates?.[0]?.source || null,
    selectedLogoConfidence: override && 'logoUrl' in override && override.logoUrl
      ? 'manual'
      : logoResearch?.logoCandidates?.[0]
        ? (logoResearch.logoCandidates[0].score >= 60 ? 'high' : logoResearch.logoCandidates[0].score >= 35 ? 'medium' : 'low')
        : 'none',
    needsManualReview: override
      ? !override.websiteUrl || !override.logoUrl || Boolean(override.note?.includes('pruefen'))
      : !best || best.score < 45 || !logoResearch?.logoCandidates?.[0],
    note: override?.note || null,
    searchResults,
    logoCandidates: logoResearch?.logoCandidates || [],
    fetchStatus: logoResearch?.fetchStatus || null,
    fetchError: logoResearch?.fetchError || null,
  });
  await sleep(700);
}

await mkdir('docs', { recursive: true });
await writeFile('docs/sponsor-url-logo-research.json', `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Wrote ${output.length} records to docs/sponsor-url-logo-research.json`);
