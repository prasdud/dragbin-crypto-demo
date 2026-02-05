export interface StoredFile {
    id: string;
    name: string;
    size: number;
    type: string;
    encryptedData: Uint8Array;
    timestamp: number;
}

export interface StoredKey {
    id: string;
    type: 'public' | 'private';
    data: Uint8Array; // For public key, this is the key. For private, it's the EncryptedPrivateKey structure.
    iv?: Uint8Array; // For private key
    salt?: Uint8Array; // For private key
}

export type EncryptionMethod = 'AES-256' | 'RSA-2048' | 'ECC-256' | 'Kyber-1024';

export interface DragbinEncryptedFile {
    encryptedData: Uint8Array;
    kyberEncryptedSessionKey: Uint8Array;
}
