"use client";
import { FC, useRef } from "react";
import { MarkdownText } from "@/components/ui/assistant-ui/markdown-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { copyText } from "@/helper/copy-text";
import { useReportExport } from "@/hooks";
import { MessagePrimitive, useMessage } from "@assistant-ui/react";
import MyAssistantActionBar from "./my-assistant-action-bar";
import { useStore } from "@/stores";
import { Badge } from "@/components/ui/badge";

const MyAssistantMessage: FC = () => {
  const { addMessage, messages, setIsRunning } = useStore();
  const messageRef = useRef<HTMLDivElement>(null);

  const { mutate: exportReport } = useReportExport();

  const messageId = crypto.randomUUID();

  const handleCopyRichText = () => {
    if (messageRef.current) {
      copyText(messageRef.current);
    }
  };

  const message = useMessage();
  const isApplyChange = messages.find((msg) => msg.id === message.id)?.isApplyChange;
  return (
    <MessagePrimitive.Root className={`relative grid w-full max-w-2xl grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4
      ${isApplyChange ? "border-2 rounded-md p-4 shadow-[0_0_10px_2px_rgba(251,191,36,0.7)] relative" : ""}
    `}>
      <Avatar className="col-start-1 row-span-full row-start-1 mr-2 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6">
        <AvatarImage src="/Flowrad logo.png" height={18} width={18} />
        <AvatarFallback>F</AvatarFallback>
      </Avatar>
      <div className="absolute top-3 right-2">
        {isApplyChange && <Badge variant={"secondary"}>Updated Report</Badge>}
      </div>
      <div
        className="text-foreground col-span-2 col-start-2 row-start-1 sm:my-1.5 lg:my-0 max-w-xl break-words leading-7"
        data-message-id={messageId}
        ref={messageRef}
        id="markDownRichText"
      >
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
      <MyAssistantActionBar
        messageId={messageId}
        onCopy={handleCopyRichText}
        onDownload={() => exportReport(messageRef)}
      />
    </MessagePrimitive.Root>
  );
};

export default MyAssistantMessage;
