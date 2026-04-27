"use client";
import { Loader2Icon } from "lucide-react";
import { useStore } from "@/stores";
// import MessageEditor from "../thread/thread-conversation/message-editor";
import { useTab } from "../thread/thread-conversation/hooks";
import { useThreadContext } from "@/providers/thread-provider";
import MessageEditor from "./editor/editor";

export const FloatingOutput = () => {
  const { isMessageLoading, messages, threadId } = useStore();
  const { activeTab, setActiveTab } = useTab({ messages, threadId });
  const { setLiveTranscript } = useThreadContext();

  return (
    <div className="flex-1 min-h-0">
      <MessageEditor />
    </div>
  );
};