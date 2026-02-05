# Implementation Notes

## Critical Bug Fix

### Issue: Kyber KEM vs Public Key Encryption

**Problem**: Initial implementation treated Kyber as traditional public-key encryption (encrypt data with public key). This caused all decryption tests to fail with "Cipher job failed".

**Root Cause**: Kyber is a **Key Encapsulation Mechanism (KEM)**, not traditional encryption:
- Traditional PKE: `encrypt(publicKey, data) → ciphertext`
- Kyber KEM: `encapsulate(publicKey) → {ciphertext, sharedSecret}`

**Solution**:
- Changed `encryptWithKyber(publicKey, sessionKey)` to `kyberEncapsulate(publicKey)`
- Kyber now **generates** the session key internally as a shared secret
- Ciphertext goes in metadata, shared secret is used as AES-GCM session key

### Code Changes

**Before (WRONG)**:
```typescript
// Generate our own session key
const sessionKey = await crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, ['encrypt']);
const rawKey = await crypto.subtle.exportKey('raw', sessionKey);

// Try to encrypt it with Kyber (WRONG - treating it like PKE)
const ciphertext = await kyber.encrypt(publicKey, rawKey);
```

**After (CORRECT)**:
```typescript
// Let Kyber generate the shared secret (session key) via KEM
const { ciphertext, secret } = await kyber.encrypt(publicKey); // No data parameter!

// Use Kyber's shared secret as the AES-GCM session key
const sessionKey = await crypto.subtle.importKey('raw', secret, {name: 'AES-GCM'}, false, ['encrypt']);
```

## Test Results

✅ **All 29 tests passing (100%)**

- Key generation: ✅
- Argon2id password hashing: ✅
- Private key encryption/decryption: ✅
- File encryption/decryption: ✅
- Round-trip tests (1KB, 100KB, 1MB): ✅
- Edge cases (empty file, single byte): ✅

## Package Verification

✅ **Zero Runtime Dependencies**
- Output of `npm ls --omit=dev`: (empty)
- All WASM is bundled into the package

✅ **Post-Quantum Encryption**
- Kyber1024 (NIST Level 5 security, ~256-bit equivalent)
- Properly implemented as KEM, not PKE

✅ **Production Ready**
- Full TypeScript support
- Dual ESM/CJS builds
- Comprehensive test coverage
- Documented API

## Key Takeaways

1. **Always understand the cryptographic primitive** - Kyber is a KEM, not PKE
2. **Follow reference implementations** - The original Dragbin code called `kyber.encrypt()` without data for a reason
3. **Test early and often** - The debug test helped identify exactly where decryption was failing
4. **Post-quantum crypto is different** - KEMs work differently than traditional PKE

## References

- [Kyber Specification](https://pq-crystals.org/kyber/index.shtml)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- Original implementation: `dragbin-front/src/utils/crypto.js:755`
