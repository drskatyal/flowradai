import { studyTypes } from "@/constants/chat";
import { StudyTypes } from "@/interfaces";
import { useThreadContext } from "@/providers/thread-provider";
import { useFindingsEmbedding } from "@/modules/thread/hooks";

export const useSelectStudyType = () => {
  const {
    selectedStudyType,
    setSelectedStudyType,
    primitiveInput,
    setIsCompareModalOpen,
    setIsTemplateDialogOpen,
    setSelectedTemplate,
    setPersistedSelectedTemplate,
    persistedSelectedTemplate,
    selectedTemplate,
  } = useThreadContext();

  const { resetTemplate } = useFindingsEmbedding();

  const studyTypeOptions = Object.values(studyTypes);

  const fetchStudyTypes = async (query?: string) => {
    if (query) {
      const cleanQuery = query?.replace(/\s+/g, "") || "";
      return studyTypeOptions.filter((option) =>
        option.label.toLowerCase().includes(cleanQuery.toLowerCase())
      );
    }
    return studyTypeOptions;
  };

  const handleStudyTypeSelect = (value: string) => {
    setIsTemplateDialogOpen(false);
    setIsCompareModalOpen(false);
    const studyType =
      studyTypes[value as StudyTypes] || studyTypes[StudyTypes.Default];
    const isRedirectedFromTemplate =
      selectedStudyType?.value === StudyTypes.Template;
    switch (value) {
      case "template":
        primitiveInput.studyName = null;
        setIsTemplateDialogOpen(true);
        setSelectedTemplate(persistedSelectedTemplate);
        setPersistedSelectedTemplate(null);
        break;
      case "follow-up":
        primitiveInput.studyName = null;
        setIsCompareModalOpen(true);

        if (isRedirectedFromTemplate) {
          setPersistedSelectedTemplate(selectedTemplate);
          setSelectedTemplate(null);
        }
        break;
      default:
        primitiveInput.studyName = null;
        resetTemplate();
        if (isRedirectedFromTemplate) {
          setPersistedSelectedTemplate(selectedTemplate);
          setSelectedTemplate(null);
        }
        break;
    }
    setSelectedStudyType(studyType);
    setSelectedTemplate(null);
  };

  return {
    fetchStudyTypes,
    selectedStudyType,
    setSelectedStudyType,
    handleStudyTypeSelect,
    studyTypeOptions,
  };
};
