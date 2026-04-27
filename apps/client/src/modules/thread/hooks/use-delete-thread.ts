import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { ThreadResponse } from "./use-threads";

export const useDeleteThread = (
  threadId: string,
  onSuccess?: (data?: any) => void
) => {
  const { toast } = useToast();

  const mutation = useMutation<ThreadResponse, Error>({
    mutationFn: async () => {
      // Soft delete API (PUT or DELETE depending on backend)
      const { data } = await serverAxios.delete(`/thread/${threadId}`);
      return data;
    },

    onSuccess: (data) => {
      toast({
        title: "Report Deleted",
        description: "Your report has been deleted successfully.",
      });
      if (onSuccess) onSuccess(data);
    },

    onError: (error) => {
      toast({
        title: "Failed to Delete Report",
        description:
          "We encountered an issue deleting your report. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    thread: mutation.data,
    deleteThread: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
