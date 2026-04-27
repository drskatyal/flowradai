import { useCallback, useEffect, useState } from "react";
import {
  Template,
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
  useUpdateTemplate,
  TemplateQueryOptions
} from "@/hooks";
import { CreateUpdateFormSubmitArgs } from "../create-update-template-dialog";

export type ActiveTemplateActions = "delete" | "edit";

export const useTemplateList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [activeTemplateAction, setActiveTemplateAction] =
    useState<ActiveTemplateActions | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<Template | null>(
    null
  );

  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate(activeTemplate?._id || "");
  const deleteMutation = useDeleteTemplate();
  
  const options: TemplateQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
  };
  
  const { data, isLoading, refetch } = useTemplates(
    debouncedSearchQuery,
    limit,
    skip,
    Array.from(selectedSpecialties),
    Array.from(selectedCategories),
    options
  );

  const templates = data?.templates || [];
  const totalCount = data?.count || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSkip(0); // Reset pagination when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSpecialtyChange = useCallback((values: Set<string>) => {
    setSelectedSpecialties(values);
    setSkip(0); // Reset pagination when filters change
  }, []);

  const handleCategoryChange = useCallback((values: Set<string>) => {
    setSelectedCategories(values);
    setSkip(0); // Reset pagination when filters change
  }, []);

  const pageInfo = {
    pageCount: Math.ceil(totalCount / limit),
    totalCount,
    hasPreviousPage: skip > 0,
    hasNextPage: skip + limit < totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Math.floor(skip / limit) + 1,
  };

  const loadMore = useCallback(() => {
    if (skip + limit < totalCount) {
      setSkip(skip + limit);
    }
  }, [skip, limit, totalCount]);

  const loadPrevious = useCallback(() => {
    if (skip - limit >= 0) {
      setSkip(skip - limit);
    } else {
      setSkip(0);
    }
  }, [skip, limit]);

  const handleLimitChange = useCallback(
    (newSize: number) => {
      setLimit(newSize);
      // Adjust skip to maintain the current page as much as possible
      const currentPage = Math.floor(skip / limit) + 1;
      const newSkip = (currentPage - 1) * newSize;
      setSkip(newSkip < 0 ? 0 : newSkip);
    },
    [skip, limit]
  );

  const handleTemplateFormSubmit = ({
    formData,
    event,
  }: CreateUpdateFormSubmitArgs) => {
    event.preventDefault();
    if (activeTemplateAction === "edit") {
      setIsConfirmationDialogOpen(true);
      if (activeTemplate) {
        setActiveTemplate({
          ...activeTemplate,
          ...formData,
        });
      }
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          refetch();
          setActiveTemplate(null);
          setIsTemplateModalOpen(false);
        },
      });
    }
  };

  const handleDeleteTemplateAction = (template: Template) => {
    setIsConfirmationDialogOpen(true);
    setActiveTemplate(template);
    setActiveTemplateAction("delete");
  };

  const handleEditTemplateAction = (template: Template) => {
    setActiveTemplate(template);
    setActiveTemplateAction("edit");
    setIsTemplateModalOpen(true);
  };

  const toggleTemplateExpansion = (template: Template) => {
    if (!expandedTemplate) {
      setExpandedTemplate(template);
    } else {
      if (expandedTemplate?._id === template?._id) {
        setExpandedTemplate(null);
      } else {
        setExpandedTemplate(template);
      }
    }
  };

  const handleTemplateModalCancel = () => {
    setIsTemplateModalOpen(false);
    setActiveTemplate(null);
    setActiveTemplateAction(null);
  };

  const handleAlertDialogCancel = () => {
    if (activeTemplateAction === "edit") {
      setIsConfirmationDialogOpen(false);
    } else {
      setIsConfirmationDialogOpen(false);
      setActiveTemplateAction(null);
      setActiveTemplate(null);
    }
  };

  const handleAlertDialogConfirm = async () => {
    if (!activeTemplate) return;
    if (activeTemplateAction === "edit") {
      updateMutation.mutate(
        {
          title: activeTemplate?.title,
          description: activeTemplate?.description,
          category: activeTemplate?.category,
          specialityId: activeTemplate?.specialityId,
          prompt: activeTemplate?.prompt
        },
        {
          onSuccess: () => {
            refetch();
            setActiveTemplate(null);
            setActiveTemplateAction(null);
            setIsConfirmationDialogOpen(false);
            setIsTemplateModalOpen(false);
          },
        }
      );
    } else {
      deleteMutation.mutate(activeTemplate?._id, {
        onSuccess: () => {
          refetch();
          setActiveTemplate(null);
          setActiveTemplateAction(null);
          setIsConfirmationDialogOpen(false);
        },
      });
    }
  };
  const isTemplateModalSubmitPending = createMutation.isPending;
  const isConfirmationModalSubmitPending =
    activeTemplateAction === "delete"
      ? deleteMutation.isPending
      : updateMutation.isPending;

  return {
    limit,
    pageInfo,
    loadMore,
    templates,
    isLoading,
    searchQuery,
    loadPrevious,
    setSearchQuery,
    activeTemplate,
    expandedTemplate,
    handleLimitChange,
    isTemplateModalOpen,
    activeTemplateAction,
    selectedSpecialties,
    selectedCategories,
    handleSpecialtyChange,
    handleCategoryChange,
    setIsTemplateModalOpen,
    toggleTemplateExpansion,
    handleAlertDialogCancel,
    isConfirmationDialogOpen,
    handleTemplateFormSubmit,
    handleEditTemplateAction,
    handleAlertDialogConfirm,
    handleTemplateModalCancel,
    handleDeleteTemplateAction,
    isTemplateModalSubmitPending,
    isConfirmationModalSubmitPending,
  };
};
