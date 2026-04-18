const MARKER = '<!--event-downloads:v1-->';

export function parseSelectedDownloadIds(content: string | null | undefined): string[] {
  if (!content) return [];

  const trimmed = content.trimStart();
  if (!trimmed.startsWith(MARKER)) return [];

  try {
    const parsed = JSON.parse(trimmed.slice(MARKER.length).trim());
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((value) => String(value || '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function serializeSelectedDownloadIds(ids: string[]): string {
  const cleaned = ids.map((id) => String(id || '').trim()).filter(Boolean);
  return `${MARKER}${JSON.stringify(cleaned)}`;
}

