import { Filters } from "@/components/customs/filters";

export const CategoryFilters = ({
  selectedCategories,
  onCategoryChange,
}: {
  selectedCategories: Set<string>;
  onCategoryChange: (values: Set<string>) => void;
}) => {
  const categoryOptions = [
    { label: "Normal", value: "normal" },
    { label: "Abnormal", value: "abnormal" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Filters
        title="Category"
        options={categoryOptions}
        selectedValues={selectedCategories}
        handleFilterChange={onCategoryChange}
        className="h-8"
      />
    </div>
  );
}; 