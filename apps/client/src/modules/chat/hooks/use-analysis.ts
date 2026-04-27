import { useApplyChanges, useCreateAnalysis, useReportAnalysis } from "@/hooks";
import { useThreadContext } from "@/providers/thread-provider";
import { useStore } from "@/stores";
import { useEffect, useState } from "react";
import { useReportValidation } from "./use-report-validation";
import { useGuideline } from "./use-guideline";

interface Analysis {
  threadId: string;
  errors?: any;
  guideline?: any;
}

const useAnalysis = () => {
  // Local state
  const [tabValue, setTabValue] = useState<"error" | "guideline">("error");
  const [errorEnabled, setErrorEnabled] = useState(true);
  const [guidelineEnabled, setGuidelineEnabled] = useState(false);

  // Store & context
  const threadId = useStore((state) => state.threadId);
  const user = useStore((state) => state.user);
  const { addMessage, messages, setIsRunning, thread } = useStore();
  const { primitiveInput, setReport } = useThreadContext();

  // Hooks
  const { handleCreateAnalysis } = useCreateAnalysis();
  const { getReportAnalysis, analysis } = useReportAnalysis();
  const { checkReportErrors, reportErrors, isLoading } = useReportValidation({
    findings: primitiveInput?.findings || messages[0]?.content || "",
    report: messages[1]?.content,
  });

  const {
    streamGuideline,
    isStreamComplete,
    isGuidelieLoading: guidelineLoading,
    checkReportGuideline,
  } = useGuideline({
    findings: primitiveInput?.findings || messages[0]?.content || "",
  });

  const { applyChanges, isChangeLoading } = useApplyChanges(threadId as string);

  // Internal functions
  const saveReportAnalysis = ({ errors, guideline }: Analysis) => {
    if (!threadId) return;

    // Use current analysis data as fallback to ensure we don't overwrite with undefined
    // This protects against cases where we're saving one field but haven't loaded/generated the other yet
    const currentErrors = analysis?.data?.error;
    const currentGuideline = analysis?.data?.guideline;

    handleCreateAnalysis({
      threadId,
      errors: errors !== undefined ? errors : currentErrors,
      guideline: guideline !== undefined ? guideline : currentGuideline
    });
  };

  const fetchReportAnalysis = (threadId: string) => {
    if (threadId && thread) getReportAnalysis({ threadId });
  };

  const handleApplyChanges = () => {
    if (!reportErrors?.corrected_report && !analysis.data?.error?.corrected_report) return;

    setReport(reportErrors?.corrected_report || analysis.data?.error?.corrected_report);

    const userMsg = {
      role: "user" as const,
      content: messages[0]?.content,
    };

    const updatedMessages = [...messages, userMsg];
    const messageContent = reportErrors?.corrected_report ? reportErrors?.corrected_report : analysis.data?.error?.corrected_report;

    setIsRunning(true);
    applyChanges({
      messages: updatedMessages,
      message: messageContent,
      threadId,
    });
  };

  // Effects

  // Fetch existing analysis when thread changes
  useEffect(() => {
    if (threadId) fetchReportAnalysis(threadId);
  }, [threadId, thread]);

  // Save report errors when generated
  useEffect(() => {
    if (threadId && reportErrors) {
      saveReportAnalysis({ threadId, errors: reportErrors });
    }
  }, [reportErrors]);

  // Save guideline when streaming completes
  useEffect(() => {
    if (threadId && streamGuideline && isStreamComplete) {
      saveReportAnalysis({ threadId, guideline: streamGuideline, errors: reportErrors });
    }
  }, [isStreamComplete, streamGuideline]);

  // Auto-check for errors after message creation
  useEffect(() => {
    if (
      !isChangeLoading &&
      user?.isErrorCheck &&
      messages.length >= 2 &&
      messages.length <= 3 &&
      messages[1]?.id &&
      primitiveInput?.findings &&
      threadId && thread
    ) {
      checkReportErrors({
        findings: primitiveInput.findings || "",
        report: messages[1]?.content,
      });
    }
  }, [user?.isErrorCheck, messages?.length > 1 && messages?.length < 3 && messages[1]?.id, primitiveInput.findings?.length]);

  // Auto-check guideline when enabled and user switches to guideline tab
  useEffect(() => {
    if (
      (user?.isReportGuideline || guidelineEnabled) &&
      !streamGuideline &&
      tabValue === "guideline" &&
      primitiveInput?.findings
    ) {
      checkReportGuideline({
        findings: primitiveInput.findings || messages[0]?.content || "",
      });
    }
  }, [
    user?.isReportGuideline,
    tabValue,
    guidelineEnabled
  ]);

  return {
    tabValue,
    setTabValue,
    setErrorEnabled,
    setGuidelineEnabled,
    saveReportAnalysis,
    fetchReportAnalysis,
    handleApplyChanges,
    errorEnabled: user?.isErrorCheck,
    reportErrors: reportErrors ?? analysis?.data?.error,
    isLoading,
    guidelineLoading,
    streamGuideline: streamGuideline.length ? streamGuideline : analysis?.data?.guideline,
    isStreamComplete,
    analysis,
    guidelineEnabled,
    preferenceGuidelineEnable: user?.isReportGuideline
  };
};

export default useAnalysis;
