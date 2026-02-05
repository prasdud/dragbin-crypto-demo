/**
 * File encryption using Kyber + AES-GCM
 */
import type { EncryptedFile, EncryptedPrivateKey } from './types.js';
/**
 * Encrypt a file using Kyber public key encryption
 *
 * Process:
 * 1. Generate random AES-GCM session key
 * 2. Encrypt session key with Kyber public key
 * 3. Split file into 1KB chunks
 * 4. Encrypt each chunk with AES-GCM (random IV per chunk)
 * 5. Prepend 10KB metadata header containing encrypted session key
 *
 * @param file - File data to encrypt
 * @param publicKey - Kyber public key (1568 bytes)
 * @returns Encrypted file data and encrypted session key
 *
 * @example
 * ```typescript
 * const { publicKey } = await generateKeyPair();
 * const fileData = new Uint8Array([...]); // Your file
 * const { encryptedData } = await encryptFile(fileData, publicKey);
 *
 * // Now you can upload encryptedData to storage
 * ```
 */
export declare function encryptFile(file: Uint8Array, publicKey: Uint8Array): Promise<EncryptedFile>;
/**
 * Encrypt a Kyber private key with a password
 *
 * Process:
 * 1. Generate random salt
 * 2. Derive AES-GCM key from password using Argon2id + HKDF
 * 3. Generate random IV
 * 4. Encrypt private key with AES-GCM
 *
 * @param privateKey - Kyber private key to encrypt (3168 bytes)
 * @param password - Password to protect the private key
 * @returns Encrypted private key, salt, and IV
 *
 * @example
 * ```typescript
 * const { privateKey } = await generateKeyPair();
 * const password = 'mySecurePassword123';
 * const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
 *
 * // Store encryptedPrivateKey, salt, and iv
 * // Later, use these to decrypt the private key
 * ```
 */
export declare function encryptPrivateKey(privateKey: Uint8Array, password: string): Promise<EncryptedPrivateKey>;
/**
 * Export the generateKeyPair function from kyber module for convenience
 */
export { generateKyberKeyPair as generateKeyPair } from './kyber.js';
