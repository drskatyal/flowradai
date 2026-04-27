"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useWebSearchPrompt } from "./use-web-search-prompt";
import { useToast } from "@/hooks/use-toast";

const WebSearchPrompt = () => {
    const { prompt, isLoading, updatePrompt, isUpdating } = useWebSearchPrompt();
    const { toast } = useToast();
    const [promptText, setPromptText] = useState("");

    // Update local state when prompt data is loaded
    useEffect(() => {
        if (prompt?.prompt) {
            setPromptText(prompt.prompt);
        }
    }, [prompt]);



    const handleSave = () => {
        if (!promptText.trim()) {
            toast({
                title: "Validation Error",
                description: "Prompt cannot be empty",
                variant: "destructive",
            });
            return;
        }

        if (promptText.length > 5000) {
            toast({
                title: "Validation Error",
                description: "Prompt is too long (maximum 5000 characters)",
                variant: "destructive",
            });
            return;
        }

        updatePrompt(promptText);
    };



    const characterCount = promptText.length;
    const isModified = promptText !== prompt?.prompt;

    return (
        <div className="container py-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Web Search Prompt Configuration</h1>
                <p className="text-muted-foreground mt-2">
                    Configure the prompt used for web search queries. This prompt guides the AI in how to search and respond to user queries.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Prompt</CardTitle>
                    <CardDescription>
                        Customize the prompt that will be used when performing web searches. The prompt should guide the AI to provide relevant and accurate results.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="prompt">Prompt Text</Label>
                                <Textarea
                                    id="prompt"
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                    placeholder="Enter the web search prompt..."
                                    rows={8}
                                    className="resize-none font-mono text-sm"
                                    disabled={isUpdating}
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {characterCount} / 5000 characters
                                    </span>
                                    {isModified && (
                                        <span className="text-amber-600 dark:text-amber-500">
                                            Unsaved changes
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleSave}
                                    disabled={isUpdating || !isModified || !promptText.trim()}
                                >
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Prompt
                                </Button>

                            </div>

                            {prompt && (
                                <div className="rounded-md bg-muted p-4 mt-4">
                                    <div className="text-sm">
                                        <span className="font-medium">Last Updated: </span>
                                        <span className="text-muted-foreground">
                                            {new Date(prompt.updatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default WebSearchPrompt;
