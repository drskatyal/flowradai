"use client";

import { GripHorizontal, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { useStore } from "@/stores";

interface FloatingHeaderProps {
    className?: string;
}

export const FloatingHeader = ({ className }: FloatingHeaderProps) => {
    const setThreadId = useStore((state) => state.setThreadId);

    const handleMinimize = () => {
        if (typeof window !== "undefined" && (window as any).electron?.minimizeWindow) {
            (window as any).electron.minimizeWindow();
        }
    };

    const handleClose = () => {
        setThreadId(null);
        if (typeof window !== "undefined" && (window as any).electron?.closeWindow) {
            (window as any).electron.closeWindow();
        } else if (typeof window !== "undefined") {
            window.close();
        }
    };

    return (
        <div className={cn("flex items-center justify-between px-3 py-2 select-none", className)}>
            <div className="flex items-center gap-2 no-drag mr-2">
                <img
                    src="/Flowrad logo.png"
                    alt="flowrad-logo"
                    className="w-5 h-5 rounded-sm"
                />
                <span className="text-sm font-semibold text-white tracking-tight">Flowrad</span>
            </div>

            <div className="flex-1 flex justify-center drag-area !cursor-move !active:cursor-grabbing">
                <div className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <GripHorizontal className="w-5 h-5" />
                </div>
            </div>

            <div className="flex items-center gap-2 no-drag">
                <button
                    onClick={handleMinimize}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                    title="Minimize"
                    type="button"
                >
                    <Minus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </button>
                <button
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-red-500/10 transition-colors group"
                    title="Close"
                    type="button"
                >
                    <X className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                </button>
            </div>
        </div>
    );
};
