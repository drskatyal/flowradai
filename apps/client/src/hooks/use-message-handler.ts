import { useMessage } from "@/modules/chat/hooks";
import { useSendMessage } from "@/modules/chat/hooks/use-send-message";
import { useStore } from "@/stores/use-store";
import { transformMessages } from "@/utils";
import { useEffect } from "react";

export function useMessageHandler() {
  const threadId = useStore((state) => state.threadId) as string;

  const setIsMessageLoading = useStore((state) => state.setIsMessageLoading);
  const setMessages = useStore((state) => state.setMessages);
  const setMessagesError = useStore((state) => state.setMessagesError);

  const { sendAssistantMessage, cancelMessage } = useSendMessage(threadId);

  const {
    messages: previousMessages,
    refetchMessages,
    isLoading,
    isError,
  } = useMessage(threadId);

  // Clear local messages immediately when switching threads to avoid stale display
  useEffect(() => {
    if (threadId) {
      setIsMessageLoading(true);
      setMessages([]);
      setMessagesError(false);
    } else {
      // If no threadId, reset everything
      setIsMessageLoading(false);
      setMessages([]);
      setMessagesError(false);
    }
  }, [threadId, setIsMessageLoading, setMessages, setMessagesError]);

  useEffect(() => {
    if (threadId) refetchMessages();
  }, [threadId, refetchMessages]);

  // Update messages when query data changes (including empty arrays)
  useEffect(() => {
    if (threadId) {
      // Handle both undefined and empty array cases
      // Only update if we have a defined value (even if it's an empty array)
      if (previousMessages !== undefined) {
        const initialMessages = transformMessages(previousMessages);
        setMessages(initialMessages);
      }
      // If query finished loading but no data, ensure we have empty array
      else if (!isLoading && previousMessages === undefined) {
        setMessages([]);
      }
    } else {
      // No threadId means we should clear messages
      setMessages([]);
    }
  }, [previousMessages, threadId, setMessages, isLoading]);

  // Sync loading state from query - only if threadId exists
  useEffect(() => {
    if (threadId) {
      setIsMessageLoading(isLoading);
    } else {
      // No threadId means not loading
      setIsMessageLoading(false);
    }
  }, [isLoading, setIsMessageLoading, threadId]);

  // Sync error state from query
  useEffect(() => {
    setMessagesError(isError);
  }, [isError, setMessagesError]);

  return {
    sendAssistantMessage,
    cancelMessage,
  };
}
