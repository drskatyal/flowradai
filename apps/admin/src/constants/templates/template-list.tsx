import { Template, Speciality } from "@/hooks";
import { TemplateType } from "@/interfaces";
import { TemplateActions } from "@/modules/template";
import { formatDate } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { getCategoryBadge } from "@/helpers";

export const getTableListColumns = ({
  specialities,
  ...actionProps
}: {
  onEditTemplate?: (templates: Template) => void;
  onDeleteTemplate?: (templates: Template) => void;
  onExpandRow?: (templates: Template) => void;
  expandedTemplate?: Template | null;
  specialities?: Speciality[];
}): ColumnDef<Template, any>[] => {
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
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.type === "private"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {row.original.type === "private"
            ? TemplateType.DEFAULT
            : TemplateType.PERSONAL}
        </span>
      ),
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
      cell: (cellProps) => <TemplateActions {...cellProps} {...actionProps} />,
    },
  ];
};
