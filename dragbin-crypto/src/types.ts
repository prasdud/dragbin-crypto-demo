/**
 * Type definitions for @dragbin/crypto
 */

/**
 * Kyber1024 key pair for post-quantum encryption
 */
export interface KyberKeyPair {
  /** Public key (1568 bytes) - can be shared */
  publicKey: Uint8Array;
  /** Private key (3168 bytes) - must be kept secret */
  privateKey: Uint8Array;
}

/**
 * Result of file encryption
 */
export interface EncryptedFile {
  /** Complete encrypted file data (metadata + encrypted chunks) */
  encryptedData: Uint8Array;
  /** Kyber-encrypted session key (can be stored separately if needed) */
  kyberEncryptedSessionKey: Uint8Array;
}

/**
 * Result of deriving a key from password
 */
export interface DerivedKey {
  /** AES-GCM key derived from password */
  key: CryptoKey;
  /** Salt used for derivation (16 bytes) */
  salt: Uint8Array;
}

/**
 * Result of encrypting a private key with password
 */
export interface EncryptedPrivateKey {
  /** Encrypted Kyber private key */
  encryptedPrivateKey: Uint8Array;
  /** Salt used for key derivation (16 bytes) */
  salt: Uint8Array;
  /** Initialization vector for AES-GCM (12 bytes) */
  iv: Uint8Array;
}

/**
 * Metadata stored in the first 10KB of encrypted files
 */
export interface FileMetadata {
  /** Session key encrypted with Kyber public key (base64) */
  kyberEncryptedSessionKey: string;
  /** Version of the encryption format */
  version: string;
}
