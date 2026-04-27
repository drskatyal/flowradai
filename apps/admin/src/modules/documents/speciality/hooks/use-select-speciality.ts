import { useState, useMemo } from "react";
import { useSpeciality } from "../../hooks/use-speciality";
import { Speciality } from "@/hooks";

interface LabelValueOption {
    label: string;
    value: string;
}

export const useSelectSpecilaity = () => {
  const { specialities } = useSpeciality();
  const [selectedSpecilaity, setSelectedSpeciality] = useState("");

  // Get label-value pairs of only active specialities
  const specialityOptions: LabelValueOption[] = useMemo(() => {
    return (specialities as Speciality[] | undefined)?.filter((item) => item.active).map((item) => ({
      label: item.name,
      value: item._id,
    })) || [];
  }, [specialities]);

  const fetchSpecialityOptions = async (query?: string) => {
    if (query) {
      return specialityOptions.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );
    }
    return specialityOptions;
  };

  const handleSpecialitySelect = (value: string) => {
    setSelectedSpeciality(value);
  };

  return {
    specialities,
    selectedSpecilaity,
    setSelectedSpeciality,
    specialityOptions,
    fetchSpecialityOptions,
    handleSpecialitySelect
  };
};
