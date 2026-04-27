import { ChevronDown, ChevronUp, PenIcon, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Speciality } from "@/hooks";
import { CellContext } from "@tanstack/react-table";

interface SpecialityActionsProps extends CellContext<Speciality, any> {
  onEditSpeciality?: (specialities: Speciality) => void;
  onDeleteSpeciality?: (specialities: Speciality) => void;
  onExpandRow?: (specialities: Speciality) => void;
  expandedSpeciality?: Speciality | null;
}

const SpecialityActions: React.FC<SpecialityActionsProps> = ({
  row,
  onEditSpeciality,
  onDeleteSpeciality,
  onExpandRow,
  expandedSpeciality,
}) => {
  const speciality = row.original;

  return (
    <div className="flex items-center justify-end gap-2">
      <>
        <Tooltip
          trigger={
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditSpeciality?.(speciality);
              }}
            >
              <PenIcon className="h-4 w-4" />
            </Button>
          }
        >
          Edit speciality
        </Tooltip>
        <Tooltip
          trigger={
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSpeciality?.(speciality);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          }
        >
          Delete Speciality
        </Tooltip>
      </>
      <Tooltip
        trigger={
          <Button
            variant="ghost"
            size="icon"
            className="transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onExpandRow?.(speciality);
            }}
          >
            {expandedSpeciality?._id === speciality._id ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        }
      >
        {expandedSpeciality?._id === speciality._id
          ? "Collapse details"
          : "Expand details"}
      </Tooltip>
    </div>
  );
};

export default SpecialityActions;
