/**
 * Type definitions for Argon2 WASM module
 */

export interface Argon2Options {
  password: string;
  salt: string;
  parallelism: number;
  iterations: number;
  memorySize: number;
  hashLength: number;
  outputType: 'hex' | 'binary';
}

export function argon2id(options: Argon2Options): Promise<string>;
