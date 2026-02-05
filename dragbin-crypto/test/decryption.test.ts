import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  encryptPrivateKey,
  decryptPrivateKey,
  encryptFile,
  decryptFile,
} from '../src/index.js';

describe('Private Key Decryption', () => {
  it('should decrypt a private key with correct password', async () => {
    const { privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

    const decrypted = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);

    expect(decrypted).toEqual(privateKey);
  });

  it('should fail to decrypt with wrong password', async () => {
    const { privateKey } = await generateKeyPair();
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword456';

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

    await expect(
      decryptPrivateKey(encryptedPrivateKey, wrongPassword, salt, iv),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with wrong salt', async () => {
    const { privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const { encryptedPrivateKey, iv } = await encryptPrivateKey(privateKey, password);
    const wrongSalt = crypto.getRandomValues(new Uint8Array(16));

    await expect(
      decryptPrivateKey(encryptedPrivateKey, password, wrongSalt, iv),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with wrong IV', async () => {
    const { privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const { encryptedPrivateKey, salt } = await encryptPrivateKey(privateKey, password);
    const wrongIv = crypto.getRandomValues(new Uint8Array(12));

    await expect(
      decryptPrivateKey(encryptedPrivateKey, password, salt, wrongIv),
    ).rejects.toThrow();
  });
});

describe('File Decryption', () => {
  it('should decrypt a file encrypted with the same key pair', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';
    const originalFile = new Uint8Array([1, 2, 3, 4, 5]);

    // Encrypt private key
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

    // Encrypt file
    const { encryptedData } = await encryptFile(originalFile, publicKey);

    // Decrypt file
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    expect(decryptedFile).toEqual(originalFile);
  });

  it('should fail to decrypt with wrong password', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';
    const wrongPassword = 'wrongPassword456';
    const originalFile = new Uint8Array([1, 2, 3, 4, 5]);

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
    const { encryptedData } = await encryptFile(originalFile, publicKey);

    await expect(
      decryptFile(encryptedData, wrongPassword, encryptedPrivateKey, salt, iv),
    ).rejects.toThrow();
  });

  it('should fail to decrypt with wrong key pair', async () => {
    const { publicKey: pub1 } = await generateKeyPair();
    const { privateKey: priv2 } = await generateKeyPair();
    const password = 'testPassword123';
    const originalFile = new Uint8Array([1, 2, 3, 4, 5]);

    // Encrypt with one key pair, decrypt with another
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(priv2, password);
    const { encryptedData } = await encryptFile(originalFile, pub1);

    await expect(
      decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv),
    ).rejects.toThrow();
  });
});
