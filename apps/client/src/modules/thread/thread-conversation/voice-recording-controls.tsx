import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, EditIcon } from "lucide-react";
import { Mic, PrimaryMic, VoiceRecorderHandle } from "@/components/customs/mic";
import { useMyComposer } from "./hooks";
import { onTranscrptionArg } from "@/components/customs/mic/hooks/use-mic";
import { useDesktopView } from "@/hooks";
import { useThreadContext } from "@/providers/thread-provider";
import SonioxSpeechToText from "@/components/customs/mic/soniox-mic";
import getAPIKey from "@/lib/utils";
import { ThreadListPrimitive } from "@assistant-ui/react";
import { ButtonWithTooltip } from "@/components/ui/assistant-ui/thread-list/thread-list";
import { useHotkeys } from "react-hotkeys-hook";
import { useVoiceCommandContext } from "@/providers/voice-command-provider";

const VoiceRecordingControls = ({
    isSendMessageDisabled,
    size,
    actionMode,
    autoRefine,
    handleTranscriptionComplete,
    handleSonioxTranscriptionComplete
}: {
    isSendMessageDisabled: boolean;
    size: number;
    actionMode: boolean;
    autoRefine: boolean;
    handleTranscriptionComplete: ({ text, rawText }: onTranscrptionArg) => void;
    handleSonioxTranscriptionComplete: ({ text, rawText }: onTranscrptionArg) => void
}) => {
    const [isOpen, setIsOpen] = useState(true);

    const { isDesktopView } = useDesktopView();
    const { isInputDisabled } = useMyComposer(isSendMessageDisabled);

    const { selectedModel, modelOptions } = useThreadContext();
    const { micStartRef, micStopRef, newSessionRef } = useVoiceCommandContext();
    const sonioxMicRef = useRef<VoiceRecorderHandle | null>(null);
    const vadMicRef = useRef<VoiceRecorderHandle | null>(null);
    const primaryMicRef = useRef<VoiceRecorderHandle | null>(null);

    const handleMicTab = () => {
        if (!isDesktopView) {
            setIsOpen(!isOpen)
        }
    }

    // ref for desktop "New Report"
    const newReportDesktopRef = useRef<HTMLButtonElement | null>(null);

    // 🔑 Shortcut only for desktop
    useHotkeys(
        "n",
        (e) => {
            // Don't trigger if user is typing in an input/textarea/contentEditable
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            e.preventDefault();
            newReportDesktopRef.current?.click();
        },
        []
    );

    useEffect(() => {
        newSessionRef.current = newReportDesktopRef.current;

        return () => {
            if (newSessionRef.current === newReportDesktopRef.current) {
                newSessionRef.current = null;
            }
        };
    }, [newSessionRef]);

    useEffect(() => {
        const activeMicRef =
            selectedModel === modelOptions[0]
                ? sonioxMicRef
                : selectedModel === modelOptions[1]
                    ? vadMicRef
                    : primaryMicRef;

        micStartRef.current = () => activeMicRef.current?.start();
        micStopRef.current = () => activeMicRef.current?.stop();

        return () => {
            micStartRef.current = null;
            micStopRef.current = null;
        };
    }, [micStartRef, micStopRef, modelOptions, selectedModel]);

    return (
        <div className="border rounded-md">
            <div
                className="flex items-center justify-between cursor-pointer p-1 md:p-2 bg-gray-100"
                onClick={() => handleMicTab()}
            >
                <p className="font-medium text-sm">Session Controls</p>
                <div className="flex gap-1 items-center justify-center">
                    <ThreadListPrimitive.New asChild>
                        <ButtonWithTooltip
                            ref={newReportDesktopRef}
                            variant="default"
                            size={"sm"}
                            className=""
                            tooltip="New Report"
                            side="top"
                        >
                            New Session
                            <span className="flex items-center gap-2">
                                <EditIcon className="size-4" />
                            </span>
                        </ButtonWithTooltip>
                    </ThreadListPrimitive.New>
                    {!isDesktopView && (isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />)}
                </div>
            </div>

            <div
                className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96" : "max-h-0"
                    }`}
            >
                <div className="p-3 flex flex-col items-center justify-center gap-2">
                    {selectedModel === modelOptions[0] && (
                        // ✅ Soniox
                        <SonioxSpeechToText
                            ref={sonioxMicRef}
                            onTranscription={handleSonioxTranscriptionComplete}
                            apiKey={getAPIKey}
                            size={size}
                            enableShortcuts={true}
                        />
                    )}

                    {selectedModel === modelOptions[1] && (
                        // ✅ VAD Mic
                        <Mic
                            ref={vadMicRef}
                            key={"auto-refine-" + autoRefine}
                            className={isInputDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            disabled={isInputDisabled}
                            onTranscription={handleTranscriptionComplete}
                            tooltipLabel="Record Findings"
                            autoRefineCheck={autoRefine}
                            actionMode={actionMode}
                            enableShortcuts={true}
                            enableModelSwitching={true}
                            size={size}
                        />
                    )}

                    {selectedModel === modelOptions[2] && (
                        // ✅ Normal Mic
                        <PrimaryMic
                            ref={primaryMicRef}
                            key={"auto-refine-" + autoRefine}
                            className={isInputDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            disabled={isInputDisabled}
                            onTranscription={handleTranscriptionComplete}
                            tooltipLabel="Record Findings"
                            autoRefineCheck={autoRefine}
                            actionMode={actionMode}
                            enableShortcuts={true}
                            enableModeSwitching={true}
                            size={size}
                        />
                    )}
                    <p className="font-light text-sm">Click the microphone to start voice input</p>
                </div>
            </div>
        </div>
    )
}

export default VoiceRecordingControls;
