'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useThreadContext } from '@/providers/thread-provider';
import { useToast } from "@/hooks/use-toast";
import { useStore } from '@/stores';
import { useMacros, Macro } from "@/hooks/use-macro";
import { useTextAutoCorrect } from "@/modules/chat/hooks/use-text-auto-correct";

// Types for the hook configuration
interface SonioxToken {
  text: string;
  speaker?: string;
  language?: string;
  is_final: boolean;
  start_ms?: number;
  duration_ms?: number;
}

interface SonioxResult {
  tokens: SonioxToken[];
}

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

interface UseSonioxSpeechToTextReturn {
  // State
  isRecording: boolean;
  isLoading: boolean;
  error: string | null;
  transcript: string;
  finalTranscript: string;
  partialTranscript: string;
  tokens: SonioxToken[];

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  clearTranscript: () => void;

  // Status
  connectionState: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useSonioxSpeechToText = (config: SonioxConfig, isEditor: boolean): UseSonioxSpeechToTextReturn => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [tokens, setTokens] = useState<SonioxToken[]>([]);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'>('idle');

  // Ref to store the SonioxClient instance
  const sonioxClientRef = useRef<any>(null);
  const allTokensRef = useRef<SonioxToken[]>([]);
  // Refs for cursor-based insertion in primitive input mode
  const useCursorInsertModeRef = useRef<boolean>(false);
  const baselineBeforeRef = useRef<string>('');
  const baselineAfterRef = useRef<string>('');
  // Refs for cursor-based insertion in regular composer mode
  const useCursorInsertModeRegularRef = useRef<boolean>(false);
  const baselineBeforeRegularRef = useRef<string>('');
  const baselineAfterRegularRef = useRef<string>('');

  const authUser = useStore((state) => state.user);

  const { data } = useMacros();
  const macros = data?.macros || [];

  const textAutoCorrectMutation = useTextAutoCorrect();

  // ✅ FIXED: Filter and sort INSIDE useMemo
  const sortedMacros = useMemo(() => {
    const filtered = macros.filter((macro: Macro) => {
      return macro.userId === authUser?._id && macro.isActive;
    });

    return filtered.sort((a: Macro, b: Macro) => b.name.length - a.name.length);
  }, [macros, authUser?._id]);

  const {
    setPrimitiveInput,
    primitiveInput,
    setMessageText,
    messageText,
    setLiveTranscript,
    liveTranscript,
    selectedModel,
    modelOptions
  } = useThreadContext();
  const { thread } = useStore();
  const { toast } = useToast();
  const isThreadRegular = thread?.status === "regular";

  const primitiveInputRef = useRef(primitiveInput);
  const regularInputRef = useRef(messageText);
  const editorInputRef = useRef(liveTranscript);
  const sortedMacrosRef = useRef(sortedMacros);
  const selectedModelRef = useRef(selectedModel);
  const modelOptionsRef = useRef(modelOptions);
  const isTextAutoCorrectionRef = useRef(authUser?.isTextAutoCorrection);

  // ✅ Update refs whenever values change
  useEffect(() => {
    primitiveInputRef.current = primitiveInput;
  }, [primitiveInput]);

  useEffect(() => {
    regularInputRef.current = messageText;
  }, [messageText]);

  useEffect(() => {
    editorInputRef.current = liveTranscript;
  }, [liveTranscript]);

  useEffect(() => {
    sortedMacrosRef.current = sortedMacros;
  }, [sortedMacros]);

  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  useEffect(() => {
    modelOptionsRef.current = modelOptions;
  }, [modelOptions]);

  useEffect(() => {
    isTextAutoCorrectionRef.current = authUser?.isTextAutoCorrection;
  }, [authUser?.isTextAutoCorrection]);

