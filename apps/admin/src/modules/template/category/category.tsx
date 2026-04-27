import { AsyncSelect } from "@/components/customs/async-select";
import { useSelectCategoryType } from "./hooks/use-select-category-type";

const Category = ({ value, onChange } : { value: string, onChange: (value: string) => void }) => {
  const {
    categoryTypeOptions,
    fetchCategoryTypeOptions,
    selectedCategoryType,
    handleCategoryTypeSelect,
  } = useSelectCategoryType();
  return (
    <div className="w-full">
      <AsyncSelect
        fetcher={fetchCategoryTypeOptions}
        renderOption={(option) => <div>{option.label}</div>}
        getOptionValue={(option) => option.value}
        getDisplayValue={(option) => option.label}
        value={selectedCategoryType || value}
        onChange={(value) => {
          handleCategoryTypeSelect(value);
          onChange(value);
        }}
        label="Category"
        placeholder="Select Category..."
        triggerClassName="w-full"
        className="w-[var(--radix-popover-trigger-width)]"
      />
    </div>
  );
};

export default Category;
