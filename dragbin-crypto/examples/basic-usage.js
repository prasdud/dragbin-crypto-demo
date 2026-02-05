/**
 * Basic usage example for @dragbin/crypto
 *
 * Demonstrates:
 * - Key pair generation
 * - Private key encryption with password
 * - File encryption
 * - File decryption
 */

import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  encryptPrivateKey,
} from '../src/index.ts';
import { readFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🔐 @dragbin/crypto - Basic Usage Example\n');

  // Step 1: Generate a Kyber key pair
  console.log('1. Generating Kyber key pair...');
  const { publicKey, privateKey } = await generateKeyPair();
  console.log(`   ✓ Public key: ${publicKey.length} bytes`);
  console.log(`   ✓ Private key: ${privateKey.length} bytes\n`);

  // Step 2: Encrypt the private key with a password
  const password = 'mySecurePassword123';
  console.log('2. Encrypting private key with password...');
  const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(
    privateKey,
    password
  );
  console.log(`   ✓ Encrypted private key: ${encryptedPrivateKey.length} bytes`);
  console.log(`   ✓ Salt: ${salt.length} bytes`);
  console.log(`   ✓ IV: ${iv.length} bytes\n`);

  // Step 3: Create a sample file
  console.log('3. Loading image file...');
  const originalFile = readFileSync(join(process.cwd(), 'kobe.jpg'));
  console.log(`   ✓ File size: ${originalFile.length} bytes`);
  console.log(`   ✓ Image loaded: kobe.jpg\n`);

  // Step 4: Encrypt the file
  console.log('4. Encrypting file...');
  const startEncrypt = Date.now();
  const { encryptedData, kyberEncryptedSessionKey } = await encryptFile(
    originalFile,
    publicKey
  );
  const encryptTime = Date.now() - startEncrypt;
  console.log(`   ✓ Encrypted size: ${encryptedData.length} bytes`);
  console.log(`   ✓ Session key (encrypted): ${kyberEncryptedSessionKey.length} bytes`);
  console.log(`   ✓ Encryption time: ${encryptTime}ms\n`);

  // Step 5: Decrypt the file
  console.log('5. Decrypting file...');
  const startDecrypt = Date.now();
  const decryptedFile = await decryptFile(
    encryptedData,
    password,
    encryptedPrivateKey,
    salt,
    iv
  );
  const decryptTime = Date.now() - startDecrypt;
  console.log(`   ✓ Decrypted size: ${decryptedFile.length} bytes`);
  console.log(`   ✓ Decryption time: ${decryptTime}ms\n`);

  // Step 6: Verify the result
  console.log('6. Verification...');
  const matches = Buffer.compare(Buffer.from(decryptedFile), Buffer.from(originalFile)) === 0;
  console.log(`   ✓ Decrypted bytes match original: ${matches ? '✅ YES' : '❌ NO'}\n`);

  if (matches) {
    console.log('🎉 Success! File was encrypted and decrypted correctly.\n');
  } else {
    console.log('❌ Error! Decrypted file does not match original.\n');
    process.exit(1);
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   Original size:  ${originalFile.length} bytes`);
  console.log(`   Encrypted size: ${encryptedData.length} bytes`);
  console.log(`   Overhead:       ${encryptedData.length - originalFile.length} bytes`);
  console.log(`   Encrypt time:   ${encryptTime}ms`);
  console.log(`   Decrypt time:   ${decryptTime}ms`);
}

main().catch(console.error);
