/**
 * Kyber WASM wrapper for post-quantum encryption.
 */

import kyber from './wasm/kyber.wasm.js';
import type { KyberKeyPair } from './types.js';

// Wait for Kyber module to be ready
let kyberReady: Promise<any> | null = null;

async function ensureKyberReady() {
  if (!kyberReady) {
    kyberReady = kyber.ready;
  }
  return await kyberReady;
}

/**
 * Generate a Kyber1024 key pair for post-quantum encryption
 * @returns Key pair with public key (1568 bytes) and private key (3168 bytes)
 *
 * @example
 * ```typescript
 * const { publicKey, privateKey } = await generateKyberKeyPair();
 * console.log('Public key size:', publicKey.length); // 1568
 * console.log('Private key size:', privateKey.length); // 3168
 * ```
 */
export async function generateKyberKeyPair(): Promise<KyberKeyPair> {
  await ensureKyberReady();
  const { publicKey, privateKey} = await kyber.keyPair();
  return { publicKey, privateKey };
}

/**
 * Perform Kyber key encapsulation (generates shared secret)
 * @param publicKey - Kyber public key (1568 bytes)
 * @returns Ciphertext and shared secret (session key)
 *
 * @example
 * ```typescript
 * const { ciphertext, secret } = await kyberEncapsulate(publicKey);
 * // secret is the session key, ciphertext is what you store for decryption
 * ```
 */
export async function kyberEncapsulate(
  publicKey: Uint8Array,
): Promise<{ ciphertext: Uint8Array; secret: Uint8Array }> {
  if (publicKey.length !== 1568) {
    throw new Error('Invalid Kyber public key size. Expected 1568 bytes.');
  }

  await ensureKyberReady();
  const result = await kyber.encrypt(publicKey); // No data - generates shared secret
  return {
    ciphertext: result.cyphertext, // Note: the API uses "cyphertext"
    secret: result.secret, // This IS the session key
  };
}

/**
 * Legacy function - use kyberEncapsulate instead
 * @deprecated Use kyberEncapsulate for proper KEM usage
 */
export async function encryptWithKyber(
  publicKey: Uint8Array,
  data?: Uint8Array,
): Promise<Uint8Array> {
  if (publicKey.length !== 1568) {
    throw new Error('Invalid Kyber public key size. Expected 1568 bytes.');
  }

  await ensureKyberReady();
  const encryptedData = await kyber.encrypt(publicKey, data);
  return encryptedData.cyphertext;
}

/**
 * Perform Kyber decapsulation (recovers shared secret)
 * @param ciphertext - Ciphertext from encapsulation
 * @param privateKey - Kyber private key (3168 bytes)
 * @returns Shared secret (session key)
 *
 * @example
 * ```typescript
 * const secret = await kyberDecapsulate(ciphertext, privateKey);
 * // secret is the session key
 * ```
 */
export async function kyberDecapsulate(
  ciphertext: Uint8Array,
  privateKey: Uint8Array,
): Promise<Uint8Array> {
  if (privateKey.length !== 3168) {
    throw new Error('Invalid Kyber private key size. Expected 3168 bytes.');
  }

  await ensureKyberReady();
  const secret = await kyber.decrypt(ciphertext, privateKey);
  return secret;
}

/**
 * Legacy function - use kyberDecapsulate instead
 * @deprecated Use kyberDecapsulate for proper KEM usage
 */
export async function decryptWithKyber(
  ciphertext: Uint8Array,
  privateKey: Uint8Array,
): Promise<Uint8Array> {
  return kyberDecapsulate(ciphertext, privateKey);
}
