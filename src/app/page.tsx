import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, RefreshCw, Cpu, FileSearch } from "lucide-react";
import { ServerView } from "@/components/ServerView";
import { SystemBadge } from "@/components/SystemBadge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 py-12 lg:pr-[380px]"> {/* Right padding for ServerView */}

        {/* Header */}
        <header className="mb-20 text-center relative z-10">
          <SystemBadge />
          <h1 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-widest mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary animate-rgb-shift text-shadow-neon">
            Dragbin Crypto
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
            Post-quantum encryption for the next generation of zero-knowledge cloud storage.
            Protect your data against future threats.
          </p>
        </header>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

          <Link href="/traditional" className="group">
            <Card className="h-full hover:border-primary transition-colors duration-300">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-full border border-primary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:neon-glow">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Traditional vs Dragbin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  See the difference between standard cloud storage and Dragbin's zero-knowledge architecture.
                  Watch what the server actually sees.
                </p>
                <div className="flex items-center text-primary text-sm font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Launch Simulation <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rotation" className="group">
            <Card className="h-full hover:border-secondary transition-colors duration-300">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-full border border-secondary/50 flex items-center justify-center group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors group-hover:neon-glow-secondary">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <CardTitle className="group-hover:text-secondary transition-colors">Password Rotation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Change your password without re-encrypting gigabytes of data.
                  Experience the power of our Key Encapsulation Mechanism.
                </p>
                <div className="flex items-center text-secondary text-sm font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Start Rotation <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quantum" className="group">
            <Card className="h-full hover:border-accent transition-colors duration-300">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-full border border-accent/50 flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors group-hover:neon-glow">
                  <Cpu className="w-6 h-6" />
                </div>
                <CardTitle className="group-hover:text-accent transition-colors">Quantum Threat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Will your data survive the quantum apocalypse?
                  Simulate attacks on RSA, ECC, and Kyber algorithms.
                </p>
                <div className="flex items-center text-accent text-sm font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Run Simulator <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/inspector" className="group">
            <Card className="h-full hover:border-destructive transition-colors duration-300">
              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-full border border-destructive/50 flex items-center justify-center group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors hover:shadow-[0_0_10px_var(--destructive)]">
                  <FileSearch className="w-6 h-6" />
                </div>
                <CardTitle className="group-hover:text-destructive transition-colors">File Inspector</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Peek under the hood. Inspect the custom encrypted file format, metadata headers, and chunk structure.
                </p>
                <div className="flex items-center text-destructive text-sm font-mono uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Open Inspector <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>

      {/* Persistent Server View */}
      <ServerView />
    </div>
  );
}
