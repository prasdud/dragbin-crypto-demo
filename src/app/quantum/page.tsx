"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ServerView } from '@/components/ServerView';
import { ArrowLeft, Cpu, ShieldAlert, ShieldCheck, Hourglass, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function QuantumDemo() {
    const [qubits, setQubits] = useState([5000000]); // 5 million qubits default
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationComplete, setSimulationComplete] = useState(false);

    // Constants (Simulated values based on research papers)
    const RSA_BREAK_QUBITS = 20000000; // ~20M noisy qubits for RSA-2048
    const ECC_BREAK_QUBITS = 10000000; // ~10M noisy qubits for ECC-256

    // Calculate break times based on qubits
    const getBreakTime = (algo: 'RSA' | 'ECC' | 'AES' | 'Kyber') => {
        const q = qubits[0];

        if (algo === 'RSA') {
            if (q < RSA_BREAK_QUBITS / 100) return "> 1 Trillion Years";
            if (q < RSA_BREAK_QUBITS / 10) return "1,000 Years";
            if (q < RSA_BREAK_QUBITS) return "10 Years";
            return "8 Hours";
        }
        if (algo === 'ECC') {
            if (q < ECC_BREAK_QUBITS / 100) return "> 1 Trillion Years";
            if (q < ECC_BREAK_QUBITS / 10) return "500 Years";
            if (q < ECC_BREAK_QUBITS) return "5 Years";
            return "4 Hours";
        }
        if (algo === 'AES') {
            // Grover's algo: AES-256 -> 128 bit security. Still safe.
            return "> 1 Trillion Years";
        }
        if (algo === 'Kyber') {
            // Post-quantum secure
            return "∞ (Secure)";
        }
        return "Unknown";
    };

    const isBroken = (algo: 'RSA' | 'ECC') => {
        const time = getBreakTime(algo);
        return time.includes("Hours") || time.includes("Years") && !time.includes("Trillion");
    };

    const handleSimulate = () => {
        setIsSimulating(true);
        setSimulationComplete(false);
        setTimeout(() => {
            setIsSimulating(false);
            setSimulationComplete(true);
        }, 2000);
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
                <span className="ml-4 font-mono text-sm text-muted-foreground uppercase">/ Demos / Quantum Threat Simulator</span>
            </div>

            <div className="flex-1 flex overflow-hidden lg:pr-[350px]">
                <div className="container mx-auto p-8 max-w-6xl">
                    <header className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4 neon-glow" style={{ color: 'var(--accent)' }}>
                            <Cpu className="w-8 h-8 animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-widest text-accent neon-text-shadow" style={{ color: 'var(--accent)' }}>Quantum Apocalypse</h1>
                        <p className="text-muted-foreground mt-4 font-mono max-w-2xl mx-auto">
                            Simulate how future quantum computers will break today's standard encryption.
                            <br /><span className="text-xs opacity-70">(Based on Shor's Algorithm running on fault-tolerant qubits)</span>
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-3 bg-card/30 border border-border p-8 rounded-xl cyber-chamfer">
                            <h3 className="font-bold uppercase mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" /> Quantum Power (Noisy Qubits)
                            </h3>
                            <Slider
                                defaultValue={[5000000]}
                                max={50000000}
                                min={100}
                                step={100000}
                                value={qubits}
                                onValueChange={setQubits}
                                className="mb-8"
                            />
                            <div className="flex justify-between font-mono text-xs text-muted-foreground uppercase">
                                <span>Today (100+)</span>
                                <span className={qubits[0] > 10000000 ? "text-primary font-bold" : ""}>Future (10M+)</span>
                                <span className={qubits[0] > 40000000 ? "text-destructive font-bold" : ""}>Far Future (50M+)</span>
                            </div>
                            <div className="text-center mt-4">
                                <span className="text-4xl font-black font-sans text-foreground">
                                    {(qubits[0] / 1000000).toFixed(1)} Million
                                </span>
                                <span className="text-sm text-muted-foreground ml-2 uppercase font-mono">Qubits</span>
                            </div>
                        </div>

                        {/* Algorithm Cards */}
                        {[
                            { name: 'RSA-2048', type: 'Legacy', desc: 'Standard Web Encryption', time: getBreakTime('RSA') },
                            { name: 'ECC-256', type: 'Legacy', desc: 'Bitcoin / Mobile Security', time: getBreakTime('ECC') },
                            { name: 'Kyber-1024', type: 'Next-Gen', desc: 'Dragbin / Post-Quantum', time: getBreakTime('Kyber') }
                        ].map((algo) => {
                            const isBrokenNow = (algo.time.includes("Hours") || (algo.time.includes("Years") && !algo.time.includes("Trillion")));
                            const isSecure = algo.time.includes("Secure") || algo.time.includes("Trillion");

                            return (
                                <Card key={algo.name} className={`relative overflow-hidden transition-all duration-500 ${isBrokenNow ? 'border-destructive/50 bg-destructive/5' : isSecure ? 'border-primary/50 bg-primary/5' : ''}`}>
                                    <CardContent className="p-6 flex flex-col items-center text-center h-full justify-between">
                                        <div>
                                            <div className="flex justify-center mb-4">
                                                {isSecure ? (
                                                    <ShieldCheck className="w-12 h-12 text-primary neon-glow" />
                                                ) : (
                                                    <ShieldAlert className={`w-12 h-12 ${isBrokenNow ? 'text-destructive animate-pulse' : 'text-yellow-500'}`} />
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-bold uppercase tracking-wider mb-1">{algo.name}</h3>
                                            <Badge variant="outline" className="mb-4 text-[10px]">{algo.type}</Badge>
                                            <p className="text-xs text-muted-foreground font-mono mb-6">{algo.desc}</p>
                                        </div>

                                        <div className="w-full bg-background/50 p-4 rounded border border-border">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Time to Break</div>
                                            <div className={`text-xl font-bold font-mono ${isBrokenNow ? 'text-destructive' : isSecure ? 'text-primary' : 'text-foreground'}`}>
                                                {algo.time}
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Overlay Effect for Broken */}
                                    {isBrokenNow && (
                                        <div className="absolute inset-0 bg-destructive/10 pointer-events-none scanlines" />
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-xl font-bold uppercase">The Math Behind the Panic</h2>
                        <p className="text-sm text-muted-foreground">
                            Shor's Algorithm allows quantum computers to factor large prime numbers exponentially faster than classical computers.
                            This breaks RSA and ECC, the foundation of the current internet.
                        </p>
                        <p className="text-sm text-primary">
                            Kyber (Lattice-based cryptography) relies on math problems that are hard even for quantum computers.
                        </p>
                    </div>
                </div>
            </div>

            <ServerView />
        </div>
    );
}
