import { toast } from "@/hooks/use-toast";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const useTextAutoCorrect = () => {
  return useMutation({
    mutationFn: async (text: string) => {
      const response = await serverAxios.post(`/refine/findings-text/`, {
        text,
      });
      return response.data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to auto correct text",
        variant: "destructive",
      });
    },
  });
};
