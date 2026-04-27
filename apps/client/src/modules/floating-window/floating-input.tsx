"use client";
import { CircleStopIcon, Loader2, Rocket, UserPen, WandSparkles } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { usePrimitiveInput } from "../chat/hooks";
import VoiceRecordingControls from "../chat/voice-recording-controls";
import { studyTypes } from "@/constants/chat";
import { StudyTypes } from "@/interfaces";
import ReleventTemplateList from "../chat/relevent-template";
import SelectTemplate from "../chat/select-template";
import { useThreadContext } from "@/providers/thread-provider";
import { useStore } from "@/stores";
import { useCreateThread } from "../thread/hooks/use-create-thread";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FloatingVoiceRecordingControls = dynamic(() => import("./floating-voice-recording-controls"), {
  ssr: false,
});
import FloatingNewSession from "./new-session";
import { Template } from "@/hooks";
import { useFindingsEmbedding } from "../thread/hooks";

export const FloatingInput = () => {
  const threadId = useStore((state) => state.threadId);
  const setThreadId = useStore((state) => state.setThreadId);
  const setThread = useStore((state) => state.setThread);
  const setThreads = useStore((state) => state.setThreads);
  const threads = useStore((state) => state.threads);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const { createThread, isLoading: isCreatingThreadLoading } = useCreateThread((threadData) => {
    if (threadData) {
      setThreadId(threadData.threadId);
      setThread(threadData);
      // Add thread to threads list
      setThreads((prevThreads) => {
        const threadExists = prevThreads.some(
          (thread) => thread.threadId === threadData.threadId
        );
        if (!threadExists && threadData) {
          return [
            {
              threadId: threadData.threadId,
              state: threadData.status,
              title: threadData.name,
            },
            ...prevThreads,
          ];
        }
        return prevThreads;
      });
      setIsCreatingThread(false);
    }
  });

  // Ensure we have a thread when component mounts or when threadId is null
  useEffect(() => {
    if (!threadId && !isCreatingThread && !isCreatingThreadLoading) {
      setIsCreatingThread(true);
      createThread();
    }
  }, [threadId, isCreatingThread, isCreatingThreadLoading]);

  const {
    composerSendHandler: originalComposerSendHandler,
    isInputDisabled,
    isMessageLoading,
    isRunning,
    handlePrimitiveInputChange,
    handleFindingsAutoCorrect,
    isCorrectingFindings,
    primitiveInput,
    handleTranscriptionComplete,
    findingsTextareaRef,
    isCustomProfile,
    setIsCustomProfile,
    customInstructions,
    setCustomInstructions,
    findingsError,
    selectedStudyType,
    autoRefine,
    handleTemplateReporting: originalHandleTemplateReporting,
    releventTemplate,
    setEditedTemplate,
    // handleTemplateSelect,
    handleSonioxTranscriptionComplete,
    actionMode,
    setActionMode,
  } = usePrimitiveInput(false);

  const {
    templatesData,
    setSelectedStudyType,
    setPrimitiveInput,
    setIsTemplateDialogOpen,
    isTemplateDialogOpen
  } = useThreadContext();
  const { resetTemplate } = useFindingsEmbedding()
  const [pendingSend, setPendingSend] = useState<"smart" | "template" | null>(null);

  const size = 32;

  // Execute pending send action when thread is ready
  useEffect(() => {
    if (threadId && pendingSend && !isCreatingThread && !isCreatingThreadLoading) {
      // Wait a bit longer to ensure all hooks and store are updated
      const timer = setTimeout(() => {
        // Double-check threadId is still set (use current state, not store)
        if (threadId) {
          if (pendingSend === "smart") {
            // Trigger smart generation
            const syntheticEvent = {
              preventDefault: () => { },
            } as React.FormEvent;
            originalComposerSendHandler(syntheticEvent);
          } else if (pendingSend === "template") {
            // Trigger template generation
            const syntheticEvent = {
              preventDefault: () => { },
            } as React.FormEvent;
            originalHandleTemplateReporting(syntheticEvent);
          }
        }
        setPendingSend(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [threadId, pendingSend, isCreatingThread, isCreatingThreadLoading, originalComposerSendHandler, originalHandleTemplateReporting]);

  // Wrapper to ensure thread exists before sending
  const composerSendHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!threadId) {
      // Create thread first if it doesn't exist
      if (!isCreatingThread && !isCreatingThreadLoading) {
        setIsCreatingThread(true);
        setPendingSend("smart");
        createThread();
      }
      return;
    }

    originalComposerSendHandler(e);
  };

  // Wrapper for template reporting
  const handleTemplateReporting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!threadId) {
      // Create thread first if it doesn't exist
      if (!isCreatingThread && !isCreatingThreadLoading) {
        setIsCreatingThread(true);
        setPendingSend("template");
        createThread();
      }
      return;
    }

    originalHandleTemplateReporting(e);
  };

  const handleTemplateSelect = (template: Template | null) => {
    if (template) {
      setSelectedStudyType(studyTypes[StudyTypes.Template]);
      setPrimitiveInput((prevState) => ({
        ...prevState,
        studyName: template.title,
      }));
      setEditedTemplate(template);
    } else {
      if (!isTemplateDialogOpen) {
        setSelectedStudyType(studyTypes[StudyTypes.Default]);
        setPrimitiveInput({
          studyName: null,
          findings: null,
        })
        setEditedTemplate(null);
        resetTemplate();
      }
    }
  };

  return (
    <ComposerPrimitive.Root onSubmit={composerSendHandler}>
      <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto
                              [&::-webkit-scrollbar]:w-2
                              [&::-webkit-scrollbar-thumb]:bg-gray-400
                              [&::-webkit-scrollbar-thumb]:rounded-full
                              [&::-webkit-scrollbar-track]:bg-gray-200 p-3 rounded-b-lg
                              border border-white/10 backdrop-blur-xl
                              widget-container overflow-x-hidden">
        <div className="flex items-center justify-between gap-2">
          <SelectTemplate
            templates={templatesData.templates}
            isDisabled={isInputDisabled}
            onTemplateSelect={handleTemplateSelect}
            listOpen={isTemplateDialogOpen}
            setListOpen={(value) => setIsTemplateDialogOpen(value)}
            className="flex-1 no-drag"
            triggerClassName="!bg-transparent border-[#FFFFFF33]"
          />
          <div className="no-drag">
            <FloatingNewSession />
          </div>
        </div>

        {/* Findings Textarea */}
        <div className="space-y-1 findings-textarea">
          <div className="border rounded-lg border-aui-ring/20 no-drag widget-input-area">
            <Textarea
              className="min-h-20 max-h-[520px] border-0 border-none border-b-0 focus:outline-none overflow-y-auto text-sm
                          [&::-webkit-scrollbar]:w-2
                          [&::-webkit-scrollbar-thumb]:bg-gray-400
                          [&::-webkit-scrollbar-thumb]:rounded-full
                          [&::-webkit-scrollbar-track]:bg-gray-200
                    "
              id="findings"
              placeholder="Please include all information relevant to your findings."
              onChange={(e) => {
                handlePrimitiveInputChange("findings", e.target.value);
              }}
              value={`${primitiveInput.findings || ""}`}
              disabled={isInputDisabled}
              ref={findingsTextareaRef}
            />
            <div className="flex items-center justify-end flex-wrap gap-1 p-2 mt-0">
              <Tooltip
                trigger={
                  <Button
                    variant={actionMode ? "default" : "ghost"}
                    type="button"
                    size="lg"
                    onClick={() => setActionMode(!actionMode)}
                    disabled={isInputDisabled}
                    className="border opacity-50 rounded-full !px-2 !py-2 action-mode-btn"
                  >
                    <Rocket className="!h-5 !w-5" />
                    {size >= 33.33 &&
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
                    type="button"
                    onClick={handleFindingsAutoCorrect}
                    variant="ghost"
                    size="lg"
                    className="border opacity-50 rounded-full !px-2 !py-2"
                    disabled={!primitiveInput.findings}
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
              <FloatingVoiceRecordingControls
                isSendMessageDisabled={false}
                size={33.33}
                actionMode={false}
                autoRefine={autoRefine}
                handleTranscriptionComplete={handleTranscriptionComplete}
                handleSonioxTranscriptionComplete={handleSonioxTranscriptionComplete}
              />
            </div>
          </div>
          <span className="text-xs text-red-500">{findingsError}</span>
        </div>

        {/* Custom Profile Input (if enabled) */}
        {isCustomProfile && (
          <div className="space-y-1">
            <Label className="text-xs">Custom Instructions</Label>
            <Textarea
              className="min-h-20 border resize-none text-sm
                          [&::-webkit-scrollbar]:w-2
                          [&::-webkit-scrollbar-thumb]:bg-gray-400
                          [&::-webkit-scrollbar-thumb]:rounded-full
                          [&::-webkit-scrollbar-track]:bg-gray-200"
              placeholder="Enter custom instructions..."
              value={customInstructions || ""}
              onChange={(e) => {
                setCustomInstructions(e.target.value);
              }}
              disabled={isInputDisabled}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2 no-drag">
          <ThreadPrimitive.If running={false}>
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                className="rounded-md p-2 text-primary-foreground disabled:opacity-70 w-full text-xs h-8 font-normal generate-btn flex-1"
                disabled={
                  selectedStudyType !== studyTypes[StudyTypes.Template] ||
                  !(
                    primitiveInput.findings?.trim() &&
                    (!isCustomProfile || (isCustomProfile && customInstructions?.trim()))
                  ) || isInputDisabled
                }
                onClick={handleTemplateReporting}
              >
                {isCreatingThread || isCreatingThreadLoading ? `Creating...` : "Use Template"}
              </Button>
              <Button
                type="button"
                className="rounded-md p-2 text-primary-foreground disabled:opacity-70 w-full text-xs h-8 font-normal generate-btn flex-1"
                onClick={composerSendHandler}
                disabled={
                  !(
                    primitiveInput.findings?.trim() &&
                    (!isCustomProfile ||
                      (isCustomProfile && customInstructions?.trim()))
                  ) || isInputDisabled || isCreatingThread || isCreatingThreadLoading || (!threadId && pendingSend !== "smart")
                }
              >
                {isCreatingThread || isCreatingThreadLoading || (!threadId && pendingSend === "smart") ? "Creating..." : "Smart Generation"}
              </Button>
            </div>
          </ThreadPrimitive.If>
          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel className="self-end" asChild>
              <TooltipIconButton
                tooltip="Cancel"
                variant="default"
                className="my-2.5 size-8 p-2 transition-opacity ease-in"
              >
                <CircleStopIcon />
              </TooltipIconButton>
            </ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
        </div>
      </div>
    </ComposerPrimitive.Root>
  );
};

