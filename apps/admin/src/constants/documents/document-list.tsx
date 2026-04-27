import { Document, Speciality } from "@/hooks";
import { DocumentActions } from "@/modules/documents";
import { formatDate } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { getCategoryBadge } from "@/helpers";

export const getTableListColumns = ({
  specialities,
  ...actionProps
}: {
  onEditDocument?: (documents: Document) => void;
  onDeleteDocument?: (documents: Document) => void;
  onExpandRow?: (documents: Document) => void;
  expandedDocument?: Document | null;
  specialities?: Speciality[];
}): ColumnDef<Document, any>[] => {
  return [
    {
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return formatDate(row.original.createdAt);
      },
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => {
        const { label, badgeColor } = getCategoryBadge(row.original.category);

        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      id: "specialityId",
      header: "Speciality",
      cell: ({ row }) => {
        return (
          specialities?.find(
            (speciality) => speciality._id === row.original.specialityId
          )?.name || "N/A"
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: (cellProps) => <DocumentActions {...cellProps} {...actionProps} />,
    },
  ];
};
