"use client";

import { Plus, Loader2 } from "lucide-react";
import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";

import { AlertDialog } from "@/components/customs";
import { RichTextEditor } from "@/components/customs/rich-text-editor";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/customs/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { getTableListColumns } from "@/constants/templates";
import { Template } from "@/hooks";

import CreateUpdateTemplateDialog from "./create-update-template-dialog";
import { useTemplateList } from "./hooks";
import { useSpeciality } from "./hooks/use-speciality";
import { TemplateFilters } from "./template-filters";
import { CategoryFilters } from "./category-filters";
import { TypeFilters } from "./type-filters";

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
  clone: {
    title: "Confirm Clone",
    description: "Are you sure you want to add this template to your profile?",
    actionTitle: "Insert in profile",
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
    showMarketplace,
    setShowMarketplace,
    setSearchQuery,
    activeTemplate,
    expandedTemplate,
    handleLimitChange,
    isTemplateModalOpen,
    activeTemplateAction,
    selectedSpecialties,
    selectedCategories,
    selectedTypes,
    handleSpecialtyChange,
    handleCategoryChange,
    handleTypeChange,
    setIsTemplateModalOpen,
    handleAlertDialogCancel,
    toggleTemplateExpansion,
    isConfirmationDialogOpen,
    handleTemplateFormSubmit,
    handleEditTemplateAction,
    handleCloneTemplateAction,
    handleAlertDialogConfirm,
    handleTemplateModalCancel,
    handleDeleteTemplateAction,
    isTemplateModalSubmitPending,
    isConfirmationModalSubmitPending,
    user,
    rowSelection,
    setRowSelection,
    handleBulkCloneAction,
    isBulkClonePending,
  } = useTemplateList();

  const { specialities } = useSpeciality();

  const columns = getTableListColumns({
    expandedTemplate,
    onDeleteTemplate: handleDeleteTemplateAction,
    onEditTemplate: handleEditTemplateAction,
    onCloneTemplate: handleCloneTemplateAction,
    onExpandRow: toggleTemplateExpansion,
    specialities,
    currentUser: user,
    showMarketplace,
  });

  const renderExpandedRow = (template: Template) => {
    if (expandedTemplate?._id !== template._id) return null;

    return (
      <tr className="bg-muted/30">
        <td colSpan={columns.length} className="p-5 border-t">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Title</p>
              <p className="mt-1 text-sm">{template.title}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Description
              </p>
              <RichTextEditor
                value={template.description}
                editorOptions={{ editable: false }}
                classNames={{
                  editor: "px-0 py-1 text-sm",
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
    ({ row, rowContent }: { row: Template; rowContent: React.ReactNode }) => (
      <>
        {rowContent}
        {expandedTemplate?._id === row._id && renderExpandedRow(row)}
      </>
    ),
    [expandedTemplate]
  );

  const alertDialogContent =
    activeTemplateAction === "delete"
      ? confirmationDialogDetails.delete
      : activeTemplateAction === "clone"
        ? confirmationDialogDetails.clone
        : confirmationDialogDetails.edit;

  return (
    <div className="space-y-4">
      {/* Filters + Action */}
      {/* Filters + Action */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="marketplace"
            checked={showMarketplace}
            onCheckedChange={(checked) =>
              setShowMarketplace(checked === true)
            }
          />
          <Label
            htmlFor="marketplace"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap"
          >
            Market Place
          </Label>
        </div>
        <TemplateFilters
          selectedSpecialties={selectedSpecialties}
          onSpecialtyChange={handleSpecialtyChange}
        />
        <CategoryFilters
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
        />
        <TypeFilters
          selectedTypes={selectedTypes}
          onTypeChange={handleTypeChange}
        />
        <Input
          type="text"
          placeholder="Search templates..."
          className="h-9 w-[180px] lg:w-[220px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex items-center gap-2">
          {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkCloneAction}
              disabled={isBulkClonePending}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 h-9"
            >
              {isBulkClonePending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Insert Selected ({Object.keys(rowSelection).length})
            </Button>
          )}

          <Button size="sm" className="h-9" onClick={() => setIsTemplateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Table */}
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
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        getRowId={(row) => row._id}
      />

      <div className="text-sm text-gray-500 my-5">
        Note:
        <ul className="list-disc list-inside">
          <li>
            To use Marketplace templates, please add them to your profile first
            by clicking "Insert in profile".
          </li>
          <li>
            Master/Default templates are available in the Market Place for all
            users.
          </li>
        </ul>
      </div>

      {/* Create / Update Dialog */}
      <CreateUpdateTemplateDialog
        open={isTemplateModalOpen}
        template={activeTemplate}
        onOpenChange={handleTemplateModalCancel}
        onSubmit={handleTemplateFormSubmit}
        onCancel={handleTemplateModalCancel}
        isPending={isTemplateModalSubmitPending}
      />

      {/* Confirmation Dialog */}
      <AlertDialog
        trigger=""
        open={isConfirmationDialogOpen}
        onCancel={handleAlertDialogCancel}
        onOpenChange={handleAlertDialogCancel}
        onConfirm={handleAlertDialogConfirm}
        dialogTitle={alertDialogContent.title}
        actionProps={{ asChild: true }}
        actionTitle={
          <Button isLoading={isConfirmationModalSubmitPending}>
            {alertDialogContent.actionTitle}
          </Button>
        }
      >
        {alertDialogContent.description}
      </AlertDialog>
    </div>
  );
};

export default TemplateList;