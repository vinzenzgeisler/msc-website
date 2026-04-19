import type { CalendarEvent } from '@/integrations/pocketbase/client';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toIcsDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcsText(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function foldLine(line: string): string {
  // RFC 5545: lines max 75 octets, continuation lines start with a space
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join('\r\n');
}

export function buildIcs(events: CalendarEvent[], calendarName = 'MSC Oberlausitzer Dreiländereck'): string {
  const now = toIcsDate(new Date());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MSC Oberlausitzer Dreilaendereck//Calendar//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];

  for (const event of events) {
    const start = toIcsDate(event.start_dt);
    const end = event.end_dt ? toIcsDate(event.end_dt) : toIcsDate(new Date(new Date(event.start_dt).getTime() + 60 * 60 * 1000));
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@msc-oberlausitzer-dreilaendereck`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(foldLine(`SUMMARY:${escapeIcsText(event.title)}`));
    if (event.description) lines.push(foldLine(`DESCRIPTION:${escapeIcsText(event.description)}`));
    if (event.location) lines.push(foldLine(`LOCATION:${escapeIcsText(event.location)}`));
    if (event.registration_url) lines.push(foldLine(`URL:${escapeIcsText(event.registration_url)}`));
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(events: CalendarEvent[], filename = 'msc-kalender.ics'): void {
  const ics = buildIcs(events);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
