const STORAGE_SECRET_SUFFIX = '|prd-creator|secure-storage';

const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null;

const CHUNK_SIZE = 0x8000;

function assertEncoder(enc: TextEncoder | null): asserts enc is TextEncoder {
  if (typeof window === 'undefined' || !enc) {
    throw new Error('Secure storage is only available in the browser context.');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error(
      'Secure storage requires Web Crypto support in this browser.'
    );
  }
}

function assertDecoder(dec: TextDecoder | null): asserts dec is TextDecoder {
  if (typeof window === 'undefined' || !dec) {
    throw new Error('Secure storage is only available in the browser context.');
  }
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error(
      'Secure storage requires Web Crypto support in this browser.'
    );
  }
}

async function deriveKey(): Promise<CryptoKey> {
  assertEncoder(encoder);
  const origin = window.location.origin ?? 'prd-creator';
  const secretSource = `${origin}${STORAGE_SECRET_SUFFIX}`;
  const secretBytes = encoder.encode(secretSource);
  const hash = await window.crypto.subtle.digest('SHA-256', secretBytes);
  return window.crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return window.btoa(binary);
}

function base64ToBuffer(value: string): ArrayBuffer {
  const binary = window.atob(value);
  const length = binary.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function isSecureStorageSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof TextEncoder !== 'undefined' &&
    typeof TextDecoder !== 'undefined' &&
    !!window.crypto?.subtle
  );
}

export async function encryptValue(value: string): Promise<string> {
  if (!value) {
    throw new Error('Nothing to encrypt. Provide a non-empty value.');
  }

  assertEncoder(encoder);
  const key = await deriveKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const activeEncoder = encoder as TextEncoder;
  const encodedValue = activeEncoder.encode(value);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedValue
  );

  const payload = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encryptedBuffer), iv.byteLength);

  return bufferToBase64(payload.buffer);
}

export async function decryptValue(payload: string): Promise<string> {
  if (!payload) {
    throw new Error('Missing encrypted value to decrypt.');
  }

  assertDecoder(decoder);
  const rawBuffer = base64ToBuffer(payload);
  const rawBytes = new Uint8Array(rawBuffer);
  const iv = rawBytes.slice(0, 12);
  const encryptedBytes = rawBytes.slice(12);

  const key = await deriveKey();
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBytes
  );

  const activeDecoder = decoder as TextDecoder;
  return activeDecoder.decode(decryptedBuffer);
}
