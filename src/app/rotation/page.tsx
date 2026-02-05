"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServerView } from '@/components/ServerView';
import { FileUpload } from '@/components/FileUpload';
import { ArrowLeft, RefreshCw, Key, CheckCircle2, Lock, FileText, AlertTriangle, Download, Upload, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '@/stores/demo-store';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '@/lib/crypto';

export default function RotationDemo() {
    const { userPassword, setUserPassword, rotatePassword, generateUserKeys, userKeyPair, serverFiles, uploadFile, decryptFileContent } = useDemoStore();

    // Local UI State
    const [activeStep, setActiveStep] = useState(1); // 1: Upload, 2: Rotate, 3: Verify

    // Step 1: Upload Vars
    const [demoFile, setDemoFile] = useState<File | null>(null);
    const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

    // Step 2: Rotate Vars
    const [oldPasswordInput, setOldPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [isRotating, setIsRotating] = useState(false);
    const [rotationComplete, setRotationComplete] = useState(false);

    // Step 3: Verify Vars
    const [verifyPassword, setVerifyPassword] = useState('');
    const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Initialize keys if needed
    useEffect(() => {
        if (!userKeyPair) {
            generateUserKeys();
            setUserPassword('password123');
        }
    }, [userKeyPair]);

    const handleDemoUpload = async (file: File) => {
        setDemoFile(file);
        // Force text file for easy verification demonstration, or just accept anything and show success
        // Ideally we want to show the content "Hello World" or similar to prove decryption.
        // If the user uploads a binary, we'll just show "Binary Data Decrypted Successfully".
        const stored = await uploadFile(file, 'Kyber-1024');
        setUploadedFileId(stored.id);
    };

    const handleRotate = async () => {
        setIsRotating(true);
        await new Promise(r => setTimeout(r, 1500)); // Fake delay for drama

        // We expect the user to type the current password to "authorize" the rotation
        // In our simplified store, userPassword is 'password123' by default
        const success = await rotatePassword(oldPasswordInput, newPasswordInput);

        if (success) {
            setRotationComplete(true);
            // Move to next step after a moment
            setTimeout(() => setActiveStep(3), 1000);
        } else {
            alert("Rotation failed. Check your old password.");
        }
        setIsRotating(false);
    };

    const handleVerify = async () => {
        if (!uploadedFileId) return;
        setIsVerifying(true);
        await new Promise(r => setTimeout(r, 1000));

        const content = await decryptFileContent(uploadedFileId, verifyPassword);

        if (content !== null) {
            // If the file was binary, this might look like garbage, but that's fine.
            // Ideally we check if it was our text file.
            setDecryptedContent(content);
        } else {
            alert("Decryption failed! Password incorrect or keys corrupted.");
        }
        setIsVerifying(false);
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
                <span className="ml-4 font-mono text-sm text-muted-foreground uppercase">/ Demos / Password Rotation Flow</span>
            </div>

            <div className="flex-1 flex overflow-hidden lg:pr-[350px]">
                <div className="container mx-auto p-8 max-w-5xl h-full flex flex-col items-center">

                    {/* Progress Stepper */}
                    <div className="flex gap-4 mb-8 w-full max-w-3xl justify-center">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${activeStep === s ? 'border-secondary bg-secondary/10 text-secondary neon-glow-secondary' : activeStep > s ? 'border-primary bg-primary/10 text-primary' : 'border-muted text-muted-foreground'}`}>
                                <span className="font-mono font-bold">{s}</span>
                                <span className="text-xs uppercase">{s === 1 ? 'Upload' : s === 2 ? 'Rotate' : 'Verify'}</span>
                                {activeStep > s && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full max-w-3xl flex-1 relative">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: UPLOAD */}
                            {activeStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="bg-card border border-border p-8 rounded-xl cyber-chamfer"
                                >
                                    <h2 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2 text-primary">
                                        <Upload className="w-6 h-6" /> Upload Verification File
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        Upload a text file (e.g., "secret.txt") containing a message.
                                        We will encrypt it with your <span className="text-foreground font-mono bg-muted/50 px-1 rounded">Current Password</span> keys.
                                    </p>

                                    {!demoFile ? (
                                        <FileUpload onUpload={handleDemoUpload} accept=".txt" label="Drop a text file here" />
                                    ) : (
                                        <div className="text-center space-y-4">
                                            <div className="p-4 bg-muted/20 border border-muted rounded flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-8 h-8 text-primary" />
                                                    <div className="text-left">
                                                        <div className="font-bold">{demoFile.name}</div>
                                                        <div className="text-xs text-muted-foreground">{formatBytes(demoFile.size)}</div>
                                                    </div>
                                                </div>
                                                <div className="text-primary font-mono text-xs uppercase flex items-center gap-2">
                                                    <Lock className="w-3 h-3" /> Encrypted
                                                </div>
                                            </div>
                                            <Button onClick={() => setActiveStep(2)} className="w-full" size="lg">
                                                File Secured. Proceed to Rotation <ArrowLeft className="w-4 h-4 rotate-180 ml-2" />
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 2: ROTATE */}
                            {activeStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="bg-card border border-border p-8 rounded-xl cyber-chamfer"
                                >
                                    <h2 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2 text-secondary">
                                        <RefreshCw className={isRotating ? "animate-spin w-6 h-6" : "w-6 h-6"} /> Rotate Password
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        Change your password. This effectively re-wraps your Private Key.
                                        <br />Your file from Step 1 will <strong>NOT</strong> be touched or re-encrypted.
                                    </p>

                                    <div className="space-y-4 max-w-md mx-auto">
                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded mb-4">
                                            <p className="text-xs text-yellow-500 mb-1 font-bold uppercase">Current State</p>
                                            <p className="text-sm font-mono">Password: {userPassword || 'password123'}</p>
                                        </div>

                                        <Input
                                            type="password"
                                            placeholder="Current Password"
                                            value={oldPasswordInput}
                                            onChange={e => setOldPasswordInput(e.target.value)}
                                        />
                                        <Input
                                            type="password"
                                            placeholder="New Password"
                                            value={newPasswordInput}
                                            onChange={e => setNewPasswordInput(e.target.value)}
                                        />
                                        <Button
                                            variant="secondary"
                                            className="w-full"
                                            onClick={handleRotate}
                                            disabled={isRotating || !oldPasswordInput || !newPasswordInput}
                                        >
                                            {isRotating ? "Re-wrapping Keys..." : "Change Password"}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: VERIFY */}
                            {activeStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="bg-card border border-border p-8 rounded-xl cyber-chamfer"
                                >
                                    <h2 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2 text-accent">
                                        <ShieldCheck className="w-6 h-6" /> Verify Access
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        Now, use your <strong>NEW</strong> password to verify you can still access last session's file.
                                        <br />This proves the underlying keys persisted even though the password changed.
                                    </p>

                                    {!decryptedContent ? (
                                        <div className="space-y-4 max-w-md mx-auto text-center">
                                            <div className="p-4 bg-muted/20 border border-muted rounded flex items-center justify-center gap-3 opacity-70">
                                                <FileText className="w-5 h-5" /> {demoFile?.name || 'secret.txt'}
                                            </div>
                                            <Input
                                                type="password"
                                                placeholder="Enter NEW Password"
                                                value={verifyPassword}
                                                onChange={e => setVerifyPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="default" // accent color ideally
                                                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                                onClick={handleVerify}
                                                disabled={isVerifying || !verifyPassword}
                                            >
                                                {isVerifying ? "Decrypting..." : "Decrypt & Read"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="max-w-md mx-auto text-center space-y-4">
                                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto neon-glow">
                                                <CheckCircle2 className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-xl font-bold text-green-500 uppercase">Decryption Successful</h3>
                                            <div className="p-4 bg-black/50 border border-green-500/30 rounded font-mono text-sm text-left whitespace-pre-wrap h-32 overflow-y-auto custom-scrollbar">
                                                {decryptedContent}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                You accessed a file encrypted with your OLD keys using your NEW password.
                                                <br /><strong>0 Bits of file data were re-encrypted.</strong>
                                            </p>
                                            <Button onClick={() => {
                                                setActiveStep(1);
                                                setDecryptedContent(null);
                                                setDemoFile(null);
                                                setOldPasswordInput('');
                                                setNewPasswordInput('');
                                                setVerifyPassword('');
                                            }} variant="outline">
                                                Reset Demo
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <ServerView />
        </div>
    );
}
