"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDesktopView } from "@/hooks";
import { Sidebar } from "@/modules/sidebar";
import { ThreadProvider, VoiceCommandProvider } from "@/providers";
import { useStore } from "@/stores/use-store";
import { useUser } from "@clerk/nextjs";
import { MyThread } from "./thread-conversation";
import ThreadNavbar from "./thread-navbar";
import { Loader2 } from "lucide-react";
import { useSidebar } from "@/providers/sidebar-provider";

const Thread = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const threadId = useStore((state) => state?.threadId);
  const threads = useStore((state) => state.threads);
  const user = useStore((state) => state.user);

  const isOnboarding = user?.status === "onboarding" && isLoaded && isSignedIn;

  const lastActiveThread = threads?.[0]?.threadId;

  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      router.replace("/auth/sign-in");
    }
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    if (!threadId && threads && lastActiveThread && !isOnboarding) {
      router.replace(`/thread/${lastActiveThread}`);
    }
  }, [threads]);

  const { isDesktopView } = useDesktopView();

  const { isSidebar } = useSidebar();

  // useEffect(() => {
  //   if (user && (user.status === 'active') && threads && (threads.length === 1 && threads[0].state === 'new' && messages?.length < 1)) {
  //     handleTour();
  //   }
  // }, [user, threads, messages]);

  if (!isLoaded || (!isSignedIn && isLoaded)) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-spin">
        <Loader2 />
      </div>
    );
  }
  return (
    <ThreadProvider>
      <VoiceCommandProvider>
        <section className="flex min-h-screen">
          {isDesktopView ? (
            <ResizablePanelGroup
              key={isSidebar ? "expanded" : "collapsed"}
              direction="horizontal"
              className="transition-all duration-700 ease-in-out"
            >
              <ResizablePanel
                defaultSize={isSidebar ? 20 : 5}
                minSize={5}
                maxSize={25}
                collapsedSize={5}
                collapsible
                className="transition-[flex-basis] duration-700 ease-in-out"
              >
                <Sidebar />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={isSidebar ? 80 : 95}>
                <div className="flex flex-col flex-1 h-screen overflow-x-auto">
                  <ThreadNavbar />
                  <MyThread />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <>
              <Sidebar />
              <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <ThreadNavbar />
                <MyThread />
              </div>
            </>
          )}
        </section>
      </VoiceCommandProvider>
    </ThreadProvider>
  );
};

export default Thread;
