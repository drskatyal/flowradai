import { useMicVAD } from "@ricky0123/vad-react";
import float32ToWavBlob from "@/helper/float32-to-wavblob";
import { useAudioTranscription } from "@/hooks";
import { validateMicrophone } from "@/helper/microphone-permision";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";

export interface onTranscrptionArg {
  text: string,
  rawText: string
}

interface Props {
  autoRefineCheck: boolean;
  actionMode: boolean;
  disabled?: boolean;
  onTranscription: (arg: onTranscrptionArg) => void;
}

export const useMic = ({
  autoRefineCheck,
  actionMode,
  disabled,
  onTranscription,
}: Props) => {
  const {
    transcribeAudio,
    isTranscribing,
    transcriptionResult,
    isTranscriptionSuccess,
    isTranscriptionError,
    transcriptionError,
    resetTranscription,
  } = useAudioTranscription(autoRefineCheck, actionMode);

  const { toast } = useToast();
  const [transcriptionProcessed, setTranscriptionProcessed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const noSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const postTranscriptionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const vad = useMicVAD({
    redemptionFrames: 16,   //preiouse value 10
    positiveSpeechThreshold: 0.5,          // Increased sensitivity to soft/medical terms previouse value 0.5
    negativeSpeechThreshold: 0.2,          // previouse value 0.2
    minSpeechFrames: 5,                     // Helps avoid false positives from mic noise previouse value 5
    preSpeechPadFrames: 4,             // Allows more tolerance before cutting off previouse value 4
    startOnLoad: false,
    onSpeechStart: () => {
      // Reset transcription processed state when user starts speaking again
      setTranscriptionProcessed(false);
      // Clear post-transcription timer when user starts speaking again
      clearPostTranscriptionTimer();
    },
    onSpeechEnd: (audio) => {
      // You can handle the audio Blob here (e.g., send to server or transcribe)
      const wavBlob = float32ToWavBlob(audio, 16000);
      const audioFile = new File([wavBlob], "recording.wav", {
        type: "audio/wav",
      });

      if (audioFile.size <= 0) {
        toast({
          title: "No Audio Detected",
          description: "No valid audio was captured. Please try speaking again.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Reset processed state for the new transcription
        setTranscriptionProcessed(false);
        transcribeAudio(audioFile);
      } catch (error) {
        console.error("Error transcribe audio:", error);
        toast({
          title: "Transcription Failed",
          description: "Failed to transcribe audio. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const toggleMic = async () => {
    if (disabled) return;

    if (!isListening) {
      const hasMicAccess = await validateMicrophone();
      if (!hasMicAccess) {
        toast({
          title: "Microphone Access Denied",
          description:
            "Please connect a microphone and allow access to use voice features.",
          variant: "destructive",
        });
        return;
      }
    }

    if (isListening) {
      clearNoSpeechTimer();
      clearPostTranscriptionTimer();
      await vad.pause(); // stop listening
      setIsListening(false);
    } else {
      setTranscriptionProcessed(false);
      resetTranscription();
      await vad.start(); // start listening
      setIsListening(true);
      startNoSpeechTimer();
    }
    setIsRecording(!isRecording);
    setIsListening(!isListening);
  };

  const startNoSpeechTimer = () => {
    clearNoSpeechTimer();
    noSpeechTimerRef.current = setTimeout(async () => {
      // if we've never seen userSpeaking in these 30s
      if (!vad.userSpeaking) {
        console.warn("No speech detected within 30 seconds – stopping mic");
        await vad.pause();
        setIsListening(false);
        setIsRecording(false);
      }
    }, 30_000);
  };

  const clearNoSpeechTimer = () => {
    if (noSpeechTimerRef.current) {
      clearTimeout(noSpeechTimerRef.current);
      noSpeechTimerRef.current = null;
    }
  };

  const startPostTranscriptionTimer = () => {
    clearPostTranscriptionTimer();
    postTranscriptionTimerRef.current = setTimeout(async () => {
      // Check if user is not currently speaking
      if (!vad.userSpeaking && isListening) {
        console.warn("No speech detected within 1 minute after transcription – stopping mic");
        await vad.pause();
        setIsListening(false);
        setIsRecording(false);
      }
    }, 60_000); // 1 minute
  };

  const clearPostTranscriptionTimer = () => {
    if (postTranscriptionTimerRef.current) {
      clearTimeout(postTranscriptionTimerRef.current);
      postTranscriptionTimerRef.current = null;
    }
  };

  // As soon as userSpeaking becomes true, cancel both timers:
  useEffect(() => {
    if (vad.userSpeaking) {
      clearNoSpeechTimer();
      clearPostTranscriptionTimer();
    }
  }, [vad.userSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearNoSpeechTimer();
      clearPostTranscriptionTimer();
    };
  }, []);

  useEffect(() => {
    if (
      isTranscriptionSuccess &&
      transcriptionResult.text &&
      !transcriptionProcessed
    ) {
      setTranscriptionProcessed(true);
      onTranscription(transcriptionResult);

      // Start the post-transcription timer after successful transcription
      if (isListening) {
        startPostTranscriptionTimer();
        resetTranscription();
      }
    }
  }, [
    isTranscriptionSuccess,
    transcriptionResult,
    onTranscription,
    transcriptionProcessed,
    isListening,
    resetTranscription,
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

  return {
    isTranscribing,
    toggleMic,
    isListening,
    isUserSpeaking: vad.userSpeaking,
  };
};