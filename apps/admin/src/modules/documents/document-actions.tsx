import { ChevronDown, ChevronUp, PenIcon, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Document } from "@/hooks";
import { CellContext } from "@tanstack/react-table";

interface DocumentActionsProps extends CellContext<Document, any> {
  onEditDocument?: (documents: Document) => void;
  onDeleteDocument?: (documents: Document) => void;
  onExpandRow?: (documents: Document) => void;
  expandedDocument?: Document | null;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  row,
  onEditDocument,
  onDeleteDocument,
  onExpandRow,
  expandedDocument,
}) => {
  const document = row.original;

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
                onEditDocument?.(document);
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
                onDeleteDocument?.(document);
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
              onExpandRow?.(document);
            }}
          >
            {expandedDocument?._id === document._id ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        }
      >
        {expandedDocument?._id === document._id
          ? "Collapse details"
          : "Expand details"}
      </Tooltip>
    </div>
  );
};

export default DocumentActions;
