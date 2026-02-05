/**
 * Utility functions for cryptographic operations
 */
/**
 * Generate a cryptographically secure random salt
 * @returns 16-byte random salt
 */
export declare function generateSalt(): Uint8Array;
/**
 * Generate a random initialization vector for AES-GCM
 * @returns 12-byte random IV
 */
export declare function generateIV(): Uint8Array;
/**
 * Convert a byte array to hexadecimal string
 * @param bytes - Byte array to convert
 * @returns Hexadecimal string
 */
export declare function bytesToHex(bytes: Uint8Array): string;
/**
 * Convert a hexadecimal string to byte array
 * @param hex - Hexadecimal string
 * @returns Byte array
 */
export declare function hexToBytes(hex: string): Uint8Array;
/**
 * Convert a byte array to base64 string
 * @param bytes - Byte array to convert
 * @returns Base64 string
 */
export declare function bytesToBase64(bytes: Uint8Array): string;
/**
 * Convert a base64 string to byte array
 * @param base64 - Base64 string
 * @returns Byte array
 */
export declare function base64ToBytes(base64: string): Uint8Array;
/**
 * Combine multiple Uint8Array instances into one
 * @param arrays - Arrays to combine
 * @returns Combined array
 */
export declare function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array;
/**
 * Create a 4-byte big-endian representation of a number
 * @param num - Number to encode
 * @returns 4-byte array
 */
export declare function numberToBytes(num: number): Uint8Array;
/**
 * Read a big-endian 4-byte number
 * @param bytes - 4-byte array
 * @returns Number
 */
export declare function bytesToNumber(bytes: Uint8Array): number;
