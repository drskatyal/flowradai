import { useMacros, useCreateMacro, useUpdateMacro, useDeleteMacro, Macro, useCloneMacro } from "@/hooks/use-macro";
import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/stores";

export type ActiveMacroActions = "delete" | "edit" | "clone";

export interface MacroFormData {
    name: string;
    description: string;
    isActive: boolean;
    isPublic: boolean;
    specialityId?: string;
}

export const useMacroList = () => {
    const user = useStore((state) => state.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
    const [activeMacro, setActiveMacro] = useState<Macro | null>(null);
    const [pendingFormData, setPendingFormData] = useState<MacroFormData | null>(null);
    const [activeMacroAction, setActiveMacroAction] = useState<ActiveMacroActions | null>(null);
    const [expandedMacro, setExpandedMacro] = useState<Macro | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const createMutation = useCreateMacro();
    const updateMutation = useUpdateMacro();
    const deleteMutation = useDeleteMacro();
    const cloneMutation = useCloneMacro();

    const [showMarketplace, setShowMarketplace] = useState(false);

    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const { data, isLoading, refetch } = useMacros(

        { 
            limit: pageSize, 
            skip: (currentPage - 1) * pageSize,
            search: debouncedSearchQuery,
            showMarketplace,
            specialties: Array.from(selectedSpecialties)
        },
        {
            staleTime: 5 * 60 * 1000,
        }
    );

    const macros = data?.macros || [];
    const totalCount = data?.count || 0;

    // Reset selection when filters change or page changes
    useEffect(() => {
        setRowSelection({});
    }, [debouncedSearchQuery, showMarketplace, selectedSpecialties, currentPage, pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when marketplace toggle changes
    }, [showMarketplace]);

    const handleSpecialtyChange = useCallback((values: Set<string>) => {
        setSelectedSpecialties(values);
        setCurrentPage(1); // Reset to first page on specialty change
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

    const handleCloneMacroAction = (macro: Macro) => {
        setActiveMacro(macro);
        setActiveMacroAction("clone");
        setIsConfirmationDialogOpen(true);
    }

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
        setIsConfirmationDialogOpen(false);
        setPendingFormData(null);
        setActiveMacroAction(null);
        setActiveMacro(null);
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
                        handleAlertDialogCancel();
                        setIsMacroModalOpen(false);
                    },
                }
            );
        } else if (activeMacroAction === "clone") {
            cloneMutation.mutate(activeMacro._id, {
                onSuccess: () => {
                    refetch();
                    handleAlertDialogCancel();
                }
            })
        } else {
            deleteMutation.mutate(activeMacro._id, {
                onSuccess: () => {
                    refetch();
                    handleAlertDialogCancel();
                },
            });
        }
    };

    const isMacroModalSubmitPending = createMutation.isPending;
    const isConfirmationModalSubmitPending =
        activeMacroAction === "delete"
            ? deleteMutation.isPending
            : activeMacroAction === "clone"
                ? cloneMutation.isPending
                : updateMutation.isPending;

    return {
        macros,

        isLoading,
        searchQuery,
        setSearchQuery,
        showMarketplace,
        setShowMarketplace,
        activeMacro,
        expandedMacro,
        isMacroModalOpen,
        activeMacroAction,
        selectedSpecialties,
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
        handleCloneMacroAction,
        isMacroModalSubmitPending,
        isConfirmationModalSubmitPending,
        user,
        currentPage,
        pageSize,
        totalCount,
        setCurrentPage,
        setPageSize,
        rowSelection,
        setRowSelection
    };

};

