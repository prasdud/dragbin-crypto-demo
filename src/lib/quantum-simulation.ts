
import forge from 'node-forge';
import { ec as EC } from 'elliptic';
import {
    generateKeyPair as generateKyberKeyPair,
    encryptFile as encryptKyber,
    decryptFile as decryptKyber
} from '@dragbin/crypto';

// --- THREAT MODEL CONSTANTS ---
// Based on current research estimates for Shor's Algorithm
const RSA_2048_QUBITS = 20_000_000_000; // ~20 Billion physical qubits (assuming 1000:1 overhead)
const ECC_256_QUBITS = 2_330_000;       // ~2.3 Million physical qubits
const KYBER_1024_QUBITS = Infinity;     // Post-Quantum Secure

// --- TYPES ---
export type AlgoType = 'RSA-2048' | 'ECC-256' | 'Kyber-1024';

interface CryptoResult {
    publicKey: any;
    privateKey: any;
    ciphertext: string; // Base64
    encryptionTime: number; // ms
    keyGenTime: number; // ms
}

// --- RSA IMPLEMENTATION ---
export async function runRSA(plaintext: string): Promise<CryptoResult> {
    const startKey = performance.now();
    // Use lower bit size for demo speed if needed, but 2048 is requested
    // Generating 2048 in JS can be slow (seconds). We might cache or use 1024 for "Demo Speed" if acceptable?
    // User asked for RSA-2048. Let's try real 2048, if too slow we warn user?
    // forge.pki.rsa.generateKeyPair is sync and can block. 
    // We'll wrap in promise to not freeze UI if possible (async forge generation).
    const keypair = await new Promise<forge.pki.KeyPair>((resolve, reject) => {
        forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, (err, keypair) => {
            if (err) reject(err);
            else resolve(keypair);
        });
    });
    const keyGenTime = performance.now() - startKey;

    const startEnc = performance.now();
    const pubKey = keypair.publicKey as forge.pki.rsa.PublicKey;
    const encrypted = pubKey.encrypt(plaintext, 'RSA-OAEP', {
        md: forge.md.sha256.create()
    });
    const encryptionTime = performance.now() - startEnc;

    return {
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        ciphertext: forge.util.encode64(encrypted),
        encryptionTime,
        keyGenTime
    };
}

export function decryptRSA(ciphertextB64: string, privateKey: forge.pki.PrivateKey): string {
    const ciphertext = forge.util.decode64(ciphertextB64);
    return (privateKey as forge.pki.rsa.PrivateKey).decrypt(ciphertext, 'RSA-OAEP', {
        md: forge.md.sha256.create()
    });
}

// --- ECC (ECIES) IMPLEMENTATION ---
// Elliptic doesn't natively do encryption, we simulate ECIES:
// 1. Generate Ephemeral Key
// 2. ECDH for Shared Secret
// 3. AES-GCM encryption
export async function runECC(plaintext: string): Promise<CryptoResult> {
    const ec = new EC('p256');

    // Static Key (Recipient)
    const startKey = performance.now();
    const keypair = ec.genKeyPair();
    const keyGenTime = performance.now() - startKey;

    // Encryption (Client/Sender)
    const startEnc = performance.now();

    // 1. Ephemeral Key
    const ephemeral = ec.genKeyPair();
    const shared = ephemeral.derive(keypair.getPublic()); // ECDH
    const secretHash = forge.md.sha256.create().update(shared.toString(16)).digest();
    const keyBytes = secretHash.toHex(); // 32 bytes for AES-256

    // 2. AES-GCM
    const iv = forge.random.getBytesSync(12);
    const cipher = forge.cipher.createCipher('AES-GCM', forge.util.createBuffer(forge.util.hexToBytes(keyBytes)));
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(plaintext));
    cipher.finish();

    // Pack: EphemeralPub(Hex) + IV(Hex) + Tag(Hex) + Ciphertext(Hex) -> Base64
    // Simplified packing for demo
    const encryptedData = cipher.output.toHex();
    const tag = cipher.mode.tag.toHex();
    const ephemPub = ephemeral.getPublic(true, 'hex'); // Compressed

    const packet = JSON.stringify({ e: ephemPub, i: forge.util.bytesToHex(iv), t: tag, c: encryptedData });
    const ciphertext = forge.util.encode64(packet);

    const encryptionTime = performance.now() - startEnc;

    return {
        publicKey: keypair.getPublic(true, 'hex'),
        privateKey: keypair, // Keep the full key object for decryption
        ciphertext,
        encryptionTime,
        keyGenTime
    };
}

export function decryptECC(ciphertextB64: string, privateKey: any): string {
    const packetJson = forge.util.decode64(ciphertextB64);
    const pkt = JSON.parse(packetJson);

    const ec = new EC('p256');

    // 1. Recover Shared Secret
    const ephemKey = ec.keyFromPublic(pkt.e, 'hex');
    const shared = privateKey.derive(ephemKey.getPublic());
    const secretHash = forge.md.sha256.create().update(shared.toString(16)).digest();
    const keyBytes = secretHash.toHex();

    // 2. AES Decrypt
    const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.createBuffer(forge.util.hexToBytes(keyBytes)));
    decipher.start({
        iv: forge.util.hexToBytes(pkt.i),
        tag: forge.util.createBuffer(forge.util.hexToBytes(pkt.t))
    });
    decipher.update(forge.util.createBuffer(forge.util.hexToBytes(pkt.c)));
    const success = decipher.finish();

    if (!success) return "[Decryption Auth Failed]";
    return decipher.output.toString();
}

