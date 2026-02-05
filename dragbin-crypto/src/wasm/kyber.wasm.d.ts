/**
 * Type definitions for Kyber WASM module
 */

export interface KyberKeyPairResult {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface KyberEncryptResult {
  cyphertext: Uint8Array; // Note: the API uses "cyphertext"
  secret: Uint8Array;
}

export interface Kyber {
  ready: Promise<Kyber>;
  keyPair(): Promise<KyberKeyPairResult>;
  encrypt(publicKey: Uint8Array, data?: Uint8Array): Promise<KyberEncryptResult>;
  decrypt(ciphertext: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>;
}

declare const kyber: Kyber;
export default kyber;
