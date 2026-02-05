import { create } from 'zustand';
import { StoredFile, StoredKey, EncryptionMethod, DragbinEncryptedFile } from '@/types/demo';
import {
    generateKeys,
    protectPrivateKey,
    encryptUserFile,
    decryptUserFile,
    unprotectPrivateKey,
    EncryptedFileMetadata
} from '@/lib/crypto';

interface DemoStore {
    // Server state (simulated cloud storage)
    serverFiles: StoredFile[];
    serverKeys: StoredKey[];

    // User state (client-side only)
    userKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array } | null;
    userPassword: string | null;
    isGeneratingKeys: boolean;

    // Actions
    setFiles: (files: StoredFile[]) => void;
    setUserPassword: (password: string) => void;

    // Async Actions
    generateUserKeys: () => Promise<void>;
    uploadFile: (file: File, method: EncryptionMethod) => Promise<StoredFile>;
    downloadFile: (fileId: string) => Promise<void>;
    rotatePassword: (oldPass: string, newPass: string) => Promise<boolean>;
    decryptFileContent: (fileId: string, password: string) => Promise<string | null>;
    reset: () => void;
}

export const useDemoStore = create<DemoStore>((set, get) => ({
    serverFiles: [],
    serverKeys: [],
    userKeyPair: null,
    userPassword: null,
    isGeneratingKeys: false,

    setFiles: (files) => set({ serverFiles: files }),
    setUserPassword: (password) => set({ userPassword: password }),

    generateUserKeys: async () => {
        set({ isGeneratingKeys: true });
        try {
            const { publicKey, privateKey } = await generateKeys();
            set({ userKeyPair: { publicKey, privateKey } });

            // Auto-upload public key to "server"
            const publicKeyId = Math.random().toString(36).substring(7);
            set((state) => ({
                serverKeys: [
                    ...state.serverKeys,
                    { id: publicKeyId, type: 'public', data: publicKey }
                ]
            }));
        } catch (error) {
            console.error('Failed to generate keys:', error);
        } finally {
            set({ isGeneratingKeys: false });
        }
    },

    uploadFile: async (file: File, method: EncryptionMethod) => {
        const { userKeyPair, userPassword } = get();

        if (method === 'Kyber-1024') {
            if (!userKeyPair) throw new Error("Keys not generated");

            const { encryptedData } = await encryptUserFile(file, userKeyPair.publicKey);

            const storedFile: StoredFile = {
                id: Math.random().toString(36).substring(7),
                name: file.name,
                size: encryptedData.length, // Encrypted size
                type: file.type,
                encryptedData: encryptedData,
                timestamp: Date.now(),
            };

            set((state) => ({
                serverFiles: [...state.serverFiles, storedFile]
            }));

            return storedFile;
        } else {
            // Mock implementation for other methods for the demo
            // In a real app we'd simulate the others too, or just use plaintext for 'Traditional'
            const buffer = await file.arrayBuffer();
            const data = new Uint8Array(buffer);

            const storedFile: StoredFile = {
                id: Math.random().toString(36).substring(7),
                name: file.name,
                size: data.length,
                type: file.type,
                encryptedData: data,
                timestamp: Date.now(),
            };

            set((state) => ({
                serverFiles: [...state.serverFiles, storedFile]
            }));
            return storedFile;
        }
    },

    downloadFile: async (fileId: string) => {
        // Implementation to trigger browser download of the stored blob
        const file = get().serverFiles.find(f => f.id === fileId);
        if (!file) return;

        const blob = new Blob([file.encryptedData as unknown as BlobPart], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `server_copy_${file.name}.bin`; // explicit binary extension to show it's encrypted
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    rotatePassword: async (oldPass: string, newPass: string) => {
        const { userKeyPair, userPassword } = get();
        if (!userKeyPair) return false;

        // In a real app we'd verify the hash, here we check local string
        if (userPassword && oldPass !== userPassword) {
            console.error("Old password incorrect");
            return false;
        }

        try {
            // 1. Simulating: We have the decrypted private key (userKeyPair.privateKey)
            // 2. We re-encrypt it with the NEW password
            const { encryptedPrivateKey, salt, iv } = await protectPrivateKey(userKeyPair.privateKey, newPass);

            // 3. Update the "Server" with the new encrypted private key
            set((state) => ({
                userPassword: newPass, // Update client sessions
                serverKeys: [
                    ...state.serverKeys.filter(k => k.type !== 'private'),
                    {
                        id: 'my-private-key',
                        type: 'private',
                        data: encryptedPrivateKey,
                        // Storing IV/Salt is critical for decryption, usually part of the wrapper format
                        // For this demo store we will assume the data blob includes them or we store them side-band
                        // Actually, our protectPrivateKey returns them separate.
                        // Let's pack them or store them in the mock object.
                        iv,
                        salt
                    }
                ]
            }));

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // New Action for Verification
    decryptFileContent: async (fileId: string, passwordToCheck: string): Promise<string | null> => {
        const file = get().serverFiles.find(f => f.id === fileId);
        const privateKeyEntry = get().serverKeys.find(k => k.type === 'private');

        if (!file || !privateKeyEntry) {
            console.error("File or Private Key missing");
            return null;
        }

        try {
            // 1. Unlock Private Key with provided password
            // We need to use unprotectPrivateKey
            const unlockedPrivateKey = await unprotectPrivateKey(
                privateKeyEntry.data,
                passwordToCheck,
                privateKeyEntry.salt!, // Assuming we stored these
                privateKeyEntry.iv!
            );

            // 2. Decrypt File
            // We need to parse the file structure to get the per-file IV/SessionKey
            // The `decryptUserFile` helper expects specific args. 
            // However, our `decryptUserFile` implementation in crypto.ts is a bit complex 
            // and expects `encryptedPrivateKey` as arg to do the unlocking internally?
            // Let's check crypto.ts signature:
            // decryptUserFile(encryptedData, password, encryptedPrivateKey, salt, iv)
            // It does the whole chain!

            const { decryptedData } = await decryptUserFile(
                file.encryptedData,
                passwordToCheck,
                privateKeyEntry.data,
                privateKeyEntry.salt!,
                privateKeyEntry.iv!
            );

            return new TextDecoder().decode(decryptedData);
        } catch (e) {
            console.error("Decryption failed:", e);
            return null;
        }
    },

    reset: () => {
        set({
            serverFiles: [],
            serverKeys: [],
            userKeyPair: null,
            userPassword: null,
            isGeneratingKeys: false,
        });
    }
}));
