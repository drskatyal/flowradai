import {
    useCouponCodes,
    useCreateCouponCode,
    useDeleteCouponCode,
    useToggleCouponCodeStatus,
    CouponCode,
} from "@/hooks/use-coupon-code";
import { useCallback, useEffect, useState } from "react";

export type ActiveCouponCodeActions = "delete" | "toggle";

export interface CouponCodeFormData {
    code: string;
    name?: string;
    days: number;
    allowedUsers: string[];
    allowToAllUsers?: boolean;
    isActive: boolean;
}

export const useCouponCodeList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [limit, setLimit] = useState(10);
    const [skip, setSkip] = useState(0);
    const [isCouponCodeModalOpen, setIsCouponCodeModalOpen] = useState(false);
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
        useState(false);
    const [activeCouponCode, setActiveCouponCode] = useState<CouponCode | null>(
        null
    );
    const [activeCouponCodeAction, setActiveCouponCodeAction] =
        useState<ActiveCouponCodeActions | null>(null);

    const createMutation = useCreateCouponCode();
    const deleteMutation = useDeleteCouponCode();
    const toggleStatusMutation = useToggleCouponCodeStatus();

    const { data, isLoading, refetch } = useCouponCodes({
        staleTime: 5 * 60 * 1000,
        limit,
        skip,
        search: debouncedSearchQuery,
    });

    const couponCodes = data?.couponCodes || [];
    const totalCount = data?.count || 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setSkip(0); // Reset pagination when search changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCouponCodeFormSubmit = (formData: CouponCodeFormData & { id?: string }) => {
        createMutation.mutate(formData, {
            onSuccess: () => {
                refetch();
                setIsCouponCodeModalOpen(false);
                setActiveCouponCode(null);
            },
        });
    };

    const handleEditCouponCodeAction = (couponCode: CouponCode) => {
        setActiveCouponCode(couponCode);
        setIsCouponCodeModalOpen(true);
    };

    const handleDeleteCouponCodeAction = (couponCode: CouponCode) => {
        setIsConfirmationDialogOpen(true);
        setActiveCouponCode(couponCode);
        setActiveCouponCodeAction("delete");
    };

    const handleToggleStatusAction = (couponCode: CouponCode) => {
        setIsConfirmationDialogOpen(true);
        setActiveCouponCode(couponCode);
        setActiveCouponCodeAction("toggle");
    };

    const handleCouponCodeModalCancel = () => {
        setIsCouponCodeModalOpen(false);
        setActiveCouponCode(null);
    };

    const handleAlertDialogCancel = () => {
        setIsConfirmationDialogOpen(false);
        setActiveCouponCodeAction(null);
        setActiveCouponCode(null);
    };

    const handleAlertDialogConfirm = async () => {
        if (!activeCouponCode) return;

        if (activeCouponCodeAction === "toggle") {
            toggleStatusMutation.mutate(activeCouponCode._id, {
                onSuccess: () => {
                    refetch();
                    setActiveCouponCode(null);
                    setActiveCouponCodeAction(null);
                    setIsConfirmationDialogOpen(false);
                },
            });
        } else {
            deleteMutation.mutate(activeCouponCode._id, {
                onSuccess: () => {
                    refetch();
                    setActiveCouponCode(null);
                    setActiveCouponCodeAction(null);
                    setIsConfirmationDialogOpen(false);
                },
            });
        }
    };

    const isCouponCodeModalSubmitPending = createMutation.isPending;
    const isConfirmationModalSubmitPending =
        activeCouponCodeAction === "delete"
            ? deleteMutation.isPending
            : toggleStatusMutation.isPending;

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
            const currentPage = Math.floor(skip / limit) + 1;
            const newSkip = (currentPage - 1) * newSize;
            setSkip(newSkip < 0 ? 0 : newSkip);
        },
        [skip, limit]
    );

    return {
        couponCodes,
        isLoading,
        searchQuery,
        setSearchQuery,
        activeCouponCode,
        isCouponCodeModalOpen,
        activeCouponCodeAction,
        pageInfo,
        limit,
        setIsCouponCodeModalOpen,
        handleAlertDialogCancel,
        isConfirmationDialogOpen,
        handleCouponCodeFormSubmit,
        handleToggleStatusAction,
        handleAlertDialogConfirm,
        handleCouponCodeModalCancel,
        handleDeleteCouponCodeAction,
        handleEditCouponCodeAction,
        isCouponCodeModalSubmitPending,
        isConfirmationModalSubmitPending,
        loadMore,
        loadPrevious,
        handleLimitChange,
    };
};