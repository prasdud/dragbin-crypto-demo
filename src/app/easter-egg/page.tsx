"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Dna } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const MolecularModel = dynamic(
  () =>
    import("@/components/MolecularModel").then((m) => m.MolecularModel),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center font-mono">
          <div className="text-primary animate-pulse text-sm uppercase tracking-widest">
            Synthesizing Molecule...
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Initializing WebGL Context
          </div>
        </div>
      </div>
    ),
  }
);

const UNLOCK_KEY = "easter-egg-unlocked";

export default function EasterEggPage() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    const unlockTimestamp = localStorage.getItem(UNLOCK_KEY);
    if (unlockTimestamp) {
      setIsUnlocked(true);
      setTimeout(() => setShowModel(true), 500);
    } else {
      setIsUnlocked(false);
    }
  }, []);

  // Loading state while checking localStorage
  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-mono text-xs uppercase tracking-widest">
          Verifying Access...
        </div>
      </div>
    );
  }

  // LOCKED — cyberpunk 404 denial
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-b from-destructive/20 via-transparent to-destructive/20" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10 px-4"
        >
          <div className="w-24 h-24 mx-auto mb-8 border-2 border-destructive/50 flex items-center justify-center cyber-chamfer">
            <Lock className="w-10 h-10 text-destructive animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-6xl font-sans font-black uppercase tracking-widest text-destructive mb-4 animate-glitch">
            Access Denied
          </h1>

          <div className="font-mono text-xs text-muted-foreground space-y-1 mb-8">
            <p>ERROR 0x7F4: CLEARANCE LEVEL INSUFFICIENT</p>
            <p className="text-destructive/60">
              {"//"} Required: Level 7 security handshake
            </p>
            <p className="text-muted-foreground/40">
              {"//"} Hint: Not everything is as it appears on the surface
            </p>
          </div>

          <Link href="/">
            <Button
              variant="outline"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Main Terminal
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // UNLOCKED — full molecular experience
  return (
    <div className="h-screen bg-background text-foreground relative overflow-hidden">
      {/* Nav bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute top-0 left-0 right-0 p-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur z-20"
      >
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <span className="ml-4 font-mono text-sm text-muted-foreground uppercase hidden sm:inline">
            / <span className="text-secondary">CLASSIFIED</span> / Protein
            Synthesis Lab
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-secondary animate-pulse" />
          <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">
            Clearance Level 7
          </span>
        </div>
      </motion.div>

      {/* Header overlay on top of the canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute top-20 left-0 right-0 z-10 text-center pointer-events-none"
      >
        <h1 className="text-3xl md:text-5xl font-sans font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-[#00d4ff] text-shadow-neon">
          Project HELIX
        </h1>
        <p className="text-[10px] md:text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest">
          Synthetic Protein Visualization // CPK Space-Fill Model
        </p>
      </motion.div>

      {/* 3D Canvas — full screen behind overlays */}
      <AnimatePresence>
        {showModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
          >
            <MolecularModel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom HUD overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-0 left-0 right-0 z-10 p-6 pointer-events-none"
      >
        <div className="flex justify-between items-end max-w-4xl mx-auto">
          <div className="font-mono text-[10px] text-muted-foreground/60 space-y-0.5">
            <div>RESIDUES: 100</div>
            <div>ATOMS: ~1200</div>
            <div>MODEL: CPK (VAN DER WAALS)</div>
            <div className="text-primary/40 mt-1">
              {">"} DRAG TO ORBIT // SCROLL TO ZOOM
            </div>
          </div>
          <div className="font-mono text-[10px] text-right space-y-0.5">
            <div className="text-primary">
              C{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-primary ml-1 align-middle" />
            </div>
            <div className="text-[#00d4ff]">
              N{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-[#00d4ff] ml-1 align-middle" />
            </div>
            <div className="text-secondary">
              O{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-secondary ml-1 align-middle" />
            </div>
            <div className="text-[#ffcc00]">
              S{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-[#ffcc00] ml-1 align-middle" />
            </div>
            <div className="text-[#aabbee]">
              H{" "}
              <span className="inline-block w-2 h-2 rounded-full bg-[#aabbee] ml-1 align-middle" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
