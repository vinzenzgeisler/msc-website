import { describe, expect, it } from 'vitest';
import type { CalendarEvent } from '@/integrations/pocketbase/client';
import { selectLocalizedMainEvent } from './useMainEvent';

const base = {
  published: true,
  start_dt: '2026-09-12T06:00:00Z',
  end_dt: '2026-09-13T16:00:00Z',
  slug: '12-oberlausitzer-dreieck',
} as CalendarEvent;

describe('selectLocalizedMainEvent', () => {
  it('uses the localized sibling when its main-event flag is missing', () => {
    const german = { ...base, id: 'de', locale: 'de', title: '12. Oberlausitzer Dreieck', is_main_event: false };
    const english = { ...base, id: 'en', locale: 'en', title: '12th Oberlausitzer Dreieck', is_main_event: true };

    expect(selectLocalizedMainEvent([german, english], 'de')).toMatchObject({ id: 'de', locale: 'de' });
  });

  it('prefers an explicitly flagged record for the active locale', () => {
    const german = { ...base, id: 'de', locale: 'de', title: '12. Oberlausitzer Dreieck', is_main_event: false };
    const english = { ...base, id: 'en', locale: 'en', title: '12th Oberlausitzer Dreieck', is_main_event: true };

    expect(selectLocalizedMainEvent([german, english], 'en')).toMatchObject({ id: 'en', locale: 'en' });
  });
});
