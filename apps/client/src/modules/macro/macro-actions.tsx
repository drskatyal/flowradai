import { ChevronDown, ChevronUp, PenIcon, Trash2, CopyPlus } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Macro } from "@/hooks/use-macro";
import { CellContext } from "@tanstack/react-table";

interface MacroActionsProps extends CellContext<Macro, any> {
    onEditMacro?: (macro: Macro) => void;
    onDeleteMacro?: (macro: Macro) => void;
    onExpandRow?: (macro: Macro) => void;
    onCloneMacro?: (macro: Macro) => void;
    expandedMacro?: Macro | null;
    isOwner: boolean;
    isPublic: boolean;
}

const MacroActions: React.FC<MacroActionsProps> = ({
    row,
    onEditMacro,
    onDeleteMacro,
    onExpandRow,
    onCloneMacro,
    expandedMacro,
    isOwner,
    isPublic,
}) => {
    const macro = row.original;

    return (
        <div className="flex items-center justify-end gap-2">
            {isOwner && (
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
            )}

            {!isOwner && isPublic && (
                <Tooltip
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloneMacro?.(macro);
                            }}
                        >
                            <CopyPlus className="h-4 w-4" />
                        </Button>
                    }
                >
                    Insert in profile
                </Tooltip>
            )}

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
