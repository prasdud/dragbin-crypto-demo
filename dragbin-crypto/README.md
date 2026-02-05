# @dragbin/crypto

Zero-dependency encryption library using Kyber post-quantum cryptography and Argon2id password hashing.

## Features

- 🔐 **Post-Quantum Secure**: Uses Kyber1024 for public-key encryption (NIST Level 5 security)
- 🛡️ **Memory-Hard Password Hashing**: Argon2id with 64MB memory requirement (GPU-resistant)
- 📦 **File Encryption**: Chunked AES-GCM-256 encryption for files of any size
- 🔑 **Password-Protected Keys**: Secure private key storage with password protection
- 0️⃣ **Zero Runtime Dependencies**: All cryptographic primitives bundled as WASM
- 🌐 **Universal**: Works in both Node.js (18+) and modern browsers
- 🎯 **TypeScript**: Full type definitions included

## Installation

```bash
npm install @dragbin/crypto
```

## Quick Start

```typescript
import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  encryptPrivateKey,
} from '@dragbin/crypto';

// 1. Generate a Kyber key pair
const { publicKey, privateKey } = await generateKeyPair();

// 2. Encrypt the private key with a password (for secure storage)
const password = 'mySecurePassword123';
const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(
  privateKey,
  password
);

// 3. Encrypt a file
const fileData = new Uint8Array([...]); // Your file data
const { encryptedData } = await encryptFile(fileData, publicKey);

// 4. Later, decrypt the file
const decryptedFile = await decryptFile(
  encryptedData,
  password,
  encryptedPrivateKey,
  salt,
  iv
);
```

## API Reference

### Key Generation

#### `generateKeyPair()`

Generates a Kyber1024 key pair for post-quantum encryption.

```typescript
const { publicKey, privateKey } = await generateKeyPair();
// publicKey: Uint8Array (1568 bytes)
// privateKey: Uint8Array (3168 bytes)
```

### File Encryption

#### `encryptFile(file, publicKey)`

Encrypts a file using the Kyber public key.

**Parameters:**
- `file: Uint8Array` - File data to encrypt
- `publicKey: Uint8Array` - Kyber public key (1568 bytes)

**Returns:**
```typescript
{
  encryptedData: Uint8Array;           // Complete encrypted file
  kyberEncryptedSessionKey: Uint8Array; // Can be stored separately if needed
}
```

**Example:**
```typescript
const fileData = new Uint8Array([1, 2, 3, 4, 5]);
const { encryptedData } = await encryptFile(fileData, publicKey);
// Upload encryptedData to your storage service
```

### File Decryption

#### `decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv)`

Decrypts an encrypted file.

**Parameters:**
- `encryptedData: Uint8Array` - Encrypted file from `encryptFile()`
- `password: string` - Password to decrypt the private key
- `encryptedPrivateKey: Uint8Array` - Encrypted private key from `encryptPrivateKey()`
- `salt: Uint8Array` - Salt from `encryptPrivateKey()` (16 bytes)
- `iv: Uint8Array` - IV from `encryptPrivateKey()` (12 bytes)

**Returns:** `Uint8Array` - Original file data

**Example:**
```typescript
const decryptedFile = await decryptFile(
  encryptedData,
  password,
  encryptedPrivateKey,
  salt,
  iv
);
```

### Private Key Protection

#### `encryptPrivateKey(privateKey, password)`

Encrypts a Kyber private key with a password for secure storage.

**Parameters:**
- `privateKey: Uint8Array` - Kyber private key (3168 bytes)
- `password: string` - Password to protect the key

**Returns:**
```typescript
{
  encryptedPrivateKey: Uint8Array; // Encrypted key
  salt: Uint8Array;                // 16 bytes
  iv: Uint8Array;                  // 12 bytes
}
```

**Example:**
```typescript
const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(
  privateKey,
  'myPassword'
);
// Store encryptedPrivateKey, salt, and iv in your database
```

#### `decryptPrivateKey(encryptedPrivateKey, password, salt, iv)`

Decrypts a password-protected private key.

**Parameters:**
- `encryptedPrivateKey: Uint8Array` - Encrypted key
- `password: string` - Password used for encryption
- `salt: Uint8Array` - Salt (16 bytes)
- `iv: Uint8Array` - IV (12 bytes)

**Returns:** `Uint8Array` - Original private key (3168 bytes)

### Key Derivation

#### `deriveKeyFromPassword(password, salt?)`

Derives an AES-GCM key from a password using Argon2id + HKDF.

**Parameters:**
- `password: string` - User password
- `salt?: Uint8Array` - Optional salt (generated if not provided)

**Returns:**
```typescript
{
  key: CryptoKey;   // AES-GCM-256 key
  salt: Uint8Array; // 16 bytes
}
```

### Utilities

#### `generateSalt()`

Generates a cryptographically secure 16-byte salt.

```typescript
const salt = generateSalt(); // Uint8Array (16 bytes)
```

## Security Considerations

### Cryptographic Primitives

- **Kyber1024**: NIST Level 5 post-quantum security (~256-bit equivalent)
- **Argon2id**: Memory-hard (64MB), 3 iterations, parallelism=4
- **AES-GCM-256**: Authenticated encryption with 256-bit keys
- **HKDF-SHA256**: Key derivation for purpose-specific keys

### Best Practices

1. **Password Strength**: Use strong, unique passwords (12+ characters, mixed case, numbers, symbols)
2. **Salt Storage**: Store salts alongside encrypted data (they're not secret)
3. **IV Storage**: Store IVs with encrypted data (they're not secret)
4. **Key Storage**: Never store private keys unencrypted
5. **Secure Deletion**: Overwrite sensitive data in memory when done
6. **HTTPS**: Always transmit encrypted data over HTTPS

### File Format

Encrypted files have the following structure:

```
[0-10KB]: Metadata (JSON + padding)
{
  "kyberEncryptedSessionKey": "<base64>",
  "version": "1.0"
}

[10KB+]: Encrypted chunks
Each chunk format:
  - IV (12 bytes)
  - Length (4 bytes, big-endian)
  - Encrypted data (variable size, max 1KB plaintext per chunk)
```

## Compatibility

### Node.js

Requires Node.js 18 or higher (for Web Crypto API support).

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Browsers

Works in all modern browsers with Web Crypto API support:
- Chrome/Edge 60+
- Firefox 57+
- Safari 11+

### Module Formats

- **ESM**: `import { generateKeyPair } from '@dragbin/crypto'`
- **CommonJS**: `const { generateKeyPair } = require('@dragbin/crypto')`

## Performance

Typical performance on modern hardware:

| Operation | Time | Throughput |
|-----------|------|------------|
| Key Generation | ~50ms | - |
| Argon2id (64MB) | ~500ms | - |
| File Encryption (1MB) | ~100ms | ~10 MB/s |
| File Decryption (1MB) | ~100ms | ~10 MB/s |

**Note**: Argon2id is intentionally slow (memory-hard) to resist brute-force attacks.

## Examples

See the `examples/` directory for complete working examples:

- [basic-usage.js](examples/basic-usage.js) - Basic encryption/decryption
- [password-rotation.js](examples/password-rotation.js) - Changing passwords

## License

MIT

## Credits

Built on top of established cryptographic implementations.

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/dragbin/dragbin-crypto).
