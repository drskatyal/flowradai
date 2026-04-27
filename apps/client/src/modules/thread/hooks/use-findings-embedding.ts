import { useCreateEmbeddings } from "@/hooks"
import { Template } from "@/hooks";
import { useThreadContext } from "@/providers/thread-provider";
import { useEffect, useRef, useState } from "react";

import { useStore } from "@/stores";

export const useFindingsEmbedding = () => {
  const [template, setTemplate] = useState<Template>();
  const templateSelectedRef = useRef(false); // Tracks if a template is already selected
  const { generateEmbeddingVectors, embedingVectors, resetEmbeddings } = useCreateEmbeddings()
  const { selectedTemplate, customTemplate, setReleventTemplates } = useThreadContext();
  const { messages } = useStore();

  const handleFindingsEmbedding = (findingsText: string) => {
    // Prevent generating embeddings if template is already selected
    if (templateSelectedRef.current) return;

    const trimmedText = findingsText.trim();
    if (!trimmedText) return;

    generateEmbeddingVectors({ findings: findingsText });
  }

  const resetTemplate = () => {
    setTemplate(undefined);
    templateSelectedRef.current = false; // allow new embedding generation
    resetEmbeddings();
  };

  useEffect(() => {
    const newTemplate = embedingVectors?.matchingTemplates[0]?.template;
    const threadShold = embedingVectors?.matchingTemplates[0]?.similarity;

    setReleventTemplates(
      embedingVectors?.matchingTemplates?.map((temp) => ({
        ...temp?.template,
        similarity: temp?.similarity,
      })) ?? []
    );

    if (customTemplate === "") {
      // Only auto-select template if no template is selected AND no messages exist (report not generated)
      if (!templateSelectedRef.current && newTemplate && messages.length === 0) {
        templateSelectedRef.current = true; // mark as selected
        if (threadShold >= 0.8) {
          setTemplate(newTemplate);
        }
      }
    }
  }, [embedingVectors, messages.length]);

  useEffect(() => {
    if (selectedTemplate === null) {
      templateSelectedRef.current = false;
    }
  }, [selectedTemplate])

  return {
    handleFindingsEmbedding,
    embedingVectors,
    template,
    resetTemplate
  }
}