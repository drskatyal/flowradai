import { useCallback, useEffect, useState } from "react";
import { Speciality, useCreateSpeciality, useUpdateSpeciality, useDeleteSpeciality, useSpecialities } from "@/hooks";
import { CreateUpdateFormSubmitArgs } from "../create-update-speciality-dailog";

export type ActiveSpecialityActions = "delete" | "edit";
export type StatusFilter = "all" | "active" | "inactive";

export const useSpecialitiesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const [isSpecialityModalOpen, setIsSpecialityModalOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [activeSpeciality, setActiveSpeciality] = useState<Speciality | null>(null);
  const [activeSpecialityAction, setActiveSpecialityAction] =
    useState<ActiveSpecialityActions | null>(null);
  const [expandedSpeciality, setExpandedSpecilaity] = useState<Speciality | null>(
    null
  );

  const createMutation = useCreateSpeciality();
  const updateMutation = useUpdateSpeciality(activeSpeciality?._id || "");
  const deleteMutation = useDeleteSpeciality();
  
  // Ensure status is a valid value
  const validStatus = statusFilter === "all" || statusFilter === "active" || statusFilter === "inactive" 
    ? statusFilter 
    : "all";

  const { data, isLoading, refetch } = useSpecialities(
    debouncedSearchQuery,
    limit,
    skip,
    validStatus
  );

  const specialities = data?.specialities || [];
  const totalCount = data?.count || 0;

  // Update page info calculation
  const pageInfo = {
    pageCount: Math.ceil(totalCount / limit),
    totalCount,
    hasPreviousPage: skip > 0,
    hasNextPage: skip + limit < totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Math.floor(skip / limit) + 1,
  };

  // Reset pagination when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setSkip(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when status filter changes
  useEffect(() => {
    setSkip(0);
  }, [statusFilter]);

  const handleStatusFilterChange = useCallback((newStatus: StatusFilter) => {
    setStatusFilter(newStatus);
    setSkip(0); // Reset to first page when filter changes
  }, []);

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

  const handleSpecialityFormSubmit = ({
    formData,
    event,
  }: CreateUpdateFormSubmitArgs) => {
    event.preventDefault();
    if (activeSpecialityAction === "edit") {
      setIsConfirmationDialogOpen(true);
      if (activeSpeciality) {
        setActiveSpeciality({
          ...activeSpeciality,
          ...formData,
        });
      }
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          refetch();
          setActiveSpeciality(null);
          setIsSpecialityModalOpen(false);
        },
      });
    }
  };

  const handleDeleteSpecialityAction = (speciality: Speciality) => {
    setIsConfirmationDialogOpen(true);
    setActiveSpeciality(speciality);
    setActiveSpecialityAction("delete");
  };

  const handleEditSpecialityAction = (speciality: Speciality) => {
    setActiveSpeciality(speciality);
    setActiveSpecialityAction("edit");
    setIsSpecialityModalOpen(true);
  };

  const handleSpecialityStatus = (speciality: Speciality) => {
    setActiveSpeciality(speciality);
    updateMutation.mutate(
      {
        ...speciality
      },
      {
        onSuccess: () => {
          refetch();
          setActiveSpeciality(null);
        },
      }
    );
  }

  const toggleSpecialityExpansion = (template: Speciality) => {
    if (!expandedSpeciality) {
        setExpandedSpecilaity(template);
    } else {
      if (expandedSpeciality?._id === template?._id) {
        setExpandedSpecilaity(null);
      } else {
        setExpandedSpecilaity(template);
      }
    }
  };

  const handleSpecialityModalCancel = () => {
    setIsSpecialityModalOpen(false);
    setActiveSpeciality(null);
    setActiveSpecialityAction(null);
  };

  const handleAlertDialogCancel = () => {
    if (activeSpecialityAction === "edit") {
      setIsConfirmationDialogOpen(false);
    } else {
      setIsConfirmationDialogOpen(false);
      setActiveSpecialityAction(null);
      setActiveSpeciality(null);
    }
  };

  const handleAlertDialogConfirm = async () => {
    if (!activeSpeciality) return;
    if (activeSpecialityAction === "edit") {
      const { prompt,...rest } = activeSpeciality;
      updateMutation.mutate(
        {
          ...rest
        },
        {
          onSuccess: () => {
            refetch();
            setActiveSpeciality(null);
            setActiveSpecialityAction(null);
            setIsConfirmationDialogOpen(false);
            setIsSpecialityModalOpen(false);
          },
        }
      );
    } else {
      deleteMutation.mutate(activeSpeciality?._id, {
        onSuccess: () => {
          refetch();
          setActiveSpeciality(null);
          setActiveSpecialityAction(null);
          setIsConfirmationDialogOpen(false);
        },
      });
    }
  };
  const isSpecialityModalSubmitPending = createMutation.isPending;
  const isConfirmationModalSubmitPending =
    activeSpecialityAction === "delete"
      ? deleteMutation.isPending
      : updateMutation.isPending;

  return {
    specialities: specialities,
    isLoading,
    pageInfo,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    limit,
    handleLimitChange,
    loadMore,
    loadPrevious,
    isSpecialityModalOpen,
    setIsSpecialityModalOpen,
    handleSpecialityFormSubmit,
    handleSpecialityModalCancel,
    isSpecialityModalSubmitPending,
    activeSpeciality,
    activeSpecialityAction,
    handleDeleteSpecialityAction,
    handleEditSpecialityAction,
    handleSpecialityStatus,
    isConfirmationDialogOpen,
    handleAlertDialogCancel,
    handleAlertDialogConfirm,
    isConfirmationModalSubmitPending,
    expandedSpeciality,
    toggleSpecialityExpansion,
  };
};
