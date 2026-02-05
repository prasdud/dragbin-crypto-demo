import { describe, it, expect } from 'vitest';
import { generateKeyPair } from '../src/index.js';

describe('Key Generation', () => {
  it('should generate a Kyber key pair with correct sizes', async () => {
    const { publicKey, privateKey } = await generateKeyPair();

    // Kyber1024 public key is 1568 bytes
    expect(publicKey).toBeInstanceOf(Uint8Array);
    expect(publicKey.length).toBe(1568);

    // Kyber1024 private key is 3168 bytes
    expect(privateKey).toBeInstanceOf(Uint8Array);
    expect(privateKey.length).toBe(3168);
  });

  it('should generate unique keys on each call', async () => {
    const { publicKey: pub1, privateKey: priv1 } = await generateKeyPair();
    const { publicKey: pub2, privateKey: priv2 } = await generateKeyPair();

    // Keys should be different
    expect(pub1).not.toEqual(pub2);
    expect(priv1).not.toEqual(priv2);
  });

  it('should generate keys quickly', async () => {
    const startTime = Date.now();
    await generateKeyPair();
    const duration = Date.now() - startTime;

    // Should complete in reasonable time (< 1 second)
    expect(duration).toBeLessThan(1000);
  });
});
