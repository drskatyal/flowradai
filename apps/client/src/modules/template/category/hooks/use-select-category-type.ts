import { useState } from "react";
import { categoryTypes } from "@/constants/category";
import { TemplateCategory } from "@/interfaces";

export const useSelectCategoryType = () => {
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>("");
  const categoryTypeOptions = Object.values(categoryTypes);

  const fetchCategoryTypeOptions = async (query?: string) => {
    if (query) {
      return categoryTypeOptions.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );
    }
    return categoryTypeOptions;
  };

  const handleCategoryTypeSelect = (value: string) => {
    setSelectedCategoryType(value);
  };

  return {
    categoryTypeOptions,
    fetchCategoryTypeOptions,
    handleCategoryTypeSelect,
    selectedCategoryType,
  };
};
