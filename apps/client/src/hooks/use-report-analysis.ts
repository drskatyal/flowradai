import { useMutation } from "@tanstack/react-query";
import { serverAxios } from "@/lib/axios";
import { toast } from "./use-toast";

interface ReportAnalysis {
    threadId: string;
    errors?: any;
    guideline?: any;
}

/**
 * Hook for creating a report analysis
 */
export const useCreateAnalysis = () => {
    const mutation = useMutation({
        mutationFn: async ({ threadId, errors, guideline }: ReportAnalysis) => {
            const response = await serverAxios.post("/report-analysis", {
                threadId,
                errors,
                guideline,
            });
            return response.data;
        },

        onSuccess: () => {
            toast({
                title: "Analysis saved successfully",
                variant: "default",
            });
        },

        onError: (error: any) => {
            console.error("Error in useCreateAnalysis:", error);
            toast({
                title: "Failed to save analysis",
                description:
                    error?.response?.data?.message || "Something went wrong. Try again.",
                variant: "destructive",
            });
        },
    });

    return {
        handleCreateAnalysis: mutation.mutate,
        handleCreateAnalysisAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
    };
};

/**
 * Hook for fetching a report analysis by threadId
 */
export const useReportAnalysis = () => {
    const mutation = useMutation({
        mutationFn: async ({ threadId }: ReportAnalysis) => {
            const response = await serverAxios.get(`/report-analysis/${threadId}`);
            return response.data;
        },

        onSuccess: () => {
            console.log("Fetched report analysis successfully");
        },

        onError: (error: any) => {
            console.error("Error in useReportAnalysis:", error);
            toast({
                title: "Failed to fetch analysis",
                description:
                    error?.response?.data?.message || "Something went wrong. Try again.",
                variant: "destructive",
            });
        },
    });

    return {
        getReportAnalysis: mutation.mutate,
        getReportAnalysisAsync: mutation.mutateAsync,
        analysis: mutation.data,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
    };
};
