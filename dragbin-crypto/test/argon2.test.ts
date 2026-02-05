import { describe, it, expect } from 'vitest';
import { deriveKeyFromPassword } from '../src/index.js';
import { generateSalt } from '../src/index.js';

describe('Argon2id Password Hashing', () => {
  it('should derive a key from password and salt', async () => {
    const password = 'testPassword123';
    const salt = generateSalt();

    const { key, salt: returnedSalt } = await deriveKeyFromPassword(password, salt);

    expect(key).toBeInstanceOf(CryptoKey);
    expect(key.type).toBe('secret');
    expect(returnedSalt).toEqual(salt);
  });

  it('should generate salt if not provided', async () => {
    const password = 'testPassword123';

    const { key, salt } = await deriveKeyFromPassword(password);

    expect(key).toBeInstanceOf(CryptoKey);
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
  });

  it('should produce the same key for same password and salt', async () => {
    const password = 'testPassword123';
    const salt = generateSalt();

    const { key: key1 } = await deriveKeyFromPassword(password, salt);
    const { key: key2 } = await deriveKeyFromPassword(password, salt);

    // Export both keys to compare
    const rawKey1 = await crypto.subtle.exportKey('raw', key1);
    const rawKey2 = await crypto.subtle.exportKey('raw', key2);

    expect(new Uint8Array(rawKey1)).toEqual(new Uint8Array(rawKey2));
  });

  it('should produce different keys for different salts', async () => {
    const password = 'testPassword123';
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    const { key: key1 } = await deriveKeyFromPassword(password, salt1);
    const { key: key2 } = await deriveKeyFromPassword(password, salt2);

    const rawKey1 = await crypto.subtle.exportKey('raw', key1);
    const rawKey2 = await crypto.subtle.exportKey('raw', key2);

    expect(new Uint8Array(rawKey1)).not.toEqual(new Uint8Array(rawKey2));
  });

  it('should produce different keys for different passwords', async () => {
    const salt = generateSalt();
    const password1 = 'testPassword123';
    const password2 = 'differentPassword456';

    const { key: key1 } = await deriveKeyFromPassword(password1, salt);
    const { key: key2 } = await deriveKeyFromPassword(password2, salt);

    const rawKey1 = await crypto.subtle.exportKey('raw', key1);
    const rawKey2 = await crypto.subtle.exportKey('raw', key2);

    expect(new Uint8Array(rawKey1)).not.toEqual(new Uint8Array(rawKey2));
  });

  it('should complete in reasonable time', async () => {
    const password = 'testPassword123';
    const salt = generateSalt();

    const startTime = Date.now();
    await deriveKeyFromPassword(password, salt);
    const duration = Date.now() - startTime;

    // Argon2id with 64MB should complete in < 2 seconds
    expect(duration).toBeLessThan(2000);
  }, 10000); // Increase timeout to 10s for this test
});
