"use client";
import { useMessageHandler, useUserHandler } from "@/hooks";
import { useThreadHandler } from "@/modules/thread/hooks";
import { useStore } from "@/stores";
import { convertMessage } from "@/utils";
import {
  AppendMessage,
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

const RuntimeProvider = ({ children }: { children: ReactNode }) => {
  const threadId = useStore((state) => state.threadId);
  const threads = useStore((state) => state.threads);
  const messages = useStore((state) => state.messages);
  const isRunning = useStore((state) => state.isRunning);
  const addMessage = useStore((state) => state.addMessage);

  const { isLoaded, isSignedIn, user, isUserLoading } = useUserHandler();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOnboarding =
    isLoaded && isSignedIn && !isUserLoading && (!user || user?.status === "onboarding");

  useEffect(() => {
    if (isOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isOnboarding, pathname, router]);

  const { switchToNewThread, switchToThread } = useThreadHandler();

  const { sendAssistantMessage, cancelMessage } = useMessageHandler();

  const onNewMessage = async (message: AppendMessage) => {
    if (message.content[0]?.type !== "text") {
      return;
    }

    const input = message.content[0].text;

    addMessage({ role: "user", content: input });

    await sendAssistantMessage([...messages, { role: "user", content: input }]);
  };

  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew: onNewMessage,
    onCancel: cancelMessage,
    adapters: {
      threadList: {
        onSwitchToNewThread: switchToNewThread,
        onSwitchToThread: (threadId) => {
          switchToThread(threadId);
        },
        threadId: threadId || "",
        threads: threads as any,
      },
    },
  });

  return <AssistantRuntimeProvider runtime={runtime} children={children} />;
};

export default RuntimeProvider;