  // ✅ MACRO DETECTION FUNCTION
  const processMacroReplacement = useCallback((text: string): string => {
    console.log('processMacroReplacement called with text:', text);
    console.log('Using macros from ref:', sortedMacrosRef.current);

    const macrosToUse = sortedMacrosRef.current;

    if (!macrosToUse?.length) {
      console.log('No macros available');
      return text;
    }

    let processedText = text;

    for (const macro of macrosToUse) {

      if (!macro.name || !macro.description) {
        console.log('Skipping macro - missing name or description');
        continue;
      }

      // Check if macro name starts with "Insert " (case-insensitive)
      const startsWithInsert = /^insert\s+/i.test(macro.name);
      console.log('Macro starts with Insert:', startsWithInsert);

      // Remove "Insert " prefix if it exists for flexible matching
      const macroNameWithoutInsert = startsWithInsert
        ? macro.name.replace(/^insert\s+/i, '').trim()
        : macro.name;

      console.log('macroNameWithoutInsert:', macroNameWithoutInsert);

      // Create a version without spaces for matching
      const macroNameNoSpaces = macroNameWithoutInsert.replace(/\s+/g, '');
      console.log('macroNameNoSpaces:', macroNameNoSpaces);

      // Create a flexible pattern that matches the macro name with OR without spaces
      const flexiblePattern = macroNameNoSpaces
        .split('')
        .map((char: string) => `(${char.toLowerCase()}|${char.toUpperCase()})`)
        .join('\\s*');

      console.log('flexiblePattern:', flexiblePattern);

      // Create patterns that ALWAYS require "insert" prefix
      const patterns = [];
      patterns.push(`\\binsert\\s+${flexiblePattern}(?=\\s|[.,!?;:]|$)`);

      console.log('patterns:', patterns);

      // Combine all patterns
      const regex = new RegExp(patterns.join('|'), 'gi');
      console.log('regex:', regex);

      // Check if this pattern exists in the input
      if (regex.test(processedText)) {
        console.log('✅ MATCH FOUND!');
        const replaceRegex = new RegExp(patterns.join('|'), 'gi');
        processedText = processedText.replace(replaceRegex, macro.description);
        console.log('Replaced with:', macro.description);
        console.log('New processedText:', processedText);
        break;
      } else {
        console.log('❌ No match for this macro');
      }
    }

    console.log('Final processedText:', processedText);
    return processedText;
  }, []);

