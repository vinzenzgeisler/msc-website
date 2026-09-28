import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AftermovieButton } from './AftermovieDialog';

describe('AftermovieButton', () => {
  beforeEach(() => window.localStorage.clear());

  it('does not contact YouTube before consent and removes the player when closed', async () => {
    render(
      <LanguageProvider>
        <ConsentProvider>
          <AftermovieButton />
        </ConsentProvider>
      </LanguageProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Aftermovie ansehen/i }));
    expect(screen.queryByTitle(/Aftermovie ·/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Externe Medien erlauben/i }));
    const player = await screen.findByTitle(/Aftermovie ·/i);
    expect(player).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com'));

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByTitle(/Aftermovie ·/i)).not.toBeInTheDocument());
  });
});
