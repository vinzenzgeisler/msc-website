const pocketbaseUrl = process.env.POCKETBASE_URL || 'https://backend.msc-oberlausitz.de';
const identity = process.env.POCKETBASE_IDENTITY;
const password = process.env.POCKETBASE_PASSWORD;

const corrections = [
  {
    name: 'Mobile Haus-Krankenpflege Kröber GmbH Zittau',
    website: 'https://www.haus-krankenpflege.de/',
    logo: 'https://onecdn.io/media/0ff42ca8-19e8-4394-9213-58e220f20108/md2x',
    filename: 'mobile-haus-krankenpflege-kroeber.png',
  },
  {
    name: 'Pro-Carline Lahwalde',
    website: 'https://procarline.de/',
    logo: 'https://procarline.de/wp-content/uploads/procarline-25jahre-logo-weiss-2.png',
    filename: 'pro-carline.png',
  },
  {
    name: 'Autopflege Langer Großschönau',
    website: 'https://www.autopflege-langer.de/',
    logo: 'https://image.jimcdn.com/app/cms/image/transf/dimension=869x10000:format=png/path/sa1ad8760c5d53819/image/ic76644c66a1e8d15/version/1490627254/image.png',
    filename: 'autopflege-langer.png',
  },
  {
    name: 'Autoservice Engler Schlegel',
    website: 'https://www.autoservice-schlegel.de/',
    logo: null,
  },
  {
    name: 'Sparkasse Oberlausitz-Niederschlesien',
    website: 'https://www.sparkasse-oberlausitz-niederschlesien.de/de/home.html',
    logo: 'https://www.sparkasse-oberlausitz-niederschlesien.de/content/dam/myif/sk-oberlausitz-niederschlesien/work/bilder/nbf-logos/logo_rot.svg',
    filename: 'sparkasse-oberlausitz-niederschlesien.svg',
  },
  {
    name: 'Rumpf und Schuppe Zittau',
    website: 'https://www.rumpf-schuppe.de/',
    logo: 'https://static.wixstatic.com/media/c058cb_e279d0bde68f443dad8df29ced29398d~mv2.png/v1/crop/x_0,y_75,w_1775,h_331/fill/w_820,h_154,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/c058cb_e279d0bde68f443dad8df29ced29398d~mv2.png',
    filename: 'rumpf-und-schuppe.png',
  },
  {
    name: 'Hotel und Ausflugsgaststätte Gondelfahrt Jonsdorf',
    website: 'https://www.hotel-gondelfahrt.de/de/home-2/',
    logo: 'https://www.hotel-gondelfahrt.de/wp-content/themes/gofa_v1/library/images/logo_home_big@2x.png',
    filename: 'hotel-gondelfahrt.png',
  },
  {
    name: 'Kaffeerösterei Waltersdorf',
    website: 'https://www.kaffeeroesterei-zittauergebirge.de/',
    logo: 'https://image.jimcdn.com/app/cms/image/transf/dimension=198x10000:format=png/path/sdf59a6e4c38e1197/image/i12ec1314ff2159ca/version/1641727280/image.png',
    filename: 'kaffeeroesterei-zittauer-gebirge.png',
  },
  {
    name: 'Reifen Service Hiltscher GmbH',
    website: 'https://www.hiltscher.com/home/reifen/',
    logo: 'https://www.hiltscher.com/wp-content/uploads/2023/11/hiltscher_logo4.jpg',
    filename: 'reifen-service-hiltscher.jpg',
  },
];

async function authenticate() {
  if (!identity || !password) throw new Error('Missing PocketBase credentials.');

  const body = JSON.stringify({ identity, password });
  for (const collection of ['cms_users', '_superusers']) {
    const response = await fetch(`${pocketbaseUrl}/api/collections/${collection}/auth-with-password`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    if (response.ok) return (await response.json()).token;
  }

  throw new Error('PocketBase authentication failed.');
}

async function checkedFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${response.status} ${await response.text()}`);
  }
  return response;
}

const token = await authenticate();
const listResponse = await checkedFetch(`${pocketbaseUrl}/api/collections/sponsors/records?perPage=200`, {
  headers: { authorization: `Bearer ${token}` },
});
const sponsors = (await listResponse.json()).items;

for (const correction of corrections) {
  const sponsor = sponsors.find((item) => item.name === correction.name);
  if (!sponsor) throw new Error(`Sponsor not found: ${correction.name}`);

  if (!correction.logo) {
    await checkedFetch(`${pocketbaseUrl}/api/collections/sponsors/records/${sponsor.id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ website: correction.website, logo: '' }),
    });
    console.log(`UPDATED ${correction.name} (text fallback)`);
    continue;
  }

  const logoResponse = await checkedFetch(correction.logo, {
    headers: { 'user-agent': 'Mozilla/5.0 sponsor-correction' },
    redirect: 'follow',
  });
  const contentType = (logoResponse.headers.get('content-type') || '').split(';')[0];
  const form = new FormData();
  form.append('website', correction.website);
  form.append('logo', new Blob([await logoResponse.arrayBuffer()], { type: contentType }), correction.filename);

  await checkedFetch(`${pocketbaseUrl}/api/collections/sponsors/records/${sponsor.id}`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  console.log(`UPDATED ${correction.name}`);
}
