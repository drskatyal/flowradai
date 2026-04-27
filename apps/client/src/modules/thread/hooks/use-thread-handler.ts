import { Thread, useStore } from "@/stores/use-store";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useCreateThread } from "./use-create-thread";
import { useThread } from "./use-thread";
import { useThreads } from "./use-threads";
import { useDeleteThread } from "./use-delete-thread";
import { useUser } from "@clerk/nextjs";

export const useThreadHandler = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isFloatingRoute = pathname?.startsWith("/floating");

  const { threads, refetchThreads } = useThreads();
  const { isLoaded, isSignedIn } = useUser();
  
  const setThreads = useStore((state) => state.setThreads);
  const setThreadId = useStore((state) => state.setThreadId);
  const setThread = useStore((state) => state.setThread);
  const user = useStore((state) => state.user);

  const currentThreadId = Array.isArray(params.threadId)
    ? params.threadId[0]
    : params.threadId;

  const { thread, refetch: refetchThread } = useThread(currentThreadId);

  const {deleteThread} = useDeleteThread(currentThreadId);

  // When thread data changes or user changes, update the thread in store
  useEffect(() => {
    if (thread) setThread(thread);
  }, [thread, setThread]);

  // When thread ID changes in URL, update the threadId in store
  useEffect(() => {
    setThreadId(currentThreadId);
    
    // If we have a threadId, refetch the thread data to ensure fresh state
    if (currentThreadId) {
      refetchThread();
    }
  }, [currentThreadId, refetchThread, setThreadId]);

  // Refetch threads when user changes
  useEffect(() => {
    if (user?._id) {
      refetchThreads();
    }
  }, [user?._id, refetchThreads, isSignedIn, isLoaded]);

  // Process threads data for the store
  const initialThreads = useMemo(() => {
    if (!threads || !Array.isArray(threads)) return [];

    return threads
      .map((thread) => ({
        threadId: thread?.threadId,
        state: thread?.status,
        title: thread?.name,
      }))
      .reverse();
  }, [threads]);

  // Update threads in the store
  useEffect(() => {
    if (initialThreads.length > 0) {
      setThreads(initialThreads as Thread[]);
    }
  }, [initialThreads, setThreads]);

  // Create a new thread and add it to the store
  const { createThread } = useCreateThread((threadData) => {
    const threadExists = initialThreads.some(
      (thread) => thread.threadId === threadData?.threadId
    );

    if (!threadExists && threadData) {
      setThreads([
        {
          threadId: threadData.threadId,
          state: threadData.status,
          title: threadData.name,
        },
        ...(initialThreads || []),
      ]);
    }

    switchToThread(threadData?.threadId);
  });

  const switchToNewThread = (): Promise<void> =>
    new Promise<void>((resolve) => {
      resolve(createThread());
    });

  const switchToThread = (threadId: string) => {
    // When operating inside the floating window route, do not navigate to the main app
    if (!isFloatingRoute) {
      router.push(`/thread/${threadId}`);
    }
    setThreadId(threadId);
    // In floating route there is no [threadId] param, so ensure store has a fresh 'new' thread
    if (isFloatingRoute) {
      setThread({
        userId: "",
        threadId,
        name: "New session",
        status: "new",
        maxAllowedMessage: 6,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: threadId,
      } as any);
    }
  };

    // 🔑 Local delete function
    const deleteThreadFromStore = (threadId: string) => {
      setThreads((prevThreads: Thread[]) =>
        prevThreads.filter((t) => t.threadId !== threadId)
      );
    };
  
    // 🔑 Delete thread and handle navigation
    const handleDeleteThread = async (threadId: string) => {
      try {
        deleteThread(); // your backend API
        deleteThreadFromStore(threadId);
  
        if (currentThreadId === threadId) {
          switchToNewThread();
        }
  
        // optional background sync
        refetchThreads();
      } catch (err) {
        console.error("Failed to delete thread:", err);
      }
    };

  return {
    switchToNewThread,
    switchToThread,
    handleDeleteThread,
    initialThreads,
  };
};
