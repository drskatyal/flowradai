import { useEffect, useRef } from "react";
import { VoiceRecorderHandle } from "@/components/customs/mic";
import { onTranscrptionArg } from "@/components/customs/mic/hooks/use-mic";
import getAPIKey from "@/lib/utils";
import FloatingSonioxSpeechToText from "./mic/floating-soniox-mic";
import { useVoiceCommandContext } from "@/providers/voice-command-provider";

const FloatingRegularVoiceRecordingControls = ({
    size,
    handleSonioxTranscriptionComplete
}: {
    isSendMessageDisabled: boolean;
    size: number;
    actionMode: boolean;
    autoRefine: boolean;
    handleTranscriptionComplete: ({ text, rawText }: onTranscrptionArg) => void;
    handleSonioxTranscriptionComplete: ({ text, rawText }: onTranscrptionArg) => void
}) => {
    const { micStartRef, micStopRef } = useVoiceCommandContext();
    const sonioxMicRef = useRef<VoiceRecorderHandle | null>(null);

    useEffect(() => {
        micStartRef.current = () => sonioxMicRef.current?.start();
        micStopRef.current = () => sonioxMicRef.current?.stop();

        return () => {
            micStartRef.current = null;
            micStopRef.current = null;
        };
    }, [micStartRef, micStopRef]);

    return (
        <FloatingSonioxSpeechToText
            ref={sonioxMicRef}
            onTranscription={handleSonioxTranscriptionComplete}
            apiKey={getAPIKey}
            size={size}
            enableShortcuts={true}
        />
    )
}

export default FloatingRegularVoiceRecordingControls;
