import { useToast } from "@/hooks/use-toast";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ThreadResponse } from "./use-threads";

export const useCreateThread = (onSuccess?: (data?: any) => void) => {
  const { toast } = useToast();

  const mutation = useMutation<ThreadResponse, Error>({
    mutationFn: async () => {
      const { data } = await serverAxios.post("/thread");
      return data;
    },

    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },

    onError: (error: any) => {
      toast({
        title: "Unable to Create Report",
        description:
          error?.response?.data?.message ||
          "We encountered an issue while creating your report. Please try again.",
        variant: "destructive",
      });
    },

    retry: false,
  });

  return {
    threadData: mutation.data,
    createThread: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
