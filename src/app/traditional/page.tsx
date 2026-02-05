"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { EncryptionFlow, EncryptionStep } from '@/components/EncryptionFlow';
import { ServerView } from '@/components/ServerView';
import { ArrowLeft, Lock, Unlock, Cloud, Shield } from 'lucide-react';
import { useDemoStore } from '@/stores/demo-store';
import { formatBytes } from '@/lib/crypto';
import { AnimatePresence, motion } from 'framer-motion';

export default function TraditionalDemo() {
    const { uploadFile, generateUserKeys, userKeyPair } = useDemoStore();
    const [traditionalFile, setTraditionalFile] = useState<File | null>(null);
    const [dragbinFile, setDragbinFile] = useState<File | null>(null);
    const [dragbinStep, setDragbinStep] = useState(-1);
    const [traditionalStep, setTraditionalStep] = useState(-1);

    const handleTraditionalUpload = async (file: File) => {
        setTraditionalFile(file);
        setTraditionalStep(0);
        // Simulate upload delay
        setTimeout(() => {
            uploadFile(file, 'AES-256'); // Storing as 'plaintext' effectively for the demo store simulation (though stored encrypted under the hood for consistency, but labeled as traditional)
            setTraditionalStep(1);
        }, 1500);
    };

    const handleDragbinUpload = async (file: File) => {
        setDragbinFile(file);

        // Flow:
        // 1. Generate Keys (if needed)
        // 2. Encrypt File
        // 3. Upload

        if (!userKeyPair) {
            setDragbinStep(0); // Generating Keys
            await generateUserKeys();
        }

        setDragbinStep(1); // Encrypting

        // Artificial delay for visual effect
        setTimeout(async () => {
            setDragbinStep(2); // Uploading
            await uploadFile(file, 'Kyber-1024');
            setTimeout(() => setDragbinStep(3), 800); // Done
        }, 1500);
    };

    const traditionalSteps: EncryptionStep[] = [
        { label: 'Upload', icon: 'cloud' },
        { label: 'Stored (Plaintext)', icon: 'file' }
    ];

    const dragbinSteps: EncryptionStep[] = [
        { label: 'Generate Keys', icon: 'key' },
        { label: 'Encrypt (Client)', icon: 'lock' },
        { label: 'Upload', icon: 'cloud' },
        { label: 'Stored (Zero-Knowledge)', icon: 'check' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground relative flex flex-col">
            {/* Nav */}
            <div className="p-4 border-b border-border flex items-center bg-background/80 backdrop-blur z-20">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                </Link>
                <span className="ml-4 font-mono text-sm text-muted-foreground uppercase">/ Demos / Traditional vs Dragbin</span>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden lg:pr-[350px]">
                {/* Left: Traditional */}
                <div className="flex-1 border-b lg:border-b-0 lg:border-r border-border p-8 bg-background relative flex flex-col">
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-blue-400">Traditional Cloud</h2>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">GOOGLE DRIVE / DROPBOX</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-8">
                        <Card className="bg-blue-500/5 border-blue-500/20">
                            <CardContent className="pt-6">
                                {!traditionalFile ? (
                                    <div className="text-center py-10">
                                        <p className="font-mono text-sm text-muted-foreground mb-4">What happens when you upload here?</p>
                                        <FileUpload
                                            onUpload={handleTraditionalUpload}
                                            label="Upload File"
                                            className="group-hover:border-blue-500 group-hover:bg-blue-500/10"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-md">
                                            <FileIcon className="w-8 h-8 text-blue-400" />
                                            <div>
                                                <p className="font-bold text-sm">{traditionalFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatBytes(traditionalFile.size)}</p>
                                            </div>
                                        </div>
                                        <EncryptionFlow steps={traditionalSteps} currentStep={traditionalStep} className="border-blue-500/20" />

                                        {traditionalStep >= 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-destructive/10 border border-destructive/50 p-4 rounded-md text-destructive text-sm font-mono"
                                            >
                                                <p className="font-bold flex items-center gap-2 uppercase"><Unlock className="w-4 h-4" /> Security Analysis</p>
                                                <ul className="mt-2 list-disc list-inside space-y-1 text-xs opacity-80">
                                                    <li>Server CAN read this file</li>
                                                    <li>Data is indexed for AI training</li>
                                                    <li>Encryption keys owned by provider</li>
                                                    <li>Vulnerable to server-side breaches</li>
                                                </ul>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right: Dragbin */}
                <div className="flex-1 p-8 bg-background relative flex flex-col">
                    <div className="mb-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 neon-glow">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-primary neon-text-shadow">Dragbin Cloud</h2>
                        <p className="text-xs text-muted-foreground mt-2 font-mono">ZERO-KNOWLEDGE ARCHITECTURE</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-8">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                {!dragbinFile ? (
                                    <div className="text-center py-10">
                                        <p className="font-mono text-sm text-muted-foreground mb-4">What happens when you upload here?</p>
                                        <FileUpload
                                            onUpload={handleDragbinUpload}
                                            label="Upload File"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-md">
                                            <FileIcon className="w-8 h-8 text-primary" />
                                            <div>
                                                <p className="font-bold text-sm">{dragbinFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatBytes(dragbinFile.size)}</p>
                                            </div>
                                        </div>
                                        <EncryptionFlow steps={dragbinSteps} currentStep={dragbinStep} />

                                        {dragbinStep >= 3 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-primary/10 border border-primary/50 p-4 rounded-md text-primary text-sm font-mono"
                                            >
                                                <p className="font-bold flex items-center gap-2 uppercase"><Lock className="w-4 h-4" /> Security Analysis</p>
                                                <ul className="mt-2 list-disc list-inside space-y-1 text-xs opacity-80">
                                                    <li>Server receives encrypted blob only</li>
                                                    <li>Keys generated on YOUR device</li>
                                                    <li>Post-quantum secure (Kyber-1024)</li>
                                                    <li>Cannot be indexed or read by server</li>
                                                </ul>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ServerView />
        </div>
    );
}

function FileIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    )
}
