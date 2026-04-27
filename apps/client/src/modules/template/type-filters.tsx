import { Filters } from "@/components/customs/filters";

export const TypeFilters = ({
  selectedTypes,
  onTypeChange,
}: {
  selectedTypes: Set<string>;
  onTypeChange: (values: Set<string>) => void;
}) => {
  const typeOptions = [
    { label: "Personal", value: "public" },
    { label: "Default", value: "private" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Filters
        title="Type"
        options={typeOptions}
        selectedValues={selectedTypes}
        handleFilterChange={onTypeChange}
        className="h-8 w-[150px]"
      />
    </div>
  );
}; 