import { Filters } from "@/components/customs/filters";
import { categoryTypes } from "@/constants/category";

export const CategoryFilters = ({
  selectedCategories,
  onCategoryChange,
}: {
  selectedCategories: Set<string>;
  onCategoryChange: (values: Set<string>) => void;
}) => {
  const categoryOptions = Object.values(categoryTypes);

  return (
    <div className="flex items-center gap-2">
      <Filters
        title="Category"
        options={categoryOptions}
        selectedValues={selectedCategories}
        handleFilterChange={onCategoryChange}
        className="h-8 w-[150px]"
      />
    </div>
  );
}; 