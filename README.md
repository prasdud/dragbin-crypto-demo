# Dragbin Crypto Demo App — Build Prompt

## Project Overview

Build an interactive demo app for **@dragbin/crypto** — a post-quantum encryption library for zero-knowledge cloud storage.

**Context:** This is the official npm package for [Dragbin.com](https://dragbin.com) — a post-quantum encrypted cloud storage platform. The demo will be open-sourced alongside the package to demonstrate its capabilities and educate users about post-quantum cryptography.

**Goal:** Create a visually impressive, highly interactive educational demo that shows:
- How traditional cloud storage (Google Drive, Dropbox) handles files vs Dragbin
- Why post-quantum encryption matters
- What "zero-knowledge" actually means
- The power and flexibility of the `@dragbin/crypto` package

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Framer Motion** for animations
- **Zustand** for state management
- **Lucide React** for icons
- **React Flow** (optional, for data visualization)

---

## Package Integration

### Location
The `@dragbin/crypto` package is located in the **project directory** at: `./dragbin-crypto/`

### Installation (for local development)
```bash
npm install ./dragbin-crypto
# or
yarn add ./dragbin-crypto
# or
pnpm add ./dragbin-crypto
```

### API Reference

```typescript
import {
  generateKeyPair,
  encryptFile,
  decryptFile,
  encryptPrivateKey,
  decryptPrivateKey,
  deriveKeyFromPassword,
  generateSalt,
} from '@dragbin/crypto';
```

#### Available Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `generateKeyPair()` | Generate Kyber1024 key pair | `Promise<{ publicKey: Uint8Array, privateKey: Uint8Array }>` |
| `encryptFile(data, publicKey)` | Encrypt file data with recipient's public key | `Promise<{ encryptedData: Uint8Array, kyberEncryptedSessionKey: Uint8Array }>` |
| `decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv)` | Decrypt file with password | `Promise<Uint8Array>` |
| `encryptPrivateKey(privateKey, password)` | Password-protect private key | `Promise<{ encryptedPrivateKey: Uint8Array, salt: Uint8Array, iv: Uint8Array }>` |
| `decryptPrivateKey(encryptedPrivateKey, password, salt, iv)` | Recover private key from password | `Promise<Uint8Array>` |
| `deriveKeyFromPassword(password, salt)` | Derive AES key from password | `Promise<{ key: CryptoKey, salt: Uint8Array }>` |
| `generateSalt()` | Generate random 16-byte salt | `Uint8Array` |

#### Types

```typescript
interface KyberKeyPair {
  publicKey: Uint8Array;   // 1568 bytes
  privateKey: Uint8Array;  // 3168 bytes
}

interface EncryptedFile {
  encryptedData: Uint8Array;              // Complete encrypted file
  kyberEncryptedSessionKey: Uint8Array;   // 1568 bytes
}

interface EncryptedPrivateKey {
  encryptedPrivateKey: Uint8Array;  // 3184 bytes
  salt: Uint8Array;                  // 16 bytes
  iv: Uint8Array;                    // 12 bytes
}
```

#### Usage Example

```typescript
// 1. Generate key pair
const { publicKey, privateKey } = await generateKeyPair();

// 2. Encrypt private key with password
const password = 'mySecurePassword123';
const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, password);

// 3. Encrypt a file
const fileData = new Uint8Array(await file.arrayBuffer());
const { encryptedData } = await encryptFile(fileData, publicKey);

// 4. Later, decrypt the file
const decryptedFile = await decryptFile(
  encryptedData,
  password,
  encryptedPrivateKey,
  salt,
  iv
);

// 5. Verify
const originalText = new TextDecoder().decode(fileData);
const decryptedText = new TextDecoder().decode(decryptedFile);
// They match!
```

#### Technical Details

- **Post-Quantum KEM:** Kyber1024 (NIST Level 5)
- **Password Hashing:** Argon2id (64MB memory, 3 iterations)
- **Symmetric Encryption:** AES-GCM-256
- **Chunk Size:** 1KB per chunk (each with unique IV)
- **Metadata Header:** 10KB (contains encrypted session key)
- **Overhead:** 10KB + ~12 bytes per chunk

#### File Structure

Encrypted files have this structure:
```
Offset 0-10239:     Metadata Header (10KB)
  - kyberEncryptedSessionKey (base64, ~2KB when encoded)
  - version: "1.0"
  - Padding (null bytes)

Offset 10240+:      Encrypted Chunks
  Each chunk:
    - IV: 12 bytes
    - Length: 4 bytes (little-endian)
    - Encrypted Data: variable (up to 1KB)
    - Auth Tag: 16 bytes (included in AES-GCM output)
```

---

## Style Guidelines

**IMPORTANT:** You must follow the style specifications in **`prompt.xml`** — this contains the complete design system including:
- Colors (light/dark mode)
- Typography
- Spacing/sizing
- Component variants
- Animation timing
- Border radius, shadows

Read `prompt.xml` carefully and match the visual language exactly.

---

## App Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing/overview
│   ├── traditional/
│   │   └── page.tsx        # Demo 1: Traditional vs Dragbin
│   ├── rotation/
│   │   └── page.tsx        # Demo 2: Password Rotation
│   ├── quantum/
│   │   └── page.tsx        # Demo 3: Quantum Attack Simulator
│   └── inspector/
│       └── page.tsx        # Demo 4: File Inspector
├── components/
│   ├── demos/              # Demo-specific components
│   ├── ServerView.tsx      # Right sidebar (always visible)
│   ├── FileUpload.tsx
│   ├── HexViewer.tsx
│   ├── EncryptionFlow.tsx
│   └── ui/                 # shadcn components
├── lib/
│   └── crypto.ts           # Wrapper functions for @dragbin/crypto
├── stores/
│   └── demo-store.ts       # Zustand store
└── types/
    └── demo.ts             # TypeScript types
```

---

## Shared Components

### 1. ServerView (Right Sidebar — Always Visible)

Shows what's actually stored on the server at any moment. Updates in real-time.

```tsx
<ServerView
  files: StoredFile[]          // Files stored on "server"
  keys: StoredKey[]            // Keys stored on "server"
  onDownload: (item) => void   // Download server copy
/>
```

**Features:**
- List all encrypted files with sizes, chunk counts
- Show public key (shareable) and encrypted private key (not readable)
- "Server Knowledge" section showing what the server CAN'T see
- Download button for verification

### 2. FileUpload Component

```tsx
<FileUpload
  accept="*/*"
  maxSize={100 * 1024 * 1024}
  onUpload={(file: File) => void}
  label="Drag & drop or click to upload"
/>
```

### 3. EncryptionFlow Animation

Shows step-by-step progress with icons and timing.

```tsx
<EncryptionFlow
  steps={[
    { label: 'Generate Keys', icon: 'key', duration: 50 },
    { label: 'Encrypt Private Key', icon: 'lock', duration: 100 },
    { label: 'Encrypt File', icon: 'file', duration: 150 },
    { label: 'Upload to Server', icon: 'cloud', duration: 80 },
  ]}
  currentStep={number}
  onComplete={() => void}
/>
```

### 4. HexViewer Component

```tsx
<HexViewer
  data: Uint8Array
  offset: number
  length: number
  showDecoded: boolean
  onByteClick: (byte: number) => void
/>
```

---

## State Management (Zustand)

```typescript
interface DemoStore {
  // Server state
  serverFiles: StoredFile[];
  serverKeys: StoredKey[];

  // User state
  userKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array } | null;
  userPassword: string | null;

  // Current demo
  currentDemo: 'traditional' | 'rotation' | 'quantum' | 'inspector';

  // Actions
  uploadToServer: (file: EncryptedFile) => void;
  rotatePassword: (oldPass: string, newPass: string) => Promise<void>;
  encryptFile: (file: File, method: EncryptionMethod) => Promise<EncryptedFile>;
  decryptFile: (encryptedFile: EncryptedFile, password: string) => Promise<Uint8Array>;
  generateKeys: () => Promise<void>;
  reset: () => void;
}
```

---

## Demo 1: Traditional Cloud vs Dragbin

**Route:** `/traditional`

### Purpose
Visually demonstrate how traditional cloud storage handles files vs Dragbin. Show that servers can read traditional files but only see gibberish with Dragbin.

### Layout: Split View Comparison

```
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│  ☁️  Traditional Cloud (Google Drive)          │  🔒 Dragbin (Zero-Knowledge Storage)           │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│                                               │                                               │
│  1. Upload a file                             │  1. Upload a file                              │
│  [Drag & drop area]                            │  [Drag & drop area]                            │
│                                               │                                               │
│  2. What server receives:                    │  2. Generate keys locally                      │
│  ┌─────────────────────────────────────┐     │  ┌─────────────────────────────────────┐     │
│  │  📄 photo.jpg                       │     │  │  Generating Kyber-1024 keys...      │     │
│  │  [Thumbnail] [Actual data]          │     │  │  Public: 1568 bytes │ Private: 3168B │     │
│  │  👁️ Server CAN see this            │     │  │  [Encrypt Private Key]              │     │
│  └─────────────────────────────────────┘     │  └─────────────────────────────────────┘     │
│                                               │                                               │
│  3. What Google can do:                       │  3. Encrypt file locally                      │
│  ✓ Read file  ✓ Scan content                  │  [Encrypting with AES-GCM...]               │
│  ✓ Train AI  ✓ Hand over to gov               │                                               │
│  ⚠️  If hacked: YOUR DATA LEAKED              │  4. What server receives:                    │
│                                               │  ┌─────────────────────────────────────┐     │
│  [Upload] → Server stores plaintext           │  │  📦 encrypted.bin                    │     │
│  [Download server copy] → Get original        │  │  [Encrypted gibberish]              │     │
│                                               │  │  👁️ Server CANNOT see              │     │
│                                               │  └─────────────────────────────────────┘     │
│                                               │                                               │
│                                               │  [Upload] → Server stores encrypted           │
│                                               │  [Download server copy] → Get random bytes    │
│                                               │  [Decrypt with password] → Get original      │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

