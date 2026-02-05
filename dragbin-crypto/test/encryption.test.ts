import { describe, it, expect } from 'vitest';
import { generateKeyPair, encryptFile, encryptPrivateKey } from '../src/index.js';

describe('File Encryption', () => {
  it('should encrypt a small file', async () => {
    const { publicKey } = await generateKeyPair();
    const fileData = new Uint8Array([1, 2, 3, 4, 5]);

    const { encryptedData, kyberEncryptedSessionKey } = await encryptFile(fileData, publicKey);

    // Encrypted data should be larger due to metadata + IVs + auth tags
    expect(encryptedData.length).toBeGreaterThan(fileData.length);

    // Kyber encrypted session key should exist
    expect(kyberEncryptedSessionKey).toBeInstanceOf(Uint8Array);
    expect(kyberEncryptedSessionKey.length).toBeGreaterThan(0);

    // First 10KB should be metadata
    const metadataSize = 10 * 1024;
    const metadata = new TextDecoder().decode(
      encryptedData.subarray(0, encryptedData.indexOf(0)),
    );
    expect(() => JSON.parse(metadata)).not.toThrow();
  });

  it('should encrypt a medium-sized file', async () => {
    const { publicKey } = await generateKeyPair();
    const fileData = new Uint8Array(10 * 1024); // 10 KB
    crypto.getRandomValues(fileData);

    const { encryptedData } = await encryptFile(fileData, publicKey);

    // Should have metadata + encrypted chunks
    expect(encryptedData.length).toBeGreaterThan(fileData.length);
  });

  it('should produce different encrypted data for the same file', async () => {
    const { publicKey } = await generateKeyPair();
    const fileData = new Uint8Array([1, 2, 3, 4, 5]);

    const result1 = await encryptFile(fileData, publicKey);
    const result2 = await encryptFile(fileData, publicKey);

    // Should be different due to random IVs and session keys
    expect(result1.encryptedData).not.toEqual(result2.encryptedData);
    expect(result1.kyberEncryptedSessionKey).not.toEqual(result2.kyberEncryptedSessionKey);
  });
});

describe('Private Key Encryption', () => {
  it('should encrypt a private key with password', async () => {
    const { privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

    expect(encryptedPrivateKey).toBeInstanceOf(Uint8Array);
    expect(encryptedPrivateKey.length).toBeGreaterThan(0);
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
    expect(iv).toBeInstanceOf(Uint8Array);
    expect(iv.length).toBe(12);
  });

  it('should produce different encrypted keys with same password', async () => {
    const { privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const result1 = await encryptPrivateKey(privateKey, password);
    const result2 = await encryptPrivateKey(privateKey, password);

    // Should be different due to random salt and IV
    expect(result1.encryptedPrivateKey).not.toEqual(result2.encryptedPrivateKey);
    expect(result1.salt).not.toEqual(result2.salt);
    expect(result1.iv).not.toEqual(result2.iv);
  });
});
