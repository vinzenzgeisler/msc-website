// Utility for storing/loading structured "row" data (key/value pairs)
// inside the existing pageContents.content text field, while staying
// backwards compatible with plain HTML/Markdown content.

export interface StructuredRow {
  label: string;
  value: string;
}

const MARKER = '<!--rows:v1-->';

export function isStructuredRowsContent(content: string | null | undefined): boolean {
  if (!content) return false;
  return content.trimStart().startsWith(MARKER);
}

export function parseStructuredRows(content: string | null | undefined): StructuredRow[] {
  if (!content) return [];
  const trimmed = content.trimStart();
  if (!trimmed.startsWith(MARKER)) return [];
  try {
    const json = trimmed.slice(MARKER.length).trim();
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row): row is StructuredRow => row && typeof row === 'object')
      .map((row) => ({
        label: String(row.label ?? ''),
        value: String(row.value ?? ''),
      }));
  } catch {
    return [];
  }
}

export function serializeStructuredRows(rows: StructuredRow[]): string {
  const cleaned = rows
    .map((row) => ({ label: (row.label || '').trim(), value: (row.value || '').trim() }))
    .filter((row) => row.label || row.value);
  return `${MARKER}${JSON.stringify(cleaned)}`;
}

export function rowsToHtmlTable(rows: StructuredRow[]): string {
  if (!rows.length) return '';
  const tr = rows
    .map(
      (row) =>
        `<tr><td><strong>${escapeHtml(row.label)}</strong></td><td>${escapeHtml(row.value)}</td></tr>`,
    )
    .join('');
  return `<table>${tr}</table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
