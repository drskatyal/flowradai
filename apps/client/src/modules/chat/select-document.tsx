"use client";
import { AsyncSelect, Option } from "@/components/ui/customs/async-select";
import { useSelectDocument } from "./hooks";

const SelectDocument = () => {

  const { fetchDocuments, handleDocumentSelect, selectedDocument } = useSelectDocument();
  return (
    <AsyncSelect
      fetcher={fetchDocuments}
      renderOption={(option: Option) => (
        <div className="flex flex-col gap-1">
          <div>{option.label}</div>
        </div>
      )}
      getOptionValue={(option: Option) => option.value}
      getDisplayValue={(option: Option) => option.label}
      value={selectedDocument?.prompt || ""}
      onChange={handleDocumentSelect}
      label="Study Name"
      triggerClassName="w-full"
      className="w-[var(--radix-popover-trigger-width)]"
      placeholder="Select document.."
    />
  );
};

export default SelectDocument;
