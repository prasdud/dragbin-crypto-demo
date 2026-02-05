/**
 * Password rotation example for @dragbin/crypto
 *
 * Demonstrates how to change the password protecting a private key
 * without re-encrypting all files.
 */

import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  encryptPrivateKey,
  decryptPrivateKey,
} from '@dragbin/crypto';

async function main() {
  console.log('🔄 @dragbin/crypto - Password Rotation Example\n');

  // Step 1: Initial setup
  console.log('1. Initial setup...');
  const { publicKey, privateKey } = await generateKeyPair();
  const oldPassword = 'oldPassword123';
  const { encryptedPrivateKey: oldEncryptedKey, salt: oldSalt, iv: oldIv } =
    await encryptPrivateKey(privateKey, oldPassword);
  console.log(`   ✓ Key pair generated`);
  console.log(`   ✓ Private key encrypted with old password\n`);

  // Step 2: Encrypt a file with the public key
  console.log('2. Encrypting file...');
  const originalFile = new TextEncoder().encode('Secret document content 📄');
  const { encryptedData } = await encryptFile(originalFile, publicKey);
  console.log(`   ✓ File encrypted (${encryptedData.length} bytes)\n`);

  // Step 3: Verify we can decrypt with old password
  console.log('3. Verifying decryption with old password...');
  const decrypted1 = await decryptFile(
    encryptedData,
    oldPassword,
    oldEncryptedKey,
    oldSalt,
    oldIv
  );
  console.log(`   ✓ File decrypted successfully with old password\n`);

  // Step 4: Rotate password
  console.log('4. Rotating password...');

  // a) Decrypt the private key with old password
  console.log('   a) Decrypting private key with old password...');
  const decryptedPrivateKey = await decryptPrivateKey(
    oldEncryptedKey,
    oldPassword,
    oldSalt,
    oldIv
  );
  console.log('      ✓ Private key decrypted');

  // b) Re-encrypt with new password
  const newPassword = 'newPassword456';
  console.log('   b) Re-encrypting private key with new password...');
  const { encryptedPrivateKey: newEncryptedKey, salt: newSalt, iv: newIv } =
    await encryptPrivateKey(decryptedPrivateKey, newPassword);
  console.log('      ✓ Private key re-encrypted\n');

  // Step 5: Verify old password no longer works
  console.log('5. Verifying old password is invalidated...');
  try {
    await decryptFile(encryptedData, oldPassword, newEncryptedKey, newSalt, newIv);
    console.log('   ❌ ERROR: Old password still works!\n');
    process.exit(1);
  } catch (error) {
    console.log('   ✓ Old password correctly rejected\n');
  }

  // Step 6: Verify new password works
  console.log('6. Verifying decryption with new password...');
  const decrypted2 = await decryptFile(
    encryptedData,
    newPassword,
    newEncryptedKey,
    newSalt,
    newIv
  );
  const matches = new TextDecoder().decode(decrypted2) ===
                  new TextDecoder().decode(originalFile);
  console.log(`   ✓ File decrypted successfully with new password`);
  console.log(`   ✓ Content matches: ${matches ? '✅ YES' : '❌ NO'}\n`);

  if (matches) {
    console.log('🎉 Success! Password rotation completed.\n');
  } else {
    console.log('❌ Error! Decrypted file does not match original.\n');
    process.exit(1);
  }

  // Summary
  console.log('📋 Key Points:');
  console.log('   • Files are encrypted with the public key');
  console.log('   • Private key is encrypted with a password');
  console.log('   • To change password:');
  console.log('     1. Decrypt private key with old password');
  console.log('     2. Re-encrypt private key with new password');
  console.log('   • No need to re-encrypt files!');
  console.log('   • Old encrypted files work with new password\n');
}

main().catch(console.error);
