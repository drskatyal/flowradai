import { useState } from 'react';

export const useTemplateFilters = () => {
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());

  const handleSpecialtyChange = (values: Set<string>) => {
    setSelectedSpecialties(values);
  };

  const getFilterParams = () => {
    return {
      specialtyIds: Array.from(selectedSpecialties),
    };
  };

  return {
    selectedSpecialties,
    handleSpecialtyChange,
    getFilterParams,
  };
}; 