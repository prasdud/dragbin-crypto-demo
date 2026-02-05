/**
 * Key derivation functions using Argon2id + HKDF
 */
import type { DerivedKey } from './types.js';
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
export declare function deriveKeyFromPassword(password: string, salt?: Uint8Array): Promise<DerivedKey>;
/**
 * Derive an AES-GCM key for encrypting private keys
 * This is an alias for deriveKeyFromPassword for semantic clarity
 *
 * @param password - User password
 * @param salt - Optional salt (will be generated if not provided)
 * @returns Derived AES-GCM-256 key and salt
 */
export declare function deriveAESKey(password: string, salt?: Uint8Array): Promise<DerivedKey>;
