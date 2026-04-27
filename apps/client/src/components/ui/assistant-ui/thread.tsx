"use client";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  Loader2Icon,
  SendHorizontalIcon,
} from "lucide-react";
import Link from "next/link";
import { FC, MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { MarkdownText } from "@/components/ui/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { copyText } from "@/helper/copy-text";
import { useDesktopView } from "@/hooks";
import { PrimitiveInput } from "@/modules/chat";
import { useSendMessage } from "@/modules/chat/hooks/use-send-message";
import ReportIdForm from "@/modules/chat/report-id-form";
import { CommandType, useStore } from "@/stores/use-store";
import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useComposerRuntime,
} from "@assistant-ui/react";
import { useUser } from "@clerk/nextjs";
import { Mic, PrimaryMic } from "@/components/customs/mic";
import { Separator } from "../separator";
import { WandSparkles, Rocket, Sparkles } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { useTextAutoCorrect } from "@/modules/chat/hooks/use-text-auto-correct";
import { onTranscrptionArg } from "@/components/customs/mic/hooks/use-mic";
import { useVoiceCommandContext } from "@/providers/voice-command-provider";

export const MyThread: React.FC = () => {
  const { thread, messagesError, isMessageLoading, messages, isRunning } =
    useStore();

  const isThreadRegular = thread?.status === "regular";

  const isSendMessageDisabled = !thread?.threadId || messagesError || isRunning;

  const { isDesktopView } = useDesktopView();

  const [size, setSize] = useState(35)

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
            <ResizablePanel defaultSize={70}>
              <ThreadPrimitive.Viewport
                role="log"
                className="flex flex-col items-center overflow-y-auto scroll-smooth overscroll-contain bg-inherit px-4 lg:pt-2 w-full h-[calc(100vh-56px)]"
              >
                {isMessageLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <Loader2Icon className="animate-spin" />
                  </div>
                ) : (
                  <>
                    <MyThreadWelcome />
                    <ThreadPrimitive.Messages
                      components={{
                        UserMessage: MyUserMessage,
                        EditComposer: MyEditComposer,
                        AssistantMessage: MyAssistantMessage,
                      }}
                    />
                  </>
                )}
              </ThreadPrimitive.Viewport>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel onResize={(size: number) => setSize(size)} defaultSize={35}>
              <ReportIdForm />
              <Separator />
              {isThreadRegular ? (
                <MyComposer isSendMessageDisabled={isSendMessageDisabled} size={size}/>
              ) : (
                <PrimitiveInput isSendMessageDisabled={isSendMessageDisabled} size={size}/>
              )}
            </ResizablePanel>
          </div>
        </ResizablePanelGroup>
      ) : (
        <>
          <ReportIdForm />
          <Separator />
          <ThreadPrimitive.Viewport
            role="log"
            className={`flex flex-col items-center overflow-y-auto scroll-smooth overscroll-contain bg-inherit px-4 pt-8 w-full h-full`}
          >
            <MyThreadWelcome />
            <ThreadPrimitive.Messages
              components={{
                UserMessage: MyUserMessage,
                EditComposer: MyEditComposer,
                AssistantMessage: MyAssistantMessage,
              }}
            />
          </ThreadPrimitive.Viewport>
          {isThreadRegular ? (
            <MyComposer isSendMessageDisabled={isSendMessageDisabled} size={33.33}/>
          ) : (
            <PrimitiveInput isSendMessageDisabled={isSendMessageDisabled} size={33.33}/>
          )}
        </>
      )}
    </ThreadPrimitive.Root>
  );
};

