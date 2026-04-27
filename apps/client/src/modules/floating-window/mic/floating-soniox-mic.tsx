'use client';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState
} from 'react';
import {
    Mic,
    MicOff,
    Loader2
} from 'lucide-react';
import { useSonioxSpeechToText } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Tooltip } from "@/components/customs";
import { cn } from '@/lib/utils';
import { onTranscrptionArg } from '@/components/customs/mic/hooks/use-mic';
import { useHotkeys } from 'react-hotkeys-hook';
import { context } from '@/constants';
import { VoiceRecorderHandle } from '@/components/customs/mic';

interface TranslationConfig {
    type: 'one_way' | 'two_way';
    target_language?: string;
    language_a?: string;
    language_b?: string;
    source_language?: string;
    translation_status?: string;
}

interface SonioxConfig {
    apiKey: string | (() => Promise<string>);
    model?: string;
    languageHints?: string[];
    language?: string;
    context?: string;
    enableSpeakerDiarization?: boolean;
    enableLanguageIdentification?: boolean;
    enableEndpointDetection?: boolean;
    translation?: TranslationConfig;
    audioConstraints?: MediaTrackConstraints;
}

interface SonioxSpeechToTextProps {
    apiKey: string | (() => Promise<string>);
    className?: string;
    onTranscription: (arg: onTranscrptionArg) => void;
    size: number;
    enableShortcuts?: boolean;
    isEditor?: boolean;
    enableModelSwitching?: boolean;
    onModelSelect?: (m: string) => void;
}

const FloatingSonioxSpeechToText = forwardRef<VoiceRecorderHandle, SonioxSpeechToTextProps>(({
    apiKey,
    className = '',
    onTranscription,
    enableShortcuts = false,
    isEditor = false,
}, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const config: SonioxConfig = {
        apiKey: apiKey,
        model: 'stt-rt-preview',
        languageHints: ['en'],
        language: 'en',
        context: context,
        enableSpeakerDiarization: false,
        enableLanguageIdentification: true,
        enableEndpointDetection: false,
        audioConstraints: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
        translation: {
            type: 'one_way',
            target_language: 'en'
        }
    };

    const {
        isRecording,
        isLoading,
        startRecording,
        stopRecording,
    } = useSonioxSpeechToText(config, isEditor);

    const handleStopRecording = () => {
        stopRecording();
        onTranscription({
            text: '',
            rawText: "",
        });
    };

    useImperativeHandle(ref, () => ({
        start: () => {
            void startRecording();
        },
        stop: () => {
            void handleStopRecording();
        },
    }), [handleStopRecording, startRecording]);

    useHotkeys('r', () => {
        if (enableShortcuts) {
            void (isRecording ? handleStopRecording() : startRecording());
        }
    });

    // 🔑 NEW: Listen for Alt+Space keyboard shortcut from Electron
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const electronApi = (window as Window & {
            electron?: {
                onStartMic?: (callback: () => void) => (() => void) | void;
            };
        }).electron;
        if (!electronApi?.onStartMic) {
            return;
        }

        const unsubscribe = electronApi.onStartMic(() => {
            // Toggle mic: stop if recording, start if not
            if (isRecording) {
                handleStopRecording();
            } else {
                startRecording();
            }
        });

        return () => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, [isRecording, startRecording, handleStopRecording]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-center items-center gap-2">
                <div className="inline-flex max-w-sm">
                    {/* Main Mic Button */}
                    <Tooltip
                        trigger={
                            <Button
                                type="button"
                                onClick={isRecording ? handleStopRecording : startRecording}
                                disabled={isLoading}
                                className={cn(
                                    "flex items-center justify-center transition-colors border px-2 py-2 rounded-full opacity-50",
                                    className,
                                    isRecording
                                        ? cn("bg-red-500 text-white animate-pulse rounded-full")
                                        : "rounded-full",
                                    isLoading ? "opacity-50 cursor-not-allowed" : "",
                                )}
                                variant={isRecording ? "default" : "ghost"}
                                size="lg"
                            >
                                {isLoading ? (
                                    <span className="flex gap-1 items-center">
                                        <Loader2 className="!h-5 !w-5 animate-spin" />
                                    </span>
                                ) : isRecording ? (
                                    <span className="flex gap-1 items-center text-wrap">
                                        <MicOff className="!h-5 !w-5" />
                                    </span>
                                ) : (
                                    <span className="flex gap-1 items-center text-wrap">
                                        <Mic className="!h-5 !w-5" />
                                    </span>
                                )}
                            </Button>
                        }
                    >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </Tooltip>
                </div>
            </div>
        </div>
    );
});

FloatingSonioxSpeechToText.displayName = "FloatingSonioxSpeechToText";

export default FloatingSonioxSpeechToText;
export { FloatingSonioxSpeechToText };
