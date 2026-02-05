"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatHexView } from '@/lib/crypto';

interface HexViewerProps {
    data: Uint8Array | null;
    offset?: number;
    className?: string;
    onByteClick?: (byte: number, index: number) => void;
}

export function HexViewer({ data, offset = 0, className, onByteClick }: HexViewerProps) {
    const lines = useMemo(() => {
        if (!data) return [];
        return formatHexView(data, offset);
    }, [data, offset]);

    if (!data || data.length === 0) {
        return (
            <div className={cn("font-mono text-xs text-muted-foreground p-4 border border-dashed border-border text-center", className)}>
                No data
            </div>
        );
    }

    return (
        <div className={cn("font-mono text-xs overflow-auto max-h-[400px] bg-background border border-border p-2 cyber-chamfer shadow-inner", className)}>
            {lines.map((line, i) => (
                <div key={i} className="whitespace-pre hover:bg-accent/10 cursor-default px-1">
                    {line}
                </div>
            ))}
        </div>
    );
}
