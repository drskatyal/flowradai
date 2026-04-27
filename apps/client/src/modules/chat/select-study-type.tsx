"use client";
import { AsyncSelect, Option } from "@/components/ui/customs/async-select";
import { useSelectStudyType } from "./hooks";

const SelectStudyType = () => {
  const { fetchStudyTypes, selectedStudyType, handleStudyTypeSelect } =
    useSelectStudyType();
  return (
    <AsyncSelect
      fetcher={fetchStudyTypes}
      renderOption={(option: Option) => (
        <div className="flex flex-col gap-1">
          <div>{option.label}</div>
        </div>
      )}
      getOptionValue={(option: Option) => option.value}
      getDisplayValue={(option: Option) => option.label}
      value={selectedStudyType?.value}
      onChange={handleStudyTypeSelect}
      label="Study Name"
      triggerClassName="w-full"
      className="w-[var(--radix-popover-trigger-width)]"
    />
  );
};

export default SelectStudyType;
