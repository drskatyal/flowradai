import { Macro, Speciality } from "@/hooks";
import { formatDate } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import MacroActions from "../../modules/macro/macro-actions";
import { useUser } from "@clerk/nextjs";

export const getTableListColumns = ({
    specialities,
    ...actionProps
}: {
    onEditMacro?: (macro: Macro) => void;
    onDeleteMacro?: (macro: Macro) => void;
    onExpandRow?: (macro: Macro) => void;
    expandedMacro?: Macro | null;
    specialities?: Speciality[];
}): ColumnDef<Macro>[] => {
    const { user } = useUser();
    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
                        <span>{row.original.name}</span>
                        {row.original.userId !== user?.publicMetadata?.internalId &&
                            <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Marketplace</span>
                        }
                    </div>
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => {
                return formatDate(row.original.createdAt);
            },
        },
        {
            id: "isActive",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                return (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </span>
                );
            },
        },
        {
            id: "isPublic",
            header: "Visibility",
            cell: ({ row }) => {
                const isPublic = row.original.isPublic;
                return (
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${isPublic
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                            }`}
                    >
                        {isPublic ? "Public" : "Private"}
                    </span>
                );
            },
        },
        {
            id: "specialityId",
            header: "Specialty",
            cell: ({ row }) => {
                return (
                    specialities?.find(
                        (speciality) => speciality._id === row.original.specialityId?._id
                    )?.name || "N/A"
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: (cellProps) => <MacroActions {...cellProps} {...actionProps} />,
        },
    ];
};