### Features Required
- Real file upload (or drag-drop)
- Side-by-side animated comparison
- "Download server copy" downloads actual stored bytes
- Modal showing hex view of server data
- Data flow animation (traditional: direct upload vs Dragbin: encrypt then upload)
- Visual indicators of what server can/cannot see

### Implementation Notes
- For traditional: simulate what Google Drive stores (plaintext file)
- For Dragbin: use real `@dragbin/crypto` to encrypt
- Let user download both versions and compare

---

## Demo 2: Password Rotation

**Route:** `/rotation`

### Purpose
Demonstrate that changing passwords doesn't require re-encrypting files — a unique advantage of the architecture.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔄 Password Rotation — Change Password Without Re-encrypting Files        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Current Setup:                                                              │
│  • Your files on server (encrypted): tax_return.pdf, secret.docx, photo.jpg │
│  • Private key protected with: "oldPassword123"                              │
│                                                                              │
│  Change Password:                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Old Password: ***********    New Password: ***********               │ │
│  │  [Rotate Password]                                                    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Step-by-Step Animation:                                                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Step 1: Decrypt Private Key with old password                          │ │
│  │  Step 2: Re-encrypt Private Key with new password                       │ │
│  │  Step 3: Update server storage (ONLY private key changes)               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Key Insight:                                                                 │
│  Files are encrypted with your PUBLIC KEY (never changes)                     │
│  Only your PRIVATE KEY needs re-encryption — files are untouched!            │
│                                                                              │
│  Verification:                                                                │
│  [Decrypt file with new password] → Success! ✓                                │
│  [Try with old password] → Failed ✗                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Features Required
- Show existing encrypted files (can pre-populate)
- Password form with show/hide toggle
- Animated step-by-step rotation process
- Visual that files are NOT touched
- Verification by decrypting a file
- Server view updates to show only private key changed

