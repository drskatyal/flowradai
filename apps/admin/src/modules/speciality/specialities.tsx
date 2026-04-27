"use client";

import { Plus } from "lucide-react";
import { useCallback } from "react";
import { AlertDialog, Filters } from "@/components/customs";
import { DataTable } from "@/components/customs/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTableListColumns } from "@/constants/specialities";
import { Prompt, Speciality } from "@/hooks";
import CreateUpdateSpecialityDialog from "./create-update-speciality-dailog";
import { StatusFilter, useSpecialitiesList } from "./hooks/use-specialities-list";
import { useCreateSpeciality } from "./hooks/use-create-speciality";

const confirmationDialogDetails = {
  delete: {
    title: "Confirm Deletion",
    description:
      "Are you sure you want to delete this speciality? This action cannot be undone.",
    actionTitle: "Delete",
  },
  edit: {
    title: "Confirm Changes",
    description:
      "Are you sure you want to save these changes? This action cannot be undone.",
    actionTitle: "Confirm",
  },
};

const SpecialityList = () => {
  const {
    limit,
    pageInfo,
    loadMore,
    specialities,
    isLoading,
    searchQuery,
    loadPrevious,
    setSearchQuery,
    activeSpeciality,
    expandedSpeciality,
    handleLimitChange,
    isSpecialityModalOpen,
    activeSpecialityAction,
    setIsSpecialityModalOpen,
    handleAlertDialogCancel,
    toggleSpecialityExpansion,
    isConfirmationDialogOpen,
    handleSpecialityFormSubmit,
    handleEditSpecialityAction,
    handleAlertDialogConfirm,
    handleSpecialityModalCancel,
    handleDeleteSpecialityAction,
    handleSpecialityStatus,
    isSpecialityModalSubmitPending,
    isConfirmationModalSubmitPending,
    statusFilter,
    setStatusFilter,
  } = useSpecialitiesList();

  const { promptsKeys } = useCreateSpeciality({ onSuccess() {
    
  },});

  const columns = getTableListColumns({
    expandedSpeciality,
    onDeleteSpeciality: handleDeleteSpecialityAction,
    onEditSpeciality: handleEditSpecialityAction,
    onExpandRow: toggleSpecialityExpansion,
    onUpdateStatus: handleSpecialityStatus
  });

  const renderExpandedRow = (speciality: Speciality) => {
    if (expandedSpeciality?._id !== speciality._id) return null;
    return (
      <tr className="bg-gray-50">
        <td colSpan={columns.length} className="p-4 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Title</h3>
              <p className="mt-1">{speciality.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Button Label</h3>
              <p className="mt-1">{speciality.specialityButtonLabel}</p>
            </div>
            <div>
              {promptsKeys.map((pro) => {
                const p_key = pro.name as keyof Prompt;
                return (
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-gray-700">{pro.label}</h3>
                    <p>{speciality.prompt?.[p_key]}</p>
                  </div>
              );
            })}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderRow = useCallback(
    ({ row, rowContent }: { row: Speciality; rowContent: React.ReactNode }) => {
      return (
        <>
          {rowContent}
          {expandedSpeciality?._id === row._id && renderExpandedRow(row)}
        </>
      );
    },
    [expandedSpeciality]
  );
  const alertDialogContent =
    activeSpecialityAction === "delete"
      ? confirmationDialogDetails?.["delete"]
      : confirmationDialogDetails?.["edit"];

  return (
    <>
      <div className="flex justify-end gap-4 flex-wrap items-center mb-2">
        <div className="flex items-center flex-wrap gap-3">
          <Filters
            title="Status"
            options={[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" }
            ]}
            selectedValues={new Set([statusFilter])}
            handleFilterChange={(values) => {
              if (values.size === 0) {
                setStatusFilter("all");
                return;
              }
              const lastValue = Array.from(values).pop();
              setStatusFilter(lastValue as StatusFilter);
            }}
          />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full xs:w-[150px] lg:w-[250px]"
          />
        </div>
        <Button onClick={() => setIsSpecialityModalOpen(true)} className="max-sm:mt-3">
          <Plus className="h-4 w-4 mr-2" />
          New Speciality
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={specialities}
        pageInfo={pageInfo}
        loadMore={loadMore}
        loadPrevious={loadPrevious}
        setPageSize={handleLimitChange}
        pageSize={limit}
        loading={isLoading}
        renderRow={renderRow}
        renderFooter={() => (
          <p className="text-sm text-gray-500 hidden lg:block">Note: To publish a specialty, please fill in all the prompt values. This is required.</p>
        )}
        pageSizeOptions={[10, 20, 30, 50, 100]}
      />
      <CreateUpdateSpecialityDialog
        open={isSpecialityModalOpen}
        speciality={activeSpeciality}
        onOpenChange={handleSpecialityModalCancel}
        onSubmit={handleSpecialityFormSubmit}
        onCancel={handleSpecialityModalCancel}
        isPending={isSpecialityModalSubmitPending}
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

export default SpecialityList;
