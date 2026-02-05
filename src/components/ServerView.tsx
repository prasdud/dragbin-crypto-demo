"use client";

import React from 'react';
import { useDemoStore } from '@/stores/demo-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileLock, Key, Download } from 'lucide-react';
import { formatBytes } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ServerView() {
    const { serverFiles, serverKeys, downloadFile } = useDemoStore();

    return (
        <div className="h-full border-l border-border bg-card/50 backdrop-blur-md w-[350px] flex flex-col fixed right-0 top-0 bottom-0 z-50 transform translate-x-full lg:translate-x-0 transition-transform duration-300 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border bg-background/90 z-10">
                <h2 className="font-sans text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Server State
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-1">
          // ZERO-KNOWLEDGE STORAGE
                </p>
            </div>

            <ScrollArea className="flex-1 p-4 space-y-6">
                {/* Keys Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                        <Key className="w-4 h-4" /> Stored Keys
                    </h3>
                    <div className="space-y-3">
                        {serverKeys.length === 0 ? (
                            <div className="text-xs text-muted-foreground/50 italic border border-dashed border-border p-3 text-center">
                                No keys stored yet
                            </div>
                        ) : (
                            serverKeys.map((key) => (
                                <Card key={key.id} className="bg-background/40 hover:bg-background/60 transition-colors border-l-2 border-l-secondary cyber-chamfer-sm">
                                    <div className="p-3">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-mono text-xs text-secondary font-bold uppercase">{key.type === 'public' ? 'Public Key' : 'Encrypted Private Key'}</span>
                                            <Badge variant="outline" className="text-[10px] h-4 border-secondary/50 text-secondary">
                                                {formatBytes(key.data.length)}
                                            </Badge>
                                        </div>
                                        <div className="font-mono text-[10px] text-muted-foreground truncate">
                                            ID: {key.id}
                                        </div>
                                        {key.type === 'private' && (
                                            <div className="mt-2 text-[10px] bg-destructive/10 text-destructive p-1 border border-destructive/20 font-bold text-center">
                                                LOCKED (Requires Password)
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Files Section */}
                <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                        <FileLock className="w-4 h-4" /> Encrypted Files
                    </h3>
                    <div className="space-y-3">
                        {serverFiles.length === 0 ? (
                            <div className="text-xs text-muted-foreground/50 italic border border-dashed border-border p-3 text-center">
                                No files uploaded
                            </div>
                        ) : (
                            serverFiles.map((file) => (
                                <Card key={file.id} className="bg-background/40 hover:bg-background/60 transition-colors border-l-2 border-l-primary cyber-chamfer-sm group">
                                    <div className="p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-mono text-xs font-bold text-foreground truncate max-w-[150px]" title={file.name}>
                                                {file.name}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] h-4 border-primary/50 text-primary">
                                                {formatBytes(file.size)}
                                            </Badge>
                                        </div>
                                        <div className="font-mono text-[10px] text-muted-foreground mb-2">
                                            Ext: {file.name.split('.').pop()?.toUpperCase() || 'BIN'}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full h-7 text-xs border-dashed opacity-50 group-hover:opacity-100 transition-opacity"
                                            onClick={() => downloadFile(file.id)}
                                        >
                                            <Download className="w-3 h-3 mr-2" />
                                            Download Blob
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background/90 text-[10px] font-mono text-muted-foreground text-center">
                SYSTEM: ONLINE<br />
                SERVER CANNOT READ DATA
            </div>
        </div>
    );
}