### Implementation Notes
- Use `decryptPrivateKey` then `encryptPrivateKey` with new password
- Show that `encryptedData` files remain identical (hash comparison)

---

## Demo 3: Quantum Attack Simulator

**Route:** `/quantum`

### Purpose
Show how long it would take a quantum computer to break different encryption methods. Educate about the quantum threat and why post-quantum matters.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚛️  Quantum Threat Simulator — Will Your Data Survive?                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Understanding the Threat:                                                   │
│  • Shor's algorithm breaks RSA/ECC                                          │
│  • Grover's algorithm reduces symmetric key security by half                 │
│  • Timeline: RSA-2048 broken ~2030, post-quantum algorithms still secure     │
│                                                                              │
│  Encrypt & Simulate:                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  📁 [Upload file]                                                      │ │
│  │                                                                         │ │
│  │  Encrypt with:                                                          │ │
│  │  [RSA-2048] [ECC-256] [AES-256] [Kyber-1024]                           │ │
│  │                                                                         │ │
│  │  [Encrypt & Simulate Attack]                                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Results:                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ RSA-2048        │  │ ECC-256         │  │ AES-256 only    │  │ Kyber-1024    │ │
│  │                 │  │                 │  │                 │  │               │ │
│  │ 🔴 BROKEN       │  │ 🔴 BROKEN       │  │ ⚠️ KEY EXPOSED  │  │ 🟢 SECURE     │ │
│  │ ~8 hours        │  │ ~4 hours        │  │ (via RSA)      │  │ Forever       │ │
│  │ (2030)          │  │ (2030)          │  │                 │  │               │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                                              │
│  Time-to-Break Calculator:                                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Method      | Classical Brute Force | Quantum Attack                  │ │
│  │  ────────────┼───────────────────────┼─────────────────────────────────│ │
│  │  RSA-2048    | ~300 trillion years   | ~8 hours (with 10M qubits)     │ │
│  │  ECC-256     | ~300 trillion years   | ~4 hours (with 10M qubits)     │ │
│  │  AES-256     | ~forever              | ~forever* (Grover = 2^128)    │ │
│  │  Kyber-1024  | ~forever              | ~forever (no quantum advantage)│ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Interactive Timeline:                                                        │
│  2025 ────── 2030 ────── 2035 ────── 2040 ────── 2045+                      │
│   Safe   Warning    RSA Broken   ECC Broken   Post-Q Era                     │
│                                                                              │
│  Your file: [Kyber-1024] → Secure forever ✓                                  │
│            [RSA-2048] → Broken ~2030 ⚠️                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Features Required
- File upload
- "Encrypt" with different methods (Kyber uses real package, others simulated)
- Time-to-break estimates with sources
- Interactive timeline slider
- Educational tooltips explaining each algorithm
- References to NIST papers

