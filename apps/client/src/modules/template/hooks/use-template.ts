import { useState, useEffect, useCallback } from "react";
import {
  Template,
  useDeleteTemplate,
  useTemplates,
  useUpdateTemplate,
} from "@/hooks";
import { useStore } from "@/stores";

export const useTemplate = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [specialityId, setSpecialityId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const user = useStore((state) => state.user);

  const { data, isLoading, refetch } = useTemplates(
    user,
    debouncedSearchQuery,
    limit,
    skip
  );

  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const templates = data?.templates || [];
  const totalCount = data?.count || 0;

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSkip(0); // Reset pagination when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset form fields when editTemplate changes
  useEffect(() => {
    if (editTemplate) {
      setTitle(editTemplate.title);
      setDescription(editTemplate.description);
      setCategory(editTemplate.category);
      setPrompt(editTemplate?.prompt);
    }
  }, [editTemplate]);

  const handleRowExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleEditClick = (template: Template) => {
    setEditTemplate(template);
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveClick = () => {
    if (
      editTemplate &&
      (title !== editTemplate.title || description !== editTemplate.description)
    ) {
      setIsWarningDialogOpen(true);
    } else {
      handleConfirmSave();
    }
  };

  const handleConfirmSave = () => {
    if (editTemplate) {
      updateMutation.mutate(
        {
          id: editTemplate._id,
          data: {
            title,
            description,
            category,
            specialityId,
            prompt,
          },
        },
        {
          onSuccess: () => {
            setEditTemplate(null);
            setIsWarningDialogOpen(false);
            refetch();
          },
        }
      );
    }
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setTemplateToDelete(null);
          refetch();
        },
      });
    }
  };

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

  // Handle limit change (items per page)
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

  return {
    skip,
    title,
    limit,
    pageInfo,
    category,
    expanded,
    templates,
    isLoading,
    description,
    searchQuery,
    editTemplate,
    updateMutation,
    isDeleteDialogOpen,
    isWarningDialogOpen,
    debouncedSearchQuery,
    setTitle,
    loadMore,
    setCategory,
    loadPrevious,
    setSearchQuery,
    setDescription,
    setEditTemplate,
    handleRowExpand,
    handleEditClick,
    handleSaveClick,
    handleConfirmSave,
    handleDeleteClick,
    handleLimitChange,
    handleConfirmDelete,
    setTemplateToDelete,
    setIsDeleteDialogOpen,
    setIsWarningDialogOpen,
  };
};