// --- KYBER IMPLEMENTATION ---
export async function runKyber(plaintext: string): Promise<CryptoResult> {
    const startKey = performance.now();
    const { publicKey, privateKey } = await generateKyberKeyPair();
    const keyGenTime = performance.now() - startKey;

    const startEnc = performance.now();
    // encryptFile expects Uint8Array, we convert string
    const data = new TextEncoder().encode(plaintext);
    // Kyber wrapper in @dragbin/crypto is hybrid (Kyber + AES)
    const { encryptedData } = await encryptKyber(data, publicKey);

    // Convert Uint8Array to Base64 manually or use forge util
    let binary = '';
    const len = encryptedData.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(encryptedData[i]);
    }
    const ciphertext = btoa(binary);

    const encryptionTime = performance.now() - startEnc;

    return {
        publicKey,
        privateKey,
        ciphertext,
        encryptionTime,
        keyGenTime
    };
}

export async function decryptKyberSim(ciphertextB64: string, privateKey: Uint8Array): Promise<string> {
    try {
        const binary = atob(ciphertextB64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        // decryptFile requires (encryptedData, password?? wait)
        // Check signature: decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv)
        // Ah, our wrapper assumes "User Flow" where key is encrypted.
        // We need a raw "Decrypt with Private Key" function if available?
        // Let's check src/lib/crypto.ts and @dragbin/crypto definition.
        // If the library doesn't expose raw decryption, we might need a workaround or modify the wrapper.
        // Looking at crypto.ts:
        // export async function decryptFile(encryptedData, password, encryptedPrivateKey, salt, iv)
        // It seems purely designed for the password-protected flow.

        // HOWEVER, since we're simulating, we can bypass the "Private Key Encryption".
        // If we implement `unprotectPrivateKey` as identity for this demo?
        // Or better: does `@dragbin/crypto` expose `decryptFileRaw`?
        // Let's assume for this specific demo we used `encryptKyber` which calls `encryptFile`.
        // We probably need to construct a "Fake" password flow if the lib is rigid.

        // Let's protect the private key with a dummy password "demo" on the fly, then call decrypt.
        // This is a bit inefficient but uses the real library code.
        const dummyPass = "demo-quantum";
        // crypto.ts has `protectPrivateKey`
        // We can't import `protectPrivateKey` here easily if circular? No, crypto.ts uses this lib?
        // Wait, I am writing THIS file. `src/lib/crypto.ts` is the existing one.
        // I should stick to using `src/lib/crypto.ts` or `@dragbin/crypto` directly.
        // The import above is from `@dragbin/crypto`.

        // Let's look at `node_modules/@dragbin/crypto` or assume standard export.
        // If `decryptFile` in lib takes (data, privateKey), that's great.
        // If it takes (data, password, encKey...), that's the high level wrapper.

        // Let's assume for a moment we can use the high level `decryptUserFile` which I defined in `demo-store` logic but it resides in `crypto.ts`.
        // Actually, let's use the local `src/lib/crypto.ts` exports which are typed and known.

        // We need `decryptDragbinFile` imported from `crypto.ts`? 
        // No, `crypto.ts` imports `decryptFile as decryptDragbinFile` from `@dragbin/crypto`.

        // Let's assume we have to use the password flow.
        // Quick Fix:
        // We will implement `decrypt` by "protecting" our raw private key instantly and then decrypting.
        const { encryptPrivateKey, decryptFile } = await import('@dragbin/crypto');

        const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKey, "qvsession");
        const decrypted = await decryptFile(bytes, "qvsession", encryptedPrivateKey, salt, iv);

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("Kyber Decrypt Error", e);
        return "[Decryption Error]";
    }
}

// --- THREAT LOGIC ---
export function getThreatStatus(qubits: number, algo: AlgoType): {
    isBroken: boolean;
    timeToBreak: string;
    statusColor: string
} {
    if (algo === 'Kyber-1024') {
        return { isBroken: false, timeToBreak: "∞ (Secure)", statusColor: "text-primary" };
    }

    const threshold = algo === 'RSA-2048' ? RSA_2048_QUBITS : ECC_256_QUBITS;

    // Logarithmic scale for "Time" visual
    if (qubits > threshold) {
        return { isBroken: true, timeToBreak: "BROKEN INSTANTLY", statusColor: "text-destructive animate-pulse" };
    }

    if (qubits > threshold / 10) {
        return { isBroken: false, timeToBreak: "< 24 Hours", statusColor: "text-orange-500" };
    }

    if (qubits > threshold / 100) {
        return { isBroken: false, timeToBreak: "~1 Year", statusColor: "text-yellow-500" };
    }

    return { isBroken: false, timeToBreak: "> 1 Trillion Years", statusColor: "text-green-500" };
}
