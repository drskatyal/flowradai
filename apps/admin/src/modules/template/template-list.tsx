"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/customs/table";
import { Input } from "@/components/ui/input";
import { Template } from "@/hooks";
import { formatDate } from "@/helpers/format-date";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Loader2, PenIcon, Trash2 } from "lucide-react";
import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CreateTemplate from "./create-template";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Category from "./category/category";
import { useTemplate } from "./hooks/use-template";
import { RichTextEditor } from "@/components/customs/rich-text-editor";

const TemplateList = () => {
  const {
    skip,
    limit,
    title,
    pageInfo,
    category,
    expanded,
    isLoading,
    templates,
    searchQuery,
    description,
    editTemplate,
    updateMutation,
    isDeleteDialogOpen,
    isWarningDialogOpen,
    debouncedSearchQuery,
    setTitle,
    loadMore,
    setCategory,
    loadPrevious,
    setSearchQuery,
    setDescription,
    setEditTemplate,
    handleRowExpand,
    handleEditClick,
    handleSaveClick,
    handleConfirmSave,
    handleDeleteClick,
    handleLimitChange,
    setTemplateToDelete,
    handleConfirmDelete,
    setIsDeleteDialogOpen,
    setIsWarningDialogOpen,
  } = useTemplate();

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.type === "private"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.original.type === "private" ? "Default" : "Personal"}
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => {
        let label = "";
        let badgeColor = "";

        switch (row.original.category) {
          case "normal":
            label = "Normal";
            badgeColor = "bg-green-100 text-green-800";
            break;

          case "abnormal":
            label = "Abnormal";
            badgeColor = "bg-yellow-100 text-yellow-800";
            break;

          default:
            label = "N/A";
            badgeColor = "bg-gray-100 text-gray-800";
            break;
        }

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const template = row.original;

        return (
          <div className="flex justify-end items-center md:gap-2">
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(template);
                      }}
                    >
                      <PenIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit template</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(template._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete template</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowExpand(template._id);
                    }}
                  >
                    {expanded === template._id ? (
                      <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {expanded === template._id
                      ? "Collapse details"
                      : "Expand details"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  const renderExpandedRow = (template: Template) => {
    if (expanded !== template._id) return null;

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
          {expanded === row._id && renderExpandedRow(row)}
        </>
      );
    },
    [expanded]
  );

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="relative w-[300px]">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full xs:w-[150px] lg:w-[250px]"
          />
        </div>
        <CreateTemplate onSuccess={() => {}} />
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

      {/* Edit Template Dialog */}
      <Dialog
        open={!!editTemplate}
        onOpenChange={(open) => !open && setEditTemplate(null)}
      >
        <DialogContent className="sm:max-w-md lg:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Make changes to your template below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <RichTextEditor
                id="description"
                value={description}
                onChange={({ markdownText }) => setDescription(markdownText)}
              />
            </div>
            <Category
              value={category}
              onChange={(value) => setCategory(value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplate(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Dialog */}
      <AlertDialog
        open={isWarningDialogOpen}
        onOpenChange={setIsWarningDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TemplateList;
