#!/usr/bin/env node

/**
 * Extract WASM bundles.
 * This allows us to bundle them directly, achieving zero runtime dependencies.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'wasm');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Extracting WASM bundles...');

try {
  // Extract Kyber WASM
  const kyberPath = require.resolve('kyber-crystals');
  const kyberSource = fs.readFileSync(kyberPath, 'utf8');
  const kyberOutput = path.join(OUTPUT_DIR, 'kyber.wasm.js');

  // Wrap in a module that exports the kyber object
  const kyberWrapper = `// Auto-generated WASM bundle. Do not edit manually.

${kyberSource}

export default kyber;
`;

  fs.writeFileSync(kyberOutput, kyberWrapper);
  console.log('✓ Extracted Kyber WASM to', kyberOutput);

  // Extract Argon2 WASM
  const argon2Path = require.resolve('hash-wasm/dist/argon2.umd.min.js');
  let argon2Source = fs.readFileSync(argon2Path, 'utf8');

  // Transform UMD wrapper: check browser globals BEFORE CommonJS
  // This fixes bundler-injected CommonJS shims taking priority over browser globals
  // Original order: CommonJS → AMD → browser
  // New order: browser globals (globalThis/window/self) → CommonJS → AMD
  argon2Source = argon2Source.replace(
    /"object"==typeof exports&&"undefined"!=typeof module\?I\(exports\):"function"==typeof define&&define\.amd\?define\(\["exports"\],I\):I\(\(A="undefined"!=typeof globalThis\?globalThis:A\|\|self\)\.hashwasm=A\.hashwasm\|\|\{\}\)/g,
    '"undefined"!=typeof globalThis?I((A=globalThis).hashwasm=A.hashwasm||{}):"undefined"!=typeof window?I((A=window).hashwasm=A.hashwasm||{}):"undefined"!=typeof self?I((A=self).hashwasm=A.hashwasm||{}):"object"==typeof exports&&"undefined"!=typeof module?I(exports):"function"==typeof define&&define.amd?define(["exports"],I):I(A={})'
  );

  const argon2Output = path.join(OUTPUT_DIR, 'argon2.wasm.js');

  // Wrap in a module that creates an exports object and re-exports the function
  const argon2Wrapper = `// Auto-generated WASM bundle. Do not edit manually.                                                                                                                                                                 
                                                                                                                                                                                                                                              
  // Force the UMD wrapper to use the correct global object                                                                                                                                                                                   
  const _globalThis = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : self);                                                                                                                       
  ${argon2Source}                                                                                                                                                                                                                             
                                                                                                                                                                                                                                              
  // Get argon2id from the global that hash-wasm populates                                                                                                                                                                                    
  export const argon2id = _globalThis.hashwasm.argon2id;                                                                                                                                                                                      
  `; 

  fs.writeFileSync(argon2Output, argon2Wrapper);
  console.log('✓ Extracted Argon2 WASM to', argon2Output);

  
  console.log('\n✅ WASM extraction complete!');
} catch (error) {
  console.error('❌ Error extracting WASM:', error.message);
  process.exit(1);
}
