import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "./use-toast";
import { useStore } from "@/stores"; // import your zustand store
import { transformMessages } from "@/utils"; // optional, if needed
import { useMessage } from "@/modules/chat/hooks"; // optional, for refetching
import { MyMessage } from "@/interfaces";

interface ApplyChangesInput {
  messages: any[];
  message: string;
  threadId: string | null;
}

export const useApplyChanges = (threadId: string) => {
  const { getToken } = useAuth();
  const addMessage = useStore((state) => state.addMessage);
  const setMessages = useStore((state) => state.setMessages);
  const [fullText, setFullText] = useState(""); // track streaming text

  const { refetchMessages, messages: updatedMessages, isSuccess } = useMessage(threadId);
  const setIsRunning = useStore((state) => state.setIsRunning);

  const mutation = useMutation({
    mutationFn: async ({ messages, message, threadId }: ApplyChangesInput) => {
      const token = await getToken({ template: "auth" });
      const controller = new AbortController();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/message/applychanges`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({ messages, message, threadId }),
          signal: controller.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prevMessages: MyMessage[]) => {
        // Will be used to edit the last assistant message
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage?.role === "assistant") {
          return [
            ...prevMessages.slice(0, -1),
            { role: "assistant", content: data.content },
          ];
        }
        return [...prevMessages, { role: "assistant", content: data.content }];
      });

      return data.content;
    },

    onSuccess: async (fullMessage: string) => {
      await refetchMessages();
      if (isSuccess && !!updatedMessages?.length) {
        setMessages(transformMessages(updatedMessages));
      }

      toast({
        title: "Changes Applied",
        description: "The changes were successfully applied to the thread.",
        variant: "default",
      });
    },

    onError(error: any) {
      console.error("Applying changes failed:", error);
      toast({
        title: "Failed to Apply Changes",
        description:
          error?.message || "Something went wrong while applying changes.",
        variant: "destructive",
      });
    },

    onSettled: () => {
      setIsRunning(false);
    },
  });

  return {
    applyChanges: mutation.mutate,
    error: mutation.error,
    appliedResult: fullText, // incremental streaming text
    isChangeLoading: mutation.isPending,
  };
};
