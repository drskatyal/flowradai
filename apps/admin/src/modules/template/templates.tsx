"use client";

import { Plus } from "lucide-react";
import { useCallback } from "react";
import { AlertDialog } from "@/components/customs";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { DataTable } from "@/components/customs/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTableListColumns } from "@/constants/templates";
import { Template } from "@/hooks";
import CreateUpdateTemplateDialog from "./create-update-template-dialog";
import { useTemplateList } from "./hooks/use-template-list";
import { useSpeciality } from "./hooks/use-speciality";
import { TemplateFilters } from "./template-filters";
import { CategoryFilters } from "./category-filters";

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

const TemplateList = () => {
  const {
    limit,
    pageInfo,
    loadMore,
    templates,
    isLoading,
    searchQuery,
    loadPrevious,
    setSearchQuery,
    activeTemplate,
    expandedTemplate,
    handleLimitChange,
    isTemplateModalOpen,
    activeTemplateAction,
    selectedSpecialties,
    selectedCategories,
    handleSpecialtyChange,
    handleCategoryChange,
    setIsTemplateModalOpen,
    handleAlertDialogCancel,
    toggleTemplateExpansion,
    isConfirmationDialogOpen,
    handleTemplateFormSubmit,
    handleEditTemplateAction,
    handleAlertDialogConfirm,
    handleTemplateModalCancel,
    handleDeleteTemplateAction,
    isTemplateModalSubmitPending,
    isConfirmationModalSubmitPending,
  } = useTemplateList();

  const { specialities } = useSpeciality();
  const columns = getTableListColumns({
    expandedTemplate,
    onDeleteTemplate: handleDeleteTemplateAction,
    onEditTemplate: handleEditTemplateAction,
    onExpandRow: toggleTemplateExpansion,
    specialities
  });

  const renderExpandedRow = (template: Template) => {
    if (expandedTemplate?._id !== template._id) return null;
    return (
      <tr className="bg-gray-50">
        <td colSpan={columns.length} className="p-4 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Title</h3>
              <p className="mt-1">{template.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Description</h3>
              <RichTextEditor
                value={template?.description}
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
                value={template?.prompt}
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
    ({ row, rowContent }: { row: Template; rowContent: React.ReactNode }) => {
      return (
        <>
          {rowContent}
          {expandedTemplate?._id === row._id && renderExpandedRow(row)}
        </>
      );
    },
    [expandedTemplate]
  );
  const alertDialogContent =
    activeTemplateAction === "delete"
      ? confirmationDialogDetails?.["delete"]
      : confirmationDialogDetails?.["edit"];

  return (
    <>
      <div className="flex justify-end gap-4 flex-wrap items-center mb-2">
        <div className="flex items-center flex-wrap gap-4">
          <TemplateFilters 
            selectedSpecialties={selectedSpecialties}
            onSpecialtyChange={handleSpecialtyChange}
          />
          <CategoryFilters
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
          />
           <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full xs:w-[150px] lg:w-[250px]"
          />
        </div>
        <Button onClick={() => setIsTemplateModalOpen(true)} className="max-md:mt-3">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={templates}
        pageInfo={pageInfo}
        loadMore={loadMore}
        loadPrevious={loadPrevious}
        setPageSize={handleLimitChange}
        pageSize={limit}
        loading={isLoading}
        renderRow={renderRow}
        pageSizeOptions={[10, 20, 30, 50, 100]}
      />
      <CreateUpdateTemplateDialog
        open={isTemplateModalOpen}
        template={activeTemplate}
        onOpenChange={handleTemplateModalCancel}
        onSubmit={handleTemplateFormSubmit}
        onCancel={handleTemplateModalCancel}
        isPending={isTemplateModalSubmitPending}
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

export default TemplateList;
