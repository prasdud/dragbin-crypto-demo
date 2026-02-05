"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Lock, FileText, CloudUpload, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface EncryptionStep {
    label: string;
    icon: 'key' | 'lock' | 'file' | 'cloud' | 'check';
    duration?: number;
}

interface EncryptionFlowProps {
    steps: EncryptionStep[];
    currentStep: number; // 0-indexed, -1 for not started
    onComplete?: () => void;
    className?: string;
}

export function EncryptionFlow({ steps, currentStep, onComplete, className }: EncryptionFlowProps) {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (currentStep >= steps.length && onComplete) {
            onComplete();
        }
    }, [currentStep, steps.length, onComplete]);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'key': return <KeyRound className="h-6 w-6" />;
            case 'lock': return <Lock className="h-6 w-6" />;
            case 'file': return <FileText className="h-6 w-6" />;
            case 'cloud': return <CloudUpload className="h-6 w-6" />;
            case 'check': return <CheckCircle2 className="h-6 w-6" />;
            default: return <FileText className="h-6 w-6" />;
        }
    };

    return (
        <Card className={cn("p-6 relative overflow-hidden bg-background/50 backdrop-blur-sm border-primary/20", className)}>
            <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 text-sm">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div key={index} className="flex flex-col items-center gap-2 relative w-full md:w-auto">
                            {/* Connecting Line (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 left-[60%] w-[calc(100%-20%)] h-[2px] bg-muted overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary neon-glow"
                                        initial={{ width: "0%" }}
                                        animate={{ width: isCompleted ? "100%" : "0%" }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                </div>
                            )}

                            <motion.div
                                className={cn(
                                    "p-3 rounded-full border-2 transition-colors duration-300 z-10",
                                    isActive ? "border-primary text-primary neon-glow bg-background" :
                                        isCompleted ? "border-primary text-primary-foreground bg-primary" :
                                            "border-muted text-muted-foreground bg-background"
                                )}
                                initial={{ scale: 0.8, opacity: 0.5 }}
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    opacity: 1,
                                    borderColor: isCompleted || isActive ? "var(--primary)" : "var(--muted)"
                                }}
                            >
                                {getIcon(step.icon)}
                            </motion.div>

                            <motion.span
                                className={cn(
                                    "font-mono text-xs uppercase tracking-wider text-center max-w-[100px]",
                                    isActive ? "text-primary font-bold text-shadow-neon" :
                                        isCompleted ? "text-primary/70" :
                                            "text-muted-foreground"
                                )}
                                animate={{ opacity: isPending ? 0.5 : 1 }}
                            >
                                {step.label}
                            </motion.span>

                            {isActive && (
                                <motion.div
                                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl -z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
