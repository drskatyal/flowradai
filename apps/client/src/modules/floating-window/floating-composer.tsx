"use client";
import {
  Loader2,
  Rocket,
  SendHorizontalIcon,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { Tooltip } from "@/components/customs";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { CircleStopIcon } from "@/customIcons";
import { useStore } from "@/stores/use-store";
import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { useMyComposer } from "@/modules/thread/thread-conversation/hooks";
import VoiceRecordingControls from "@/modules/thread/thread-conversation/voice-recording-controls";
import FloatingRegularVoiceRecordingControls from "./floating-regular-voice-controls";
import FloatingNewSession from "./new-session";

interface FloatingComposerProps {
  isSendMessageDisabled: boolean;
  size: number;
}

const FloatingComposer: FC<FloatingComposerProps> = ({ isSendMessageDisabled, size }) => {
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
    handleSonioxTranscriptionComplete,
  } = useMyComposer(isSendMessageDisabled);
  const { messages, isMessageLoading, threads, isRunning, thread } = useStore();

  // In floating composer, ignore quota gating; only disable when explicitly blocked by parent/runtime
  const effectiveDisabled = isSendMessageDisabled;
  const handleKeyDownWrapper = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && effectiveDisabled) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full widget-container rounded-b-lg px-3 pb-3 pt-2">
      <ComposerPrimitive.Root
        className="border-aui-ring/20 w-full rounded-lg border pt-2.5 px-2.5 shadow-sm transition-colors ease-in items-center min-h-14 no-drag widget-input-area"
        onSubmit={handleSubmit}
      >
        <ComposerPrimitive.Input
          placeholder="Write a message..."
          rows={1}
          onKeyDown={handleKeyDownWrapper}
          disabled={isInputDisabled}
          value={messageText}
          onChange={handleInputChange}
          onSelect={handleCursorPositionChange}
          onFocus={handleCursorPositionChange}
          onBlur={handleCursorPositionChange}
          className={`w-full composer-input min-h-12 !max-h-[300px] bg-transparent flex-grow border-none text-white text-sm outline-none focus:ring-0
          ${isInputDisabled ? "pointer-events-none" : ""}`}
        />
        <div className="flex justify-between w-full">
          <div className="flex flex-wrap justify-end items-center gap-1 max-lg:max-w-2xl">
            <FloatingRegularVoiceRecordingControls
              isSendMessageDisabled={isSendMessageDisabled}
              size={size}
              actionMode={false}
              autoRefine={autoRefine}
              handleTranscriptionComplete={handleTranscriptionComplete}
              handleSonioxTranscriptionComplete={handleSonioxTranscriptionComplete}
            />
            <Tooltip
              trigger={
                <Button
                  variant={actionMode ? "default" : "ghost"}
                  type="button"
                  size="lg"
                  onClick={() => setActionMode(!actionMode)}
                  disabled={false}
                  className="border opacity-50 rounded-full !px-2"
                >
                  <Rocket className="!h-5 !w-5" />
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
                  size="lg"
                  className="border rounded-full !px-2 !py-2"
                  disabled={effectiveDisabled || !messageText.trim()}
                  type="button"
                >
                  {!isCorrectingFindings ? (
                    <WandSparkles className="!h-5 !w-5" />
                  ) : (
                    <Loader2 className="!h-5 !w-5 animate-spin" />
                  )}
                </Button>
              }
            >
              AI Text Correction
            </Tooltip>
          </div>
          <div className="flex items-center gap-1">
            <FloatingNewSession />
            <ThreadPrimitive.If running={false}>
              <ComposerPrimitive.Send disabled={!messageText.trim() || isInputDisabled} asChild>
                <TooltipIconButton
                  tooltip="Send"
                  variant="default"
                  type="submit"
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
    </div>
  );
};

export default FloatingComposer;


