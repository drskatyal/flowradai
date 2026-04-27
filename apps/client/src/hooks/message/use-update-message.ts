import { MyMessage } from "@/interfaces";
import { serverAxios } from "@/lib/axios";
import { useMessage } from "@/modules/chat/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../use-toast";

export const useUpdateMessage = (threadId: string) => {
  const queryClient = useQueryClient();

  const { refetchMessages } = useMessage(threadId);
  return useMutation({
    mutationFn: async (message: MyMessage) => {
      const response = await serverAxios.put(
        `/message/${message?.id}`,
        message
      );
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      refetchMessages();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update message",
        variant: "destructive",
      });
    },
  });
};
