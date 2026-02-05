# Dragbin Crypto Demo

A high-fidelity demonstration of `@dragbin/crypto` capabilities, featuring a "Cyberpunk/Glitch" aesthetic built with Next.js 14, Tailwind CSS, and Bun.

## Features

### Zero-Knowledge Encryption
-   **Client-Side Security**: Files are encrypted in the browser before ever touching the network.
-   **Kyber-1024 Integration**: Uses Post-Quantum Cryptography (PQC) for key updates.
-   **Structure Visualization**: Includes a Hex/ASCII inspector for the custom binary file format.

### True Password Rotation (KEM)
-   **Zero Re-Encryption**: Change your password (and private key wrapper) without re-encrypting a single byte of stored user files.
-   **Verification Flow**: Explicit Proof-of-Concept demo showing access to "Old Files" with "New Password".

### Real Quantum Threat Simulator
-   **Scientific Model**: Simulates Shor's Algorithm running on a fault-tolerant quantum computer.
-   **Real-Time Hacking**: Generates actual RSA-2048, ECC-256, and Kyber-1024 keys in the browser.
    -   **RSA-2048**: Vulnerable at ~20 Billion Physical Qubits.
    -   **ECC-256**: Vulnerable at ~2.3 Million Physical Qubits.
    -   **Kyber-1024**: Quantum Resistant (∞).
-   **Live Decryption**: When the slider passes the threshold, the app effectively "cracks" the encryption live.

## Setup & Development

This project uses **Bun**.

### 1. Install Dependencies
```bash
bun install
```
*Note: This project includes a local dependency `@dragbin/crypto` in the root `dragbin-crypto` folder.*

### 2. Run Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Production Build
```bash
bun run build
bun start
```

## Tech Stack
-   **Framework**: Next.js 14 (App Router)
-   **Runtime**: Bun
-   **Styling**: Tailwind CSS + Custom Cyberpunk Design System
-   **State Management**: Zustand
-   **Animations**: Framer Motion
-   **Cryptography**: `@dragbin/crypto`, `node-forge`, `elliptic`