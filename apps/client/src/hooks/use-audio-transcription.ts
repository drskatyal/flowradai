import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export interface TranscriptionResponse {
  text: string;
  rawText: string;
}

export const useAudioTranscription = (autoRefine: boolean, actionMode: boolean) => {
  // Track last transcription result to prevent duplicates
  const [lastRequestId, setLastRequestId] = useState<string>("");
  
  const {
    mutate: transcribeAudioInternal,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset
  } = useMutation<TranscriptionResponse, Error, { audioFile: File; }>({
    mutationFn: async ({ audioFile }) => {
      // Generate a unique ID for this request
      const requestId = Date.now().toString();
      setLastRequestId(requestId);

      // Check if file is valid
      if (audioFile.size === 0) {
        throw new Error('Audio file is empty');
      }

      // Create form data
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("autoRefine", autoRefine ? "true" : "false");
      formData.append("actionMode", actionMode ? "true" : "false");
      
      try {
        const response = await serverAxios.post("/audio/transcribe", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
   
        if (!response.data || !response.data.text) {
          console.error('Invalid response from transcription API:', response.data);
          throw new Error('Invalid response from transcription service');
        }
        
        return response.data;
      } catch (err) {
        console.error('Transcription request failed:', err);
        // Extract meaningful error messages from axios error
        let errorMessage = 'Transcription failed';
        
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as any;
          if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error;
            console.error('Server error details:', axiosError.response.data);
          } else if (axiosError.message) {
            errorMessage = axiosError.message;
          }
        }
        
        throw new Error(errorMessage);
      }
    },
    retry: false, // Disable retries to prevent duplicate requests
  });
  
  // Wrapper for transcribeAudio to avoid duplicate calls
  const transcribeAudio = (audioFile: File) => {    // Reset state before starting a new transcription
    reset();
    transcribeAudioInternal({ audioFile }, {
      onSuccess: (data) => {},
      onError: (error) => {
        console.error('Transcription failed in hook onError handler:', error);
      },
    });
  };

  return {
    transcribeAudio,
    isTranscribing: isPending,
    isTranscriptionSuccess: isSuccess,
    isTranscriptionError: isError,
    transcriptionError: error,
    transcriptionResult: { text:data?.text || "", rawText: data?.rawText || "" },
    resetTranscription: reset
  };
}; 