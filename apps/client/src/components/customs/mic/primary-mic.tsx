import { Check, ChevronDown, Loader2, Mic, MicOff, Pause, Play } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Tooltip } from "@/components/customs";
import { Button, ButtonProps } from "@/components/ui/button";
import { useAudioTranscription } from "@/hooks/use-audio-transcription";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { onTranscrptionArg } from "./hooks/use-mic";
import { useHotkeys } from 'react-hotkeys-hook';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useThreadContext } from "@/providers/thread-provider";
import { VoiceRecorderHandle } from "./types";

interface MicButtonProps {
  onTranscription: (arg: onTranscrptionArg) => void;
  onModelSelect?: (m: string) => void;
  className?: string;
  disabled?: boolean;
  tooltipLabel?: string;
  autoRefineCheck?: boolean;
  actionMode?: boolean;
  onAutoSubmit?: () => void;
  buttonProps?: ButtonProps;
  enableShortcuts?: boolean;
  enableModeSwitching?: boolean;
  size: number;
  isEditor?: boolean;
}

const PrimaryMic = forwardRef<VoiceRecorderHandle, MicButtonProps>(({
  onTranscription,
  onModelSelect,
  className = "",
  disabled = false,
  tooltipLabel = "Transcribe",
  autoRefineCheck,
  actionMode = false,
  onAutoSubmit,
  buttonProps,
  enableShortcuts = false,
  enableModeSwitching = false,
  size,
  isEditor = false
}, ref) => {
  const audioChunksRef = useRef<Blob[]>([]);
  const lastAudioActivityRef = useRef<number>(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcriptionProcessed, setTranscriptionProcessed] = useState(false);

  const autoRefine = !!autoRefineCheck;

  const { toast } = useToast();
  const {
    transcribeAudio,
    isTranscribing,
    transcriptionResult,
    isTranscriptionSuccess,
    isTranscriptionError,
    transcriptionError,
    resetTranscription,
  } = useAudioTranscription(autoRefine, actionMode);

  const { setSelectedModel, selectedModel, modelOptions } = useThreadContext();

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startSilenceTimer = () => {
    if (actionMode && onAutoSubmit && !isPaused) {
      resetSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastAudioActivityRef.current;

        if (isRecording && !isPaused && timeSinceLastActivity >= 5000) {
          console.log(
            "Detected 5s of silence, stopping recording automatically"
          );
          stopRecording();
        }
      }, 5000);
    }
  };

  const updateAudioActivity = () => {
    if (!isPaused) {
      lastAudioActivityRef.current = Date.now();
      if (actionMode) {
        startSilenceTimer();
      }
    }
  };

  const startRecording = async () => {
    if (disabled) return;

    audioChunksRef.current = [];
    setTranscriptionProcessed(false);
    setIsPaused(false);
    resetTranscription();
    lastAudioActivityRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      const options = { mimeType: "audio/webm" };
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (e) {
        console.warn(
          "Failed to create MediaRecorder with specified options, trying defaults",
          e
        );
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          updateAudioActivity();
        } else {
          console.warn("Received empty audio chunk");
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        resetSilenceTimer();

        if (audioChunksRef.current.length === 0) {
          console.error("No audio chunks recorded");
          toast({
            title: "Recording Failed",
            description: "No audio was recorded. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size < 100) {
          console.error("Audio blob too small, likely invalid");
          toast({
            title: "Recording Failed",
            description:
              "Audio recording appears to be invalid. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
          lastModified: Date.now(),
        });

        try {
          transcribeAudio(audioFile);
        } catch (error) {
          console.error("Error transcribing audio:", error);
          toast({
            title: "Transcription Failed",
            description: "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);

      if (actionMode) {
        startSilenceTimer();
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description:
          error instanceof Error
            ? error.message
            : "Please allow microphone access to use this feature.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      try {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        resetSilenceTimer();
        console.log("Recording paused");
      } catch (error) {
        console.error("Error pausing recording:", error);
        toast({
          title: "Pause Failed",
          description: "Failed to pause recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      try {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        lastAudioActivityRef.current = Date.now();
        if (actionMode) {
          startSilenceTimer();
        }
        console.log("Recording resumed");
      } catch (error) {
        console.error("Error resuming recording:", error);
        toast({
          title: "Resume Failed",
          description: "Failed to resume recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    resetSilenceTimer();

    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("Error stopping recording:", error);
      }
      setIsRecording(false);
      setIsPaused(false);
    } else {
      console.warn("Attempted to stop recording, but no active recorder found");
    }
  };

  const handlePauseResumeClick = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  useEffect(() => {
    if (
      isTranscriptionSuccess &&
      transcriptionResult &&
      !transcriptionProcessed
    ) {
      setTranscriptionProcessed(true);

      setTimeout(() => {
        onTranscription(transcriptionResult);
      }, 0);
    }
  }, [
    isTranscriptionSuccess,
    transcriptionResult,
    onTranscription,
    transcriptionProcessed,
    actionMode,
  ]);

  useEffect(() => {
    if (isTranscriptionError && transcriptionError && !transcriptionProcessed) {
      console.error("Transcription error:", transcriptionError);
      setTranscriptionProcessed(true);
      toast({
        title: "Transcription Error",
        description: transcriptionError.message || "Failed to transcribe audio",
        variant: "destructive",
      });
    }
  }, [isTranscriptionError, transcriptionError, toast, transcriptionProcessed]);

  useEffect(() => {
    return () => {
      resetSilenceTimer();
    };
  }, []);

  const handleChangeModel = (m: string) => {
    onModelSelect?.(m);
    setSelectedModel(m);
  };

  useImperativeHandle(ref, () => ({
    start: () => {
      void startRecording();
    },
    stop: () => {
      stopRecording();
    },
  }), [startRecording, stopRecording]);

  useHotkeys('r', () => enableShortcuts && isRecording ? stopRecording() : startRecording());
  useHotkeys('p', () => enableShortcuts && isRecording ? handlePauseResumeClick() : '');

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className={cn("flex justify-center items-center gap-2", !isEditor ? 'flex-wrap' : 'flex-nowrap')}>
          <div className="inline-flex max-w-sm">
            {/* Main Mic Button */}
            <Tooltip
              trigger={
                <Button
                  {...buttonProps}
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={disabled || isTranscribing}
                  className={cn(
                    "flex-1 h-9 flex items-center justify-center transition-colors rounded-r-none", // fixed height
                    className,
                    isRecording
                      ? cn("bg-red-500 text-white animate-pulse", enableModeSwitching ? 'rounded-r-md' : '')
                      : "bg-black text-white hover:bg-slate-800 shadow-lg",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                  )}
                >
                  {isTranscribing ? (
                    <span className="flex gap-1 items-center">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {
                        !isEditor &&
                        <span>Transcribing... ({selectedModel})</span>
                      }
                    </span>
                  ) : isRecording ? (
                    <span className="flex gap-1 items-center">
                      <MicOff className="h-5 w-5" />
                      {
                        !isEditor &&
                        <span>Stop Transcribing</span>
                      }
                    </span>
                  ) : (
                    <span className="flex gap-1 items-center text-wrap">
                      <Mic className="h-5 w-5" />
                      {
                        !isEditor &&
                        <span>Start Transcribing
                          {
                            size >= 33.33 &&
                            <span className='max-sm:hidden lg:hidden xl:inline-block text-xs'>({selectedModel})</span>
                          }
                        </span>
                      }
                    </span>
                  )}
                </Button>
              }
            >
              {isRecording ? "Stop Recording" : tooltipLabel}{" "}
              {actionMode ? "(Action Mode Enabled)" : ""}
            </Tooltip>

            {/* Split dropdown trigger */}
            {
              !isRecording && enableModeSwitching && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      disabled={disabled || isTranscribing || isRecording}
                      aria-label="Select model"
                      className={cn(
                        "h-9 sm:w-7 rounded-r-md rounded-l-none bg-black border-l flex items-center justify-center transition-colors shadow-md shrink-0", // match height
                        (disabled || isTranscribing) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="min-w-[--radix-dropdown-menu-trigger-width]"
                  >
                    {modelOptions.map((m) => (
                      <DropdownMenuItem key={m} onClick={() => handleChangeModel(m)}>
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

          {/* Pause/Resume Button - Only show when recording */}
          {isRecording && (
            <Tooltip
              trigger={
                <Button
                  type="button"
                  onClick={handlePauseResumeClick}
                  disabled={disabled || isTranscribing}
                  className={cn(
                    "h-9 flex items-center justify-center transition-colors",
                    className,
                    isPaused
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-yellow-500 text-white hover:bg-yellow-600",
                    "shadow-lg",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  {isPaused ? (
                    <span className="flex gap-1 items-center">
                      <Play className="h-4 w-4" />
                      {!isEditor &&
                        <span>Resume Transcribing</span>
                      }
                    </span>
                  ) : (
                    <span className="flex gap-1 items-center">
                      <Pause className="h-4 w-4" />
                      {
                        !isEditor &&
                        <span>Pause Transcribing</span>
                      }
                    </span>
                  )}
                </Button>
              }
            >
              {isPaused ? "Resume Recording" : "Pause Recording"}
            </Tooltip>
          )}
        </div>

      </div>
      {/* Recording Status Indicator */}
      {isRecording && !isEditor && (
        <div className="flex items-center gap-2 text-sm">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"
          )} />
          <span className="text-muted-foreground">
            {isPaused ? "Recording Paused" : "Recording..."}
          </span>
        </div>
      )}
    </>
  );
});

PrimaryMic.displayName = "PrimaryMic";

export default PrimaryMic;
