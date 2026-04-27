import { useState, useEffect, useCallback } from "react";
import { Speciality, useCreateSpeciality, useUpdateSpeciality, useDeleteSpeciality, useSpecialities, CreateSpecialityData } from "@/hooks";

export const useSpeciality = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [editSpeciality, setEditSpeciality] = useState<Speciality | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specialitiesKey, setSpecialitiesKey] = useState<CreateSpecialityData>({
    name: '',
    description: '',
    specialityButtonLabel: "",
    elaborateButtonLabel: "",
    active: false,
    elaborateInstruction: "",
    structuredReportingApproachInstruction: "",
    regularInstruction: "",
    defaultGrokInstructions: "",
    defaultOpenaiInstructions: "",
    defaultGeminiInstructions: "",
    templateRegularInstruction: "",
    textCorrectionInstruction: "",
    refinementInstruction: "",
    disabledRefinementInstructions: "",
    actionModeRefinementInstruction: "",
    wishperInstruction: "",
    reportErrorValidationInstruction: "",
    reportGuidelineInstruction: ""
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [specialityToDelete, setSpecialityToDelete] = useState<string | null>(null);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [category, setCategory] = useState<any>(null);

  const { data, isLoading, refetch } = useSpecialities(
    debouncedSearchQuery,
    limit,
    skip
  );

  const updateMutation = useUpdateSpeciality(editSpeciality?._id || "");
  const deleteMutation = useDeleteSpeciality();

  const specialities = data?.specialities || [];
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
    if (editSpeciality) {
      setSpecialitiesKey({
        name: editSpeciality.name,
        description: editSpeciality.description,
        specialityButtonLabel: editSpeciality.specialityButtonLabel,
        isButton: editSpeciality.isButton,
        active: editSpeciality.active,
        elaborateInstruction: editSpeciality?.prompt?.elaborateInstruction,
        structuredReportingApproachInstruction: editSpeciality.prompt.structuredReportingApproachInstruction,
        regularInstruction: editSpeciality.prompt.regularInstruction,
        defaultGrokInstructions: editSpeciality.prompt.defaultGrokInstructions,
        defaultOpenaiInstructions: editSpeciality.prompt.defaultOpenaiInstructions,
        defaultGeminiInstructions: editSpeciality.prompt.defaultGeminiInstructions,
        templateRegularInstruction: editSpeciality.prompt.templateRegularInstruction,
        textCorrectionInstruction: editSpeciality.prompt.textCorrectionInstruction,
        refinementInstruction: editSpeciality.prompt.refinementInstruction,
        disabledRefinementInstructions: editSpeciality.prompt.disabledRefinementInstructions,
        actionModeRefinementInstruction: editSpeciality.prompt.actionModeRefinementInstruction,
        wishperInstruction: editSpeciality.prompt.wishperInstruction,
        reportErrorValidationInstruction: editSpeciality.prompt.reportErrorValidationInstruction,
        reportGuidelineInstruction: editSpeciality.prompt.reportGuidelineInstruction
      })
    }
  }, [editSpeciality]);

  const handleRowExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleEditClick = (template: Speciality) => {
    setEditSpeciality(template);
  };

  const handleDeleteClick = (id: string) => {
    setSpecialityToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveClick = () => {
    if (
      editSpeciality &&
      (name !== editSpeciality.name || description !== editSpeciality.description)
    ) {
      setIsWarningDialogOpen(true);
    } else {
      handleConfirmSave();
    }
  };

  const handleConfirmSave = () => {
    if (editSpeciality) {
      updateMutation.mutate(
        {
          ...specialitiesKey
        },
        {
          onSuccess: () => {
            setEditSpeciality(null);
            setIsWarningDialogOpen(false);
            refetch();
          },
        }
      );
    }
  };

  const handleConfirmDelete = () => {
    if (specialityToDelete) {
      deleteMutation.mutate(specialityToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSpecialityToDelete(null);
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
    name,
    limit,
    pageInfo,
    category,
    expanded,
    specialities,
    isLoading,
    description,
    searchQuery,
    editSpeciality,
    updateMutation,
    isDeleteDialogOpen,
    isWarningDialogOpen,
    debouncedSearchQuery,
    setName,
    loadMore,
    setCategory,
    loadPrevious,
    setSearchQuery,
    setDescription,
    setEditSpeciality,
    handleRowExpand,
    handleEditClick,
    handleSaveClick,
    handleConfirmSave,
    handleDeleteClick,
    handleLimitChange,
    handleConfirmDelete,
    setSpecialityToDelete,
    setIsDeleteDialogOpen,
    setIsWarningDialogOpen,
  };
};
