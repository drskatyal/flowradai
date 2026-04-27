import { Speciality } from "@/hooks";
import { SpecialityActions, SpecialityStatus } from "@/modules/speciality";
import { ColumnDef } from "@tanstack/react-table";
import { hasEmptyPromptField } from "@/helpers";
import { Badge } from "@/components/ui/badge";

export const getTableListColumns = (
  actionProps
    : {
      onEditSpeciality?: (specialities: Speciality) => void;
      onDeleteSpeciality?: (specialities: Speciality) => void;
      onExpandRow?: (specialities: Speciality) => void;
      onUpdateStatus?: (specialities: Speciality) => void;
      expandedSpeciality?: Speciality | null;
    }): ColumnDef<Speciality, any>[] => [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const isPromptIncomplete = hasEmptyPromptField(row.original);
        return <div className="flex gap-2">
          {row.original.name}
          {
            isPromptIncomplete &&
            <Badge style={{ background: '#505050' }} className="rounded-xl">Draft</Badge>
          }
        </div>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (row.original.description),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: (cellProps) => <SpecialityStatus {...cellProps} {...actionProps} />,
    },
    {
      id: "actions",
      header: "",
      cell: (cellProps) => <SpecialityActions {...cellProps} {...actionProps} />,
    },
  ];
