import { AsyncSelect } from "@/components/customs/async-select";
import { useSelectSpecilaity } from "./hooks/use-select-speciality";

const Speciality = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
}) => {
  const {
    specialities,
    selectedSpecilaity,
    setSelectedSpeciality,
    specialityOptions,
    fetchSpecialityOptions,
    handleSpecialitySelect,
  } = useSelectSpecilaity();

  return (
    <div className="w-full">
      <AsyncSelect
        fetcher={fetchSpecialityOptions}
        renderOption={(option) => <div>{option.label}</div>}
        getOptionValue={(option) => option.value}
        getDisplayValue={(option) => option.label}
        value={selectedSpecilaity || value || ""}
        onChange={(value) => {
          handleSpecialitySelect(value);
          onChange(value);
        }}
        label="Speciality"
        placeholder="Select Speciality..."
        triggerClassName="w-full"
        className="w-[var(--radix-popover-trigger-width)]"
      />
    </div>
  );
};

export default Speciality;
