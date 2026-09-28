import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkPasskeySupport, checkPlatformAuthenticatorAvailable, platformAuthenticatorLabel } from './passkeySupport';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('checkPasskeySupport', () => {
  it('reports unsupported when PublicKeyCredential is missing', () => {
    vi.stubGlobal('PublicKeyCredential', undefined);
    expect(checkPasskeySupport()).toBe('unsupported');
  });

  it('reports supported when PublicKeyCredential exists', () => {
    vi.stubGlobal('PublicKeyCredential', class {});
    expect(checkPasskeySupport()).toBe('supported');
  });
});

describe('checkPlatformAuthenticatorAvailable', () => {
  it('returns false without PublicKeyCredential', async () => {
    vi.stubGlobal('PublicKeyCredential', undefined);
    await expect(checkPlatformAuthenticatorAvailable()).resolves.toBe(false);
  });

  it('returns the API result when available', async () => {
    vi.stubGlobal('PublicKeyCredential', { isUserVerifyingPlatformAuthenticatorAvailable: async () => true });
    await expect(checkPlatformAuthenticatorAvailable()).resolves.toBe(true);
  });

  it('treats a thrown error as unavailable instead of failing', async () => {
    vi.stubGlobal('PublicKeyCredential', {
      isUserVerifyingPlatformAuthenticatorAvailable: async () => {
        throw new Error('blocked');
      }
    });
    await expect(checkPlatformAuthenticatorAvailable()).resolves.toBe(false);
  });
});

describe('platformAuthenticatorLabel', () => {
  const withUserAgent = (ua: string) => vi.stubGlobal('navigator', { userAgent: ua });

  it('names the platform-specific confirmation without repeating the term "Passkey"', () => {
    withUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
    expect(platformAuthenticatorLabel()).toBe('Face ID oder Touch ID');
    withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    expect(platformAuthenticatorLabel()).toBe('Touch ID');
    withUserAgent('Mozilla/5.0 (Linux; Android 14)');
    expect(platformAuthenticatorLabel()).toBe('Fingerabdruck oder Gesichtserkennung');
    withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    expect(platformAuthenticatorLabel()).toBe('Windows Hello (Fingerabdruck, Gesichtserkennung oder PIN)');
  });

  it('falls back to a generic label for unknown platforms', () => {
    withUserAgent('curl/8.0');
    expect(platformAuthenticatorLabel()).toBe('Fingerabdruck, Gesichtserkennung oder Gerätecode');
  });
});