const MyThreadWelcome: FC = () => {
  const { user } = useUser();
  return (
    <ThreadPrimitive.Empty>
      <div className="flex flex-grow flex-col items-center justify-center">
        <p className="mt-4 font-medium text-center max-w-md">
          Welcome {user?.firstName}! Precision and speed at your fingertips -
          start your reporting now!
        </p>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const MyComposer: FC<{
  isSendMessageDisabled: boolean;
  size: number;
}> = ({ isSendMessageDisabled, size }) => {
  const [remainingMessages, setRemainingMessages] = useState(0);
  // Add a state to store the message text
  const [messageText, setMessageText] = useState("");
  // Add state to track cursor position
  const [cursorPosition, setCursorPosition] = useState(0);
  const composerRuntime = useComposerRuntime();
  const {
    messages,
    isMessageLoading,
    thread,
    threads,
    isRunning,
    addMessage,
    threadId,
  } = useStore();

  const isInputDisabled =
    isSendMessageDisabled || remainingMessages <= 0 || messages?.length >= 12;

  const { sendAssistantMessage } = useSendMessage(threadId as string);
  const [autoRefine, setAutoRefine] = useState(false);
  const [isCorrectingFindings, setIsCorrectingFindings] = useState(false);
  const [actionMode, setActionMode] = useState(false);

  const textAutoCorrectMutation = useTextAutoCorrect();

  useEffect(() => {
    if (thread?.maxAllowedMessage) {
      const userMessagesCount = messages.filter(
        (msg) => msg.role === "user"
      ).length;

      setRemainingMessages(
        Math.max(Math.floor(thread?.maxAllowedMessage - userMessagesCount), 0)
      );
    }
  }, [thread, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isInputDisabled) {
      e.preventDefault();
    }
  };

  const handleElaborate = () => {
    if (!messages.length || isSendMessageDisabled) return;

    addMessage({
      role: "user",
      content: "Elaborate",
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: "Elaborate",
        },
      ],
      CommandType.ELABORATE
    );
  };

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    // Store current cursor position when text changes
    setCursorPosition(e.target.selectionStart);
  };

  // Handler for cursor position changes
  const handleCursorPositionChange = (
    e: React.SyntheticEvent<HTMLTextAreaElement>
  ) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  // Add a dedicated function for auto-submission
  const handleAutoSubmission = (text: string) => {
    // Only proceed if action mode is enabled and we have text
    if (actionMode && text.trim() && !isInputDisabled) {
      addMessage({
        role: "user",
        content: text,
      });

      sendAssistantMessage(
        [
          ...messages,
          {
            role: "user",
            content: text,
          },
        ],
        CommandType.REGULAR
      );

      // Clear the input after sending
      setMessageText("");
      composerRuntime.setText("");
    } else {
      console.log("Auto-submission skipped:", {
        actionMode,
        hasText: !!text.trim(),
        isInputDisabled,
      });
    }
  };

  // Handler for transcription complete
  const handleTranscriptionComplete = ({ text }: onTranscrptionArg) => {
    if (text) {
      // Insert text at cursor position instead of appending
      const beforeCursor = messageText.substring(0, cursorPosition);
      const afterCursor = messageText.substring(cursorPosition);
      const newText = beforeCursor + text + afterCursor;

      setMessageText(newText);
      composerRuntime.setText(newText);

      // Update cursor position to end of inserted text
      const newCursorPosition = cursorPosition + text.length;
      setCursorPosition(newCursorPosition);

      // Focus and set cursor position in the textarea
      setTimeout(() => {
        const textarea = document.querySelector(
          "textarea.composer-input"
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);

      // If action mode is enabled, automatically submit the message after transcription
      if (actionMode && text.trim()) {
        // Allow a little time for the transcription to be processed and displayed
        setTimeout(() => {
          handleAutoSubmission(newText);
        }, 500);
      }
    }
  };

  const handleFindingsAutoCorrect = () => {
    setIsCorrectingFindings(true);
    textAutoCorrectMutation.mutate(messageText, {
      onSuccess: (data) => {
        setMessageText(data?.correctedText || "");
        setIsCorrectingFindings(false);
      },
      onError: () => {
        setIsCorrectingFindings(false);
      },
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isInputDisabled || !messageText.trim()) {
      return;
    }

    addMessage({
      role: "user",
      content: messageText,
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: messageText,
        },
      ],
      CommandType.REGULAR
    );
    // Clear the input after sending
    setMessageText("");
    composerRuntime.setText("");
  };

  return (
    <div className="p-4 xl:p-6 !pt-8">
      <ComposerPrimitive.Root
        className="focus-within:border-aui-ring/20 w-full rounded-lg border pt-2.5 px-2.5 shadow-sm transition-colors ease-in items-center max-lg:max-w-2xl mx-auto min-h-14"
        onSubmit={handleSubmit}
      >
        <ComposerPrimitive.Input
          placeholder="Write a message..."
          rows={1}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
          value={messageText}
          onChange={handleInputChange}
          onSelect={handleCursorPositionChange}
          onFocus={handleCursorPositionChange}
          onBlur={handleCursorPositionChange}
          className={`w-full composer-input placeholder:text-muted-foreground min-h-20 max-h-40 flex-grow resize-none border-none bg-transparent text-sm outline-none focus:ring-0 
            ${isInputDisabled ? "pointer-events-none" : ""}`}
        />
        <div className="flex justify-between w-full">
          <div className="flex  justify-end items-center gap-1 max-lg:max-w-2xl">
            <Tooltip
              trigger={
                <Button
                  variant={actionMode ? "default" : "ghost"}
                  type="button"
                  size="sm"
                  onClick={() => setActionMode(!actionMode)}
                  disabled={isInputDisabled}
                  className="border rounded-full !px-2"
                >
                  <Rocket />
                  <span className="hidden min-[426px]:inline lg:hidden 2xl:block">
                    Action Mode
                  </span>
                </Button>
              }
            >
              <p>Action Mode</p>
            </Tooltip>
            <Tooltip
              trigger={
                <Button
                  variant={autoRefine ? "default" : "ghost"}
                  type="button"
                  size="sm"
                  onClick={() => setAutoRefine(!autoRefine)}
                  disabled={isInputDisabled}
                  className="border rounded-full !px-2"
                >
                  <Sparkles />
                  <span className="hidden min-[426px]:inline lg:hidden 2xl:block">
                    Auto Refine
                  </span>
                </Button>
              }
            >
              <p>Auto Refine</p>
            </Tooltip>
            <Tooltip
              trigger={
                <Button
                  onClick={handleFindingsAutoCorrect}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                  isLoading={isCorrectingFindings}
                  disabled={isInputDisabled || !messageText.trim()}
                  type="button"
                >
                  {!isCorrectingFindings && <WandSparkles className="size-4" />}
                </Button>
              }
            >
              AI Text Correction
            </Tooltip>
            {
              autoRefine 
              ? 
              <PrimaryMic 
                key={"auto-refine-" + autoRefine}
                className={
                  isInputDisabled ? "opacity-50 cursor-not-allowed" : ""
                }
                disabled={isInputDisabled}
                onTranscription={handleTranscriptionComplete}
                tooltipLabel="Record Findings"
                autoRefineCheck={autoRefine}
                size={33.33}
              />
              :
              <Mic
                key={"auto-refine-" + autoRefine + "-action-" + actionMode}
                className="mr-2"
                disabled={isInputDisabled}
                onTranscription={handleTranscriptionComplete}
                autoRefineCheck={autoRefine}
                actionMode={actionMode}
                tooltipLabel="Input by voice"
                size={33.33}
              />
            }
          </div>
          <div>
            <ThreadPrimitive.If running={false}>
              <ComposerPrimitive.Send disabled={isInputDisabled} asChild>
                <TooltipIconButton
                  tooltip="Send"
                  variant="default"
                  onClick={handleSubmit}
                  className="my-2.5 size-8 p-2 transition-opacity ease-in"
                >
                  <SendHorizontalIcon />
                </TooltipIconButton>
              </ComposerPrimitive.Send>
            </ThreadPrimitive.If>
            <ThreadPrimitive.If running>
              <ComposerPrimitive.Cancel asChild>
                <TooltipIconButton
                  tooltip="Cancel"
                  variant="default"
                  className="my-2.5 size-6 p-1.5 transition-opacity ease-in"
                >
                  <CircleStopIcon />
                </TooltipIconButton>
              </ComposerPrimitive.Cancel>
            </ThreadPrimitive.If>
          </div>
        </div>
      </ComposerPrimitive.Root>
      {!isMessageLoading && (
        <p className="text-[10px] text-muted-foreground max-lg:max-w-2xl mx-auto">
          {threads?.length === 0 ? (
            <>
              Get started by{" "}
              <Link href="/pricing" className="underline">
                purchasing a report.
              </Link>
            </>
          ) : remainingMessages === 0 ? (
            <>No messages left for this report.</>
          ) : (
            <>
              {remainingMessages} message{remainingMessages === 1 ? "" : "s"}{" "}
              remaining
            </>
          )}
        </p>
      )}
      {!isMessageLoading &&
        remainingMessages > 0 &&
        messages.length > 0 &&
        messages.length < 12 && (
          <div className="max-lg:max-w-2xl mx-auto">
            <Button
              className="text-opacity-75 transition-opacity ease-in cursor-pointer mt-6 py-2 w-full mx-auto text-sm text-left font-medium"
              onClick={handleElaborate}
              type="button"
              disabled={isInputDisabled || isRunning}
            >
              Elaborate
            </Button>
          </div>
        )}
    </div>
  );
};

const MyUserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 py-4">
      <div className="bg-muted text-foreground col-start-2 row-start-1 max-w-xl break-words rounded-3xl px-5 py-2.5">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const MyEditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted my-4 flex w-full max-w-2xl flex-col gap-2 rounded-xl">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none border-none bg-transparent p-4 pb-0 outline-none focus:ring-0" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const MyAssistantMessage: FC = () => {
  const messageId = crypto.randomUUID();
  const messageRef = useRef<HTMLDivElement>(null);

  const handleCopyRichText = () => {
    if (messageRef.current) {
      copyText(messageRef.current);
    }
  };

  return (
    <MessagePrimitive.Root className="relative grid w-full max-w-2xl grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4">
      <Avatar className="col-start-1 row-span-full row-start-1 mr-2 sm:mr-4 w-5 h-5 sm:w-6 sm:h-6">
        <AvatarImage src="/logo.png" height={18} width={18} />
        <AvatarFallback>F</AvatarFallback>
      </Avatar>

      <div
        className="text-foreground col-span-2 col-start-2 row-start-1 sm:my-1.5 max-w-xl break-words leading-7"
        data-message-id={messageId}
        ref={messageRef}
      >
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
      <MyAssistantActionBar messageId={messageId} onCopy={handleCopyRichText} />
    </MessagePrimitive.Root>
  );
};

const MyAssistantActionBar: FC<{
  messageId: string;
  onCopy?: MouseEventHandler<HTMLButtonElement>;
}> = ({ messageId, onCopy }) => {
  const { copyActionRef, downloadActionRef } = useVoiceCommandContext();

  const handleDownload = useCallback(async () => {
    const messageContainer = document.querySelector(
      `div[data-message-id="${messageId}"]`
    );
    const messageElement = messageContainer?.querySelector(
      `div[data-status="complete"]`
    );

    if (!messageElement) return;

    const paragraphs: Paragraph[] = [];

    // Helper function to create styled text
    const createStyledText = (text: string, isBold = false, size = 24) => {
      return new TextRun({
        text: text.trim(),
        size,
        bold: isBold,
      });
    };

    // Process each element
    Array.from(messageElement.children).forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      const text = element.textContent?.trim() || "";

      switch (tagName) {
        case "h1":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text, true, 36)],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            })
          );
          break;

        case "h2":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text, true, 32)],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
          break;

        case "h3":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text, true, 28)],
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 180, after: 90 },
            })
          );
          break;

        case "h4":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text, true, 26)],
              heading: HeadingLevel.HEADING_4,
              spacing: { before: 160, after: 80 },
            })
          );
          break;

        case "h5":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text, true, 24)],
              heading: HeadingLevel.HEADING_5,
              spacing: { before: 140, after: 70 },
            })
          );
          break;

        case "h6":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text, true, 22)],
              heading: HeadingLevel.HEADING_6,
              spacing: { before: 120, after: 60 },
            })
          );
          break;

        case "p":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text)],
              spacing: { before: 120, after: 120 },
            })
          );
          break;

        case "blockquote":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text)],
              indent: { left: 720 },
              spacing: { before: 120, after: 120 },
              style: "Quote",
            })
          );
          break;

        case "ul":
          element.querySelectorAll("li").forEach((li) => {
            paragraphs.push(
              new Paragraph({
                children: [createStyledText(li.textContent?.trim() || "")],
                bullet: {
                  level: 0,
                },
                spacing: { before: 60, after: 60 },
              })
            );
          });
          break;

        case "ol":
          element.querySelectorAll("li").forEach((li, index) => {
            paragraphs.push(
              new Paragraph({
                children: [createStyledText(li.textContent?.trim() || "")],
                numbering: {
                  reference: "default-numbering",
                  level: 0,
                },
                spacing: { before: 60, after: 60 },
              })
            );
          });
          break;

        case "hr":
          paragraphs.push(
            new Paragraph({
              children: [],
              spacing: { before: 240, after: 240 },
              border: {
                bottom: { style: "single", size: 1, color: "999999" },
              },
            })
          );
          break;

        case "pre":
        case "code":
          paragraphs.push(
            new Paragraph({
              children: [createStyledText(text)],
              spacing: { before: 120, after: 120 },
              style: "Code",
            })
          );
          break;
      }
    });

    // Create Word document with numbering configuration
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "default-numbering",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: "start",
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 260 },
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // Generate timestamp-based unique ID
    const timestamp = new Date();
    const formattedDate = timestamp.toISOString().replace(/[:.]/g, "-");
    const fileName = `radiology-report-${formattedDate}.docx`;

    // Generate and download document
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [messageId]);

  useEffect(() => {
    // Keep internal refs in sync with context for voice commands
    const copyAction = onCopy
      ? () => onCopy({} as any)
      : null;
    
    copyActionRef.current = copyAction;
    downloadActionRef.current = handleDownload;

    return () => {
      if (copyActionRef.current === copyAction) {
        copyActionRef.current = null;
      }
      if (downloadActionRef.current === handleDownload) {
        downloadActionRef.current = null;
      }
    };
  }, [copyActionRef, downloadActionRef, onCopy, handleDownload]);

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground data-[floating]:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild onClick={onCopy}>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <TooltipIconButton tooltip="Download" onClick={handleDownload}>
        <DownloadIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};
