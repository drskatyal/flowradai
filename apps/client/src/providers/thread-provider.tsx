"use client";
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Option } from "@/components/ui/customs/async-select";
import { studyTypes } from "@/constants/chat";
import { Template } from "@/hooks/use-template-handler";
import { useInfiniteTemplates } from "@/hooks/use-infinite-templates";
import { Document } from "@/hooks";
import { StudyTypes, TemplatesData } from "@/interfaces";
import { PrimitiveInput } from "@/modules/chat";
import { TemplateWithExtra } from "@/modules/chat/select-template";
import { useStore } from "@/stores";
import { useThreads } from "@/modules/thread/hooks";

const noop = () => undefined;
const noopSetRelevantTemplates = ((value: React.SetStateAction<TemplateWithExtra[]>) =>
  value) as React.Dispatch<React.SetStateAction<TemplateWithExtra[]>>;

interface ThreadContextType {
  selectedTemplate: Template | null;
  setSelectedTemplate: React.Dispatch<React.SetStateAction<Template | null>>;
  selectedStudyType: Option;
  setSelectedStudyType: React.Dispatch<React.SetStateAction<Option>>;
  isTemplateDialogOpen: boolean;
  setIsTemplateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  primitiveInput: PrimitiveInput;
  setPrimitiveInput: React.Dispatch<React.SetStateAction<PrimitiveInput>>;
  persistedSelectedTemplate: Template | null;
  setPersistedSelectedTemplate: React.Dispatch<
    React.SetStateAction<Template | null>
  >;
  selectedDocument: Document | null;
  setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
  templatesData: TemplatesData;
  customTemplate: string | null;
  setCustomTemplate: React.Dispatch<React.SetStateAction<string | null>>;
  setIsMicStoped: React.Dispatch<React.SetStateAction<boolean>>;
  isMicStoped: boolean;
  releventTemplate: TemplateWithExtra[];
  setReleventTemplates: React.Dispatch<React.SetStateAction<TemplateWithExtra[]>>;
  isCustomProfile: boolean;
  setIsCustomProfile: React.Dispatch<React.SetStateAction<boolean>>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  liveTranscript: string;
  setLiveTranscript: React.Dispatch<React.SetStateAction<string>>;
  modelOptions: string[];
  messageText: string;
  setMessageText: React.Dispatch<React.SetStateAction<string>>;
  actionMode: boolean;
  setActionMode: React.Dispatch<React.SetStateAction<boolean>>;
  autoRefine: boolean;
  setAutoRefine: React.Dispatch<React.SetStateAction<boolean>>;
  sidebar: boolean;
  setSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isReportcomplete: boolean;
  setIsReportComplete: React.Dispatch<React.SetStateAction<boolean>>;
  report: string;
  setReport: React.Dispatch<React.SetStateAction<string>>;
  voiceCommandsEnabled: boolean;
  setVoiceCommandsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ThreadContext = createContext<ThreadContextType>({
  selectedTemplate: null,
  setSelectedTemplate: noop,
  selectedStudyType: studyTypes[StudyTypes.Default],
  setSelectedStudyType: noop,
  isTemplateDialogOpen: false,
  setIsTemplateDialogOpen: noop,
  isCompareModalOpen: false,
  setIsCompareModalOpen: noop,
  primitiveInput: {
    studyName: null,
    findings: null,
  },
  setPrimitiveInput: noop,
  templatesData: { templates: [], count: 0 },
  persistedSelectedTemplate: null,
  setPersistedSelectedTemplate: noop,
  selectedDocument: null,
  setSelectedDocument: noop,
  customTemplate: "",
  setCustomTemplate: noop,
  setIsMicStoped: noop,
  isMicStoped: false,
  releventTemplate: [],
  setReleventTemplates: noopSetRelevantTemplates,
  isCustomProfile: false,
  setIsCustomProfile: noop,
  selectedModel: '',
  setSelectedModel: noop,
  liveTranscript: '',
  setLiveTranscript: noop,
  modelOptions: [],
  messageText: '',
  setMessageText: noop,
  actionMode: false,
  setActionMode: noop,
  autoRefine: false,
  setAutoRefine: noop,
  sidebar: true,
  setSidebar: noop,
  isReportcomplete: false,
  setIsReportComplete: noop,
  report: "",
  setReport: noop,
  voiceCommandsEnabled: false,
  setVoiceCommandsEnabled: noop
});

export const ThreadProvider = ({
  children,
}: {
  children: React.ReactNode | ((props: ThreadContextType) => React.ReactNode);
}) => {
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [customTemplate, setCustomTemplate] = useState<string | null>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [persistedSelectedTemplate, setPersistedSelectedTemplate] =
    useState<Template | null>(null);
  const [selectedStudyType, setSelectedStudyType] = useState<Option>(
    studyTypes[StudyTypes.Default]
  );
  const [primitiveInput, setPrimitiveInput] = useState<PrimitiveInput>({
    studyName: null,
    findings: null,
  });
  const { user } = useStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteTemplates(user, "");

  // Flatten pages into templates array for the dropdown
  const templatesData: TemplatesData = useMemo(() => ({
    templates: data?.pages.flatMap(page => page.templates) ?? [],
    count: data?.pages[0]?.count ?? 0,
    hasMore: hasNextPage,
    loadMore: fetchNextPage,
    isLoadingMore: isFetchingNextPage
  }), [data, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const [isMicStoped, setIsMicStoped] = useState(false);
  const [releventTemplate, setReleventTemplates] = React.useState<TemplateWithExtra[]>([]);
  const [isCustomProfile, setIsCustomProfile] = useState(false);
  const modelOptions = ["Transcription v2.0-Fastest", "Transcription v1.0", "Smart Record and Transcribe"];
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [messageText, setMessageText] = useState("");

  const [actionMode, setActionMode] = useState<boolean>(false);
  const [autoRefine, setAutoRefine] = useState<boolean>(false);

  //sidebar props
  const [sidebar, setSidebar] = useState<boolean>(true);
  const [isReportcomplete, setIsReportComplete] = useState<boolean>(false);

  //Corrected report
  const [report, setReport] = useState("");
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(
    user?.voiceCommandsEnabled ?? false
  );

  // Ensure threads are fetched on mount
  useThreads();

  useEffect(() => {
    setVoiceCommandsEnabled(user?.voiceCommandsEnabled ?? false);
  }, [user?.voiceCommandsEnabled]);

  return (
    <ThreadContext.Provider
      value={{
        selectedTemplate,
        setSelectedTemplate,
        selectedStudyType,
        setSelectedStudyType,
        isTemplateDialogOpen,
        setIsTemplateDialogOpen,
        isCompareModalOpen,
        setIsCompareModalOpen,
        primitiveInput,
        setPrimitiveInput,
        templatesData,

        persistedSelectedTemplate,
        setPersistedSelectedTemplate,

        selectedDocument,
        setSelectedDocument,

        customTemplate,
        setCustomTemplate,

        isMicStoped,
        setIsMicStoped,

        releventTemplate,
        setReleventTemplates,

        isCustomProfile,
        setIsCustomProfile,

        selectedModel,
        setSelectedModel,

        liveTranscript,
        setLiveTranscript,

        modelOptions,

        messageText,
        setMessageText,

        actionMode,
        setActionMode,
        autoRefine,
        setAutoRefine,

        sidebar,
        setSidebar,

        isReportcomplete,
        setIsReportComplete,

        report,
        setReport,

        voiceCommandsEnabled,
        setVoiceCommandsEnabled
      }}
    >
      {typeof children === "function"
        ? children({
          selectedTemplate,
          setSelectedTemplate,
          selectedStudyType,
          setSelectedStudyType,
          isTemplateDialogOpen,
          setIsTemplateDialogOpen,
          isCompareModalOpen,
          setIsCompareModalOpen,
          primitiveInput,
          setPrimitiveInput,
          templatesData,
          persistedSelectedTemplate,
          setPersistedSelectedTemplate,
          selectedDocument,
          setSelectedDocument,
          customTemplate,
          setCustomTemplate,
          isMicStoped,
          setIsMicStoped,
          releventTemplate,
          setReleventTemplates,
          isCustomProfile,
          setIsCustomProfile,
          setSelectedModel,
          selectedModel,
          liveTranscript,
          setLiveTranscript,
          modelOptions,
          messageText,
          setMessageText,
          actionMode,
          setActionMode,
          autoRefine,
          setAutoRefine,
          sidebar,
          setSidebar,
          isReportcomplete,
          setIsReportComplete,
          report,
          setReport,
          voiceCommandsEnabled,
          setVoiceCommandsEnabled
        })
        : children}
    </ThreadContext.Provider>
  );
};

export default ThreadProvider;

export const useThreadContext = () => useContext(ThreadContext);
