"use client";

import { useEffect, useRef } from "react";
import SpeechRecognition, {
  Command,
  useSpeechRecognition,
} from "react-speech-recognition";

export const useVoiceCommands = (commands: Command[], enabled: boolean) => {
  const recognition = useSpeechRecognition({ commands });
  const {
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
    isMicrophoneAvailable,
    listening,
    resetTranscript,
  } = recognition;
  const isStartingRef = useRef(false);

  useEffect(() => {
    if (
      !enabled ||
      !browserSupportsSpeechRecognition ||
      !isMicrophoneAvailable
    ) {
      SpeechRecognition.stopListening();
      resetTranscript();
      return;
    }

    const startVoiceCommandListener = async () => {
      if (isStartingRef.current) {
        return;
      }

      isStartingRef.current = true;

      try {
        await SpeechRecognition.startListening({
          continuous: true,
          language: "en-US",
        });
      } catch (error) {
        console.error("Failed to start voice commands listener", error);
      } finally {
        isStartingRef.current = false;
      }
    };

    void startVoiceCommandListener();

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [
    enabled,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    resetTranscript,
  ]);

  useEffect(() => {
    if (
      !enabled ||
      !browserSupportsSpeechRecognition ||
      !isMicrophoneAvailable ||
      listening
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const startVoiceCommandListener = async () => {
        if (isStartingRef.current) {
          return;
        }

        isStartingRef.current = true;

        try {
          await SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
          });
        } catch (error) {
          console.error("Failed to restart voice commands listener", error);
        } finally {
          isStartingRef.current = false;
        }
      };

      void startVoiceCommandListener();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    enabled,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
  ]);

  return {
    ...recognition,
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
    isMicrophoneAvailable,
    listening,
    resetTranscript,
  };
};