### Implementation Notes
- Use real `@dragbin/crypto` for Kyber encryption
- Simulate other methods (just show estimated break times)
- Break time estimates based on research papers (cite sources)
- Show that even with Grover's algorithm, AES-256 is still secure but key exchange is the weak point

### Data Sources for Estimates
Cite these sources in the UI:
- NIST Post-Quantum Cryptography Standardization (FIPS 203)
- "How to factor 2048-bit RSA in 8 hours" (paper extrapolations)
- Various quantum computing roadmap papers

---

## Demo 4: File Inspector

**Route:** `/inspector`

### Purpose
Let users inspect the actual structure of an encrypted file — see metadata, chunks, headers, and compare encrypted vs decrypted content.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔬 Encrypted File Inspector — See What's Inside                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Generate Encrypted File                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  📄 [Select file]  🔑 [Password]                                       │ │
│  │  [Generate Encrypted File]                                              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  2. File Structure Visualization                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  [Header: 10KB] [Chunk 0: 60B] [Chunk 1: 1KB] ... [Chunk N: 512B]     │ │
│  │      ↓                  ↓               ↓                    ↓            │ │
│  │  [Click to inspect] [Click to inspect] [Click to inspect] [Click]     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  3. Inspector Panel (when section clicked)                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  📋 Header / 📦 Chunk #0                                                 │
│  │                                                                         │ │
│  │  Structure:                                                             │
│  │  • Offset: 0 / 10240                                                    │ │
│  │  • Size: 10240 / 60 bytes                                               │ │
│  │  • Fields: [Click any field for details]                                │ │
│  │                                                                         │ │
│  │  Encrypted View:                                                         │
│  │  7f 3a 8c 4d e1 9f 2b 6a 7c 5e 3d 8f 4a 2b 6c 9d 1e 7f...                │ │
│  │                                                                         │ │
│  │  Decrypted View (requires password):                                     │
│  │  "Hello, World! This is the actual file content..."                     │ │
│  │                                                                         │ │
│  │  [Decrypt This Section] [Download Section]                               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  4. Full File Hex View                                                       │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  00000000  7f 3a 8c 4d e1 9f 2b 6a 7c 5e 3d 8f 4a 2b 6c...               │ │
│  │  00000010  b4 2c 8e 5a 3d 9f 1e 7c 5b 3a 8e 4d 9c 1f 2e...               │ │
│  │  ...                                                                     │ │
│  │  [Scroll to explore]                                                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  5. Decryption Test                                                           │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Password: ***********                                                  │ │
│  │  [Decrypt Full File]                                                    │ │
│  │                                                                         │ │
│  │  Result: ✓ Success! Original: contract.pdf (1.24 MB)                    │ │
│  │          Decrypted: decrypted_contract.pdf (1.24 MB)                   │ │
│  │          [Compare: byte-by-byte match ✓]                                │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Features Required
- Generate real encrypted file using `@dragbin/crypto`
- Interactive file structure visualization
- Click any section to inspect
- Side-by-side encrypted vs decrypted view
- Hex viewer with offset
- Download individual components
- Verify decryption matches original

