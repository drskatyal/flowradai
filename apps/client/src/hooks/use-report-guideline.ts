import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { useAuth } from "@clerk/nextjs";

interface ReportGuidelineInput {
  findings: string;
}

export const useReportGuideline = () => {
  const [streamText, setStreamText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoadning] = useState(false);
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ findings }: ReportGuidelineInput) => {
      setStreamText('');
      const token = await getToken({ template: "auth" });
      setIsLoadning(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guideline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ findings }),
      });

      if (!response.body) throw new Error("No streaming body!");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";
      while (true) {
        setIsLoadning(false);
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamText((prev) => prev + chunk);
      }
      setIsComplete(true);
    },

    onSuccess() {
      toast({
        title: "Guideline Retrieved",
        description: "The report guideline was generated successfully.",
        variant: "default",
      });
    },

    onError(error: any) {
      console.error("Guideline request failed:", error);
      toast({
        title: "Guideline Retrieval Failed",
        description: error?.message || "Something went wrong while fetching the guideline.",
        variant: "destructive",
      });
    },
  });

  return {
    handleGuideline: mutation.mutate,
    error: mutation.error,
    streamGuideline: streamText,
    isStreamComplete: isComplete,
    isLoading,
  };
};
