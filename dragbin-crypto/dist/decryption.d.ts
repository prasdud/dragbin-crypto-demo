/**
 * File decryption using Kyber + AES-GCM
 */
/**
 * Decrypt a Kyber private key using password
 *
 * Process:
 * 1. Derive AES-GCM key from password + salt using Argon2id + HKDF
 * 2. Decrypt the encrypted private key using AES-GCM
 *
 * @param encryptedPrivateKey - Encrypted Kyber private key
 * @param password - Password used to protect the private key
 * @param salt - Salt used for key derivation (16 bytes)
 * @param iv - Initialization vector for AES-GCM (12 bytes)
 * @returns Decrypted Kyber private key (3168 bytes)
 *
 * @example
 * ```typescript
 * // After encrypting a private key with encryptPrivateKey...
 * const privateKey = await decryptPrivateKey(
 *   encryptedPrivateKey,
 *   'mySecurePassword123',
 *   salt,
 *   iv
 * );
 * ```
 */
export declare function decryptPrivateKey(encryptedPrivateKey: Uint8Array, password: string, salt: Uint8Array, iv: Uint8Array): Promise<Uint8Array>;
/**
 * Decrypt an encrypted file
 *
 * Process:
 * 1. Extract and parse metadata (first 10KB)
 * 2. Decrypt Kyber private key using password
 * 3. Decrypt session key using Kyber private key
 * 4. Decrypt file chunks using session key
 * 5. Combine chunks into original file
 *
 * @param encryptedData - Complete encrypted file (metadata + chunks)
 * @param password - Password to decrypt the Kyber private key
 * @param encryptedPrivateKey - Encrypted Kyber private key
 * @param salt - Salt for password key derivation (16 bytes)
 * @param iv - IV for private key decryption (12 bytes)
 * @returns Decrypted file data
 *
 * @example
 * ```typescript
 * // Download encrypted file from storage
 * const encryptedFile = new Uint8Array([...]); // From storage
 *
 * // Decrypt with stored credentials
 * const decryptedFile = await decryptFile(
 *   encryptedFile,
 *   'mySecurePassword123',
 *   encryptedPrivateKey,
 *   salt,
 *   iv
 * );
 *
 * // Save or use decrypted file
 * ```
 */
export declare function decryptFile(encryptedData: Uint8Array, password: string, encryptedPrivateKey: Uint8Array, salt: Uint8Array, iv: Uint8Array): Promise<Uint8Array>;
