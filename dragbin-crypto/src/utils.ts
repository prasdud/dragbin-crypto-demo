/**
 * Utility functions for cryptographic operations
 */

/**
 * Generate a cryptographically secure random salt
 * @returns 16-byte random salt
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate a random initialization vector for AES-GCM
 * @returns 12-byte random IV
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Convert a byte array to hexadecimal string
 * @param bytes - Byte array to convert
 * @returns Hexadecimal string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert a hexadecimal string to byte array
 * @param hex - Hexadecimal string
 * @returns Byte array
 */
export function hexToBytes(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) {
    throw new Error('Invalid hex string');
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

/**
 * Convert a byte array to base64 string
 * @param bytes - Byte array to convert
 * @returns Base64 string
 */
export function bytesToBase64(bytes: Uint8Array): string {
  // Handle large arrays by processing in chunks to avoid argument limit
  const CHUNK_SIZE = 8192;
  let binString = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    binString += String.fromCharCode(...chunk);
  }
  return btoa(binString);
}

/**
 * Convert a base64 string to byte array
 * @param base64 - Base64 string
 * @returns Byte array
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

/**
 * Combine multiple Uint8Array instances into one
 * @param arrays - Arrays to combine
 * @returns Combined array
 */
export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Create a 4-byte big-endian representation of a number
 * @param num - Number to encode
 * @returns 4-byte array
 */
export function numberToBytes(num: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[0] = (num >> 24) & 0xff;
  bytes[1] = (num >> 16) & 0xff;
  bytes[2] = (num >> 8) & 0xff;
  bytes[3] = num & 0xff;
  return bytes;
}

/**
 * Read a big-endian 4-byte number
 * @param bytes - 4-byte array
 * @returns Number
 */
export function bytesToNumber(bytes: Uint8Array): number {
  return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
}
