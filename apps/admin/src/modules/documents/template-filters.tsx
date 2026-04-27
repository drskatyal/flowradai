import { Filters } from "@/components/customs/filters";
import { useSpeciality } from "./hooks/use-speciality";

export const TemplateFilters = ({
  selectedSpecialties,
  onSpecialtyChange,
}: {
  selectedSpecialties: Set<string>;
  onSpecialtyChange: (values: Set<string>) => void;
}) => {
  const { specialities } = useSpeciality();

  const specialtyOptions = specialities.map((specialty: any) => ({
    label: specialty.name,
    value: specialty.id,
  }));

  return (
    <div className="flex items-center gap-2">
      <Filters
        title="Specialty"
        options={specialtyOptions}
        selectedValues={selectedSpecialties}
        handleFilterChange={onSpecialtyChange}
        className="h-8 w-[150px]"
      />
    </div>
  );
}; 