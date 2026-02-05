/**
 * File decryption using Kyber + AES-GCM
 */

import { decryptWithKyber } from './kyber.js';
import { deriveKeyFromPassword } from './keyDerivation.js';
import { base64ToBytes, bytesToNumber } from './utils.js';

/**
 * Fixed size for metadata header (10 KB)
 */
const METADATA_SIZE = 10 * 1024;

/**
 * Metadata format in encrypted files
 */
interface FileMetadata {
  kyberEncryptedSessionKey: string; // Base64-encoded
  version: string;
}

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
export async function decryptPrivateKey(
  encryptedPrivateKey: Uint8Array,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  if (salt.length !== 16) {
    throw new Error('Salt must be exactly 16 bytes');
  }
  if (iv.length !== 12) {
    throw new Error('IV must be exactly 12 bytes');
  }

  // Derive key from password + salt
  const { key } = await deriveKeyFromPassword(password, salt);

  // Decrypt private key
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    encryptedPrivateKey as any,
  );

  return new Uint8Array(decryptedData);
}

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
export async function decryptFile(
  encryptedData: Uint8Array,
  password: string,
  encryptedPrivateKey: Uint8Array,
  salt: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  // console.log('[DEBUG] decryptFile called with:');
  console.log('  - encryptedData size:', encryptedData.length);
  console.log('  - encryptedPrivateKey size:', encryptedPrivateKey.length);
  console.log('  - salt size:', salt.length);
  console.log('  - iv size:', iv.length);

  if (encryptedData.length < METADATA_SIZE) {
    throw new Error('Invalid encrypted file: too small');
  }

  // Step 1: Extract and parse metadata
  // console.log('[DEBUG] Step 1: Extracting metadata...');
  const metadataBuffer = encryptedData.subarray(0, METADATA_SIZE);

  // Find the end of JSON (first null byte or end of buffer)
  let metadataEnd = metadataBuffer.indexOf(0);
  if (metadataEnd === -1) {
    metadataEnd = metadataBuffer.length;
  }

  const metadataString = new TextDecoder().decode(metadataBuffer.subarray(0, metadataEnd));
  const metadata: FileMetadata = JSON.parse(metadataString);

  if (!metadata.kyberEncryptedSessionKey) {
    throw new Error('Invalid metadata: missing kyberEncryptedSessionKey');
  }
  // console.log('[DEBUG] Metadata parsed successfully');
  console.log('  - kyberEncryptedSessionKey length (base64):', metadata.kyberEncryptedSessionKey.length);

  // Step 2: Decrypt Kyber private key
  // console.log('[DEBUG] Step 2: Decrypting private key...');
  try {
    const privateKey = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);
    // console.log('[DEBUG] Private key decrypted successfully, size:', privateKey.length);
  } catch (error: any) {
    console.error('[DEBUG] Failed to decrypt private key:', error.message);
    throw new Error('Failed to decrypt private key: ' + error.message);
  }
  const privateKey = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);

  // Step 3: Decrypt session key
  // console.log('[DEBUG] Step 3: Decrypting session key...');
  const kyberEncryptedSessionKey = base64ToBytes(metadata.kyberEncryptedSessionKey);
  // console.log('[DEBUG] Kyber encrypted session key size:', kyberEncryptedSessionKey.length);

  try {
    const rawSessionKey = await decryptWithKyber(kyberEncryptedSessionKey, privateKey);
    // console.log('[DEBUG] Session key decrypted successfully, size:', rawSessionKey.length);
  } catch (error: any) {
    console.error('[DEBUG] Failed to decrypt session key with Kyber:', error.message);
    throw new Error('Failed to decrypt session key: ' + error.message);
  }
  const rawSessionKey = await decryptWithKyber(kyberEncryptedSessionKey, privateKey);

  // Import session key
  // console.log('[DEBUG] Importing session key for AES-GCM...');
  const sessionKey = await crypto.subtle.importKey(
    'raw',
    rawSessionKey as any,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  );
  // console.log('[DEBUG] Session key imported successfully');

  // Step 4: Decrypt file chunks
  // console.log('[DEBUG] Step 4: Decrypting file chunks...');
  // console.log('[DEBUG] Total encrypted data size:', encryptedData.length);
  // console.log('[DEBUG] Chunk data starts at offset:', METADATA_SIZE);
  const decryptedChunks: Uint8Array[] = [];
  let offset = METADATA_SIZE;
  let chunkIndex = 0;

  while (offset < encryptedData.length) {
    console.log(`[DEBUG] Processing chunk ${chunkIndex} at offset ${offset}...`);
    // Read IV (12 bytes)
    if (offset + 12 > encryptedData.length) {
      throw new Error('Invalid encrypted file: incomplete IV');
    }
    const chunkIv = encryptedData.subarray(offset, offset + 12);
    offset += 12;

    // Read chunk length (4 bytes, big-endian)
    if (offset + 4 > encryptedData.length) {
      throw new Error('Invalid encrypted file: incomplete length');
    }
    const lengthBytes = encryptedData.subarray(offset, offset + 4);
    const chunkLength = bytesToNumber(lengthBytes);
    offset += 4;

    // Read encrypted chunk
    if (offset + chunkLength > encryptedData.length) {
      throw new Error('Invalid encrypted file: incomplete chunk');
    }
    const encryptedChunk = encryptedData.subarray(offset, offset + chunkLength);
    offset += chunkLength;

    console.log(`[DEBUG]   - IV size: ${chunkIv.length}, chunk length: ${chunkLength}, encrypted chunk size: ${encryptedChunk.length}`);

    // Decrypt chunk
    try {
      const decryptedChunk = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: chunkIv as any },
        sessionKey,
        encryptedChunk as any,
      );
      console.log(`[DEBUG]   - Chunk ${chunkIndex} decrypted successfully, size: ${decryptedChunk.byteLength}`);
      decryptedChunks.push(new Uint8Array(decryptedChunk));
    } catch (error: any) {
      console.error(`[DEBUG]   - Failed to decrypt chunk ${chunkIndex}:`, error.message);
      throw new Error(`Failed to decrypt chunk ${chunkIndex}: ` + error.message);
    }

    chunkIndex++;
  }

  // Step 5: Combine all decrypted chunks
  const totalLength = decryptedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let resultOffset = 0;

  for (const chunk of decryptedChunks) {
    result.set(chunk, resultOffset);
    resultOffset += chunk.length;
  }

  return result;
}
