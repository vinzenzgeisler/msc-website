import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConsentProvider, useConsent } from './ConsentContext';

function ConsentHarness() {
  const { preferences, hasStoredConsent, acceptAll } = useConsent();
  return (
    <>
      <output data-testid="consent">{JSON.stringify({ preferences, hasStoredConsent })}</output>
      <button type="button" onClick={acceptAll}>accept all</button>
    </>
  );
}

describe('ConsentProvider', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps YouTube disabled until external media is accepted', async () => {
    render(<ConsentProvider><ConsentHarness /></ConsentProvider>);
    expect(screen.getByTestId('consent')).toHaveTextContent('"externalMedia":false');

    fireEvent.click(screen.getByRole('button', { name: 'accept all' }));
    await waitFor(() => {
      expect(screen.getByTestId('consent')).toHaveTextContent('"externalMedia":true');
      expect(screen.getByTestId('consent')).toHaveTextContent('"hasStoredConsent":true');
    });
  });

  it('asks again when only the previous consent version is stored', async () => {
    window.localStorage.setItem('msc_cookie_consent', JSON.stringify({
      version: 2,
      updatedAt: new Date().toISOString(),
      necessary: true,
      statistics: true,
    }));

    render(<ConsentProvider><ConsentHarness /></ConsentProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('consent')).toHaveTextContent('"hasStoredConsent":false');
      expect(screen.getByTestId('consent')).toHaveTextContent('"statistics":false');
    });
  });
});
