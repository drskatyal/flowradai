import { ChevronDown, ChevronUp, PenIcon, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Macro } from "@/hooks";
import { CellContext } from "@tanstack/react-table";

interface MacroActionsProps extends CellContext<Macro, any> {
    onEditMacro?: (macro: Macro) => void;
    onDeleteMacro?: (macro: Macro) => void;
    onExpandRow?: (macro: Macro) => void;
    expandedMacro?: Macro | null;
}

const MacroActions: React.FC<MacroActionsProps> = ({
    row,
    onEditMacro,
    onDeleteMacro,
    onExpandRow,
    expandedMacro,
}) => {
    const macro = row.original;

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
                                onEditMacro?.(macro);
                            }}
                        >
                            <PenIcon className="h-4 w-4" />
                        </Button>
                    }
                >
                    Edit macro
                </Tooltip>
                <Tooltip
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteMacro?.(macro);
                            }}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    }
                >
                    Delete macro
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
                            onExpandRow?.(macro);
                        }}
                    >
                        {expandedMacro?._id === macro._id ? (
                            <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        )}
                    </Button>
                }
            >
                {expandedMacro?._id === macro._id
                    ? "Collapse details"
                    : "Expand details"}
            </Tooltip>
        </div>
    );
};

export default MacroActions;
