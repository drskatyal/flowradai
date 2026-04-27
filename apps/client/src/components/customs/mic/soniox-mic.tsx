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
    ChevronDown,
    Check,
    Loader2
} from 'lucide-react';
import { useSonioxSpeechToText } from '@/hooks';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from "@/components/customs";
import { useThreadContext } from '@/providers/thread-provider';
import { cn } from '@/lib/utils';
import { onTranscrptionArg } from './hooks/use-mic';
import { useHotkeys } from 'react-hotkeys-hook';
import { context } from '@/constants';
import { VoiceRecorderHandle } from './types';

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

const SonioxSpeechToText = forwardRef<VoiceRecorderHandle, SonioxSpeechToTextProps>(({
    apiKey,
    className = '',
    onTranscription,
    size,
    enableShortcuts = false,
    isEditor = false,
    onModelSelect
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

    const {
        selectedModel,
        setSelectedModel,
        modelOptions,
    } = useThreadContext();

    const handleStopRecording = () => {
        stopRecording();
        onTranscription({
            text: '',
            rawText: "",
        });
        // debouncedTranscription(onTranscription, !isThreadRegular ? (primitiveInput.findings ?? '') : (messageText));
    };

    const handleChangeModel = (m: string) => {
        onModelSelect?.(m);
        setSelectedModel(m);
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
                                    "flex-1 h-9 flex items-center justify-center transition-colors rounded-r-none",
                                    className,
                                    isRecording
                                        ? cn("bg-red-500 text-white animate-pulse rounded-r-md")
                                        : "bg-black text-white hover:bg-slate-800 shadow-lg",
                                    isLoading ? "opacity-50 cursor-not-allowed" : "",
                                )}
                            >
                                {isLoading ? (
                                    <span className="flex gap-1 items-center">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {
                                            !isEditor && <span>Connecting...</span>
                                        }
                                    </span>
                                ) : isRecording ? (
                                    <span className="flex gap-1 items-center text-wrap">
                                        <MicOff className="h-5 w-5" />
                                        {!isEditor &&
                                            <span>Stop Transcribing</span>
                                        }
                                    </span>
                                ) : (
                                    <span className="flex gap-1 items-center text-wrap">
                                        <Mic className="h-5 w-5" />
                                        {!isEditor &&
                                            <span>
                                                Start Transcribing
                                                {size >= 33.33 &&
                                                    <span className='max-sm:hidden lg:hidden xl:inline-block text-xs'>({selectedModel})</span>
                                                }
                                            </span>
                                        }
                                    </span>
                                )}
                            </Button>
                        }
                    >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </Tooltip>

                    {/* Split dropdown trigger */}
                    {
                        !isRecording && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        disabled={isLoading || isRecording}
                                        aria-label="Select model"
                                        className={cn(
                                            "h-9 sm:w-7 rounded-r-md rounded-l-none bg-black border-l flex items-center justify-center transition-colors shadow-md shrink-0",
                                            (isLoading || isRecording) && "opacity-50 cursor-not-allowed",
                                        )}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align="end"
                                    className="min-w-[--radix-dropdown-menu-trigger-width]"
                                >
                                    {modelOptions
                                        .filter((_, index) => !(isEditor && index === 2))
                                        .map((m) => (
                                            <DropdownMenuItem
                                                key={m}
                                                onClick={() => handleChangeModel(m)}
                                            >
                                                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                                                    {m === selectedModel ? <Check className="h-4 w-4" /> : null}
                                                </span>
                                                {m}
                                            </DropdownMenuItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                        )
                    }
                </div>
            </div>

            {/* Recording Status Indicator */}
            {isRecording && !isEditor && (
                <div className="flex items-center gap-2 text-sm text-center">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        "bg-red-500 animate-pulse"
                    )} />
                    <span className="text-muted-foreground text-center">
                        Recording...
                    </span>
                </div>
            )}
        </div>
    );
});

SonioxSpeechToText.displayName = "SonioxSpeechToText";

export default SonioxSpeechToText;
export { SonioxSpeechToText };
