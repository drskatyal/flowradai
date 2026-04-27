"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Globe, Loader2, Send, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useWebSearch } from "./hooks/use-web-search";

const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            h1: ({ node, ...props }: any) => (
                <h1
                    className="mt-8 mb-4 text-3xl font-bold tracking-tight"
                    {...props}
                />
            ),
            h2: ({ node, ...props }: any) => (
                <h2
                    className="mt-6 mb-3 text-2xl font-semibold tracking-tight"
                    {...props}
                />
            ),
            h3: ({ node, ...props }: any) => (
                <h3 className="mt-5 mb-2 text-xl font-medium" {...props} />
            ),
            p: ({ node, ...props }: any) => (
                <p
                    className="mb-4 leading-8 text-[17px] whitespace-pre-wrap"
                    {...props}
                />
            ),
            ul: ({ node, ...props }: any) => (
                <ul className="list-disc ml-6 mb-4 space-y-2 text-[17px]" {...props} />
            ),
            ol: ({ node, ...props }: any) => (
                <ol
                    className="list-decimal ml-6 mb-4 space-y-2 text-[17px]"
                    {...props}
                />
            ),
            li: ({ node, ...props }: any) => <li className="leading-8" {...props} />,
            a: ({ node, children, ...props }: any) => {
                const isUrl =
                    typeof children === "string" && children.startsWith("http");
                return (
                    <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                        {isUrl ? (
                            <ExternalLink className="w-4 h-4 mb-0.5" />
                        ) : (
                            <span className="underline underline-offset-4">{children}</span>
                        )}
                    </a>
                );
            },
            blockquote: ({ node, ...props }: any) => (
                <blockquote
                    className="border-l-4 border-primary/30 pl-5 italic text-muted-foreground my-5 text-[17px]"
                    {...props}
                />
            ),
            code: ({ node, ...props }: any) => (
                <code
                    className="bg-background/60 px-2 py-0.5 rounded text-[14px] font-mono"
                    {...props}
                />
            ),
            pre: ({ node, ...props }: any) => (
                <pre
                    className="bg-background/60 rounded-xl p-4 overflow-x-auto my-5 text-[13px] font-mono leading-relaxed shadow-sm"
                    {...props}
                />
            ),
            table: ({ node, ...props }: any) => (
                <div className="overflow-x-auto my-5">
                    <table
                        className="min-w-full text-[16px] border rounded-xl"
                        {...props}
                    />
                </div>
            ),
            th: ({ node, ...props }: any) => (
                <th
                    className="border px-4 py-2.5 bg-muted font-bold text-left"
                    {...props}
                />
            ),
            td: ({ node, ...props }: any) => (
                <td className="border px-4 py-2.5" {...props} />
            ),
        }}
    >
        {content}
    </ReactMarkdown>
);

const AIAvatar = () => (
    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
        <Globe className="w-4 h-4 text-primary-foreground" />
    </div>
);

const MessagePair = ({
    inputText,
    outputText,
    isStreaming,
    onDelete,
}: {
    inputText: string;
    outputText: string;
    isStreaming?: boolean;
    onDelete?: () => void;
}) => (
    <div className="group space-y-6 py-6 border-b border-border/40 last:border-none">
        {/* User bubble — right aligned */}
        <div className="flex justify-end">
            <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-5 py-3.5 text-[16px] leading-7 shadow-sm">
                {inputText}
            </div>
        </div>

        {/* AI response — left aligned */}
        <div className="flex gap-3 items-start">
            <AIAvatar />
            <div className="flex-1 min-w-0">
                {outputText ? (
                    <div className="text-foreground">
                        <MarkdownContent content={outputText} />
                        {isStreaming && (
                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-full" />
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching the web…</span>
                    </div>
                )}
            </div>

            {/* Delete button — only on history items */}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    </div>
);

const WelcomeState = () => (
    <div className="flex flex-col items-center justify-center h-full gap-5 select-none focus:outline-none">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Globe className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center space-y-1">
            <p className="text-xl font-semibold">Web Assist</p>
            <p className="text-sm text-muted-foreground">
                Ask anything — powered by AI web assist.
            </p>
        </div>
    </div>
);

export const WebAssist = () => {
    const {
        searches,
        loading,
        streamingResult,
        isStreaming,
        currentQuery,
        handleWebSearch,
        loadSearches,
        deleteSearch,
    } = useWebSearch();

    const [query, setQuery] = useState("");
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevLengthRef = useRef<number>(0);

    useEffect(() => {
        loadSearches();
    }, [loadSearches]);

    useEffect(() => {
        const currentLength = searches.length;
        const isNewMessage = currentLength > prevLengthRef.current;

        if (isStreaming || streamingResult || isNewMessage) {
            const timeoutId = setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 100);

            prevLengthRef.current = currentLength;
            return () => clearTimeout(timeoutId);
        }
        prevLengthRef.current = currentLength;
    }, [searches.length, streamingResult, isStreaming]);

    const submit = () => {
        const q = query.trim();
        if (!q || isStreaming) return;
        handleWebSearch(q);
        setQuery("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    };

    const displaySearches = [...searches].reverse();
    const showEmpty = !loading && searches.length === 0 && !isStreaming;

    return (
        <div className="flex flex-col h-full w-full">
            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto">
                {loading && searches.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : showEmpty ? (
                    <div className="h-full px-4 py-6">
                        <WelcomeState />
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto px-6 pb-6">
                        {/* History — shown oldest first */}
                        {displaySearches.map((s) => (
                            <MessagePair
                                key={s._id}
                                inputText={s.inputText}
                                outputText={s.outputText}
                                onDelete={() => setItemToDelete(s._id)}
                            />
                        ))}

                        {/* Live streaming message */}
                        {isStreaming && (
                            <MessagePair
                                key="__streaming__"
                                inputText={currentQuery}
                                outputText={streamingResult}
                                isStreaming
                            />
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* ── Input Bar ── */}
            <div className="shrink-0 border-t bg-background/95 backdrop-blur px-4 py-3">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-end gap-2 bg-muted/50 border rounded-2xl px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all shadow-sm">
                        <Textarea
                            ref={textareaRef}
                            value={query}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything…"
                            disabled={isStreaming}
                            rows={1}
                            id="web-search-input"
                            className="flex-1 resize-none border-none bg-transparent shadow-none focus-visible:ring-0 text-sm leading-6 py-1 min-h-[28px] max-h-[160px] placeholder:text-muted-foreground/60"
                        />
                        <Button
                            size="icon"
                            onClick={submit}
                            disabled={!query.trim() || isStreaming}
                            className="shrink-0 h-7 w-7 rounded-lg"
                            id="web-search-submit"
                        >
                            {isStreaming ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground/50 mt-1">
                        Enter to send · Shift+Enter for new line
                    </p>
                </div>
            </div>

            <AlertDialog
                open={!!itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this
                            search from your history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (itemToDelete) {
                                    deleteSearch(itemToDelete);
                                    setItemToDelete(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};