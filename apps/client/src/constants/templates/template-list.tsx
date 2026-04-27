import { Template } from "@/hooks";
import { Speciality } from "@/hooks/use-speciality";
import { TemplateType } from "@/interfaces";
import TemplateActions from "@/modules/template/template-actions";
import { formatDate } from "@/utils/format-date";
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export const getTableListColumns = ({
  specialities,
  currentUser,
  showMarketplace,
  ...actionProps
}: {
  onEditTemplate?: (templates: Template) => void;
  onDeleteTemplate?: (templates: Template) => void;
  onCloneTemplate?: (templates: Template) => void;
  onExpandRow?: (templates: Template) => void;
  expandedTemplate?: Template | null;
  specialities?: Speciality[];
  currentUser?: any; // Add currentUser
  showMarketplace?: boolean;
}): ColumnDef<Template, any>[] => {
  const columns: ColumnDef<Template, any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Name",
      cell: ({ row }) => {
        const template = row.original;
        const isOwner = currentUser?._id === template.userId;
        const isMarketplace = template.type === "private" && !isOwner;

        return (
          <div className="flex items-center gap-2">
            <span
              className="font-medium cursor-pointer hover:underline text-sm"
              onClick={() => actionProps.onExpandRow?.(template)}
            >
              {template.title}
            </span>
            {isMarketplace && (
              <Badge
                variant="secondary"
                className="text-[10px] h-5 px-1 bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                Marketplace
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        if (row.original.type === "private") return "N/A";
        return formatDate(row.original.createdAt);
      },
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.type === "private"
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
        let label = "";
        let badgeColor = "";

        switch (row.original.category) {
          case "normal":
            label = "Normal";
            badgeColor = "bg-green-100 text-green-800";
            break;

          case "abnormal":
            label = "Abnormal";
            badgeColor = "bg-yellow-100 text-yellow-800";
            break;

          default:
            label = "N/A";
            badgeColor = "bg-gray-100 text-gray-800";
            break;
        }

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
      cell: (cellProps: CellContext<Template, any>) => {
        const template = cellProps.row.original;
        const isOwner = currentUser?._id === template.userId;
        const isDefault = template.type === "private";

        return (
          <TemplateActions
            {...cellProps}
            {...actionProps}
            isOwner={isOwner}
            isDefault={isDefault}
          />
        );
      },
    },
  ];

  if (!showMarketplace) {
    return columns.filter((column) => column.id !== "select");
  }

  return columns;
};
