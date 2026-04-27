import { useCallback, useEffect, useState } from "react";
import {
  Template,
  useCloneTemplate,
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
  useUpdateTemplate,
  useBulkCloneTemplates,
} from "@/hooks";
import { CreateUpdateFormSubmitArgs } from "../create-update-template-dialog";
import { useStore } from "@/stores";

export type ActiveTemplateActions = "delete" | "edit" | "clone";
export const useTemplateList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
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
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const user = useStore((state) => state.user);

  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();
  const cloneMutation = useCloneTemplate();
  const bulkCloneMutation = useBulkCloneTemplates();

  const { data, isLoading, refetch } = useTemplates(
    user,
    debouncedSearchQuery,
    limit,
    skip,
    Array.from(selectedSpecialties),
    Array.from(selectedCategories),
    Array.from(selectedTypes),
    showMarketplace
  );

  const allTemplates = data?.templates || [];
  const totalCount = data?.count || 0;

  // Marketplace Logic:
  // If showMarketplace is true, show only marketplace templates
  // Otherwise show only personal templates
  const filteredTemplates = allTemplates.filter((template: Template) => {
    const isMarketplaceTemplate = template.type === "private";

    if (showMarketplace) {
      return isMarketplaceTemplate;
    }

    return !isMarketplaceTemplate;
  });

  // Reset selection when filters change or page changes
  useEffect(() => {
    setRowSelection({});
  }, [
    debouncedSearchQuery,
    showMarketplace,
    selectedSpecialties,
    selectedCategories,
    selectedTypes,
    skip,
    limit,
  ]);

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

  const handleTypeChange = useCallback((values: Set<string>) => {
    setSelectedTypes(values);
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

  const handleCloneTemplateAction = (template: Template) => {
    setActiveTemplate(template);
    setActiveTemplateAction("clone");
    setIsConfirmationDialogOpen(true);
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
    setIsConfirmationDialogOpen(false);
    setActiveTemplateAction(null);
    setActiveTemplate(null);
  };

  const handleAlertDialogConfirm = async () => {
    if (!activeTemplate) return;
    if (activeTemplateAction === "edit") {
      updateMutation.mutate(
        {
          id: activeTemplate?._id,
          data: {
            title: activeTemplate?.title,
            description: activeTemplate?.description,
            category: activeTemplate?.category,
            specialityId: activeTemplate?.specialityId as string,
            prompt: activeTemplate?.prompt as string,
          },
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
    } else if (activeTemplateAction === "clone") {
      cloneMutation.mutate(activeTemplate._id, {
        onSuccess: () => {
          refetch();
          handleAlertDialogCancel();
        },
      });
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

  const handleBulkCloneAction = async () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (id) => rowSelection[id]
    );

    if (selectedIds.length === 0) return;

    bulkCloneMutation.mutate(selectedIds, {
      onSuccess: () => {
        refetch();
        setRowSelection({});
      },
    });
  };

  const isTemplateModalSubmitPending = createMutation.isPending;
  const isConfirmationModalSubmitPending =
    activeTemplateAction === "delete"
      ? deleteMutation.isPending
      : activeTemplateAction === "clone"
        ? cloneMutation.isPending
        : updateMutation.isPending;

  return {
    user,
    limit,
    pageInfo,
    loadMore,
    templates: filteredTemplates,
    isLoading,
    searchQuery,
    loadPrevious,
    showMarketplace,
    setShowMarketplace,
    setSearchQuery,
    activeTemplate,
    expandedTemplate,
    handleLimitChange,
    isTemplateModalOpen,
    activeTemplateAction,
    selectedSpecialties,
    selectedCategories,
    selectedTypes,
    handleSpecialtyChange,
    handleCategoryChange,
    handleTypeChange,
    setIsTemplateModalOpen,
    handleAlertDialogCancel,
    toggleTemplateExpansion,
    handleTemplateFormSubmit,
    isConfirmationDialogOpen,
    handleEditTemplateAction,
    handleCloneTemplateAction,
    handleAlertDialogConfirm,
    handleTemplateModalCancel,
    handleDeleteTemplateAction,
    isTemplateModalSubmitPending,
    isConfirmationModalSubmitPending,
    rowSelection,
    setRowSelection,
    handleBulkCloneAction,
    isBulkClonePending: bulkCloneMutation.isPending,
  };
};