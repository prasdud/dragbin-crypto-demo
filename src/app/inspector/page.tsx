"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { ServerView } from '@/components/ServerView';
import { HexViewer } from '@/components/HexViewer';
import { ArrowLeft, FileSearch, Lock, Unlock, Database, Code, Shield } from 'lucide-react';
import { useDemoStore } from '@/stores/demo-store';
import { parseEncryptedFile, formatBytes, encryptUserFile } from '@/lib/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function InspectorDemo() {
    const { userKeyPair, generateUserKeys, uploadFile } = useDemoStore();
    const [file, setFile] = useState<File | null>(null);
    const [encryptedData, setEncryptedData] = useState<Uint8Array | null>(null);
    const [parsedStructure, setParsedStructure] = useState<any | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null); // 'header' | 'chunk-X'
    const [viewedData, setViewedData] = useState<Uint8Array | null>(null);
    const [passwordInput, setPasswordInput] = useState('');

    const handleProcessFile = async (uploadedFile: File) => {
        setFile(uploadedFile);

        // Ensure keys exist
        let keys = userKeyPair;
        if (!keys) {
            // Just generate them for this demo if missing
            await generateUserKeys();
            // Need to re-fetch from store after update for the next call usually, but we can rely on the action updating it
            // However, `encryptUserFile` expects keys passed in. 
            // Since setState is async in components but store updates are usually synchronous-ish or we can wait.
            // Let's grab it from store again or just wait a tick.
            // Better: generateUserKeys is void promise.
            // We will just wait.
        }

        // We need the keys to encrypt (simulating the generation of an encrypted file to inspect)
        // We can't access `userKeyPair` immediately if we just called generate because of closure staleness in this render.
        // So we should probably just use `useDemoStore.getState().userKeyPair` if we were outside hook, but inside component we rely on hook.
        // For simplicity, we ask user to click "Generate" again if keys were missing, or we assume they exist/are generated.
        // But let's try to proceed.

        // Actually, `uploadFile` handles encryption logic inside the store using the current state.
        // But here we want the raw encrypted bytes to inspect locally.
        const state = useDemoStore.getState();
        let pk = state.userKeyPair?.publicKey;

        if (!pk) {
            await state.generateUserKeys();
            pk = useDemoStore.getState().userKeyPair?.publicKey;
        }

        if (pk) {
            const { encryptedData } = await encryptUserFile(uploadedFile, pk);
            setEncryptedData(encryptedData);

            const structure = parseEncryptedFile(encryptedData);
            setParsedStructure(structure);

            // Auto-upload to server view for consistency
            await uploadFile(uploadedFile, 'Kyber-1024');
        }
    };

    const handleSectionClick = (section: string, data: Uint8Array) => {
        setSelectedSection(section);
        setViewedData(data);
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative flex flex-col">
            {/* Nav */}
            <div className="p-4 border-b border-border flex items-center bg-background/80 backdrop-blur z-20">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                </Link>
                <span className="ml-4 font-mono text-sm text-muted-foreground uppercase">/ Demos / File Inspector</span>
            </div>

            <div className="flex-1 flex overflow-hidden lg:pr-[350px]">
                <div className="container mx-auto p-8 max-w-7xl h-full flex flex-col">
                    <header className="mb-6 flex items-center gap-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive neon-glow" style={{ boxShadow: 'var(--box-shadow-destructive)' }}>
                            <FileSearch className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-widest text-destructive">Encrypted Structure</h1>
                            <p className="text-xs text-muted-foreground font-mono">
                                Visualizing the Dragbin Encrypted File Format (v1.0)
                            </p>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                        {/* Left: Input & Structure Visualizer */}
                        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
                            <Card className="border-destructive/20 bg-destructive/5">
                                <CardContent className="pt-6">
                                    {!file ? (
                                        <FileUpload
                                            onUpload={handleProcessFile}
                                            label="Inspect File"
                                            className="group-hover:border-destructive group-hover:bg-destructive/10"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <p className="font-bold">{file.name}</p>
                                            <p className="text-xs text-muted-foreground mb-4">{formatBytes(file.size)}</p>
                                            <Button variant="outline" size="sm" onClick={() => setFile(null)}>Inspect Another</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {parsedStructure && (
                                <div className="space-y-4">
                                    <h3 className="font-bold uppercase text-xs text-muted-foreground flex items-center gap-2">
                                        <Database className="w-4 h-4" /> File Anatomy
                                    </h3>

                                    {/* Header Block */}
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleSectionClick('header', encryptedData!.slice(0, 10240))}
                                        className={`p-4 rounded border cursor-pointer transition-colors ${selectedSection === 'header' ? 'bg-destructive/20 border-destructive text-destructive' : 'bg-card border-border hover:border-destructive/50'}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm uppercase">Metadata Header</span>
                                            <span className="text-[10px] font-mono opacity-70">10KB</span>
                                        </div>
                                        <div className="text-[10px] font-mono space-y-1 opacity-80">
                                            <div className="flex items-center gap-2"><Lock className="w-3 h-3" /> Kyber Session Key</div>
                                            <div className="flex items-center gap-2"><Code className="w-3 h-3" /> Version: {parsedStructure.header.version}</div>
                                        </div>
                                    </motion.div>

                                    {/* Chunks Visualization */}
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase text-muted-foreground mb-2">Encrypted Chunks ({parsedStructure.chunks.length})</p>
                                        <div className="flex flex-wrap gap-1">
                                            {parsedStructure.chunks.map((chunk: any, i: number) => (
                                                <motion.div
                                                    key={i}
                                                    whileHover={{ scale: 1.1 }}
                                                    onClick={() => handleSectionClick(`chunk-${i}`, chunk.encryptedData)}
                                                    className={`w-3 h-8 rounded-sm cursor-pointer ${selectedSection === `chunk-${i}` ? 'bg-destructive shadow-[0_0_5px_var(--destructive)]' : 'bg-muted hover:bg-destructive/50'}`}
                                                    title={`Chunk ${i}: ${chunk.length} bytes`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Inspector Panel */}
                        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
                            {selectedSection ? (
                                <Card className="flex-1 flex flex-col min-h-0 border-destructive/20 bg-background/50">
                                    <div className="p-4 border-b border-border flex justify-between items-center">
                                        <h3 className="font-bold uppercase text-destructive flex items-center gap-2">
                                            <Code className="w-5 h-5" />
                                            {selectedSection === 'header' ? 'Header Data' : `Chunk Data`}
                                        </h3>
                                        <div className="text-xs font-mono text-muted-foreground">
                                            Offset: {selectedSection === 'header' ? '0' : parsedStructure.chunks[parseInt(selectedSection.split('-')[1])].offset}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        {/* Hex View */}
                                        <div className="flex-1 overflow-auto p-0">
                                            <HexViewer data={viewedData} className="border-0 h-full max-h-none shadow-none" />
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-border bg-muted/20">
                                        <div className="flex gap-4 items-center">
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-1">Attempt Decryption (Simulation)</p>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter Password"
                                                        value={passwordInput}
                                                        onChange={(e) => setPasswordInput(e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                    <Button size="sm" variant="secondary" className="h-8" disabled={!passwordInput}>
                                                        <Unlock className="w-3 h-3 mr-2" /> Decrypt
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-right text-[10px] font-mono text-muted-foreground max-w-[150px]">
                                                Status: <span className="text-primary">ENCRYPTED</span><br />
                                                Algorithm: {selectedSection === 'header' ? 'Kyber-1024' : 'AES-GCM-256'}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl text-muted-foreground">
                                    <div className="text-center">
                                        <FileSearch className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p>Select a section to inspect bits</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ServerView />
        </div>
    );
}
