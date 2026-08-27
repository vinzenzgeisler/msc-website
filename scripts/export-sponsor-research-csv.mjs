import { readFile, writeFile } from 'node:fs/promises';

const input = JSON.parse(await readFile('docs/sponsor-url-logo-research.json', 'utf8'));

function csv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

const rows = [
  ['sponsor', 'website_url', 'logo_candidate_url', 'website_confidence', 'logo_confidence', 'needs_manual_review', 'note'],
  ...input.map((item) => [
    item.sponsor,
    item.selectedWebsiteUrl,
    item.selectedLogoCandidateUrl,
    item.selectedWebsiteConfidence,
    item.selectedLogoConfidence,
    item.needsManualReview,
    item.note,
  ]),
];

await writeFile('docs/sponsor-url-logo-research.csv', `${rows.map((row) => row.map(csv).join(',')).join('\n')}\n`, 'utf8');
console.log(`Wrote ${input.length} records to docs/sponsor-url-logo-research.csv`);
