import { useEffect, useState } from "react";
import { useSendMessage } from "@/modules/chat/hooks/use-send-message";
import { useTextAutoCorrect } from "@/modules/chat/hooks/use-text-auto-correct";
import { CommandType, useStore } from "@/stores/use-store";
import { useComposerRuntime } from "@assistant-ui/react";
import { onTranscrptionArg } from "@/components/customs/mic/hooks/use-mic";
import { useThreadContext } from "@/providers/thread-provider";
import { useSpeciality } from "@/hooks";

export interface AutoSubmitProps {
  newText: string;
  rawText: string;
}

export const useMyComposer = (isSendMessageDisabled: boolean) => {
  const [remainingMessages, setRemainingMessages] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isCorrectingFindings, setIsCorrectingFindings] = useState(false);
  const textAutoCorrectMutation = useTextAutoCorrect();
  const composerRuntime = useComposerRuntime();
  const { messages, thread, addMessage, threadId } = useStore();
  const authUser = useStore((state) => state.user);

  const isInputDisabled =
    isSendMessageDisabled || remainingMessages <= 0 || messages?.length >= 12;

  const { sendAssistantMessage } = useSendMessage(threadId as string);

  const {
    liveTranscript,
    messageText,
    setMessageText,
    modelOptions,
    setSelectedModel,
    actionMode,
    setAutoRefine,
    autoRefine,
    setActionMode,
    selectedModel,
  } = useThreadContext();

  const { data, refetch } = useSpeciality(authUser?.specialityId || '');
  const speciality = data;

  useEffect(() => {
    if (thread?.maxAllowedMessage) {
      const userMessagesCount = messages.filter(
        (msg) => msg.role === "user"
      ).length;

      setRemainingMessages(
        Math.max(Math.floor(thread?.maxAllowedMessage - userMessagesCount), 0)
      );
    }
  }, [thread, messages]);

  const handleAutoSubmission = ({ newText, rawText }: AutoSubmitProps) => {
    // Only proceed if action mode is enabled and we have text
    if (actionMode && newText.trim() && !isInputDisabled) {
      addMessage({
        role: "user",
        content: rawText,
      });

      sendAssistantMessage(
        [
          ...messages,
          {
            role: "user",
            content: rawText,
          },
        ],
        CommandType.REGULAR
      );

      // Clear the input after sending
      // setMessageText("");
      // composerRuntime.setText("");
    } else {
      console.log("Auto-submission skipped:", {
        actionMode,
        hasText: !!newText.trim(),
        isInputDisabled,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && isInputDisabled) {
      e.preventDefault();
    }
  };

  const handleElaborate = () => {
    if (!messages.length || isSendMessageDisabled) return;

    addMessage({
      role: "user",
      content: "Elaborate",
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: "Elaborate",
        },
      ],
      CommandType.ELABORATE
    );
  };

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    // Store current cursor position when text changes
    setCursorPosition(e.target.selectionStart);
  };

  // Handler for cursor position changes
  const handleCursorPositionChange = (
    e: React.SyntheticEvent<HTMLTextAreaElement>
  ) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  // Handler for transcription complete
  const handleTranscriptionComplete = ({ text, rawText }: onTranscrptionArg) => {
    if (text) {
      // Insert text at cursor position instead of appending
      const beforeCursor = messageText.substring(0, cursorPosition);
      const afterCursor = messageText.substring(cursorPosition);
      const newText = beforeCursor + text + afterCursor;

      setMessageText(newText);

      composerRuntime.setText(newText);

      // Update cursor position to end of inserted text
      const newCursorPosition = cursorPosition + text.length;
      setCursorPosition(newCursorPosition);

      // Focus and set cursor position in the textarea
      setTimeout(() => {
        const textarea = document.querySelector(
          "textarea.composer-input"
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);

      if (actionMode && text.trim()) {
        // Allow a little time for the transcription to be processed and displayed
        setTimeout(() => {
          handleAutoSubmission({ newText, rawText: text });
        }, 500);
      }
    }
  };

  const handleSonioxTranscriptionComplete = ({ text, rawText }: onTranscrptionArg) => {
    if (!text && !rawText && selectedModel === modelOptions[0] && authUser?.isTextAutoCorrection) {
      handleFindingsAutoCorrect();
    }
    const newText = messageText;
    composerRuntime.setText(newText);
    if (actionMode) {
      // Allow a little time for the transcription to be processed and displayed
      setTimeout(() => {
        handleAutoSubmission({ newText: messageText, rawText: messageText });
      }, 500);
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isInputDisabled || !messageText.trim()) {
      return;
    }

    addMessage({
      role: "user",
      content: messageText,
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: messageText,
        },
      ],
      CommandType.REGULAR
    );
    // Clear the input after sending
    setMessageText("");
    composerRuntime.setText("");
  };

  const handleFindingsAutoCorrect = () => {
    setIsCorrectingFindings(true);
    textAutoCorrectMutation.mutate(messageText, {
      onSuccess: (data) => {
        setMessageText(data?.correctedText || "");
        setIsCorrectingFindings(false);
      },
      onError: () => {
        setIsCorrectingFindings(false);
      },
    });
  };

  const handleSetActionMode = (value: boolean) => {
    setActionMode(value);
  };
  const elaborateButtonLabel = speciality?.elaborateButtonLabel ?? "Elaborate";
  const isElaborateButton = speciality?.isElaborateButton;

  useEffect(() => {
    switch (selectedModel) {
      case modelOptions[0]:
        return;
      case modelOptions[1]:
        return setAutoRefine(false);
      case modelOptions[2]:
        return setAutoRefine(true);
      default:
        return setAutoRefine(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    // set actionMode
    setActionMode(authUser?.actionMode ?? false);
    // set transcription mode
    switch (authUser?.defaultTranscriptionModel) {
      case "v2":
        return setSelectedModel(modelOptions[0]);
      case "v1":
        return (setSelectedModel(modelOptions[1]), setAutoRefine(false));
      case "v0":
        return (setSelectedModel(modelOptions[2]), setAutoRefine(true));
      default:
        return setSelectedModel(modelOptions[0]);
    }
  }, [authUser]);

  return {
    isInputDisabled,
    handleSubmit,
    handleInputChange,
    handleCursorPositionChange,
    handleTranscriptionComplete,
    handleKeyDown,
    messageText,
    remainingMessages,
    handleElaborate,
    actionMode,
    setActionMode: handleSetActionMode,
    autoRefine,
    handleFindingsAutoCorrect,
    isCorrectingFindings,
    liveTranscript,
    elaborateButtonLabel,
    isElaborateButton,
    handleSonioxTranscriptionComplete
  };
};
