"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/customs/table";
import { AlertDialog } from "@/components/customs";
import { useSpeciality } from "@/modules/template/hooks/use-speciality";
import { useMacroList } from "./hooks/use-macro-list";
import { useCallback } from "react";
import { Macro } from "@/hooks/use-macro";
import { ColumnDef } from "@tanstack/react-table";
import { TemplateFilters } from "../template/template-filters";
import { Plus } from "lucide-react";
import { useBulkCloneMacro } from "@/hooks/use-macro";
import { useToast } from "@/hooks/use-toast";
import CreateUpdateMacroDialog from "./macro-create-or-update";


import { getMacroListColumns } from "./macro-list-columns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    clone: {
        title: "Confirm Clone",
        description: "Are you sure you want to add this macro to your profile?",
        actionTitle: "Insert in profile"
    }
};

const MacroList = () => {
    const {
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
        handleAlertDialogCancel,
        toggleMacroExpansion,
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
    } = useMacroList();

    const bulkCloneMutation = useBulkCloneMacro();
    const { toast } = useToast();



    const { specialities } = useSpeciality();

    const totalPages = Math.ceil(totalCount / pageSize);

    const columns: ColumnDef<Macro>[] = getMacroListColumns({
        expandedMacro,
        onDeleteMacro: handleDeleteMacroAction,
        onEditMacro: handleEditMacroAction,
        onExpandRow: toggleMacroExpansion,
        onCloneMacro: handleCloneMacroAction,
        specialities,
        currentUser: user ?? null,
        showMarketplace
    });


    const selectedIds = Object.keys(rowSelection).filter((id: string) => rowSelection[id]);

    const handleBulkClone = async () => {
        if (selectedIds.length === 0) return;
        try {
            // TanStack rowSelection keys are usually stringified indices or IDs.
            // In our case, with a server pagination, we need to extract the actual _id.
            // However, useReactTable's rowSelection uses row ID (default index).
            // I should ensure row ID is set to macro._id for easier extraction.

            const selectedMacroIds = macros
                .filter((_: Macro, index: number) => rowSelection[index])
                .map((m: Macro) => m._id);



            if (selectedMacroIds.length === 0) return;

            await bulkCloneMutation.mutateAsync(selectedMacroIds);
            setRowSelection({});
            toast({
                title: "Success",
                description: `${selectedMacroIds.length} macros added to your profile successfully`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add macros to your profile",
                variant: "destructive",
            });
        }
    };



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
            : activeMacroAction === "clone"
                ? confirmationDialogDetails?.["clone"]
                : confirmationDialogDetails?.["edit"];

    return (
        <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 group/filters">
                {/* Left Section: Marketplace Toggle */}
                <div className="flex items-center shrink-0">
                    <div className="inline-flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                        <Switch
                            id="marketplace"
                            checked={showMarketplace}
                            onCheckedChange={(checked) => setShowMarketplace(checked === true)}
                        />
                        <Label
                            htmlFor="marketplace"
                            className="text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer select-none"
                        >
                            Market Place
                        </Label>
                    </div>
                </div>

                {/* Center Section: Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-3xl flex-1">
                    <div className="shrink-0 w-full sm:w-auto">
                        <TemplateFilters
                            selectedSpecialties={selectedSpecialties}
                            onSpecialtyChange={handleSpecialtyChange}
                        />
                    </div>
                    <div className="relative w-full">
                        <Input
                            type="text"
                            placeholder="Search macros..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full rounded-xl bg-white border-gray-200 shadow-none focus-visible:ring-1 focus-visible:ring-primary pl-4"
                        />
                    </div>
                </div>

                {/* Right Section: Action Button */}
                <div className="flex items-center shrink-0 w-full lg:w-auto justify-end gap-3">
                    {showMarketplace && selectedIds.length > 0 && (
                        <Button
                            onClick={handleBulkClone}
                            variant="secondary"
                            isLoading={bulkCloneMutation.isPending}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none shadow-sm rounded-xl h-10 px-6 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="font-semibold">Add {selectedIds.length} to Profile</span>
                        </Button>
                    )}
                    <Button
                        onClick={() => setIsMacroModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white shadow-md rounded-xl h-10 px-6 transition-transform active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="font-semibold">New Macro</span>
                    </Button>
                </div>

            </div>

            <div>
                <DataTable<Macro, unknown>
                    columns={columns}
                    data={macros}
                    loading={isLoading}
                    renderRow={renderRow}
                    pageInfo={{
                        currentPage,
                        totalPages,
                        hasNextPage: currentPage < totalPages,
                        hasPreviousPage: currentPage > 1
                    }}
                    loadMore={() => setCurrentPage(prev => prev + 1)}
                    loadPrevious={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    setPageSize={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                    }}
                    pageSize={pageSize}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                />

            </div>



            <div className="text-sm text-gray-500 my-5">Note:
                <ul className="list-disc list-inside">
                    <li>To use marketplace macros, please add them to your profile first.</li>
                    <li>To enable automatic macro detection in the findings input, please include the keyword <strong>"insert"</strong> in your text. For example, if your macro name is <strong>"tumor"</strong>, write <strong>"insert tumor"</strong>.</li>
                    <li>Only macros with an active status can be detected in the findings input.</li> <li>If you create a macro and mark it as public, it will be visible to all users.</li>
                </ul>
            </div>
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
