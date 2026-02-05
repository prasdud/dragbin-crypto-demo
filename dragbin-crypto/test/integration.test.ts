import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  encryptPrivateKey,
  decryptPrivateKey,
} from '../src/index.js';

describe('Integration Tests', () => {
  it('should complete full round-trip: encrypt and decrypt', async () => {
    // 1. Generate key pair
    const { publicKey, privateKey } = await generateKeyPair();

    // 2. Create test file
    const originalFile = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // 3. Encrypt private key with password
    const password = 'mySecurePassword123';
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

    // 4. Encrypt file
    const { encryptedData } = await encryptFile(originalFile, publicKey);

    // 5. Decrypt file
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    // 6. Verify match
    expect(decryptedFile).toEqual(originalFile);
  });

  it('should handle 1 KB file', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const originalFile = new Uint8Array(1024);
    crypto.getRandomValues(originalFile);

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
    const { encryptedData } = await encryptFile(originalFile, publicKey);
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    expect(decryptedFile).toEqual(originalFile);
  });

  it('should handle 100 KB file', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const originalFile = new Uint8Array(100 * 1024);
    // Fill in chunks due to crypto.getRandomValues 65KB limit
    for (let i = 0; i < originalFile.length; i += 65536) {
      const chunk = originalFile.subarray(i, Math.min(i + 65536, originalFile.length));
      crypto.getRandomValues(chunk);
    }

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
    const { encryptedData } = await encryptFile(originalFile, publicKey);
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    expect(decryptedFile).toEqual(originalFile);
  }, 30000); // Increase timeout for large files

  it('should handle 1 MB file', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const originalFile = new Uint8Array(1024 * 1024);
    // Fill in chunks due to crypto.getRandomValues 65KB limit
    for (let i = 0; i < originalFile.length; i += 65536) {
      const chunk = originalFile.subarray(i, Math.min(i + 65536, originalFile.length));
      crypto.getRandomValues(chunk);
    }

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
    const { encryptedData } = await encryptFile(originalFile, publicKey);
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    expect(decryptedFile).toEqual(originalFile);
  }, 60000); // Increase timeout for large files

  it('should handle empty file', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const originalFile = new Uint8Array(0);

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
    const { encryptedData } = await encryptFile(originalFile, publicKey);
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    expect(decryptedFile).toEqual(originalFile);
  });

  it('should handle file with single byte', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    const originalFile = new Uint8Array([42]);

    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);
    const { encryptedData } = await encryptFile(originalFile, publicKey);
    const decryptedFile = await decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv);

    expect(decryptedFile).toEqual(originalFile);
  });

  it('should verify encrypted data is different from original', async () => {
    const { publicKey } = await generateKeyPair();
    const originalFile = new Uint8Array([1, 2, 3, 4, 5]);

    const { encryptedData } = await encryptFile(originalFile, publicKey);

    // Encrypted data should not contain the original data in plaintext
    const encryptedString = new TextDecoder().decode(encryptedData);
    const originalString = Array.from(originalFile).join(',');

    expect(encryptedString).not.toContain(originalString);
  });

  it('should verify private key can be decrypted and used', async () => {
    const { publicKey, privateKey } = await generateKeyPair();
    const password = 'testPassword123';

    // Encrypt private key
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

    // Decrypt private key
    const decryptedPrivateKey = await decryptPrivateKey(
      encryptedPrivateKey,
      password,
      salt,
      iv,
    );

    // Use decrypted private key to decrypt a file
    const originalFile = new Uint8Array([1, 2, 3]);
    const { encryptedData } = await encryptFile(originalFile, publicKey);

    // Re-encrypt the decrypted private key for use in decryptFile
    const { encryptedPrivateKey: reEncryptedKey, salt: newSalt, iv: newIv } =
      await encryptPrivateKey(decryptedPrivateKey, password);

    const decryptedFile = await decryptFile(
      encryptedData,
      password,
      reEncryptedKey,
      newSalt,
      newIv,
    );

    expect(decryptedFile).toEqual(originalFile);
  });
});
