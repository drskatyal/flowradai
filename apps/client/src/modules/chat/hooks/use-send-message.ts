import { useState } from "react";
import { MyMessage } from "@/interfaces";
import { ThreadResponse } from "@/modules/thread/hooks";
import { CommandType, useStore } from "@/stores";
import { transformMessages } from "@/utils";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useMessage } from "./use-messages";
import { ExtendedUserPublicMetadata } from "@/modules/home/navbar";

export const useSendMessage = (threadId: string) => {
  const addMessage = useStore((state) => state.addMessage);
  const setMessages = useStore((state) => state.setMessages);
  const setIsRunning = useStore((state) => state.setIsRunning);

  const { getToken } = useAuth();
  const { user: clerckUser } = useUser();

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const thread = useStore((state) => state.thread);
  const setThread = useStore((state) => state.setThread);
  const threads = useStore((state) => state.threads);
  const setThreads = useStore((state) => state.setThreads);
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  // Get current threadId from store to ensure we always use the latest value
  const currentThreadId = useStore((state) => state.threadId);

  const {
    refetchMessages,
    isSuccess,
    messages: updatedMessages,
  } = useMessage(threadId || currentThreadId || "");

  const handleThreadUpdate = (activeThreadId: string) => {
    const updatedThreads = threads?.map((thread) =>
      thread.threadId === activeThreadId ? { ...thread, status: "regular" } : thread
    );
    setThreads(updatedThreads);
    setThread({ ...thread, status: "regular" } as ThreadResponse);
  };

  let fullText = "";

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      messages,
      commandType = CommandType.REGULAR,
      template = null,
      customInstructions = null,
      document,
      isApplyChange = false
    }: {
      messages: MyMessage[];
      commandType?: CommandType;
      template?: object | null;
      customInstructions?: string | null;
      document?: object | null;
      isApplyChange?: boolean;
    }) => {
      // Read threadId directly from store at call time to get latest value
      const storeState = useStore.getState();
      const activeThreadId = storeState.threadId || threadId;
      
      if (!activeThreadId) {
        throw new Error("Thread ID is required. Please create a thread first.");
      }

          const controller = new AbortController();
          setAbortController(controller);

          const currentThread = storeState.thread;
          const currentUser = storeState.user;
          
          if (currentThread?.status === "new") {
            handleThreadUpdate(activeThreadId);
            if (currentUser?.availableCredits !== undefined) {
              if ((clerckUser?.publicMetadata as ExtendedUserPublicMetadata).payment?.planType === "regular") {
                storeState.setUser({ availableCredits: currentUser.availableCredits - 1 });
              }
            }
          }

          const token = await getToken({ template: "auth" });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/message`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
              },
              body: JSON.stringify({
                messages,
                threadId: activeThreadId,
                commandType,
                template,
                customInstructions,
                document,
                isApplyChange
              }),
              signal: controller.signal,
            }
          );

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      if (!reader) throw new Error("No reader available");

      while (true) {
        setIsRunning(false);
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        fullText += new TextDecoder().decode(value);

        setMessages((prevMessages: MyMessage[]) => {
          // Will be used to edit the last assistant message
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.role === "assistant") {
            return [
              ...prevMessages.slice(0, -1),
              { role: "assistant", content: fullText },
            ];
          }
          return [...prevMessages, { role: "assistant", content: fullText }];
        });
      }
    },
    onSuccess: async () => {
      await refetchMessages();
      if (isSuccess && !!updatedMessages?.length) {
        setMessages(transformMessages(updatedMessages));
      }
    },
    onError: (error: Error) => {
      console.error("Send message error:", error);
      if (error.toString().includes("AbortError")) {
        addMessage({ role: "assistant", content: fullText });
      } else if (error.message.includes("Thread ID is required")) {
        addMessage({
          role: "assistant",
          content: "Please wait while we create a thread for you, then try again.",
        });
      } else {
        addMessage({
          role: "assistant",
          content: "Failed to send message. Please try again.",
        });
      }
    },

    onSettled: () => {
      setIsRunning(false);
    },
  });

  const sendAssistantMessage = async (
    messages: MyMessage[],
    commandType: CommandType = CommandType.REGULAR,
    template: object | null = null,
    customInstructions: string | null = null,
    document: object | null = null,
    isApplyChange?: boolean
  ) => {
    setIsRunning(true);
    sendMessageMutation.mutate({
      messages,
      commandType,
      template,
      customInstructions,
      document,
      isApplyChange
    });
  };

  const cancelMessage = () => {
    abortController?.abort();
    setIsRunning(false);
    return Promise.resolve();
  };

  return {
    sendAssistantMessage,
    cancelMessage,
    isLoading: sendMessageMutation.isPending,
  };
};
