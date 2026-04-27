"use client";
import { CircleStopIcon, Rocket, UserPen, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Tooltip } from "@/components/customs";
import { TooltipIconButton } from "@/components/ui/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { usePrimitiveInput } from "./hooks";
import SelectDocument from "./select-document";
import dynamic from "next/dynamic";

const VoiceRecordingControls = dynamic(() => import("./voice-recording-controls"), {
  ssr: false,
});
import { studyTypes } from "@/constants/chat";
import { StudyTypes } from "@/interfaces";
import ReleventTemplateList from "./relevent-template";

interface PrimitiveInput {
  studyName: string | null;
  findings: string | null;
}

const PrimitiveInput = ({
  isSendMessageDisabled,
  size
}: {
  isSendMessageDisabled: boolean;
  size: number;
}) => {
  const {
    composerSendHandler,
    handleStructuredReporting,
    isInputDisabled,
    isMessageLoading,
    threads,
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
    studyNameError,
    findingsError,
    validateFields,
    isProfileEditMode,
    selectedStudyType,
    structredReportingButtonLabel,
    isStructuredReport,
    actionMode,
    setActionMode,
    autoRefine,
    selectedDocument,
    handleTemplateReporting,
    releventTemplate,
    handleTemplateSelect,
    handleSonioxTranscriptionComplete
  } = usePrimitiveInput(isSendMessageDisabled);

  return (
    <>
      <ComposerPrimitive.Root onSubmit={composerSendHandler}>
        <Card className="max-sm:sticky bottom-0 rounded-none border-0 max-lg:border-t w-full shadow-none">
          <CardContent className="flex flex-col gap-4 lg:gap-6 p-4 lg:p-6">
            {/*we add here mic section*/}
            <div className="mic-btn">
              <VoiceRecordingControls
                isSendMessageDisabled={isSendMessageDisabled}
                size={size}
                actionMode={actionMode}
                autoRefine={autoRefine} // if make dynamic pass autoRefine prop
                handleTranscriptionComplete={handleTranscriptionComplete}
                handleSonioxTranscriptionComplete={handleSonioxTranscriptionComplete}
              />
            </div>
            <div className="space-y-2">
              <Label>Document</Label>
              <SelectDocument />
            </div>
            <div className="space-y-2 findings-textarea">
              <Label htmlFor="findings">Study Name and Findings</Label>
              <div className="border rounded-lg focus-visible:outline-none focus-within:border-aui-ring/20">
                <Textarea
                  className="lg:min-h-52 border-0 resize-none border-none border-b-0 focus:outline-none overflow-y-auto
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-thumb]:bg-gray-400
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-200"
                  id="findings"
                  placeholder="Please include all information relevant to your findings."
                  onChange={(e) => {
                    handlePrimitiveInputChange("findings", e.target.value);
                  }}
                  cols={5}
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
                        size="sm"
                        onClick={() => setActionMode(!actionMode)}
                        disabled={isInputDisabled}
                        className="border rounded-full !px-2 action-mode-btn"
                      >
                        <Rocket />
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
                        variant={isCustomProfile ? "default" : "ghost"}
                        type="button"
                        size="sm"
                        onClick={() => setIsCustomProfile(!isCustomProfile)}
                        disabled={isInputDisabled}
                        className="border rounded-full !px-2 custom-profile-btn"
                      >
                        <UserPen />
                        {size >= 33.33 &&
                          <span className="hidden min-[426px]:inline lg:hidden 2xl:block">
                            Custom Profile
                          </span>
                        }
                      </Button>
                    }
                  >
                    <p>Custom Profile</p>
                  </Tooltip>
                  <Tooltip
                    trigger={
                      <Button
                        type="button"
                        onClick={handleFindingsAutoCorrect}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 text-crrection-btn"
                        isLoading={isCorrectingFindings}
                        disabled={!primitiveInput.findings}
                      >
                        {!isCorrectingFindings && (
                          <WandSparkles className="size-4" />
                        )}
                      </Button>
                    }
                  >
                    AI Text Correction
                  </Tooltip>
                </div>
              </div>
              {!isMessageLoading && (
                <p className="text-[10px] text-muted-foreground !mt-0">
                  {threads?.length === 0 && (
                    <>
                      Get started by{" "}
                      <Link href="/pricing" className="underline">
                        purchasing report credits.
                      </Link>
                    </>
                  )}
                </p>
              )}
              <span className="text-sm text-red-500">{findingsError}</span>
            </div>
            <div className="flex flex-col flex-wrap xs:flex-row-reverse lg:flex-col 2xl:flex-row-reverse gap-2 items-center lg:items-end justify-between">
              <ThreadPrimitive.If running={false}>
                <div className="flex flex-wrap gap-2 w-full">
                  <Button
                    type="button"
                    className="bg-primary rounded-md p-2 text-primary-foreground disabled:opacity-70 w-full text-sm lg:text-base lg:flex-col lg:w-full h-full font-normal generate-btn flex-1"
                    disabled={
                      selectedStudyType !== studyTypes[StudyTypes.Template] ||
                      !(
                        primitiveInput.findings?.trim() &&
                        (!isCustomProfile || (isCustomProfile && customInstructions?.trim()))
                      ) || isInputDisabled
                    }
                    onClick={handleTemplateReporting}
                  >
                    Use Template
                  </Button>
                  <Button
                    type="button"
                    className="bg-primary rounded-md p-2 text-primary-foreground disabled:opacity-70 w-full text-sm lg:text-base lg:flex-col lg:w-full h-full font-normal generate-btn flex-1"
                    onClick={composerSendHandler}
                    disabled={
                      !(
                        primitiveInput.findings?.trim() &&
                        (!isCustomProfile ||
                          (isCustomProfile && customInstructions?.trim()))
                      ) || isInputDisabled
                    }
                  >
                    Smart Generation
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
              {
                isStructuredReport && (
                  (!isRunning && !selectedDocument && selectedStudyType.value === "default" && (
                    <Button
                      type="button"
                      className="bg-primary rounded-md p-2 text-primary-foreground disabled:opacity-70 w-full text-sm lg:text-base lg:flex-col lg:w-full h-full font-normal"
                      onClick={handleStructuredReporting}
                      disabled={
                        !(
                          primitiveInput.findings?.trim() &&
                          (!isCustomProfile ||
                            (isCustomProfile && customInstructions?.trim()))
                        ) || isInputDisabled
                      }
                    >
                      {structredReportingButtonLabel()}
                    </Button>
                  )
                  ))
              }
            </div>
            {releventTemplate && releventTemplate.length > 0 && (
              <ReleventTemplateList
                templates={releventTemplate}
                onClick={(template) => handleTemplateSelect(template)}
              />
            )}
          </CardContent>
        </Card>
      </ComposerPrimitive.Root>
    </>
  );
};

export default PrimitiveInput;
