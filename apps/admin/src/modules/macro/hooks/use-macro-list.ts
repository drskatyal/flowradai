import { useMacros, useCreateMacro, useUpdateMacro, useDeleteMacro, Macro, CreateMacroData } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { Speciality } from "@/hooks/use-speciality";

export type ActiveMacroActions = "delete" | "edit";

export interface MacroFormData {
    name: string;
    description: string;
    isActive: boolean;
    isPublic: boolean;
    specialityId?: string;
}

export const useMacroList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
    const [limit, setLimit] = useState(10);
    const [skip, setSkip] = useState(0);
    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
    const [activeMacro, setActiveMacro] = useState<Macro | null>(null);
    const [pendingFormData, setPendingFormData] = useState<MacroFormData | null>(null);
    const [activeMacroAction, setActiveMacroAction] = useState<ActiveMacroActions | null>(null);
    const [expandedMacro, setExpandedMacro] = useState<Macro | null>(null);

    const createMutation = useCreateMacro();
    const updateMutation = useUpdateMacro();
    const deleteMutation = useDeleteMacro();

    const { data, isLoading, refetch } = useMacros({
        staleTime: 5 * 60 * 1000,
        limit,
        skip,
    });

    const macros = data?.macros || [];
    const totalCount = data?.count || 0;

    // Filter macros based on search and specialty
    const filteredMacros = macros.filter((macro: Macro) => {
        const matchesSearch = !debouncedSearchQuery ||
            macro.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            macro.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

        const matchesSpecialty = selectedSpecialties.size === 0 ||
            (macro.specialityId && selectedSpecialties.has(macro.specialityId._id));

        return matchesSearch && matchesSpecialty;
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setSkip(0); // Reset pagination when search changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSpecialtyChange = useCallback((values: Set<string>) => {
        setSelectedSpecialties(values);
        setSkip(0); // Reset pagination when filter changes
    }, []);

    const handleMacroFormSubmit = (formData: MacroFormData) => {
        if (activeMacroAction === "edit" && activeMacro) {
            setIsConfirmationDialogOpen(true);
            setPendingFormData(formData);
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    refetch();
                    setActiveMacro(null);
                    setIsMacroModalOpen(false);
                },
            });
        }
    };

    const handleDeleteMacroAction = (macro: Macro) => {
        setIsConfirmationDialogOpen(true);
        setActiveMacro(macro);
        setActiveMacroAction("delete");
    };

    const handleEditMacroAction = (macro: Macro) => {
        setActiveMacro(macro);
        setActiveMacroAction("edit");
        setIsMacroModalOpen(true);
    };

    const toggleMacroExpansion = (macro: Macro) => {
        if (!expandedMacro) {
            setExpandedMacro(macro);
        } else {
            if (expandedMacro?._id === macro?._id) {
                setExpandedMacro(null);
            } else {
                setExpandedMacro(macro);
            }
        }
    };

    const handleMacroModalCancel = () => {
        setIsMacroModalOpen(false);
        setActiveMacro(null);
        setPendingFormData(null);
        setActiveMacroAction(null);
    };

    const handleAlertDialogCancel = () => {
        if (activeMacroAction === "edit") {
            setIsConfirmationDialogOpen(false);
            setPendingFormData(null);
        } else {
            setIsConfirmationDialogOpen(false);
            setActiveMacroAction(null);
            setActiveMacro(null);
            setPendingFormData(null);
        }
    };

    const handleAlertDialogConfirm = async () => {
        if (!activeMacro) return;

        if (activeMacroAction === "edit") {
            updateMutation.mutate(
                {
                    id: activeMacro._id,
                    name: pendingFormData?.name || activeMacro.name,
                    description: pendingFormData?.description || activeMacro.description,
                    isActive: pendingFormData?.isActive ?? activeMacro.isActive,
                    isPublic: pendingFormData?.isPublic ?? activeMacro.isPublic,
                    specialityId: pendingFormData?.specialityId || activeMacro.specialityId?._id,
                },
                {
                    onSuccess: () => {
                        refetch();
                        setActiveMacro(null);
                        setPendingFormData(null);
                        setActiveMacroAction(null);
                        setIsConfirmationDialogOpen(false);
                        setIsMacroModalOpen(false);
                    },
                }
            );
        } else {
            deleteMutation.mutate(activeMacro._id, {
                onSuccess: () => {
                    refetch();
                    setActiveMacro(null);
                    setPendingFormData(null);
                    setActiveMacroAction(null);
                    setIsConfirmationDialogOpen(false);
                },
            });
        }
    };

    const isMacroModalSubmitPending = createMutation.isPending;
    const isConfirmationModalSubmitPending =
        activeMacroAction === "delete"
            ? deleteMutation.isPending
            : updateMutation.isPending;

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

    return {
        macros: filteredMacros,
        isLoading,
        searchQuery,
        setSearchQuery,
        activeMacro,
        expandedMacro,
        isMacroModalOpen,
        activeMacroAction,
        selectedSpecialties,
        pageInfo,
        limit,
        handleSpecialtyChange,
        setIsMacroModalOpen,
        toggleMacroExpansion,
        handleAlertDialogCancel,
        isConfirmationDialogOpen,
        handleMacroFormSubmit,
        handleEditMacroAction,
        handleAlertDialogConfirm,
        handleMacroModalCancel,
        handleDeleteMacroAction,
        isMacroModalSubmitPending,
        isConfirmationModalSubmitPending,
        loadMore,
        loadPrevious,
        handleLimitChange,
    };
};
