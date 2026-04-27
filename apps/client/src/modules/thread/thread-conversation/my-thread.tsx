"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDesktopView } from "@/hooks/use-desktop-view";
import { PrimitiveInput } from "@/modules/chat";
import { FC, useEffect, useState } from "react";
// import ReportIdForm from "@/modules/chat/report-id-form";
import { useStore } from "@/stores/use-store";
import { ThreadPrimitive } from "@assistant-ui/react";
import { Chat } from "./chat";
import MyComposer from "./my-composer";

interface ThreadMessageInputProps {
  isThreadRegular: boolean;
  isSendMessageDisabled: boolean;
  size: number;
}

const ThreadMessageInput: FC<ThreadMessageInputProps> = ({
  isThreadRegular,
  isSendMessageDisabled,
  size,
}) => {
  return isThreadRegular ? (
    <MyComposer isSendMessageDisabled={isSendMessageDisabled} size={size} />
  ) : (
    <PrimitiveInput isSendMessageDisabled={isSendMessageDisabled} size={size} />
  );
};

export const MyThread: React.FC = () => {
  const {
    thread,
    messagesError,
    isMessageLoading,
    messages,
    isRunning,
    threadId,
  } = useStore();
  const { isDesktopView } = useDesktopView();

  const isThreadRegular = thread?.status === "regular";
  const isSendMessageDisabled = !thread?.threadId || messagesError || isRunning;
  const [size, setSize] = useState<number>(40);

  useEffect(() => {
    const viewport = document.querySelector('[role="log"]');

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, [
    isMessageLoading,
    messages.length,
    messages[messages.length - 1]?.content,
  ]);

  return (
    <ThreadPrimitive.Root className="bg-background grow h-[calc(100vh-56px)] flex flex-col justify-between">
      {isDesktopView ? (
        <ResizablePanelGroup direction="horizontal">
          <div className="flex w-full">
            <ResizablePanel defaultSize={60}>
              <Chat
                key={threadId}
                isMessageLoading={isMessageLoading}
                isDesktopView
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              onResize={(size: number) => setSize(size)}
              defaultSize={40}
              minSize={20}
              maxSize={45}
              className="!overflow-y-auto
                            [&::-webkit-scrollbar]:w-[6px]
                            [&::-webkit-scrollbar-thumb]:bg-gray-400
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-200"
            >
              {/* <ReportIdForm /> */}
              {/* <Separator /> */}
              <ThreadMessageInput
                isThreadRegular={isThreadRegular}
                isSendMessageDisabled={isSendMessageDisabled}
                size={size}
              />
            </ResizablePanel>
          </div>
        </ResizablePanelGroup>
      ) : (
        <div className="grid grid-rows-[1fr_auto] w-full items-center max-h-[calc(100vh-56px)] relative h-full overflow-y-scroll">
          <Chat key={threadId} isMessageLoading={isMessageLoading} />
          <div className="w-full bottom-0 bg-background">
            <ThreadMessageInput
              isThreadRegular={isThreadRegular}
              isSendMessageDisabled={isSendMessageDisabled}
              size={size}
            />
          </div>
        </div>
      )}
    </ThreadPrimitive.Root>
  );
};
export default MyThread;