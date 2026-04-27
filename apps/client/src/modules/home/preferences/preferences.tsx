"use client";

import React from "react";
import { Dialog } from "@/components/customs/dialog";
import { ToggleSwitch } from "@/components/ui/customs/custom-switch";
import { usePreferences } from "./hooks/use-preferences";
import { Settings, Zap, Mic, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UpdatePreferences = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {

  const {
    preferences,
    setPreferences,
    handleUpdatePreferences,
    handleTranscriptionModelChange
  } = usePreferences();

  const handleSave = () => {
    handleUpdatePreferences(preferences);
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      headerTitle="Preferences"
      icon={Settings}
      headerDescription="Customize your AI assistant experience."
      allowInteractionOutside={false}
      onOpenChange={() => setIsOpen(false)}
      classNames={{
        content:
          "w-full max-w-md max-h-[80vh] flex flex-col rounded-lg shadow-xl bg-white dark:bg-neutral-900",
        headerTitle: "text-lg font-semibold flex items-center gap-2",
      }}
    >
      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 pr-2 space-y-6">
        {/* General Settings */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 space-y-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4 text-yellow-500" /> General Settings
            </h3>
            <p className="text-xs text-muted-foreground">
              Core functionality and behavior preferences
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Auto Template</p>
              <p className="text-xs text-muted-foreground break-words">
                Automatically suggest templates based on your input.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.autoTemplate}
              onCheckedChange={(val) =>
                setPreferences((prev) => ({ ...prev, autoTemplate: val }))
              }
              id="autoTemplate"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Action Mode</p>
              <p className="text-xs text-muted-foreground break-words">
                Automatically send inputs from session controls without triggering any button.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.actionMode}
              onCheckedChange={(val) =>
                setPreferences((prev) => ({ ...prev, actionMode: val }))
              }
              id="actionMode"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Report Validation Mode</p>
              <p className="text-xs text-muted-foreground break-words max-w-[500px]">
                When turned on, it automatically checks the first generated report for errors without manual action.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.isErrorCheck}
              onCheckedChange={(val) =>
                setPreferences((prev) => ({ ...prev, isErrorCheck: val }))
              }
              id="isErrorCheck"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Report Insights Mode</p>
              <p className="text-xs text-muted-foreground break-words max-w-[500px]">
                When turned on, it automatically checks the report for guideline without manual action.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.isReportGuideline}
              onCheckedChange={(val) =>
                setPreferences((prev) => ({ ...prev, isReportGuideline: val }))
              }
              id="isReportGuideline"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Auto Text Correction</p>
              <p className="text-xs text-muted-foreground break-words max-w-[500px]">
                When turned on, it automatically corrects the transcription text after recording stops (Transcription v2.0-Fastest only).
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.isTextAutoCorrection}
              onCheckedChange={(val) =>
                setPreferences((prev) => ({ ...prev, isTextAutoCorrection: val }))
              }
              id="isTextAutoCorrection"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">Voice Commands</p>
              <p className="text-xs text-muted-foreground break-words max-w-[500px]">
                Control the app using voice phrases like start mic, start mike, stop mic, new session, new report, copy report, and download report.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.voiceCommandsEnabled}
              onCheckedChange={(val) =>
                setPreferences((prev) => ({ ...prev, voiceCommandsEnabled: val }))
              }
              id="voiceCommandsEnabled"
            />
          </div>
        </div>

        {/* AI Models */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 space-y-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Mic className="w-4 h-4 text-blue-500" /> Transcription Models
            </h3>
            <p className="text-xs text-muted-foreground">
              Enable the transcription models you want to use and set one as your default.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Transcription v2.0-Fastest</p>
              <p className="text-xs text-muted-foreground break-words">
                Get real-time transcription with instant streaming output.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.defaultTranscriptionModel === "v2"}
              onCheckedChange={(val) => handleTranscriptionModelChange("v2", val)}
              id="transcription_v2"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Transcription v1.0</p>
              <p className="text-xs text-muted-foreground break-words">
                Record, transcribe, and display text in chunks using voice activity detection.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.defaultTranscriptionModel === "v1"}
              onCheckedChange={(val) => handleTranscriptionModelChange("v1", val)}
              id="transcription_v1"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Smart Record and Transcribe</p>
              <p className="text-xs text-muted-foreground break-words">
                Capture the entire recording, then transcribe and display the full content at once.
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.defaultTranscriptionModel === "v0"}
              onCheckedChange={(val) => handleTranscriptionModelChange("v0", val)}
              id="transcription_v0"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 space-y-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4 text-blue-500" /> Report Email
            </h3>
            <p className="text-xs text-muted-foreground break-words">
              Email address to receive report.
            </p>
          </div>
          <Input
            type="email"
            value={preferences.reportEmail}
            onChange={(e) => setPreferences((prev) => ({ ...prev, reportEmail: e.target.value }))}
            id="reportEmail"
          />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex justify-end items-center border-t pt-3 mt-3 gap-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-lg bg-black text-white hover:bg-neutral-800"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default UpdatePreferences;
