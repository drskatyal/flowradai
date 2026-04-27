"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/customs/table";
import { AlertDialog } from "@/components/customs";
import { getTableListColumns } from "@/constants/coupon-code";
import { useCouponCodeList } from "./hooks/use-coupon-code-list";
import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import CreateCouponCodeDialog from "./coupon-code-create";
import CouponCodeDetailsSheet from "./coupon-code-details-sheet";
import { CouponCode } from "@/hooks/use-coupon-code";
import { useToast } from "@/hooks/use-toast";

const confirmationDialogDetails = {
    delete: {
        title: "Confirm Deletion",
        description:
            "Are you sure you want to delete this coupon code? This action cannot be undone.",
        actionTitle: "Delete",
    },
    toggle: {
        title: "Confirm Status Change",
        description:
            "Are you sure you want to change the status of this coupon code?",
        actionTitle: "Confirm",
    },
};

const CouponCodeList = () => {
    const { toast } = useToast();
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
    const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
    const [selectedCouponCodeId, setSelectedCouponCodeId] = useState<string | null>(null);

    const {
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
    } = useCouponCodeList();

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast({
            title: "Copied!",
            description: "Coupon code copied to clipboard",
        });

        // Reset the copied state after 2 seconds
        setTimeout(() => {
            setCopiedCode(null);
        }, 2000);
    };

    const handleViewDetails = (couponCode: CouponCode) => {
        setSelectedCouponCodeId(couponCode._id);
        setDetailsSheetOpen(true);
    };

    const handleCloseDetailsSheet = () => {
        setDetailsSheetOpen(false);
        setSelectedCouponCodeId(null);
    };

    const columns: ColumnDef<CouponCode>[] = getTableListColumns({
        onDeleteCouponCode: handleDeleteCouponCodeAction,
        onEditCouponCode: handleEditCouponCodeAction,
        onToggleStatus: handleToggleStatusAction,
        onViewDetails: handleViewDetails,
        onCopyCode: handleCopyCode,
        copiedCode,
    });

    const alertDialogContent =
        activeCouponCodeAction === "delete"
            ? confirmationDialogDetails?.["delete"]
            : confirmationDialogDetails?.["toggle"];

    return (
        <>
            <div className="flex justify-end gap-4 flex-wrap items-center mb-2">
                <div className="flex items-center flex-wrap gap-4">
                    <Input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full xs:w-[150px] lg:w-[250px]"
                    />
                </div>
                <Button
                    onClick={() => setIsCouponCodeModalOpen(true)}
                    className="max-md:mt-3"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Coupon Code
                </Button>
            </div>
            <DataTable<CouponCode, unknown>
                columns={columns}
                data={couponCodes}
                loading={isLoading}
                pageInfo={pageInfo}
                loadMore={loadMore}
                loadPrevious={loadPrevious}
                setPageSize={handleLimitChange}
                pageSize={limit}
                pageSizeOptions={[10, 20, 30, 50, 100]}
            />
            <CreateCouponCodeDialog
                open={isCouponCodeModalOpen}
                coupon={activeCouponCode}
                onOpenChange={handleCouponCodeModalCancel}
                onSubmit={handleCouponCodeFormSubmit}
                onCancel={handleCouponCodeModalCancel}
                isPending={isCouponCodeModalSubmitPending}
            />
            <CouponCodeDetailsSheet
                isOpen={detailsSheetOpen}
                onClose={handleCloseDetailsSheet}
                couponCodeId={selectedCouponCodeId || undefined}
            />
            <AlertDialog
                trigger={""}
                open={isConfirmationDialogOpen}
                onCancel={handleAlertDialogCancel}
                onOpenChange={handleAlertDialogCancel}
                onConfirm={handleAlertDialogConfirm}
                dialogTitle={alertDialogContent?.title}
                actionProps={{ asChild: true }}
                actionTitle={
                    <Button isLoading={isConfirmationModalSubmitPending}>
                        {alertDialogContent?.actionTitle}
                    </Button>
                }
            >
                {alertDialogContent?.description}
            </AlertDialog>
        </>
    );
};

export default CouponCodeList;