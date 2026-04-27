import { Template } from "@/hooks/use-template-handler";
import { useThreadContext } from "@/providers/thread-provider";
import { useStore } from "@/stores";
import { useMemo, useState } from "react";

export const useSelectTemplate = (
  templates: Template[],
  onTemplateSelect?: (template: Template | null) => void
) => {
  const user = useStore((state) => state.user);
  const { selectedTemplate, setSelectedTemplate, releventTemplate } = useThreadContext();
  const [selected, setSelected] = useState("default");
  const [selectedPrivacy, setSelectedPrivacy] = useState("all");

  const options = [
    { label: "Normal", value: "normal" },
    { label: "Abnormal", value: "abnormal" },
    { label: "Default", value: "default" },
  ];

  const privacyOptions = [
    { label: "All", value: "all" },
    { label: "Default", value: "private" },
    { label: "Personal", value: "public" },
    { label: "Relevent", value: "relevent" }
  ]

  const refactorTemplate = useMemo(() => {
    if (!templates || !Array.isArray(templates)) {
      return [];
    }

    return templates.map((template) => ({
      ...template,
      disabled: false,
    }));
  }, [templates, user?.specialityId]);

  const filteredtemplate = useMemo(() => {
    if (!refactorTemplate) return [];

    // Map for quick similarity lookup
    const similarityMap = new Map(
      (releventTemplate || []).map((t) => [t._id, t.similarity ?? null])
    );

    let filtered = refactorTemplate
      .map((template) => ({
        ...template,
        similarity: similarityMap.get(template._id) ?? null, // ✅ bind similarity to all
      }))
      .filter((template) => {
        const matchesPrivacy =
          selectedPrivacy === "all" ||
          (selectedPrivacy === "relevent" && similarityMap.has(template._id)) ||
          template.type === selectedPrivacy;

        const matchesCategory =
          selected === "default" || template.category === selected;

        return matchesPrivacy && matchesCategory;
      });

    // Sorting: relevant always pinned first (with similarity order)
    if (["all", "private", "public"].includes(selectedPrivacy)) {
      const relevant = filtered
        .filter((t) => similarityMap.has(t._id))
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));

      const others = filtered.filter((t) => !similarityMap.has(t._id));

      filtered = [...relevant, ...others];
    }

    return filtered;
  }, [selected, selectedPrivacy, refactorTemplate, releventTemplate]);

  const fetchTemplateOptions = async (query?: string) => {
    if (!filteredtemplate) return [];

    if (!query) return filteredtemplate;

    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return filteredtemplate.filter((template) => {
      const title = template.title.toLowerCase();
      return words.every((word) => title.includes(word));
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    if (!templates || !Array.isArray(templates)) {
      return;
    }

    const template = templates.find((t) => t._id === templateId) || null;
    setSelectedTemplate(template);
    onTemplateSelect?.(template);

    if (!template) {
      setSelectedPrivacy("all");
    }
  };

  return {
    fetchTemplateOptions,
    handleTemplateSelect,
    selectedTemplate,
    options,
    selected,
    setSelected,
    privacyOptions,
    selectedPrivacy,
    setSelectedPrivacy,
    setSelectedTemplate
  };
};
