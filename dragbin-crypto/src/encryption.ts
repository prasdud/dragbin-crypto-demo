/**
 * File encryption using Kyber + AES-GCM
 */

import { generateKyberKeyPair, kyberEncapsulate } from './kyber.js';
import { deriveKeyFromPassword } from './keyDerivation.js';
import {
  generateSalt,
  generateIV,
  concatUint8Arrays,
  numberToBytes,
  bytesToBase64,
} from './utils.js';
import type { EncryptedFile, EncryptedPrivateKey, KyberKeyPair } from './types.js';

/**
 * Fixed size for metadata header (10 KB)
 */
const METADATA_SIZE = 10 * 1024;

/**
 * Chunk size for file encryption (1 KB)
 * Each chunk is encrypted separately with its own IV
 */
const CHUNK_SIZE = 1024;

/**
 * Generate a random AES-GCM session key
 * @returns 32-byte session key
 * @internal
 */
async function generateSessionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt'],
  );
}

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
export async function encryptFile(
  file: Uint8Array,
  publicKey: Uint8Array,
): Promise<EncryptedFile> {
  // Use Kyber KEM to generate session key and ciphertext
  const { ciphertext: kyberEncryptedSessionKey, secret: rawSessionKey } = await kyberEncapsulate(publicKey);

  // Import the Kyber-generated secret as AES-GCM session key
  const sessionKey = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(rawSessionKey),
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );

  // Create metadata
  const metadata = {
    kyberEncryptedSessionKey: bytesToBase64(kyberEncryptedSessionKey),
    version: '1.0',
  };

  const metadataString = JSON.stringify(metadata);
  const metadataBytes = new TextEncoder().encode(metadataString);

  // Pad metadata to fixed size (10 KB)
  const paddedMetadata = new Uint8Array(METADATA_SIZE);
  paddedMetadata.set(metadataBytes);

  // Encrypt file in chunks
  const encryptedChunks: Uint8Array[] = [];
  let offset = 0;

  while (offset < file.length) {
    // Get chunk
    const chunkEnd = Math.min(offset + CHUNK_SIZE, file.length);
    const chunk = file.subarray(offset, chunkEnd);

    // Generate random IV
    const iv = generateIV();

    // Encrypt chunk
    const encryptedChunk = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as any },
      sessionKey,
      chunk as any,
    );

    // Format: [IV (12 bytes)][Length (4 bytes)][Encrypted data]
    const encryptedChunkBytes = new Uint8Array(encryptedChunk);
    const lengthBytes = numberToBytes(encryptedChunkBytes.length);

    const formattedChunk = concatUint8Arrays(iv, lengthBytes, encryptedChunkBytes);
    encryptedChunks.push(formattedChunk);

    offset = chunkEnd;
  }

  // Combine metadata + encrypted chunks
  const encryptedData = concatUint8Arrays(paddedMetadata, ...encryptedChunks);

  return {
    encryptedData,
    kyberEncryptedSessionKey,
  };
}

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
export async function encryptPrivateKey(
  privateKey: Uint8Array,
  password: string,
): Promise<EncryptedPrivateKey> {
  // Derive key from password
  const { key, salt } = await deriveKeyFromPassword(password);

  // Generate random IV
  const iv = generateIV();

  // Encrypt private key
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    privateKey as any,
  );

  return {
    encryptedPrivateKey: new Uint8Array(encryptedData),
    salt,
    iv,
  };
}

/**
 * Export the generateKeyPair function from kyber module for convenience
 */
export { generateKyberKeyPair as generateKeyPair } from './kyber.js';
