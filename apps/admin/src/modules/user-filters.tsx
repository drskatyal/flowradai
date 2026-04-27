"use client";
import { Filters } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { paymentStatuses } from "@/constants";
import { X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface UserFiltersProps {
  onSearch: (search: string) => void;
  selectedStatuses: Set<string>;
  handleStatusFilterChange: (values: Set<string>) => void;
  selectedRoles: Set<string>;
  handleRoleFilterChange: (values: Set<string>) => void;
  selectedPlanTypes: Set<string>;
  handlePlanTypeFilterChange: (values: Set<string>) => void;
  planTypeOptions?: { value: string; label: string }[];
  search: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onReset?: () => void;
  onExport?: () => void;
}

const UserFilters = ({
  onSearch,
  selectedStatuses,
  handleStatusFilterChange,
  selectedRoles,
  handleRoleFilterChange,
  selectedPlanTypes,
  handlePlanTypeFilterChange,
  planTypeOptions = [],
  search,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
  onExport,
}: UserFiltersProps) => {
  const isFiltered =
    selectedRoles.size > 0 ||
    selectedStatuses.size > 0 ||
    selectedPlanTypes.size > 0 ||
    startDate !== null ||
    endDate !== null ||
    (search !== null && search !== "");
  const [inputValue, setInputValue] = useState(search ?? "");

  // Only update input value when search prop changes from outside
  useEffect(() => {
    if (search !== inputValue) {
      setInputValue(search ?? "");
    }
  }, [search]);

  // Memoize the filter handlers to prevent unnecessary re-renders
  const handleFilters = useMemo(
    () => ({
      handleStatusChange: (values: Set<string>) => {
        handleStatusFilterChange(values);
      },
      handleRoleChange: (values: Set<string>) => {
        handleRoleFilterChange(values);
      },
      handlePlanTypeFilterChange: (values: Set<string>) => {
        handlePlanTypeFilterChange(values);
      },
    }),
    []
  );

  return (
    <div className="flex flex-col flex-wrap gap-4 mb-2">
      <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-end">
        <div className="flex flex-col gap-2 xs:flex-row xs:items-center">
          <DatePicker
            date={startDate || undefined}
            onDateChange={onStartDateChange}
            placeholder="Start Date"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <DatePicker
            date={endDate || undefined}
            onDateChange={onEndDateChange}
            placeholder="End Date"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filters
            options={paymentStatuses}
            selectedValues={selectedStatuses}
            handleFilterChange={handleFilters.handleStatusChange}
            title="Payment Status"
          />
          <Filters
            options={planTypeOptions}
            selectedValues={selectedPlanTypes}
            handleFilterChange={handlePlanTypeFilterChange}
            title="Plan Type"
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                if (onReset) {
                  onReset();
                } else {
                  // Fallback for backward compatibility
                  handleFilters.handleStatusChange(new Set());
                  handleFilters.handleRoleChange(new Set());
                  handleFilters.handlePlanTypeFilterChange(new Set());
                  onStartDateChange(undefined);
                  onEndDateChange(undefined);
                }
              }}
              className="h-8 px-2"
            >
              Reset
              <X className="h-4 w-4" />
            </Button>
          )}
          {onExport && (
            <Button
              variant="default"
              onClick={onExport}
              className="h-8 px-2"
            >
              Export Excel
            </Button>
          )}
        </div>
        <Input
          placeholder="Search users by name and email..."
          value={inputValue}
          onChange={(event) => {
            const searchTerm = event.target.value;
            setInputValue(searchTerm);
            onSearch(searchTerm);
          }}
          className="h-8 w-full xs:w-[150px] lg:w-[250px]"
        />
      </div>
    </div>
  );
};

export default React.memo(UserFilters);
