import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ThreadResponse } from "./use-threads";

export interface EditThreadPayload {
  name?: string;
  status?: "regular" | "archived" | "new" | "deleted";
}

export const useEditThread = (
  threadId: string,
  onSuccess?: (data?: any) => void
) => {
  const { toast } = useToast();

  const mutation = useMutation<ThreadResponse, Error, EditThreadPayload>({
    mutationFn: async (thread) => {
      const { data } = await serverAxios.put(`/thread/${threadId}`, {
        ...thread,
      });
      return data;
    },

    onSuccess: (data) => {
      toast({
        title: "Report Updated",
        description: "Your report has been updated successfully.",
      });
      if (onSuccess) onSuccess(data);
    },

    onError: (error) => {
      toast({
        title: "Failed to Update Report",
        description:
          "We encountered an issue updating your report. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    thread: mutation.data,
    editThread: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