### Implementation Notes
- Parse the encrypted file format to show structure
- Extract and display header metadata
- Show individual chunk structure (IV, length, data)
- Allow decrypting individual chunks for comparison

---

## Navigation

```tsx
// Use Next.js navigation
<Link href="/traditional">Traditional vs Dragbin</Link>
<Link href="/rotation">Password Rotation</Link>
<Link href="/quantum">Quantum Threat</Link>
<Link href="/inspector">File Inspector</Link>
```

---

## Important Requirements

1. **All encryption happens client-side** — Server never sees plaintext
2. **Real file operations** — Use actual `@dragbin/crypto` package
3. **Download verification** — Let users download stored data to verify encryption
4. **Performance stats** — Show real encryption time, overhead, file sizes
5. **Educational tooltips** — Explain Kyber, AES-GCM, Argon2id, post-quantum
6. **Responsive** — Works on desktop and tablet (demos need space)
7. **Dark mode** — Support both modes per `prompt.xml`
8. **Cool animations** — Use Framer Motion for smooth transitions

---

## Crypto Helper Library

Create `src/lib/crypto.ts` as a wrapper:

```typescript
import {
  generateKeyPair as generateKyberKeyPair,
  encryptFile,
  decryptFile as decryptDragbinFile,
  encryptPrivateKey as encryptDragbinPrivateKey,
  decryptPrivateKey as decryptDragbinPrivateKey,
  generateSalt,
} from '@dragbin/crypto';

// Convert File to Uint8Array
export function fileToUint8Array(file: File): Promise<Uint8Array> {
  return file.arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

// Convert Uint8Array to File
export function uint8ArrayToFile(data: Uint8Array, filename: string, mimeType: string): File {
  return new File([data], filename, { type: mimeType });
}

// Encrypt file with public key
export async function encryptUserFile(file: File, publicKey: Uint8Array): Promise<{
  encryptedData: Uint8Array;
  encryptionTime: number;
}> {
  const start = performance.now();
  const data = await fileToUint8Array(file);
  const { encryptedData } = await encryptFile(data, publicKey);
  const encryptionTime = performance.now() - start;
  return { encryptedData, encryptionTime };
}

// Decrypt file with password and encrypted private key
export async function decryptUserFile(
  encryptedData: Uint8Array,
  password: string,
  encryptedPrivateKey: Uint8Array,
  salt: Uint8Array,
  iv: Uint8Array,
): Promise<{ decryptedData: Uint8Array; decryptionTime: number }> {
  const start = performance.now();
  const decryptedData = await decryptDragbinFile(
    encryptedData,
    password,
    encryptedPrivateKey,
    salt,
    iv,
  );
  const decryptionTime = performance.now() - start;
  return { decryptedData, decryptionTime };
}

// Generate key pair
export async function generateKeys(): Promise<{
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  generationTime: number;
}> {
  const start = performance.now();
  const { publicKey, privateKey } = await generateKyberKeyPair();
  const generationTime = performance.now() - start;
  return { publicKey, privateKey, generationTime };
}

// Encrypt private key with password
export async function protectPrivateKey(
  privateKey: Uint8Array,
  password: string,
): Promise<{ encryptedPrivateKey: Uint8Array; salt: Uint8Array; iv: Uint8Array }> {
  return encryptDragbinPrivateKey(privateKey, password);
}

// Decrypt private key with password
export async function unprotectPrivateKey(
  encryptedPrivateKey: Uint8Array,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array,
): Promise<Uint8Array> {
  return decryptDragbinPrivateKey(encryptedPrivateKey, password, salt, iv);
}

// Parse encrypted file structure
export function parseEncryptedFile(data: Uint8Array): {
  header: { version: string; kyberEncryptedSessionKey: Uint8Array };
  chunks: Array<{ offset: number; iv: Uint8Array; length: number; encryptedData: Uint8Array }>;
} {
  const headerSize = 10 * 1024;
  const headerText = new TextDecoder().decode(data.slice(0, headerSize));
  const headerMatch = headerText.match(/"kyberEncryptedSessionKey":"([^"]+)"/);
  const versionMatch = headerText.match(/"version":"([^"]+)"/);

  const chunks = [];
  let offset = headerSize;

  while (offset < data.length) {
    const iv = data.slice(offset, offset + 12);
    const length = new DataView(data.buffer, offset + 12, 4).getUint32(0, true);
    const encryptedData = data.slice(offset + 16, offset + 16 + length);

    chunks.push({ offset, iv, length, encryptedData });
    offset += 16 + length;
  }

  return {
    header: {
      version: versionMatch?.[1] || 'unknown',
      kyberEncryptedSessionKey: new TextEncoder().encode(headerMatch?.[1] || ''),
    },
    chunks,
  };
}

// Format bytes to human-readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format hex view
export function formatHexView(data: Uint8Array, offset: number = 0, bytesPerLine: number = 16): string[] {
  const lines: string[] = [];
  for (let i = 0; i < data.length; i += bytesPerLine) {
    const lineBytes = data.slice(i, i + bytesPerLine);
    const hex = Array.from(lineBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(lineBytes).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    const address = (offset + i).toString(16).padStart(8, '0');
    lines.push(`${address}  ${hex.padEnd(bytesPerLine * 3 - 1)}  |${ascii}|`);
  }
  return lines;
}
```

---

## Deliverables

1. Next.js 14 app with App Router structure
2. Four demo pages as specified
3. Shared components (ServerView, FileUpload, HexViewer, EncryptionFlow)
4. Zustand store for state management
5. Fully functional integration with `@dragbin/crypto` (local package)
6. Responsive, accessible UI following `prompt.xml` style guide
7. Cool Framer Motion animations

---

## Before You Start

1. Read `prompt.xml` for the complete design system
2. Dont care about installing the package, just use the functions directly from the library, i will install it
3. Review the `@dragbin/crypto` API section above
4. Plan your component structure
5. Ask clarifying questions if needed
6. Thinking about deploying to vercel so make sure we make it a way that is suitable for that
7. There will be a homepage that will have like cards for each demo and user can pick which demo to use

---

**Please confirm you understand the requirements and proceed with building. Focus on making it visually impressive and highly educational — this will demonstrate post-quantum encryption to potential users and investors.**
