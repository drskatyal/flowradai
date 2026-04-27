import { SwitchToggle } from "@/components/ui/toggle";
import { Speciality } from "@/hooks";
import { CellContext } from "@tanstack/react-table";
import { Tooltip } from "@/components/customs";
import { useState } from "react";

interface SpecialityActionsProps extends CellContext<Speciality, any> {
  onUpdateStatus?: (specialities: Speciality) => void;
}

const SpecialityStatus: React.FC<SpecialityActionsProps> = ({
  row,
  onUpdateStatus,
}) => {
  const speciality = row.original;
  const [isActive, setIsActive] = useState(speciality.active);

  const isValid = Object.entries(speciality.prompt).every(([key, value]) => {
    if (["_id", "__v", "createdAt", "updatedAt", "specialityId"].includes(key)) {
      return true;
    }
    return typeof value !== "string" || value.trim().length > 0;
  });

  return (
    <div>
      <Tooltip
        trigger={
          <div className="flex items-center gap-2">
            <SwitchToggle
              size="sm"
              pressed={isActive}
              onPressedChange={(value) => {
                setIsActive(value);
                onUpdateStatus?.({ ...speciality, active: value });
              }}
              disabled={!isValid}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isActive ? '#10b981' : '#f87171', // green-500 : red-400
              }}
            />
            <span className={`text-xs font-medium ${
              isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        }
      >
        {isValid ? "Update speciality status" : "Please fill all prompt values"}
      </Tooltip>
    </div>
  );
};

export default SpecialityStatus;