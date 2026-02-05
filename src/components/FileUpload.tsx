"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
    onUpload: (file: File) => void;
    accept?: string;
    maxSize?: number; // bytes
    label?: string;
    className?: string;
    isUploading?: boolean;
}

export function FileUpload({
    onUpload,
    accept = "*/*",
    maxSize = 100 * 1024 * 1024,
    label = "Drag & drop or click to upload",
    className,
    isUploading = false
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const validateAndUpload = (file: File) => {
        if (file.size > maxSize) {
            alert(`File size too large (max ${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
            return;
        }
        onUpload(file);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div
            className={cn(
                "relative group cursor-pointer transition-all duration-300",
                className
            )}
            onClick={handleFileClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept={accept}
            />

            <div className={cn(
                "border-2 border-dashed rounded-none border-muted cyber-chamfer p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 bg-card/20",
                isDragOver ? "border-primary bg-primary/10 neon-glow" : "group-hover:border-primary/50 group-hover:bg-accent/5",
                isUploading ? "opacity-50 pointer-events-none" : ""
            )}>
                <motion.div
                    animate={isDragOver ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Upload className={cn(
                        "h-12 w-12 transition-colors duration-300",
                        isDragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                </motion.div>

                <div className="text-center space-y-2">
                    <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                        {label}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground/50">
                        MAX SIZE: {(maxSize / 1024 / 1024).toFixed(0)}MB
                    </p>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
}
