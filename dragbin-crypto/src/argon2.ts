/**
 * Argon2id WASM wrapper for password hashing.
 */

import { argon2id } from './wasm/argon2.wasm.js';
import { bytesToHex, hexToBytes } from './utils.js';

/**
 * Argon2id parameters matching Dragbin's configuration
 */
export const ARGON2_PARAMS = {
  /** Number of parallel threads */
  parallelism: 4,
  /** Number of iterations (time cost) */
  iterations: 3,
  /** Memory size in KB (64 MB) */
  memorySize: 64 * 1024,
  /** Output hash length in bytes */
  hashLength: 32,
} as const;

/**
 * Hash a password using Argon2id
 * @param password - Password to hash
 * @param salt - Salt for hashing (16 bytes)
 * @returns 32-byte hash
 *
 * @example
 * ```typescript
 * const salt = generateSalt();
 * const hash = await hashPassword('myPassword', salt);
 * ```
 */
export async function hashPassword(
  password: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  if (salt.length !== 16) {
    throw new Error('Salt must be exactly 16 bytes');
  }

  // Convert salt to hex (required by hash-wasm)
  const saltHex = bytesToHex(salt);

  // Hash with Argon2id
  const hashHex = await argon2id({
    password,
    salt: saltHex,
    parallelism: ARGON2_PARAMS.parallelism,
    iterations: ARGON2_PARAMS.iterations,
    memorySize: ARGON2_PARAMS.memorySize,
    hashLength: ARGON2_PARAMS.hashLength,
    outputType: 'hex',
  });

  // Convert back to bytes
  return hexToBytes(hashHex);
}
