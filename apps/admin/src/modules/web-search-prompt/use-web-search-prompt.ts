"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
    fetchActivePrompt,
    updatePrompt,
    WebSearchPrompt,
} from "./web-search-prompt-api";

export const useWebSearchPrompt = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetch active prompt
    const {
        data: prompt,
        isLoading,
        error,
        refetch,
    } = useQuery<WebSearchPrompt>({
        queryKey: ["webSearchPrompt"],
        queryFn: fetchActivePrompt,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Update prompt mutation
    const updatePromptMutation = useMutation({
        mutationFn: (newPrompt: string) => updatePrompt(newPrompt),
        onMutate: async (newPrompt) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["webSearchPrompt"] });

            // Snapshot the previous value
            const previousPrompt = queryClient.getQueryData<WebSearchPrompt>(["webSearchPrompt"]);

            // Optimistically update to the new value
            if (previousPrompt) {
                queryClient.setQueryData<WebSearchPrompt>(["webSearchPrompt"], {
                    ...previousPrompt,
                    prompt: newPrompt,
                });
            }

            // Return a context object with the snapshotted value
            return { previousPrompt };
        },
        onError: (err, newPrompt, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousPrompt) {
                queryClient.setQueryData(["webSearchPrompt"], context.previousPrompt);
            }
            toast({
                title: "Error updating prompt",
                description: err instanceof Error ? err.message : "An error occurred",
                variant: "destructive",
            });
        },
        onSuccess: () => {
            toast({
                title: "Prompt updated",
                description: "Web search prompt updated successfully",
            });
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ["webSearchPrompt"] });
        },
    });

    return {
        prompt,
        isLoading,
        error,
        updatePrompt: updatePromptMutation.mutate,
        isUpdating: updatePromptMutation.isPending,
        refetch,
    };
};
