"use client";
import {
  Rocket,
  SendHorizontalIcon,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Tooltip } from "@/components/customs";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { CircleStopIcon } from "@/customIcons";
import { useStore } from "@/stores/use-store";
import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { useMyComposer } from "./hooks";
import VoiceRecordingControls from "./voice-recording-controls";

interface MyComposerProps {
  isSendMessageDisabled: boolean;
  size: number;
}

const MyComposer: FC<MyComposerProps> = ({ isSendMessageDisabled, size }) => {
  const {
    handleSubmit,
    handleInputChange,
    handleCursorPositionChange,
    handleKeyDown,
    messageText,
    isInputDisabled,
    handleTranscriptionComplete,
    remainingMessages,
    handleElaborate,
    actionMode,
    setActionMode,
    autoRefine,
    handleFindingsAutoCorrect,
    isCorrectingFindings,
    elaborateButtonLabel,
    isElaborateButton,
    handleSonioxTranscriptionComplete
  } = useMyComposer(isSendMessageDisabled);
  const { messages, isMessageLoading, threads, isRunning } = useStore();

  return (
    <div className="w-full md:w-auto p-4 xl:p-6 lg:!pt-8">
      <ComposerPrimitive.Root
        className="focus-within:border-aui-ring/20 w-full rounded-lg border pt-2.5 px-2.5 shadow-sm transition-colors ease-in items-center mx-auto min-h-14"
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
          className={`w-full composer-input placeholder:text-muted-foreground max-h-10 md:min-h-44 md:max-h-40 flex-grow resize-none border-none bg-transparent text-sm outline-none focus:ring-0 
          ${isInputDisabled ? "pointer-events-none" : ""}`}
        />
        <div className="flex justify-between w-full">
          <div className="flex flex-wrap justify-end items-center gap-1 max-lg:max-w-2xl">
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
                  {
                    size >= 33.33 &&
                    <span className="hidden min-[426px]:inline lg:hidden 2xl:block">
                      Action Mode
                    </span>
                  }
                </Button>
              }
            >
              <p>Action Mode</p>
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
          </div>
          <div>
            <ThreadPrimitive.If running={false}>
              <ComposerPrimitive.Send disabled={!messageText.trim() || isInputDisabled} asChild>
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
      <div className="my-3">
        <VoiceRecordingControls
          isSendMessageDisabled={isSendMessageDisabled}
          size={size}
          actionMode={actionMode}
          autoRefine={autoRefine} // pass autoRefine prop if make dynamic
          handleTranscriptionComplete={handleTranscriptionComplete}
          handleSonioxTranscriptionComplete={handleSonioxTranscriptionComplete}
        />
      </div>
      {
        isElaborateButton &&
        (
          !isMessageLoading &&
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
                {elaborateButtonLabel}
              </Button>
            </div>
          ))
      }
    </div>
  );
};

export default MyComposer;
