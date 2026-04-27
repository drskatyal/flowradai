import { AsyncSelect } from "@/components/ui/customs/async-select";
import { useSelectSpecilaity } from "./hooks/use-select-speciality";

const Speciality = ({
  value,
  onChange,
  isReadOnly = true
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  isReadOnly: boolean
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
        disabled={isReadOnly}
      />
    </div>
  );
};

export default Speciality;
