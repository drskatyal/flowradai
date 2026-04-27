import { studyTypes } from "@/constants/chat";
import { Template } from "@/hooks";
import { StudyTypes } from "@/interfaces";
import { useThreadContext } from "@/providers/thread-provider";
import { useStore } from "@/stores";
import SelectTemplate from "../chat/select-template";
import { Navbar } from "../home";
import { useEffect, useMemo } from "react";
import { usePrimitiveInput } from "../chat/hooks";
import { useFindingsEmbedding } from "./hooks";
import { debounce } from "lodash";
import { useSelectTemplate } from "../chat/hooks/use-select-template";

const ThreadNavbar = () => {
  const { thread, user } = useStore();
  const {
    setSelectedStudyType,
    templatesData,
    isTemplateDialogOpen,
    setIsTemplateDialogOpen,
    setIsCompareModalOpen,
    setPrimitiveInput,
    selectedStudyType,
    primitiveInput,
    isMicStoped,
    customTemplate,
  } = useThreadContext();
  const isThreadRegular = thread?.status === "regular";
  const { setEditedTemplate } = usePrimitiveInput(false);
  const { handleFindingsEmbedding, template, resetTemplate } =
    useFindingsEmbedding();
  const { setSelectedTemplate } = useSelectTemplate(templatesData.templates);

  const debouncedEmbedding = useMemo(
    () =>
      debounce((value: string) => {
        handleFindingsEmbedding(value);
      }, 4000),
    []
  );

  useEffect(() => {
    if (user?.autoTemplate && customTemplate === "" && !isThreadRegular) {
      if (!isMicStoped) {
        debouncedEmbedding(primitiveInput?.findings ?? "");
      }
    }
    return () => {
      debouncedEmbedding.cancel();
    };
  }, [
    primitiveInput?.findings,
    selectedStudyType,
    user?.autoTemplate,
    isMicStoped,
  ]);

  useEffect(() => {
    if (template) {
      setSelectedTemplate(template);
      setPrimitiveInput((prevState) => ({
        ...prevState,
        studyName: template.title,
      }));
      setSelectedStudyType(studyTypes[StudyTypes.Template]);
    }
  }, [template]);

  const handleTemplateSelect = (template: Template | null) => {
    if (template) {
      setSelectedStudyType(studyTypes[StudyTypes.Template]);
      setPrimitiveInput((prevState) => ({
        ...prevState,
        studyName: template.title,
      }));
      setEditedTemplate(template);
      setIsCompareModalOpen(false);
    } else {
      if (!isTemplateDialogOpen) {
        setSelectedStudyType(studyTypes[StudyTypes.Default]);
        setPrimitiveInput({
          studyName: null,
          findings: null,
        });
        setEditedTemplate(null);
        resetTemplate();
      }
    }
  };

  return (
    <Navbar>
      <SelectTemplate
        isDisabled={thread?.status === "regular"}
        templates={templatesData.templates}
        triggerClassName="w-full"
        onTemplateSelect={handleTemplateSelect}
        listOpen={isTemplateDialogOpen}
        setListOpen={(value) => setIsTemplateDialogOpen(value)}
        isCustom={false}
      />
    </Navbar>
  );
};

export default ThreadNavbar;