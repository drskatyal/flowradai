import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

export interface WebSearch {
    _id: string;
    inputText: string;
    outputText: string;
    createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const useWebSearch = () => {
    const { getToken } = useAuth();
    const { toast } = useToast();

    const [searches, setSearches] = useState<WebSearch[]>([]);
    const [loading, setLoading] = useState(false);
    const [streamingResult, setStreamingResult] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentQuery, setCurrentQuery] = useState("");

    const loadSearches = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/web-search`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to load search history");
            const json = await res.json();
            setSearches(json.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const handleWebSearch = async (query: string) => {
        if (!query.trim() || isStreaming) return;

        setIsStreaming(true);
        setStreamingResult("");
        setCurrentQuery(query);

        try {
            const token = await getToken();
            const response = await fetch(`${API_BASE}/web-search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Search failed");
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setStreamingResult(fullText);
            }

            // Refresh history to include the newly saved item
            await loadSearches();
        } catch (error) {
            console.error("Web search error:", error);
            toast({
                variant: "destructive",
                title: "Search Error",
                description:
                    error instanceof Error ? error.message : "Search failed. Try again.",
            });
        } finally {
            setIsStreaming(false);
            setStreamingResult("");
            setCurrentQuery("");
        }
    };

    const deleteSearch = async (id: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/web-search/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to delete search");
            setSearches((prev) => prev.filter((s) => s._id !== id));
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete this search.",
            });
        }
    };

    return {
        searches,
        loading,
        streamingResult,
        isStreaming,
        currentQuery,
        handleWebSearch,
        loadSearches,
        deleteSearch,
    };
};