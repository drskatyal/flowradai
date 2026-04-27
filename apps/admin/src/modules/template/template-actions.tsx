import { ChevronDown, ChevronUp, PenIcon, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Template } from "@/hooks";
import { CellContext } from "@tanstack/react-table";

interface TemplateActionsProps extends CellContext<Template, any> {
  onEditTemplate?: (templates: Template) => void;
  onDeleteTemplate?: (templates: Template) => void;
  onExpandRow?: (templates: Template) => void;
  expandedTemplate?: Template | null;
}

const TemplateActions: React.FC<TemplateActionsProps> = ({
  row,
  onEditTemplate,
  onDeleteTemplate,
  onExpandRow,
  expandedTemplate,
}) => {
  const template = row.original;

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
                onEditTemplate?.(template);
              }}
            >
              <PenIcon className="h-4 w-4" />
            </Button>
          }
        >
          Edit template
        </Tooltip>
        <Tooltip
          trigger={
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTemplate?.(template);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          }
        >
          Delete template
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
              onExpandRow?.(template);
            }}
          >
            {expandedTemplate?._id === template._id ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        }
      >
        {expandedTemplate?._id === template._id
          ? "Collapse details"
          : "Expand details"}
      </Tooltip>
    </div>
  );
};

export default TemplateActions;
