"use client";

import { PlusCircle, Crown, Clock, Zap } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Tooltip } from "@/components/customs";
import { DataTable } from "@/components/customs/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter, formatDate } from "@/helpers";
import useFetchUsers from "@/hooks/useFetchUsers";
import { User } from "@/interfaces";
import { UpdateUserCreditDialog } from "@/modules/user";
import { ColumnDef } from "@tanstack/react-table";
import { useSpecialityList } from "@/hooks";

const pageSizeOptions = [10, 20, 50, 100];

const UsersTable = () => {
  const {
    users,
    loading,
    filters,
    pagination,
    updateFilters,
    handleLimitChange,
    refetch,
  } = useFetchUsers({
    page: 1,
    limit: pageSizeOptions[0],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [updatableUser, setUpdatableUser] = useState<User | null>(null);
  // Handle search input with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      updateFilters({ search: searchQuery, page: 1 });
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const { data: specialities } = useSpecialityList();

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) =>
          `${capitalizeFirstLetter(row.original.firstName)} ${row.original.lastName
          }`,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => capitalizeFirstLetter(row.original.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => capitalizeFirstLetter(row.original.status),
      },
      {
        accessorKey: "specialityId",
        header: "Specialty",
        cell: ({ row }) => {
          const speciality = specialities?.specialities.find(
            (speciality: any) => speciality?.id === row.original?.specialityId
          );
          return speciality?.name ?? "N/A";
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: "availableCredits",
        header: "Credits Balance",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.availableCredits ?? 0} / {row.original.totalCredits ?? 0}
          </span>
        ),
      },
      {
        id: "usedCredits",
        header: "Used (Credit)",
        cell: ({ row }) =>
          (row.original.totalCredits ?? 0) - (row.original.availableCredits ?? 0),
      },
      {
        id: "planStatus",
        header: "PLAN STATUS",
        cell: ({ row }) => {
          const sub = row.original.currentSubscription;
          const isExpired = sub && new Date(sub.endDate) < new Date();
          const isUnlimited =
            sub && ["monthly", "yearly", "unlimited", "quarterly", "coupon_code", "referral"].includes(sub.planType);

          if (isUnlimited && !isExpired) {
            return (
              <Tooltip
                classNames={{
                  content: "p-3 bg-white text-black border shadow-lg",
                }}
                trigger={
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-100 flex gap-1 w-fit cursor-pointer"
                  >
                    <Crown className="w-3 h-3" />
                    <div className="flex flex-col items-start leading-tight">
                      <span>Unlimited</span>
                      <span className="text-[10px]">Active</span>
                    </div>
                  </Badge>
                }
              >
                <div className="flex flex-col gap-1 text-xs">
                  <div className="font-semibold border-b pb-1 mb-1">
                    Subscription Details
                  </div>
                  <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium capitalize">
                      {sub?.planType?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">Start:</span>
                    <span>{sub ? formatDate(sub.startDate) : "N/A"}</span>
                    <span className="text-muted-foreground">End:</span>
                    <span>{sub ? formatDate(sub.endDate) : "N/A"}</span>
                  </div>
                </div>
              </Tooltip>
            );
          }

          if (isExpired) {
            return (
              <Tooltip
                classNames={{
                  content: "p-3 bg-white text-black border shadow-lg",
                }}
                trigger={
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-600 border-orange-200 flex gap-1 w-fit cursor-help"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Plan Expired</span>
                  </Badge>
                }
              >
                <div className="flex flex-col gap-1 text-xs">
                  <div className="font-semibold border-b pb-1 mb-1">
                    Expired Subscription
                  </div>
                  <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium capitalize">
                      {sub?.planType?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">Ended:</span>
                    <span>{sub ? formatDate(sub.endDate) : "N/A"}</span>
                  </div>
                </div>
              </Tooltip>
            );
          }

          return (
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 hover:bg-slate-100 flex gap-1 w-fit"
            >
              <Zap className="w-3 h-3" />
              <span>Credit Only</span>
            </Badge>
          );
        },
      },
      {
        id: "unlimitedUsed",
        header: "Unlimited Used",
        cell: ({ row }) => {
          const sub = row.original.currentSubscription;
          const isUnlimited =
            sub && ["monthly", "yearly", "unlimited", "quarterly", "coupon_code", "referral"].includes(sub.planType);

          if (!isUnlimited) return <span className="text-muted-foreground">—</span>;

          const daysLeft = sub
            ? Math.ceil(
              (new Date(sub.endDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
            )
            : 0;

          return (
            <div className="flex items-center gap-1">
              <span className="font-bold text-purple-700">
                {row.original.unlimitedUsage ?? 0}
              </span>
              {daysLeft >= 0 && (
                <span className="text-muted-foreground text-xs">
                  ({daysLeft}d left)
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Add Credit",
        cell: ({ row }) => (
          <Tooltip
            trigger={
              <Button
                variant="ghost"
                className="gap-1 px-1"
                onClick={() => {
                  setUpdatableUser(row.original);
                }}
              >
                <PlusCircle />
                <span> Credit</span>
              </Button>
            }
          >
            Add Credit
          </Tooltip>
        ),
      },
    ],
    [specialities]
  );

  const handleClose = (isUpdated?: boolean) => {
    setUpdatableUser(null);
    if (isUpdated) {
      refetch();
    }
  };

  return (
    <>
      <UpdateUserCreditDialog user={updatableUser} onClose={handleClose} />
      <div className="flex justify-end items-center mb-2">
        <Input
          type="text"
          placeholder="Search by Name or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-full xs:w-[150px] lg:w-[250px]"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading && !users.length}
        pageInfo={pagination}
        loadMore={() => updateFilters({ page: pagination.currentPage + 1 })}
        loadPrevious={() => updateFilters({ page: pagination.currentPage - 1 })}
        setPageSize={(size) => handleLimitChange(size)}
        pageSize={filters.limit ?? pageSizeOptions[0]}
        pageSizeOptions={pageSizeOptions}
      />
    </>
  );
};

export default UsersTable;