"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/customs/table";
import { AlertDialog } from "@/components/customs";
import { useSpeciality } from "@/modules/documents/hooks/use-speciality";
import { getTableListColumns } from "@/constants/macro";
import { useMacroList } from "./hooks/use-macro-list";
import React, { useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SpecialityFilters } from "../documents/speciality-filters";
import { Plus } from "lucide-react";
import CreateUpdateMacroDialog from "./macro-create-or-update";
import { Macro } from "@/hooks";

const confirmationDialogDetails = {
    delete: {
        title: "Confirm Deletion",
        description:
            "Are you sure you want to delete this macro? This action cannot be undone.",
        actionTitle: "Delete",
    },
    edit: {
        title: "Confirm Changes",
        description:
            "Are you sure you want to save these changes? This action cannot be undone.",
        actionTitle: "Confirm",
    },
};

const MacroList = () => {
    const {
        macros,
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
        handleAlertDialogCancel,
        toggleMacroExpansion,
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
    } = useMacroList();

    const { specialities } = useSpeciality();

    const columns: ColumnDef<Macro>[] = getTableListColumns({
        expandedMacro,
        onDeleteMacro: handleDeleteMacroAction,
        onEditMacro: handleEditMacroAction,
        onExpandRow: toggleMacroExpansion,
        specialities,
    });

    const renderExpandedRow = (macro: Macro) => {
        if (expandedMacro?._id !== macro._id) return null;
        return (
            <tr className="bg-gray-50">
                <td colSpan={columns.length} className="p-4 border-t border-gray-200">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Name</h3>
                            <p className="mt-1">{macro.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Description</h3>
                            <p className="mt-1 whitespace-pre-wrap">{macro.description}</p>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    const renderRow = useCallback(
        ({ row, rowContent }: { row: Macro; rowContent: React.ReactNode }) => {
            return (
                <>
                    {rowContent}
                    {expandedMacro?._id === row._id && renderExpandedRow(row)}
                </>
            );
        },
        [expandedMacro]
    );

    const alertDialogContent =
        activeMacroAction === "delete"
            ? confirmationDialogDetails?.["delete"]
            : confirmationDialogDetails?.["edit"];

    return (
        <>
            <div className="flex justify-end gap-4 flex-wrap items-center mb-2">
                <div className="flex items-center flex-wrap gap-4">
                    <SpecialityFilters
                        selectedSpecialties={selectedSpecialties}
                        onSpecialtyChange={handleSpecialtyChange}
                    />
                    <Input
                        type="text"
                        placeholder="Search macros..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full xs:w-[150px] lg:w-[250px]"
                    />
                </div>
                <Button onClick={() => setIsMacroModalOpen(true)} className="max-md:mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    New Macro
                </Button>
            </div>
            <DataTable<Macro, unknown>
                columns={columns}
                data={macros}
                loading={isLoading}
                renderRow={renderRow}
                pageInfo={pageInfo}
                loadMore={loadMore}
                loadPrevious={loadPrevious}
                setPageSize={handleLimitChange}
                pageSize={limit}
                pageSizeOptions={[10, 20, 30, 50, 100]}
            />
            <CreateUpdateMacroDialog
                open={isMacroModalOpen}
                macro={activeMacro}
                onOpenChange={handleMacroModalCancel}
                onSubmit={handleMacroFormSubmit}
                onCancel={handleMacroModalCancel}
                isPending={isMacroModalSubmitPending}
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

export default MacroList;