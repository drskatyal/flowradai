import { useCreateDocument, useDeleteDocument, useUpdateDocument, useDocument, useDocuments, Document, DocumentQueryOptions } from "@/hooks";
import { useCallback, useEffect, useState } from "react";
import { CreateUpdateFormSubmitArgs } from "../create-update-document-dialog";

export type ActiveDocumentActions = "delete" | "edit";

export const useDocumentList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [limit, setLimit] = useState(10);
    const [skip, setSkip] = useState(0);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
        useState(false);
    const [activeDocument, setActiveDocument] = useState<Document | null>(null);
    const [activeDocumentAction, setActiveDocumentAction] =
        useState<ActiveDocumentActions | null>(null);
    const [expandedDocument, setExpandedDocument] = useState<Document | null>(
        null
    );

    const options: DocumentQueryOptions = {
        staleTime: 5 * 60 * 1000, // 5 minutes
    };

    const createMutation = useCreateDocument();
    const updateMutation = useUpdateDocument(activeDocument?._id || "");
    const deleteMutation = useDeleteDocument();

    const { data, isLoading, refetch } = useDocuments(
        debouncedSearchQuery,
        limit,
        skip,
        Array.from(selectedSpecialties),
        Array.from(selectedCategories),
        options
    )

    const documents = data?.documents || [];
    const totalCount = data?.total || 0;

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

    const handleDocumentFormSubmit = ({
        formData,
        event,
    }: CreateUpdateFormSubmitArgs) => {
        event.preventDefault();
        if (activeDocumentAction === "edit") {
            setIsConfirmationDialogOpen(true);
            if (activeDocument) {
                setActiveDocument({
                    ...activeDocument,
                    ...formData,
                });
            }
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    refetch();
                    setActiveDocument(null);
                    setIsDocumentModalOpen(false);
                },
            });
        }
    };

    const handleDeleteDocumentAction = (template: Document) => {
        setIsConfirmationDialogOpen(true);
        setActiveDocument(template);
        setActiveDocumentAction("delete");
    };

    const handleEditDocumentAction = (template: Document) => {
        setActiveDocument(template);
        setActiveDocumentAction("edit");
        setIsDocumentModalOpen(true);
    };

    const toggleDocumentExpansion = (template: Document) => {
        if (!expandedDocument) {
            setExpandedDocument(template);
        } else {
            if (expandedDocument?._id === template?._id) {
                setExpandedDocument(null);
            } else {
                setExpandedDocument(template);
            }
        }
    };

    const handleDocumentModalCancel = () => {
        setIsDocumentModalOpen(false);
        setActiveDocument(null);
        setActiveDocumentAction(null);
    };

    const handleAlertDialogCancel = () => {
        if (activeDocumentAction === "edit") {
            setIsConfirmationDialogOpen(false);
        } else {
            setIsConfirmationDialogOpen(false);
            setActiveDocumentAction(null);
            setActiveDocument(null);
        }
    };

    const handleAlertDialogConfirm = async () => {
        if (!activeDocument) return;
        if (activeDocumentAction === "edit") {
            updateMutation.mutate(
                {
                    title: activeDocument?.title,
                    description: activeDocument?.description,
                    category: activeDocument?.category,
                    specialityId: activeDocument?.specialityId,
                    prompt: activeDocument?.prompt
                },
                {
                    onSuccess: () => {
                        refetch();
                        setActiveDocument(null);
                        setActiveDocumentAction(null);
                        setIsConfirmationDialogOpen(false);
                        setIsDocumentModalOpen(false);
                    },
                }
            );
        } else {
            deleteMutation.mutate(activeDocument?._id, {
                onSuccess: () => {
                    refetch();
                    setActiveDocument(null);
                    setActiveDocumentAction(null);
                    setIsConfirmationDialogOpen(false);
                },
            });
        }
    };
    const isDocumentModalSubmitPending = createMutation.isPending;
    const isConfirmationModalSubmitPending =
        activeDocumentAction === "delete"
            ? deleteMutation.isPending
            : updateMutation.isPending;
    return {
        limit,
        pageInfo,
        loadMore,
        documents,
        isLoading,
        searchQuery,
        loadPrevious,
        setSearchQuery,
        activeDocument,
        expandedDocument,
        handleLimitChange,
        isDocumentModalOpen,
        activeDocumentAction,
        selectedSpecialties,
        selectedCategories,
        handleSpecialtyChange,
        handleCategoryChange,
        setIsDocumentModalOpen,
        toggleDocumentExpansion,
        handleAlertDialogCancel,
        isConfirmationDialogOpen,
        handleDocumentFormSubmit,
        handleEditDocumentAction,
        handleAlertDialogConfirm,
        handleDocumentModalCancel,
        handleDeleteDocumentAction,
        isDocumentModalSubmitPending,
        isConfirmationModalSubmitPending,
    }
}