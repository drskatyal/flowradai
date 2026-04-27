import { ColumnDef, CellContext, HeaderContext } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Macro } from "@/hooks/use-macro";
import { Speciality } from "@/hooks/use-speciality";
import { DBUser } from "@/hooks/use-db-user";
import MacroActions from "./macro-actions";

export const getMacroListColumns = ({
    expandedMacro,
    onDeleteMacro,
    onEditMacro,
    onExpandRow,
    onCloneMacro,
    specialities,
    currentUser,
    showMarketplace
}: {
    expandedMacro: Macro | null;
    onDeleteMacro: (macro: Macro) => void;
    onEditMacro: (macro: Macro) => void;
    onCloneMacro: (macro: Macro) => void;
    onExpandRow: (macro: Macro) => void;
    specialities: Speciality[] | undefined;
    currentUser: DBUser | null;
    showMarketplace: boolean;
}): ColumnDef<Macro>[] => {
    return [
        {
            id: "select",
            header: ({ table }: HeaderContext<Macro, unknown>) => (

                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: CellContext<Macro, unknown>) => (

                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {

            accessorKey: "name",
            header: "Name",
            cell: ({ row }: CellContext<Macro, unknown>) => {

                const macro = row.original;
                const isOwner = currentUser?._id === macro.userId;
                const isMarketplace = !isOwner && macro.isPublic;

                return (
                    <div className="flex items-center gap-2 max-w-[250px]">
                        <div
                            className="font-medium cursor-pointer hover:underline truncate"
                            onClick={() => onExpandRow(row.original)}
                            title={row.getValue("name")}
                        >
                            {row.getValue("name")}
                        </div>
                        {isMarketplace && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-1 bg-blue-100 text-blue-800 shrink-0">
                                Marketplace
                            </Badge>
                        )}
                    </div>
                );

            },
        },
        {
            accessorKey: "specialityId",
            header: "Speciality",
            cell: ({ row }: CellContext<Macro, unknown>) => {

                const specialityId = row.original.specialityId?._id;
                const specialty = specialities?.find(s => s._id === specialityId);
                return specialty ? (
                    <div className="max-w-[200px] truncate" title={specialty.name}>
                        {specialty.name}
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                );

            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }: CellContext<Macro, unknown>) => (

                // <Badge variant={row.original.isActive ? "default" : "secondary"}>
                <p className={`${row.original.isActive ? "text-green-500" : "text-red-500"}`}>{row.original.isActive ? "Active" : "Inactive"}</p>
                // </Badge>
            ),
        },
        {
            accessorKey: "isPublic",
            header: "Visibility",
            cell: ({ row }: CellContext<Macro, unknown>) => (

                <Badge variant={row.original.isPublic ? "secondary" : "outline"}>
                    {row.original.isPublic ? "Public" : "Private"}
                </Badge>
            ),
        },
        {
            id: "actions",
            cell: (props: CellContext<Macro, unknown>) => {

                const { row } = props;
                const macro = row.original;
                const isOwner = currentUser?._id === macro.userId;

                // Owner can edit/delete
                // Non-Owner (Public) can clone
                return (
                    <MacroActions
                        {...props}
                        row={row}
                        onEditMacro={onEditMacro}
                        onDeleteMacro={onDeleteMacro}
                        onExpandRow={onExpandRow}
                        onCloneMacro={onCloneMacro}
                        expandedMacro={expandedMacro}
                        isOwner={isOwner}
                        isPublic={macro.isPublic}
                    />
                );
            },
        },
    ].filter(column => showMarketplace || column.id !== "select");
};

