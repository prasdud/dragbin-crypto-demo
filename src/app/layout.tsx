import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dragbin Crypto Demo",
  description: "Post-quantum encryption for the next generation of cloud storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${shareTechMono.variable} ${jetbrainsMono.variable} font-mono antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <div className="fixed inset-0 pointer-events-none z-[100] scanlines opacity-30 mix-blend-overlay"></div>
        {children}
      </body>
    </html>
  );
}
