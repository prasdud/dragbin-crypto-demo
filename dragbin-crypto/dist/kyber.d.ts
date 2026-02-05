/**
 * Kyber WASM wrapper for post-quantum encryption.
 */
import type { KyberKeyPair } from './types.js';
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
export declare function generateKyberKeyPair(): Promise<KyberKeyPair>;
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
export declare function kyberEncapsulate(publicKey: Uint8Array): Promise<{
    ciphertext: Uint8Array;
    secret: Uint8Array;
}>;
/**
 * Legacy function - use kyberEncapsulate instead
 * @deprecated Use kyberEncapsulate for proper KEM usage
 */
export declare function encryptWithKyber(publicKey: Uint8Array, data?: Uint8Array): Promise<Uint8Array>;
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
export declare function kyberDecapsulate(ciphertext: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
/**
 * Legacy function - use kyberDecapsulate instead
 * @deprecated Use kyberDecapsulate for proper KEM usage
 */
export declare function decryptWithKyber(ciphertext: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
