"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const UNLOCK_KEY = "easter-egg-unlocked";
const REQUIRED_CLICKS = 7;

export function SystemBadge() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Visual hint on clicks 5-6: brief magenta flash
    if (newCount >= 5 && newCount < REQUIRED_CLICKS) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 300);
    }

    if (newCount >= REQUIRED_CLICKS) {
      localStorage.setItem(UNLOCK_KEY, Date.now().toString());
      router.push("/easter-egg");
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-block mb-4 px-4 py-1 border border-primary/30 rounded-full bg-primary/5 text-primary text-xs font-mono tracking-widest uppercase animate-pulse cursor-pointer select-none transition-all duration-150 ${
        showHint ? "neon-glow-secondary border-secondary text-secondary" : ""
      }`}
    >
      System Online: Secure
    </div>
  );
}
