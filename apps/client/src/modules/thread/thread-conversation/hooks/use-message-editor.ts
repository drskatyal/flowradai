import { debounce, has } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { RichTextEditorChangeHandlerArgs } from "@/components/customs/rich-text-editor/rich-text-editor";
import { copyText } from "@/helper/copy-text";
import { Template, useToast } from "@/hooks";
import { useUpdateMessage } from "@/hooks/message";
import { useStore } from "@/stores";
import { useThreadContext } from "@/providers/thread-provider";
import { usePrimitiveInput } from "@/modules/chat/hooks";
import { studyTypes } from "@/constants/chat";
import { StudyTypes } from "@/interfaces";

export const useMessageEditor = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [editedResponse, setEditedResponse] = useState<string>("");
  const [reportChanges, setReportChanges] = useState<string>("");
  const reportRef = useRef("");

  const { messages, threadId, isMessageLoading, isRunning } = useStore();
  const { toast } = useToast();

  const updateMessage = useUpdateMessage(threadId || "");

  const {
    setSelectedStudyType,
    templatesData,
    selectedTemplate,
    setSelectedTemplate,
    setCustomTemplate,
    report
  } = useThreadContext();

  useEffect(() => {
    if(selectedTemplate) {
      const original = templatesData?.templates.find((template) => template._id === selectedTemplate._id);
      setSelectedTemplate((prev) => {
        if (!prev) return null; // handle null case safely
      
        return {
          ...prev,
          description: original?.description ?? "",
        };
      });
      setEditedResponse(original?.description ?? '');
    } else {
      setEditedResponse('');
    }
  },[selectedTemplate?._id]);

  const lastAssistantMessage = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      return lastMessage;
    }
    return null;
  }, [messages, isMessageLoading]);

  useEffect(() => {
    if (lastAssistantMessage) {
      if (!has(lastAssistantMessage, 'id')) {
        setEditedResponse(lastAssistantMessage.content || "");
      }
    } else {
      setEditedResponse("");
    }
  }, [lastAssistantMessage]);

  useEffect(() => {
    if (isCopied) {
      setIsCopied(false);
    }
  }, [lastAssistantMessage?.id, lastAssistantMessage]);

  useEffect(() => {
    setEditedResponse(lastAssistantMessage?.content || "");
  }, [lastAssistantMessage?.id, threadId]);

  const handleCopyEditedText = (el: HTMLDivElement | null) => {
    if (el) {
      copyText(el);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
      });
    } else {
      toast({
        title: "Failed to copy text. please try again",
        variant: "destructive",
      });
    }
  };

  const handleSaveEditedResponse = debounce((markdownText: string) => {
    if (lastAssistantMessage && threadId) {
      const updatedMessage = {
        ...lastAssistantMessage,
        content: markdownText,
      };
      if (updatedMessage?.id) {
        updateMessage.mutate(updatedMessage);
      }
    }
  }, 2000);

  const handleEditResponse = ({
    markdownText,
  }: RichTextEditorChangeHandlerArgs) => {
    handleSaveEditedResponse(markdownText);
    if (selectedTemplate === null) {
      setSelectedStudyType(studyTypes[StudyTypes.Template]);
      setCustomTemplate(markdownText);
    }
    if (markdownText === '') {
      setSelectedStudyType(studyTypes[StudyTypes.Default]);
    }
    setSelectedTemplate((prev) => {
      if (!prev) return null; // handle null case safely
    
      return {
        ...prev,
        description: markdownText,
      };
    });
    if (isCopied) {
      setIsCopied(false);
    }
  };

  const handleCorrectionApplyOnReport = (correctedReport: string) => {
    // Update the last assistant message if it exists
    if (lastAssistantMessage && threadId) {
      const updatedMessage = {
        ...lastAssistantMessage,
        content: correctedReport,
      };
      
    //   // Save to database immediately (not debounced since this is user-triggered)
      if (updatedMessage?.id) {
        updateMessage.mutate(updatedMessage, {
          onSuccess: () => {
            toast({
              title: "Corrections applied successfully",
            });
            setEditedResponse(lastAssistantMessage?.content || "");
          },
          onError: () => {
            toast({
              title: "Failed to apply corrections",
              variant: "destructive",
            });
          }
        });
      }
    }

    // // Update template if one is selected
    if (selectedTemplate === null) {
      setSelectedStudyType(studyTypes[StudyTypes.Template]);
      setCustomTemplate(correctedReport);
    }
    
    setSelectedTemplate((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        description: correctedReport,
      };
    });

    // Reset copied state
    if (isCopied) {
      setIsCopied(false);
    }
  };

  useEffect(() => {
    if (report.length) {
      setEditedResponse(report);
    }
  }, [report]);

  return {
    handleCopyEditedText,
    handleSaveEditedResponse,
    lastAssistantMessageText: lastAssistantMessage?.content || "",
    isCopied,
    handleEditResponse,
    editedResponse,
    setEditedResponse,
    messages,
    isMessageLoading,
    isRunning,
    handleCorrectionApplyOnReport,
    reportRef
  };
};
