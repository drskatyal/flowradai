import { useRef, useState } from "react";
import { usePrimitiveInput } from "../chat/hooks";
import { useDesktopView } from "@/hooks";
import { useThreadContext } from "@/providers/thread-provider";
import getAPIKey from '@/lib/utils';
import { useHotkeys } from "react-hotkeys-hook";
import FloatingSonioxSpeechToText from "./mic/floating-soniox-mic";

interface FloatingVoiceRecordingControlsProps {
    isSendMessageDisabled: boolean;
    size: number;
    actionMode: boolean;
    autoRefine: boolean;
    handleTranscriptionComplete: (args: OnTranscriptionArgs) => void;
    handleSonioxTranscriptionComplete: (args: OnTranscriptionArgs) => void;
}

interface OnTranscriptionArgs {
    text: string;
    rawText: string;
}

const FloatingVoiceRecordingControls: React.FC<FloatingVoiceRecordingControlsProps> = ({
    isSendMessageDisabled,
    size,
    actionMode,
    autoRefine,
    handleTranscriptionComplete,
    handleSonioxTranscriptionComplete,
}) => {

    const [isOpen, setIsOpen] = useState(true);

    const { isDesktopView } = useDesktopView();
    const { isInputDisabled } = usePrimitiveInput(isSendMessageDisabled);

    const { selectedModel, modelOptions } = useThreadContext();

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
    return (
        <FloatingSonioxSpeechToText
            onTranscription={handleSonioxTranscriptionComplete}
            apiKey={getAPIKey}
            size={size}
            enableShortcuts={true}
        />
    );
};

export default FloatingVoiceRecordingControls;
