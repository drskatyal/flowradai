import { Button } from "@/components/ui/button";
import { CouponCode } from "@/hooks/use-coupon-code";
import { formatDate } from "@/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, CopyCheck } from "lucide-react";
import CouponCodeActions from "../../modules/coupon-code/coupon-code-actions";

export const getTableListColumns = ({
    onCopyCode,
    copiedCode,
    ...actionProps
}: {
    onToggleStatus?: (couponCode: CouponCode) => void;
    onEditCouponCode?: (couponCode: CouponCode) => void;
    onDeleteCouponCode?: (couponCode: CouponCode) => void;
    onViewDetails?: (couponCode: CouponCode) => void;
    onCopyCode?: (code: string) => void;
    copiedCode?: string | null;
}): ColumnDef<CouponCode>[] => {
    return [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => {
                const isCopied = copiedCode === row.original.code;
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{row.original.code}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopyCode?.(row.original.code);
                            }}
                        >
                            {isCopied ? (
                                <CopyCheck className="h-3 w-3" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                return row.original.name || "-";
            },
        },
        {
            accessorKey: "days",
            header: "Validity",
            cell: ({ row }) => {
                return `${row.original.days} Days`;
            },
        },
        {
            accessorKey: "allowToAllUsers",
            header: "User Access",
            cell: ({ row }) => {
                const allowToAllUsers = row.original.allowToAllUsers;
                return (
                    <span
                        className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${allowToAllUsers
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                    >
                        {allowToAllUsers ? "All Users" : "Selected Users"}
                    </span>
                );
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
            id: "actions",
            header: "",
            cell: (cellProps) => (
                <CouponCodeActions {...cellProps} {...actionProps} />
            ),
        },
    ];
};