/**
 * Key derivation functions using Argon2id + HKDF
 */

import { hashPassword } from './argon2.js';
import { generateSalt } from './utils.js';
import type { DerivedKey } from './types.js';

/**
 * Info strings for HKDF (must match Dragbin frontend)
 */
const HKDF_INFO = {
  /** For encrypting Kyber private keys */
  AES_KEY: 'dragbin-argon2-aes',
} as const;

/**
 * Derive HKDF key material from password using Argon2id
 * @param password - User password
 * @param salt - Salt for Argon2id (16 bytes)
 * @returns CryptoKey suitable for HKDF derivation
 *
 * @internal
 */
async function deriveKeyMaterial(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  // Hash password with Argon2id
  const hashBytes = await hashPassword(password, salt);

  // Import as HKDF key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    hashBytes as any,
    'HKDF',
    false,
    ['deriveKey'],
  );

  return keyMaterial;
}

/**
 * Derive an AES-GCM key from password and salt
 * Uses Argon2id for password hashing and HKDF for key derivation
 *
 * @param password - User password
 * @param salt - Optional salt (will be generated if not provided)
 * @returns Derived AES-GCM-256 key and salt
 *
 * @example
 * ```typescript
 * // Generate new key (for encryption)
 * const { key, salt } = await deriveKeyFromPassword('myPassword');
 *
 * // Use existing salt (for decryption)
 * const { key } = await deriveKeyFromPassword('myPassword', existingSalt);
 * ```
 */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array,
): Promise<DerivedKey> {
  // Generate salt if not provided
  const actualSalt = salt || generateSalt();

  if (actualSalt.length !== 16) {
    throw new Error('Salt must be exactly 16 bytes');
  }

  // Get HKDF key material from Argon2id
  const keyMaterial = await deriveKeyMaterial(password, actualSalt);

  // Derive AES-GCM key using HKDF
  const encoder = new TextEncoder();
  const key = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      salt: new Uint8Array(0), // Empty salt (Argon2id already provides salt mixing)
      info: encoder.encode(HKDF_INFO.AES_KEY),
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt'],
  );

  return { key, salt: actualSalt };
}

/**
 * Derive an AES-GCM key for encrypting private keys
 * This is an alias for deriveKeyFromPassword for semantic clarity
 *
 * @param password - User password
 * @param salt - Optional salt (will be generated if not provided)
 * @returns Derived AES-GCM-256 key and salt
 */
export async function deriveAESKey(
  password: string,
  salt?: Uint8Array,
): Promise<DerivedKey> {
  return deriveKeyFromPassword(password, salt);
}
