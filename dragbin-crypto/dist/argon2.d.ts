/**
 * Argon2id WASM wrapper for password hashing.
 */
/**
 * Argon2id parameters matching Dragbin's configuration
 */
export declare const ARGON2_PARAMS: {
    /** Number of parallel threads */
    readonly parallelism: 4;
    /** Number of iterations (time cost) */
    readonly iterations: 3;
    /** Memory size in KB (64 MB) */
    readonly memorySize: number;
    /** Output hash length in bytes */
    readonly hashLength: 32;
};
/**
 * Hash a password using Argon2id
 * @param password - Password to hash
 * @param salt - Salt for hashing (16 bytes)
 * @returns 32-byte hash
 *
 * @example
 * ```typescript
 * const salt = generateSalt();
 * const hash = await hashPassword('myPassword', salt);
 * ```
 */
export declare function hashPassword(password: string, salt: Uint8Array): Promise<Uint8Array>;
