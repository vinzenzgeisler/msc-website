const DB_NAME = 'msc-event-voter';
const DB_VERSION = 1;
const STORE_NAME = 'keys';
const KEY_ID = 'default';

interface StoredKeyPair {
  id: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

function isBrowserCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined' && typeof window.crypto?.subtle !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readStoredKeyPair(): Promise<StoredKeyPair | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY_ID);
    request.onsuccess = () => resolve((request.result as StoredKeyPair | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function writeStoredKeyPair(pair: StoredKeyPair): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(pair);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * The private key is generated non-extractable so it can never leave the browser;
 * per the WebCrypto spec the public key of an asymmetric pair stays exportable
 * regardless of the `extractable` flag, so it can still be sent to the server.
 */
async function createKeyPair(): Promise<StoredKeyPair> {
  const keyPair = await window.crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  const stored: StoredKeyPair = { id: KEY_ID, publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
  await writeStoredKeyPair(stored);
  return stored;
}

let cachedKeyPairPromise: Promise<StoredKeyPair> | null = null;

async function getOrCreateKeyPair(): Promise<StoredKeyPair> {
  if (!cachedKeyPairPromise) {
    cachedKeyPairPromise = (async () => (await readStoredKeyPair()) ?? createKeyPair())();
  }
  return cachedKeyPairPromise;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return window.btoa(binary);
}

export async function isVoterIdentityAvailable(): Promise<boolean> {
  return isBrowserCryptoAvailable();
}

export async function getVoterPublicKeyBase64(): Promise<string> {
  const pair = await getOrCreateKeyPair();
  const spki = await window.crypto.subtle.exportKey('spki', pair.publicKey);
  return bufferToBase64(spki);
}

export async function signVoterMessage(message: string): Promise<string> {
  const pair = await getOrCreateKeyPair();
  const signature = await window.crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    pair.privateKey,
    new TextEncoder().encode(message)
  );
  return bufferToBase64(signature);
}

export function generateClientSubmissionKey(): string {
  return window.crypto.randomUUID();
}

const HINT_STORAGE_KEY_PREFIX = 'msc_event_hub_vote_hint_dismissed_';
const HINT_VERSION = 1;

export function hasDismissedVoteHint(eventId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(`${HINT_STORAGE_KEY_PREFIX}${eventId}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { version?: number } | null;
    return parsed?.version === HINT_VERSION;
  } catch {
    return false;
  }
}

export function markVoteHintDismissed(eventId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${HINT_STORAGE_KEY_PREFIX}${eventId}`, JSON.stringify({ version: HINT_VERSION }));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}
