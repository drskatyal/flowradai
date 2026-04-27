"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/customs/table";
import { AlertDialog } from "@/components/customs";
import { useSpeciality } from "./hooks/use-speciality";
import { getTableListColumns } from "@/constants/documents";
import { useDocumentList } from "./hooks/use-document-list";
import { useCallback } from "react";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { Document } from "@/hooks";
import { SpecialityFilters } from "./speciality-filters";
import { CategoryFilters } from "./category-filters";
import { Plus } from "lucide-react";
import CreateUpdateDocumentDialog from "./create-update-document-dialog";

const confirmationDialogDetails = {
    delete: {
        title: "Confirm Deletion",
        description:
            "Are you sure you want to delete this template? This action cannot be undone.",
        actionTitle: "Delete",
    },
    edit: {
        title: "Confirm Changes",
        description:
            "Are you sure you want to save these changes? This action cannot be undone.",
        actionTitle: "Confirm",
    },
};

const Documents = () => {
    const {
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
        handleAlertDialogCancel,
        toggleDocumentExpansion,
        isConfirmationDialogOpen,
        handleDocumentFormSubmit,
        handleEditDocumentAction,
        handleAlertDialogConfirm,
        handleDocumentModalCancel,
        handleDeleteDocumentAction,
        isDocumentModalSubmitPending,
        isConfirmationModalSubmitPending,
    } = useDocumentList();
    const { specialities } = useSpeciality();
    const columns = getTableListColumns({
        expandedDocument,
        onDeleteDocument: handleDeleteDocumentAction,
        onEditDocument: handleEditDocumentAction,
        onExpandRow: toggleDocumentExpansion,
        specialities
    });

    const renderExpandedRow = (document: Document) => {
        if (expandedDocument?._id !== document._id) return null;
        return (
            <tr className="bg-gray-50">
                <td colSpan={columns.length} className="p-4 border-t border-gray-200">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Title</h3>
                            <p className="mt-1">{document.title}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Description</h3>
                            <RichTextEditor
                                value={document?.description}
                                editorOptions={{
                                    editable: false,
                                }}
                                classNames={{
                                    editor: "px-0 py-1",
                                    editorContainer: "border-none rounded-none",
                                }}
                                requireToolbar={false}
                            />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">Prompt</h3>
                            <RichTextEditor
                                value={document?.prompt}
                                editorOptions={{
                                    editable: false,
                                }}
                                classNames={{
                                    editor: "px-0 py-1",
                                    editorContainer: "border-none rounded-none",
                                }}
                                requireToolbar={false}
                            />
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    const renderRow = useCallback(
        ({ row, rowContent }: { row: Document; rowContent: React.ReactNode }) => {
            return (
                <>
                    {rowContent}
                    {expandedDocument?._id === row._id && renderExpandedRow(row)}
                </>
            );
        },
        [expandedDocument]
    );

    const alertDialogContent =
        activeDocumentAction === "delete"
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
                    <CategoryFilters
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryChange}
                    />
                    <Input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 w-full xs:w-[150px] lg:w-[250px]"
                    />
                </div>
                <Button onClick={() => setIsDocumentModalOpen(true)} className="max-md:mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    New Document
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={documents}
                pageInfo={pageInfo}
                loadMore={loadMore}
                loadPrevious={loadPrevious}
                setPageSize={handleLimitChange}
                pageSize={limit}
                loading={isLoading}
                renderRow={renderRow}
                pageSizeOptions={[10, 20, 30, 50, 100]}
            />
            <CreateUpdateDocumentDialog
                open={isDocumentModalOpen}
                template={activeDocument}
                onOpenChange={handleDocumentModalCancel}
                onSubmit={handleDocumentFormSubmit}
                onCancel={handleDocumentModalCancel}
                isPending={isDocumentModalSubmitPending}
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
    )
}

export default Documents;