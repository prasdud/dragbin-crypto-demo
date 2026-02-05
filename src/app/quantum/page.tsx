"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ServerView } from '@/components/ServerView';
import { ArrowLeft, Cpu, ShieldAlert, ShieldCheck, Zap, Lock, Unlock, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { runRSA, runECC, runKyber, decryptRSA, decryptECC, decryptKyberSim, getThreatStatus, AlgoType } from '@/lib/quantum-simulation';

export default function QuantumDemo() {
    const [qubits, setQubits] = useState([5000]); // Start with low qubits
    const [userText, setUserText] = useState("Top Secret Nuclear Codes");

    // State for the 3 algorithms
    const [rsaState, setRsaState] = useState<any>(null);
    const [eccState, setEccState] = useState<any>(null);
    const [kyberState, setKyberState] = useState<any>(null);

    const [isProcessing, setIsProcessing] = useState(false);

    // Initial Encryption
    useEffect(() => {
        handleRunSimulation();
    }, []); // Run once on mount

    const handleRunSimulation = async () => {
        setIsProcessing(true);

        // small delay for UI
        await new Promise(r => setTimeout(r, 100));

        const [rsa, ecc, kyber] = await Promise.all([
            runRSA(userText),
            runECC(userText),
            runKyber(userText)
        ]);

        setRsaState(rsa);
        setEccState(ecc);
        setKyberState(kyber);

        setIsProcessing(false);
    };

    const AlgoCard = ({ algo, data }: { algo: AlgoType, data: any }) => {
        const { isBroken, timeToBreak, statusColor } = getThreatStatus(qubits[0], algo);
        const [decryptedDisplay, setDecryptedDisplay] = useState<string | null>(null);

        // Effect: If broken, actually decrypt!
        useEffect(() => {
            if (isBroken && data && !decryptedDisplay) {
                // Simulate "cracking" delay based on algo?
                const crack = async () => {
                    if (algo === 'RSA-2048') {
                        setDecryptedDisplay(decryptRSA(data.ciphertext, data.privateKey));
                    } else if (algo === 'ECC-256') {
                        setDecryptedDisplay(decryptECC(data.ciphertext, data.privateKey));
                    } else {
                        // Kyber never breaks in this demo
                        setDecryptedDisplay(null);
                    }
                };
                crack();
            } else if (!isBroken) {
                setDecryptedDisplay(null);
            }
        }, [isBroken, data, algo]);

        return (
            <Card className={`relative overflow-hidden transition-all duration-500 h-full flex flex-col ${isBroken ? 'border-destructive/50 bg-destructive/5' : 'border-primary/20 bg-card/50'}`}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                                {algo}
                            </CardTitle>
                            <CardDescription className="font-mono text-[10px] mt-1">
                                {algo === 'Kyber-1024' ? 'LATTICE-BASED KEM' : 'LEGACY PUBLIC KEY'}
                            </CardDescription>
                        </div>
                        {isBroken ? (
                            <ShieldAlert className="w-6 h-6 text-destructive animate-pulse" />
                        ) : (
                            <ShieldCheck className="w-6 h-6 text-primary neon-glow" />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 font-mono text-xs">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground opacity-70">
                        <div>KeyGen: {data?.keyGenTime.toFixed(1)}ms</div>
                        <div>Encrypt: {data?.encryptionTime.toFixed(1)}ms</div>
                    </div>

                    {/* Ciphertext / Plaintext Display */}
                    <div className="flex-1 bg-background/50 p-3 rounded border border-border overflow-hidden relative group">
                        <div className="absolute top-1 right-2 text-[8px] uppercase text-muted-foreground">
                            {isBroken ? "DECRYPTED (CRACKED)" : "ENCRYPTED (SECURE)"}
                        </div>

                        <div className="break-all leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
                            {isBroken && decryptedDisplay ? (
                                <span className="text-destructive font-bold animate-glitch">{decryptedDisplay}</span>
                            ) : (
                                <span className="text-muted-foreground blur-[0.5px] opacity-80">
                                    {data?.ciphertext.substring(0, 150)}...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mt-auto pt-4 border-t border-border">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase text-muted-foreground">Est. Time to Break</span>
                            <span className={`text-sm font-bold ${statusColor}`}>{timeToBreak}</span>
                        </div>
                    </div>
                </CardContent>

                {isBroken && <div className="absolute inset-0 bg-destructive/5 pointer-events-none scanlines mix-blend-overlay" />}
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative flex flex-col">
            <div className="p-4 border-b border-border flex items-center bg-background/80 backdrop-blur z-20">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                </Link>
                <span className="ml-4 font-mono text-sm text-muted-foreground uppercase">/ Demos / Quantum Simulator (Real-Time)</span>
            </div>

            <div className="flex-1 flex overflow-hidden lg:pr-[350px]">
                <div className="container mx-auto p-4 lg:p-8 max-w-7xl overflow-y-auto h-full pb-20">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                        <div className="flex-1">
                            <h1 className="text-3xl font-black uppercase tracking-widest text-accent neon-text-shadow mb-2">Quantum Apocalypse</h1>
                            <p className="text-sm text-muted-foreground max-w-2xl">
                                Simulating Shor's Algorithm against real encryption.
                                We generate actual RSA/ECC/Kyber keys in your browser and verify if they hold up against projected quantum power.
                            </p>
                        </div>

                        {/* Input Control */}
                        <div className="w-full md:w-auto bg-card p-4 rounded-xl border border-border cyber-chamfer min-w-[300px]">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">Target Data</h3>
                            <div className="flex gap-2">
                                <Input
                                    value={userText}
                                    onChange={(e) => setUserText(e.target.value)}
                                    className="h-9 text-xs font-mono"
                                />
                                <Button size="sm" onClick={handleRunSimulation} disabled={isProcessing}>
                                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Slider Section */}
                    {/* Slider Section */}
                    <div className="mb-12 bg-card/30 border border-secondary/20 p-8 rounded-xl cyber-chamfer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Cpu className="w-32 h-32" />
                        </div>

                        <h3 className="font-bold uppercase text-secondary mb-8 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Quantum Computer Power (Physical Qubits)
                        </h3>

                        <Slider
                            defaultValue={[44.4]} // ~1,000 qubits log scale
                            value={[(Math.log10(qubits[0]) - 2) / 9 * 100]}
                            onValueChange={(vals) => {
                                // Formula: qubits = 10 ^ (2 + (sliderVal / 100) * 9)
                                // Range: 10^2 (100) to 10^11 (100B)
                                const sliderVal = vals[0];
                                const logVal = 2 + (sliderVal / 100) * 9;
                                setQubits([Math.pow(10, logVal)]);
                            }}
                            max={100}
                            min={0}
                            step={0.1}
                            className="mb-8 z-10 relative"
                        />

                        <div className="flex justify-between items-end font-mono uppercase z-10 relative">
                            <div className="text-xs text-muted-foreground">
                                Today (Google/IBM)<br />
                                <span className="text-foreground font-bold">~1,000 Qubits</span>
                            </div>

                            <div className="text-center">
                                <span className="text-5xl font-black text-secondary neon-text-shadow-secondary">
                                    {(qubits[0] > 1_000_000_000)
                                        ? `${(qubits[0] / 1_000_000_000).toFixed(1)}B`
                                        : (qubits[0] > 1_000_000)
                                            ? `${(qubits[0] / 1_000_000).toFixed(1)}M`
                                            : (qubits[0] > 1_000)
                                                ? `${(qubits[0] / 1_000).toFixed(1)}k`
                                                : Math.round(qubits[0])
                                    }
                                </span>
                                <span className="block text-xs tracking-widest mt-1">Simulated Qubits</span>
                            </div>

                            <div className="text-xs text-muted-foreground text-right">
                                Future Forecast<br />
                                <span className="text-foreground font-bold">100 Billion+</span>
                            </div>
                        </div>
                    </div>

                    {/* Algorithm Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
                        {rsaState && <AlgoCard algo="RSA-2048" data={rsaState} />}
                        {eccState && <AlgoCard algo="ECC-256" data={eccState} />}
                        {kyberState && <AlgoCard algo="Kyber-1024" data={kyberState} />}
                    </div>
                </div>
            </div>

            <ServerView />
        </div>
    );
}

function RefreshCw({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
}
