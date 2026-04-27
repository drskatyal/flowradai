import { Mic as MicIcon, MicOff, Loader2, ChevronDown, Check } from "lucide-react";
import { Tooltip } from "@/components/customs/tooltip";
import { Button, ButtonProps } from "@/components/ui/button";
import { useMic } from "./hooks/use-mic";
import { cn } from "@/lib/utils";
import { WaveBars } from "./wave.bars";
import { onTranscrptionArg } from "./hooks/use-mic";
import { useThreadContext } from "@/providers/thread-provider";
import { useHotkeys } from 'react-hotkeys-hook';
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VoiceRecorderHandle } from "./types";

interface MicProps {
  onTranscription: (arg: onTranscrptionArg) => void;
  onModelSelect?: (m: string) => void;
  className?: string;
  disabled?: boolean;
  tooltipLabel?: string;
  autoRefineCheck?: boolean;
  actionMode?: boolean;
  buttonProps?: ButtonProps;
  enableShortcuts?: boolean;
  enableModelSwitching?: boolean;
  size: number;
  isEditor?: boolean;
}

const Mic = forwardRef<VoiceRecorderHandle, MicProps>(({
  onTranscription,
  onModelSelect,
  className = "",
  disabled = false,
  tooltipLabel = "Transcribe",
  autoRefineCheck = true,
  actionMode = false,
  buttonProps,
  enableShortcuts = false,
  enableModelSwitching = false,
  size,
  isEditor = false,
}, ref) => {

  const { isListening, isTranscribing, isUserSpeaking, toggleMic } = useMic({
    autoRefineCheck,
    actionMode,
    disabled,
    onTranscription,
  });

  const { setIsMicStoped, isMicStoped, setSelectedModel, selectedModel, modelOptions } = useThreadContext();
  const prevState = useRef(isMicStoped);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useHotkeys('r', () => {
    if (enableShortcuts) {
      toggleMic(); setIsMicStoped((prev) => !prev)
    }
  });

  // Handle timer when state changes
  useEffect(() => {
    if (isMicStoped !== prevState.current) {
      if (timerRef.current) clearTimeout(timerRef.current);

      prevState.current = isMicStoped;

      if (isMicStoped) {
        // Only start timer if mic was started
        timerRef.current = setTimeout(() => {
          setIsMicStoped(false);
        }, 25000);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMicStoped, setIsMicStoped]);

  const handleChangeModel = (m: string) => {
    onModelSelect?.(m);
    setSelectedModel(m);
  };

  useImperativeHandle(ref, () => ({
    start: () => {
      if (!isListening) {
        void toggleMic();
      }
    },
    stop: () => {
      if (isListening) {
        void toggleMic();
      }
    },
  }), [isListening, toggleMic]);

  return (
    <div className="flex flex-wrap justify-center items-center gap-2">
      <div className="inline-flex max-w-sm">
        <Tooltip
          trigger={
            <Button
              {...buttonProps}
              type="button"
              onClick={() => { toggleMic(); setIsMicStoped((prev) => !prev) }}
              disabled={disabled || isTranscribing}
              className={cn(
                "h-9 flex items-center justify-center transition-colors rounded-r-none",
                className,
                isListening
                  ? isUserSpeaking
                    ? cn("bg-red-500 text-white", enableModelSwitching ? "rounded-r-md" : '')
                    : cn("bg-red-500 text-white animate-pulse", enableModelSwitching ? 'rounded-r-md' : "")
                  : "bg-black text-white hover:bg-slate-800 hover:text-white shadow-lg",
                disabled ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {isTranscribing ? (
                <span className="flex gap-2 items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {!isEditor && <span>Processing</span>}
                </span>
              ) : isListening ? (
                isUserSpeaking ? (
                  <WaveBars />
                ) : (
                  <span className="flex gap-1 items-center">
                    <MicOff className="h-5 w-5 text-wrap" />
                    {
                      !isEditor &&
                      <span>Stop Transcribing</span>
                    }
                  </span>
                )
              ) : (
                <span className="flex gap-1 items-center text-wrap">
                  <MicIcon className="h-5 w-5" />
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
          {tooltipLabel} {actionMode ? "(Action Mode Enabled)" : ""}
        </Tooltip>
        {
          !isListening && enableModelSwitching && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  disabled={disabled || isTranscribing}
                  aria-label="Select model"
                  className={cn(
                    "h-9 sm:w-7 rounded-r-md rounded-l-none bg-black border-l flex items-center justify-center transition-colors shadow-md shrink-0",
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
  );
});

Mic.displayName = "Mic";

export default Mic;
