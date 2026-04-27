import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { studyTypes } from "@/constants/chat";
import { Template, useSpeciality } from "@/hooks";
import { useMacros, Macro } from "@/hooks/use-macro";
import { StudyTypes } from "@/interfaces";
import { useThreadContext } from "@/providers/thread-provider";
import { CommandType, useStore } from "@/stores";
import { useComposerRuntime } from "@assistant-ui/react";
import { CompareData } from "../compare-modal";
import PrimitiveInput from "../primitive-input";
import { useSendMessage } from "./use-send-message";
import { useTextAutoCorrect } from "./use-text-auto-correct";
import { useCustomProfile } from "@/modules/home/custom-profile/hooks/use-custom-profile";
import { useSaveCustomProfile } from "@/modules/home/custom-profile/hooks/use-save-custom-profile";
import { useUser } from "@clerk/nextjs";
import { onTranscrptionArg } from "@/components/customs/mic/hooks/use-mic";
import { TemplateWithExtra } from "../select-template";

export interface AutoSubmitProps {
  newFindings: string,
  rawText: string
}

export const usePrimitiveInput = (isSendMessageDisabled: boolean) => {
  const [editedTemplate, setEditedTemplate] = useState<Template | null>(null);
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [isCorrectingFindings, setIsCorrectingFindings] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ start: number, end: number } | null>(null);
  const findingsTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string | null>(null);
  const [studyNameError, setStudyNameError] = useState("");
  const [findingsError, setFindingsError] = useState("");
  const [isProfileEditMode, setIsProfileEditMode] = useState<boolean>(false);
  const [rawFindings, setRawFindings] = useState<string>("");

  const {
    messages,
    isMessageLoading,
    threads,
    addMessage,
    threadId,
    isRunning,
  } = useStore();
  const {
    setSelectedTemplate,
    selectedStudyType,
    setSelectedStudyType,
    primitiveInput,
    setPrimitiveInput,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    templatesData,
    selectedDocument,
    setSelectedDocument,
    selectedTemplate,
    customTemplate,
    isCustomProfile,
    setIsCustomProfile,
    releventTemplate,
    liveTranscript,
    setMessageText,
    setSelectedModel,
    selectedModel,
    modelOptions,
    actionMode,
    setActionMode,
    autoRefine,
    setAutoRefine,
    setIsReportComplete
  } = useThreadContext();

  const authUser = useStore((state) => state.user);
  const { user } = useUser();
  const { customProfile } = useCustomProfile(user?.id || "");
  const { saveCustomProfile } = useSaveCustomProfile();
  const textAutoCorrectMutation = useTextAutoCorrect();
  const composerRuntime = useComposerRuntime();
  const { sendAssistantMessage } = useSendMessage(threadId || "");
  const { data, refetch } = useSpeciality(authUser?.specialityId || '');
  const speciality = data;
  const { data: macrosData } = useMacros();
  const macros = macrosData?.macros || [];



  useEffect(() => {
    refetch();
  }, [authUser, refetch]);

  const sortedMacros = useMemo(() => {
    return [...macros].sort((a: Macro, b: Macro) => b.name.length - a.name.length);
  }, [macros]).filter((macro: Macro) => macro.userId === authUser?._id && macro.isActive);

  const templates = templatesData.templates;
  const isInputDisabled = isSendMessageDisabled || messages?.length >= 12;

  // Helper function to process macro replacements - centralized logic
  const processMacroReplacement = useCallback((text: string): string => {
    if (!sortedMacros?.length) return text;

    let processedText = text;

    for (const macro of sortedMacros) {
      if (!macro.name || !macro.description) continue;

      // Check if macro name starts with "Insert " (case-insensitive)
      const startsWithInsert = /^insert\s+/i.test(macro.name);

      // Remove "Insert " prefix if it exists for flexible matching
      const macroNameWithoutInsert = startsWithInsert
        ? macro.name.replace(/^insert\s+/i, '').trim()
        : macro.name;

      // Create a version without spaces for matching
      const macroNameNoSpaces = macroNameWithoutInsert.replace(/\s+/g, '');

      // Escape special characters for regex
      const escapedName = macroNameWithoutInsert.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedNameNoSpaces = macroNameNoSpaces.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create a flexible pattern that matches the macro name with OR without spaces
      // This creates a pattern like: (N|n)(o|O)(r|R)(m|M)(a|A)(l|L)\s*(C|c)(h|H)(e|E)(s|S)(t|T)
      const flexiblePattern = macroNameNoSpaces
        .split('')
        .map((char: any) => `(${char.toLowerCase()}|${char.toUpperCase()})`)
        .join('\\s*'); // Allow optional spaces between each character

      // Create patterns that ALWAYS require "insert" prefix
      const patterns = [];

      // Pattern 1: insert + flexible spacing (handles "insert normal chest", "insert normalchest", etc.)
      patterns.push(`\\binsert\\s+${flexiblePattern}(?=\\s|[.,!?;:]|$)`);

      // Combine all patterns
      const regex = new RegExp(patterns.join('|'), 'gi');

      // Check if this pattern exists in the input
      if (regex.test(processedText)) {
        // Create a fresh regex for replacement (regex.test() consumed it)
        const replaceRegex = new RegExp(patterns.join('|'), 'gi');
        processedText = processedText.replace(replaceRegex, macro.description);

        // Break after first match to avoid multiple replacements
        break;
      }
    }

    return processedText;
  }, [sortedMacros]);

  useEffect(() => {
    // If messages array length increases, it means a new message was sent
    if (messages.length > 0) {
      // Check if the last message is from the user, that means generate was clicked
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "user") {
        setEditedTemplate(null);
        setSelectedTemplate(null);
        setSelectedStudyType(studyTypes[StudyTypes.Default]);
      }
    }
  }, [messages.length, setSelectedTemplate, setSelectedStudyType]);

  useEffect(() => {
    if (isCustomProfile) {
      setCustomInstructions(customProfile?.content || "");
    }
  }, [isCustomProfile, customProfile]);

  useEffect(() => {
    setIsProfileEditMode(customProfile?.content === customInstructions);
  }, [customProfile, customInstructions]);

  const handleSaveCustomProfile = () => {
    if (customInstructions || customInstructions === "") {
      saveCustomProfile(customInstructions);
    }
  }

  const handleStructuredReporting = () => {
    if (
      isSendMessageDisabled ||
      !primitiveInput.findings
    )
      return;

    const content = `${primitiveInput?.studyName ? `Study Type:\n${primitiveInput?.studyName}` : ``}\n\nFindings:\n${primitiveInput?.findings}`;

    const isTemplate = selectedStudyType?.value === "template";
    const isCompare = selectedStudyType?.value === "compare";

    const compare = {
      isCompare,
      compareData: compareData,
    };

    const template = {
      isTemplate,
      description: editedTemplate?.description || "",
    };

    addMessage({
      role: "user",
      content: content,
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: content,
        },
      ],
      CommandType.STRUCTURED_REPORTING,
      template,
      isCustomProfile ? customInstructions : null,
      selectedDocument ? selectedDocument : null,
    );

    // Clear template and form data
    setPrimitiveInput({
      studyName: null,
      findings: null,
    });
    setEditedTemplate(null);
    setSelectedTemplate(null);
    setSelectedDocument(null);
    setSelectedStudyType(studyTypes[StudyTypes.Default]);
    setCustomInstructions(null);
    composerRuntime.setText("");
  };

  const composerSendHandler = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      isSendMessageDisabled ||
      !primitiveInput.findings
    )
      return;

    const content = `Findings:\n${primitiveInput?.findings}`;

    const isTemplate = false;

    const template = {
      isTemplate,
      description: "",
      prompt: "",
    };

    addMessage({
      role: "user",
      content: content,
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: content,
        },
      ],
      CommandType.REGULAR,
      template,
      isCustomProfile ? customInstructions : null,
      selectedDocument ? selectedDocument : null
    );

    setMessageText("");
    setEditedTemplate(null);
    setSelectedTemplate(null);
    setSelectedStudyType(studyTypes[StudyTypes.Default]);
    setCustomInstructions(null);
    setSelectedDocument(null);
    composerRuntime.setText("");
  };

  const handleTemplateReporting = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      isSendMessageDisabled ||
      !primitiveInput.findings
    )
      return;

    const content = `Findings:\n${primitiveInput?.findings}`;

    const isTemplate = selectedStudyType?.value === "template";

    const template = {
      isTemplate,
      description: selectedTemplate?.description || editedTemplate?.description || "" || customTemplate,
      prompt: selectedTemplate?.prompt || editedTemplate?.prompt || "",
    };

    addMessage({
      role: "user",
      content: content,
    });

    sendAssistantMessage(
      [
        ...messages,
        {
          role: "user",
          content: content,
        },
      ],
      CommandType.REGULAR,
      template,
      isCustomProfile ? customInstructions : null,
      selectedDocument ? selectedDocument : null
    );

    setMessageText("");
    setEditedTemplate(null);
    setSelectedTemplate(null);
    setSelectedStudyType(studyTypes[StudyTypes.Default]);
    setCustomInstructions(null);
    setSelectedDocument(null);
    composerRuntime.setText("");
  }

  const handleAutoSubmission = ({ newFindings, rawText }: AutoSubmitProps) => {
    // Only proceed if action mode is enabled and we have text
    if (actionMode && newFindings.trim() && !isInputDisabled) {
      const content = `${primitiveInput?.studyName ? `Study Type:\n${primitiveInput?.studyName}` : ``}\n\nFindings:\n${rawText}`;

      const isTemplate = selectedStudyType?.value === "template";

      const template = {
        isTemplate,
        description: selectedTemplate?.description || editedTemplate?.description || "" || customTemplate,
        prompt: selectedTemplate?.prompt || editedTemplate?.prompt || "",
      };

      addMessage({
        role: "user",
        content: content,
      });

      sendAssistantMessage(
        [
          ...messages,
          {
            role: "user",
            content: content,
          },
        ],
        CommandType.REGULAR,
        template,
        isCustomProfile ? customInstructions : null,
        selectedDocument ? selectedDocument : null
      );

      // Clear template and form data
      setPrimitiveInput({
        studyName: null,
        findings: null,
      });
      setMessageText("");
      setEditedTemplate(null);
      setSelectedTemplate(null);
      setSelectedStudyType(studyTypes[StudyTypes.Default]);
      setCustomInstructions(null);
      composerRuntime.setText("");
    }
  };

  const handleTemplateModalSave = (template: Template) => {
    setEditedTemplate(template);
    setPrimitiveInput((prevState) => ({
      ...prevState,
      studyName: template.title,
    }));
    setSelectedTemplate(template);
    composerRuntime.setText(
      `Study Type:\n${template.title
      }\n\nClinical History:Not provided\n\nFindings:\n${primitiveInput.findings || ""
      }`
    );
  };

  const handlePrimitiveInputChange = (
    field: keyof PrimitiveInput,
    value: string
  ) => {
    // Process macro replacement
    let newValue = field === "findings" ? processMacroReplacement(value) : value;

    validateFields(field, newValue);
    setPrimitiveInput((prevState) => {
      const updatedState = {
        ...prevState,
        [field]: newValue,
      };
      composerRuntime.setText(
        `Study Type:\n${updatedState.studyName}\n\nFindings:\n${updatedState.findings}`
      );
      return updatedState;
    });

    // If this is for the findings field, track cursor position
    if (field === "findings") {
      const textarea = document.getElementById('findings') as HTMLTextAreaElement;
      if (textarea) {
        findingsTextareaRef.current = textarea;
        setCursorPosition({
          start: textarea.selectionStart,
          end: textarea.selectionEnd
        });
      }
    }
  };

  // Track cursor position whenever user clicks or interacts with the findings textarea
  useEffect(() => {
    const textarea = document.getElementById('findings') as HTMLTextAreaElement;
    if (textarea) {
      findingsTextareaRef.current = textarea;

      const trackCursorPosition = () => {
        setCursorPosition({
          start: textarea.selectionStart,
          end: textarea.selectionEnd
        });
      };

      textarea.addEventListener('click', trackCursorPosition);
      textarea.addEventListener('keyup', trackCursorPosition);
      textarea.addEventListener('select', trackCursorPosition);

      return () => {
        textarea.removeEventListener('click', trackCursorPosition);
        textarea.removeEventListener('keyup', trackCursorPosition);
        textarea.removeEventListener('select', trackCursorPosition);
      };
    }
  }, []);

  const handleFindingsAutoCorrect = () => {
    setIsCorrectingFindings(true);
    textAutoCorrectMutation.mutate(primitiveInput.findings || "", {
      onSuccess: (data) => {
        setPrimitiveInput((prevState) => ({
          ...prevState,
          findings: data?.correctedText,
        }));
        setIsCorrectingFindings(false);
      },
      onError: () => {
        setIsCorrectingFindings(false);
      },
    });
  };

  const handleTranscriptionComplete = ({ text, rawText }: onTranscrptionArg) => {
    if (isInputDisabled || !text || text.trim() === '') {
      return;
    }
    if (actionMode) {
      setRawFindings(rawText);
    }
    // Get the current textarea element and its real-time cursor position
    const textarea = findingsTextareaRef.current || document.getElementById('findings') as HTMLTextAreaElement;
    if (!textarea) return;

    // Get current cursor position from the actual textarea element
    const currentCursorStart = textarea.selectionStart;
    const currentCursorEnd = textarea.selectionEnd;
    const currentFindings = textarea.value || '';

    // Insert text at the current cursor position
    const beforeCursor = currentFindings.substring(0, currentCursorStart);
    const afterCursor = currentFindings.substring(currentCursorEnd);

    // Add appropriate spacing
    const needsSpaceBefore = beforeCursor.length > 0 && !beforeCursor.endsWith(' ') && !beforeCursor.endsWith('\n');
    const needsSpaceAfter = afterCursor.length > 0 && !afterCursor.startsWith(' ') && !afterCursor.startsWith('\n');

    let newFindings = beforeCursor;

    if (!beforeCursor.endsWith(text)) {
      newFindings += (needsSpaceBefore ? ' ' : '') + text;
    }

    newFindings += (needsSpaceAfter ? ' ' : '') + afterCursor;

    // Process macro replacement on the new findings text
    newFindings = processMacroReplacement(newFindings);

    // Calculate new cursor position (after inserted text)
    const newCursorPosition = beforeCursor.length +
      (needsSpaceBefore ? 1 : 0) +
      text.length;

    // Clear any existing validation errors
    setFindingsError("");
    setStudyNameError("");

    // Update the textarea value immediately
    textarea.value = newFindings;

    // Update the React state
    setPrimitiveInput(prevState => {
      const updatedState = {
        ...prevState,
        findings: newFindings
      };

      // Update composer text
      composerRuntime.setText(
        `Study Type:\n${updatedState.studyName || ''}\n\nFindings:\n${newFindings}`
      );
      return updatedState;
    });

    // Set the cursor position and focus
    textarea.focus();
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);

    // Trigger input event to ensure React recognizes the change
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Update our tracked cursor position
    setCursorPosition({
      start: newCursorPosition,
      end: newCursorPosition
    });

    if (actionMode && text.trim()) {
      // Allow a little time for the transcription to be processed and displayed
      setTimeout(() => {
        handleAutoSubmission({ newFindings, rawText: text });
      }, 500);
    }
  };

  const handleSonioxTranscriptionComplete = ({ text, rawText }: onTranscrptionArg) => {
    if (!text && !rawText && selectedModel === modelOptions[0] && authUser?.isTextAutoCorrection) {
      handleFindingsAutoCorrect();
    }
    if (actionMode) {
      // Process macro replacement before auto submission
      const processedFindings = processMacroReplacement(primitiveInput.findings || "");

      // Update the state with processed findings
      if (processedFindings !== primitiveInput.findings) {
        setPrimitiveInput(prevState => ({
          ...prevState,
          findings: processedFindings
        }));
      }

      // Allow a little time for the transcription to be processed and displayed
      setTimeout(() => {
        handleAutoSubmission({
          newFindings: processedFindings,
          rawText: processedFindings
        });
      }, 500);
    }
  }

  const validateFields = (field: "studyName" | "findings", value: string) => {
    const trimmedValue = value.trim();

    if (field === "studyName") {
      if (trimmedValue && !primitiveInput.findings?.trim()) {
        setFindingsError("Findings are required.");
      } else {
        setFindingsError("");
        setStudyNameError("");
      }
    }

    if (field === "findings") {
      setStudyNameError("");
      setFindingsError("");
    }
  };

  const handleTemplateSelect = (template: TemplateWithExtra) => {
    setSelectedStudyType(studyTypes[StudyTypes.Template]);
    setSelectedTemplate(template);
  }

  const structredReportingButtonLabel = () => {
    return speciality?.specialityButtonLabel ?? "Structured Reporting Approach";
  }

  const isStructuredReport = speciality?.isButton;

  const handleSetActionMode = (value: boolean) => {
    setActionMode(value);
  };

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
    //update actionmode
    setActionMode(authUser?.actionMode ?? false);
    //update transcription mode
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

  useEffect(() => {
    setIsReportComplete(isInputDisabled);
  }, [isInputDisabled]);

  return {
    threads,
    isRunning,
    templates,
    actionMode,
    autoRefine,
    compareData,
    studyNameError,
    liveTranscript,
    findingsError,
    primitiveInput,
    editedTemplate,
    isCustomProfile,
    isInputDisabled,
    isMessageLoading,
    isProfileEditMode,
    customInstructions,
    findingsTextareaRef,
    isCorrectingFindings,
    isTemplateDialogOpen,
    selectedStudyType,
    isStructuredReport,
    selectedDocument,
    releventTemplate,
    setPrimitiveInput,
    validateFields,
    setActionMode: handleSetActionMode,
    setEditedTemplate,
    setIsCustomProfile,
    setCustomInstructions,
    composerSendHandler,
    handleTemplateSelect,
    handleSaveCustomProfile,
    handleTemplateModalSave,
    setIsTemplateDialogOpen,
    handleFindingsAutoCorrect,
    handleStructuredReporting,
    handleTemplateReporting,
    handlePrimitiveInputChange,
    handleTranscriptionComplete,
    structredReportingButtonLabel,
    handleSonioxTranscriptionComplete
  };
};