  // ✅ AUTO-CORRECTION FUNCTION
  const handleFindingsAutoCorrect = useCallback((findings: string) => {
    console.log('Starting auto-correction for:', findings);

    textAutoCorrectMutation.mutate(findings, {
      onSuccess: (data) => {
        console.log('Auto-correction success:', data?.correctedText);

        if (!isEditor) {
          if (isThreadRegular) {
            setMessageText(data?.correctedText || findings);

            setTimeout(() => {
              const composer = document.querySelector('.composer-input') as HTMLTextAreaElement | null;
              if (composer) {
                composer.value = data?.correctedText || findings;
                composer.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }, 100);
          } else {
            setPrimitiveInput((prevState) => ({
              ...prevState,
              findings: data?.correctedText || findings,
            }));

            setTimeout(() => {
              const textarea = document.getElementById('findings') as HTMLTextAreaElement | null;
              if (textarea) {
                textarea.value = data?.correctedText || findings;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }, 100);
          }
        }
      },
      onError: (error) => {
        console.error('Auto-correction error:', error);
      },
    });
  }, [textAutoCorrectMutation, isEditor, isThreadRegular, setPrimitiveInput, setMessageText]);

  // Initialize Soniox client - ✅ ONLY ONCE, no function dependencies
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const initClient = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { SonioxClient } = await import('@soniox/speech-to-text-web');
        sonioxClientRef.current = new SonioxClient({
          apiKey: config.apiKey,
          onStarted: () => {
            console.log('Soniox: Recording started');
            setConnectionState('connected');
            setIsLoading(false);
            setError(null);
          },
          onFinished: () => {
            console.log('Soniox: Recording finished');
            setConnectionState('disconnected');
            setIsRecording(false);
            setIsLoading(false);

            // ✅ MACRO DETECTION + AUTO-CORRECTION ON FINISH
            console.log('=== POST-PROCESSING START ===');
            console.log('isEditor:', isEditor);
            console.log('isThreadRegular:', isThreadRegular);

            if (!isEditor) {
              if (isThreadRegular) {
                // Process macro replacement for regular thread
                const currentText = regularInputRef.current || '';
                console.log('Regular thread - currentText:', currentText);
                console.log('Available macros:', sortedMacrosRef.current);

                // Step 1: Macro detection
                const processedText = processMacroReplacement(currentText);
                console.log('Regular thread - processedText after macro:', processedText);

                if (processedText !== currentText) {
                  console.log('✅ Macro replacement in regular thread:', currentText, '->', processedText);
                  setMessageText(processedText);

                  setTimeout(() => {
                    const composer = document.querySelector('.composer-input') as HTMLTextAreaElement | null;
                    if (composer) {
                      composer.value = processedText;
                      composer.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }, 100);
                }

                // Step 2: Auto-correction (if enabled and using model v2)
                const shouldAutoCorrect = selectedModelRef.current === modelOptionsRef.current?.[0] && isTextAutoCorrectionRef.current;
                console.log('Should auto-correct?', shouldAutoCorrect);
                console.log('selectedModel:', selectedModelRef.current);
                console.log('modelOptions[0]:', modelOptionsRef.current?.[0]);
                console.log('isTextAutoCorrection:', isTextAutoCorrectionRef.current);

                if (shouldAutoCorrect) {
                  console.log('✅ Running auto-correction for regular thread');
                  setTimeout(() => {
                    handleFindingsAutoCorrect(processedText);
                  }, 200);
                } else {
                  console.log('❌ Auto-correction skipped - conditions not met');
                }
              } else {
                // Process macro replacement for primitive input
                const currentFindings = primitiveInputRef.current.findings || '';
                console.log('Primitive input - currentFindings:', currentFindings);
                console.log('Available macros:', sortedMacrosRef.current);

                // Step 1: Macro detection
                const processedFindings = processMacroReplacement(currentFindings);
                console.log('Primitive input - processedFindings after macro:', processedFindings);

                if (processedFindings !== currentFindings) {
                  console.log('✅ Macro replacement in primitive input:', currentFindings, '->', processedFindings);
                  setPrimitiveInput({
                    ...primitiveInputRef.current,
                    findings: processedFindings
                  });

                  setTimeout(() => {
                    const textarea = document.getElementById('findings') as HTMLTextAreaElement | null;
                    if (textarea) {
                      textarea.value = processedFindings;
                      textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }, 100);
                }

                // Step 2: Auto-correction (if enabled and using model v2)
                const shouldAutoCorrect = selectedModelRef.current === modelOptionsRef.current?.[0] && isTextAutoCorrectionRef.current;
                console.log('Should auto-correct?', shouldAutoCorrect);
                console.log('selectedModel:', selectedModelRef.current);
                console.log('modelOptions[0]:', modelOptionsRef.current?.[0]);
                console.log('isTextAutoCorrection:', isTextAutoCorrectionRef.current);

                if (shouldAutoCorrect) {
                  console.log('✅ Running auto-correction for primitive input');
                  setTimeout(() => {
                    handleFindingsAutoCorrect(processedFindings);
                  }, 200);
                } else {
                  console.log('❌ Auto-correction skipped - conditions not met');
                }
              }
            }
            console.log('=== POST-PROCESSING END ===');

            // Reset cursor insertion mode after finishing to avoid late appends
            useCursorInsertModeRef.current = false;
            baselineBeforeRef.current = '';
            baselineAfterRef.current = '';
            useCursorInsertModeRegularRef.current = false;
            baselineBeforeRegularRef.current = '';
            baselineAfterRegularRef.current = '';
          },
          onPartialResult: (result: SonioxResult) => {
            // Update all tokens
            allTokensRef.current = [...allTokensRef.current, ...result.tokens];
            setTokens([...allTokensRef.current]);
            // Separate final and partial transcripts
            const finalTokens = allTokensRef.current.filter(
              token => token.is_final && token.language === "en"
            );

            const partialTokens = result.tokens.filter(
              token => !token.is_final && token.language === "en"
            );

            const finalText = finalTokens.map(token => token.text).join('');
            const partialText = partialTokens.map(token => token.text).join('');

            setFinalTranscript(finalText);
            setPartialTranscript(partialText);
            setTranscript(finalText + (partialText ? ' ' + partialText : ''));

            if (!isEditor) {
              if (isThreadRegular) {
                // Regular thread: if a cursor position was captured at start, insert at that position
                if (useCursorInsertModeRegularRef.current) {
                  const composer = document.querySelector('.composer-input') as HTMLTextAreaElement | null;
                  const composed = baselineBeforeRegularRef.current + finalText + (partialText ? ' ' + partialText : '') + baselineAfterRegularRef.current;
                  setMessageText(composed);
                  if (composer) {
                    composer.value = composed;
                    const newCaret = baselineBeforeRegularRef.current.length + finalText.length + (partialText ? 1 + partialText.length : 0);
                    composer.setSelectionRange(newCaret, newCaret);
                    composer.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                } else {
                  setMessageText((regularInputRef.current ? regularInputRef.current : '') + finalText + (partialText ? ' ' + partialText : ''));
                }
              } else {
                // Primitive input mode: if a cursor position was captured at start, insert at that position
                if (useCursorInsertModeRef.current) {
                  const textarea = document.getElementById('findings') as HTMLTextAreaElement | null;
                  const composed = baselineBeforeRef.current + finalText + (partialText ? ' ' + partialText : '') + baselineAfterRef.current;
                  setPrimitiveInput({
                    studyName: primitiveInputRef.current.studyName || '',
                    findings: composed
                  });
                  // Keep the user's caret right after the inserted streaming text
                  if (textarea) {
                    textarea.value = composed;
                    const newCaret = baselineBeforeRef.current.length + finalText.length + (partialText ? 1 + partialText.length : 0);
                    textarea.setSelectionRange(newCaret, newCaret);
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                } else {
                  // Fallback: existing behavior (append to end)
                  setPrimitiveInput({
                    studyName: primitiveInputRef.current.studyName || '',
                    findings: (primitiveInputRef.current.findings ? primitiveInputRef.current.findings : '') + finalText + (partialText ? ' ' + partialText : '')
                  });
                }
              }
            } else {
              setLiveTranscript(finalText + (partialText ? ' ' + partialText : ''));
            }
          },
          onStateChange: ({ newState, oldState }) => {
            console.log(`Soniox state changed from ${oldState} to ${newState}`);
          },
          onError: (status: string, message: string) => {
            console.error('Soniox error:', status, message);
            setError(`${status}: ${message}`);
            setConnectionState('error');
            setIsRecording(false);
            setIsLoading(false);
            // Ensure we reset cursor insertion state on error
            useCursorInsertModeRef.current = false;
            baselineBeforeRef.current = '';
            baselineAfterRef.current = '';
            useCursorInsertModeRegularRef.current = false;
            baselineBeforeRegularRef.current = '';
            baselineAfterRegularRef.current = '';
          }
        });
      } catch (err) {
        console.error('Failed to initialize Soniox client:', err);
        setError('Failed to initialize speech recognition');
        setConnectionState('error');
      }
    };

    initClient();

    // Cleanup on unmount
    return () => {
      if (sonioxClientRef.current) {
        try {
          console.log('Cleaning up Soniox client');
          sonioxClientRef.current.cancel();
        } catch (err) {
          console.warn('Error during cleanup:', err);
        }
      }
    };
  }, [config.apiKey]); // ✅ ONLY apiKey dependency - nothing else!

  // Start recording function
  const startRecording = useCallback(async () => {
    // Check if running on client side
    if (typeof window === 'undefined') {
      setError('Speech recognition only works in the browser');
      return;
    }

    if (!sonioxClientRef.current) {
      setError('Speech recognition not initialized');
      return;
    }

    if (isRecording) {
      console.warn('Already recording');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setConnectionState('connecting');

      // Clear previous transcripts
      allTokensRef.current = [];
      setTokens([]);
      setTranscript('');
      setFinalTranscript('');
      setPartialTranscript('');

      await sonioxClientRef.current.start({
        model: config.model || 'stt-rt-preview',
        languageHints: config.languageHints,
        language: config.language,
        context: config.context,
        enableSpeakerDiarization: config.enableSpeakerDiarization,
        enableLanguageIdentification: config.enableLanguageIdentification,
        enableEndpointDetection: config.enableEndpointDetection,
        translation: config.translation,
        max_non_final_tokens_duration_ms: 3000,
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
          sampleSize: 16,
          ...config.audioConstraints
        },
      });

      primitiveInputRef.current = primitiveInput;
      regularInputRef.current = messageText;
      editorInputRef.current = liveTranscript;
      sortedMacrosRef.current = sortedMacros;
      selectedModelRef.current = selectedModel;
      modelOptionsRef.current = modelOptions;
      isTextAutoCorrectionRef.current = authUser?.isTextAutoCorrection;

      // Capture cursor position and baseline text for primitive input mode
      if (!isEditor && !isThreadRegular) {
        const textarea = document.getElementById('findings') as HTMLTextAreaElement | null;
        if (textarea && typeof textarea.selectionStart === 'number') {
          const start = textarea.selectionStart;
          const value = textarea.value || '';
          baselineBeforeRef.current = value.substring(0, start);
          baselineAfterRef.current = value.substring(start);
          useCursorInsertModeRef.current = true;
        } else {
          useCursorInsertModeRef.current = false;
        }
      } else {
        useCursorInsertModeRef.current = false;
      }

      // Capture cursor position and baseline text for regular composer mode
      if (!isEditor && isThreadRegular) {
        const composer = document.querySelector('.composer-input') as HTMLTextAreaElement | null;
        if (composer && typeof composer.selectionStart === 'number') {
          const start = composer.selectionStart;
          const value = composer.value || '';
          baselineBeforeRegularRef.current = value.substring(0, start);
          baselineAfterRegularRef.current = value.substring(start);
          useCursorInsertModeRegularRef.current = true;
        } else {
          useCursorInsertModeRegularRef.current = false;
        }
      } else {
        useCursorInsertModeRegularRef.current = false;
      }
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (err) {
      console.error('Error starting recording:', err);

      toast({
        title: "Microphone Access Denied",
        description:
          err instanceof Error
            ? err.message
            : "Please allow microphone access to use this feature.",
        variant: "destructive",
      });

      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setConnectionState('error');
      setIsLoading(false);
    }
  }, [config, isRecording, primitiveInput, messageText, liveTranscript, isEditor, isThreadRegular, toast, sortedMacros, selectedModel, modelOptions, authUser?.isTextAutoCorrection]);

  // Stop recording function
  const stopRecording = useCallback(async () => {
    console.log('Stop recording called, isRecording:', isRecording);

    if (!sonioxClientRef.current) {
      console.error('No Soniox client found');
      return;
    }

    if (!isRecording) {
      console.warn('Not currently recording');
      return;
    }

    try {
      console.log('Stopping Soniox recording...');
      setIsLoading(true);
      primitiveInputRef.current = primitiveInput;
      regularInputRef.current = messageText;
      editorInputRef.current = liveTranscript;
      sortedMacrosRef.current = sortedMacros;
      selectedModelRef.current = selectedModel;
      modelOptionsRef.current = modelOptions;
      isTextAutoCorrectionRef.current = authUser?.isTextAutoCorrection;

      await sonioxClientRef.current.stop();
      console.log('Soniox stop() called successfully');
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      setIsRecording(false);
      setIsLoading(false);
    }
  }, [isRecording, primitiveInput, messageText, liveTranscript, sortedMacros, selectedModel, modelOptions, authUser?.isTextAutoCorrection]);

  // Cancel recording function
  const cancelRecording = useCallback(() => {
    if (!sonioxClientRef.current || !isRecording) {
      return;
    }

    try {
      console.log('Canceling recording...');
      sonioxClientRef.current.cancel();
      setIsRecording(false);
      setIsLoading(false);
      setConnectionState('disconnected');
    } catch (err) {
      console.error('Error canceling recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel recording');
    }
  }, [isRecording]);

  // Clear transcript function
  const clearTranscript = useCallback(() => {
    allTokensRef.current = [];
    setTokens([]);
    setTranscript('');
    setFinalTranscript('');
    setPartialTranscript('');
    setError(null);
  }, []);

  return {
    // State
    isRecording,
    isLoading,
    error,
    transcript,
    finalTranscript,
    partialTranscript,
    tokens,

    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    clearTranscript,

    // Status
    connectionState
  };
};