// Types
export interface EncryptedFileMetadata {
    header: {
        version: string;
        kyberEncryptedSessionKey: Uint8Array;
    };
    chunks: Array<{
        offset: number;
        iv: Uint8Array;
        length: number;
        encryptedData: Uint8Array;
    }>;
}

// Convert File to Uint8Array
export function fileToUint8Array(file: File): Promise<Uint8Array> {
    return file.arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

// Convert Uint8Array to File
export function uint8ArrayToFile(data: Uint8Array, filename: string, mimeType: string): File {
    return new File([data as unknown as BlobPart], filename, { type: mimeType });
}

// Encrypt file with public key
export async function encryptUserFile(file: File, publicKey: Uint8Array): Promise<{
    encryptedData: Uint8Array;
    encryptionTime: number;
}> {
    const { encryptFile } = await import('@dragbin/crypto');
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
    const { decryptFile: decryptDragbinFile } = await import('@dragbin/crypto');
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
    const { generateKeyPair: generateKyberKeyPair } = await import('@dragbin/crypto');
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
    const { encryptPrivateKey: encryptDragbinPrivateKey } = await import('@dragbin/crypto');
    return encryptDragbinPrivateKey(privateKey, password);
}

// Decrypt private key with password
export async function unprotectPrivateKey(
    encryptedPrivateKey: Uint8Array,
    password: string,
    salt: Uint8Array,
    iv: Uint8Array,
): Promise<Uint8Array> {
    const { decryptPrivateKey: decryptDragbinPrivateKey } = await import('@dragbin/crypto');
    return decryptDragbinPrivateKey(encryptedPrivateKey, password, salt, iv);
}

// Parse encrypted file structure
export function parseEncryptedFile(data: Uint8Array): EncryptedFileMetadata {
    const headerSize = 10 * 1024;
    const headerText = new TextDecoder().decode(data.slice(0, headerSize));

    // Extract specific fields using regex or assumption of JSON structure if applicable
    // Per README: Metadata Header (10KB) contains kyberEncryptedSessionKey (base64)
    // Assuming the header is a JSON string padded with null bytes

    // Find the end of usage data (first null byte or end of valid JSON)
    // A simple heuristic: look for the last '}'
    const lastBrace = headerText.lastIndexOf('}');
    const jsonString = headerText.substring(0, lastBrace + 1);

    let headerObj: any = {};
    try {
        headerObj = JSON.parse(jsonString);
    } catch (e) {
        console.warn("Failed to parse header JSON", e);
    }

    const chunks: EncryptedFileMetadata['chunks'] = [];
    let offset = headerSize;

    while (offset < data.length) {
        // Ensure we have enough bytes for header (16 bytes: 12 IV + 4 Length)
        if (offset + 16 > data.length) break;

        const iv = data.slice(offset, offset + 12);
        const length = new DataView(data.buffer, data.byteOffset + offset + 12, 4).getUint32(0, true);

        // Ensure we have enough bytes for the chunk data
        if (offset + 16 + length > data.length) break;

        const encryptedData = data.slice(offset + 16, offset + 16 + length);

        chunks.push({ offset, iv, length, encryptedData });
        offset += 16 + length;
    }

    const versionMatch = headerText.match(/"version":"([^"]+)"/);
    // The header likely contains base64 encoded strings

    return {
        header: {
            version: headerObj.version || '1.0',
            kyberEncryptedSessionKey: new TextEncoder().encode(headerObj.kyberEncryptedSessionKey || ''),
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
