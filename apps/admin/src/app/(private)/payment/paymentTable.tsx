"use client";

import { DataTable } from "@/components/customs/table";
import { useState, useEffect } from "react";
import useFetchPayments from "@/hooks/useFetchPayments";
import { formatDate, capitalizeFirstLetter } from "@/helpers";
import { checkCurrency } from "@/helpers";
import { usePricingPlans } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import UserFilters from "@/modules/user-filters";

const PaymentsTable = () => {
  const { payments, loading, pagination, updateFilters, filters, downloadExcel } =
    useFetchPayments({ page: 1, limit: 10 });

  const { data: plans = [] } = usePricingPlans();

  const planTypeOptions = plans.map((p) => ({ value: p.slug, label: p.name }));

  const getPlanName = (totalAmount: number): string => {
    for (const plan of plans) {
      const inrTotal = Math.round(plan.inrPrice * (1 + plan.gstPercent / 100));
      if ([plan.usdPrice, plan.inrPrice, inrTotal].includes(totalAmount)) {
        return plan.name;
      }
    }
    return "Unknown Plan";
  };

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [selectedPlanTypes, setSelectedPlanTypes] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      updateFilters({ search: searchQuery ?? "", page: 1 });
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleStatusFilterChange = (values: Set<string>) => {
    setSelectedStatuses(values);
    updateFilters({ status: Array.from(values), page: 1 });
  };

  const handleRoleFilterChange = (values: Set<string>) => {
    setSelectedRoles(values);
    updateFilters({ role: Array.from(values), page: 1 });
  };

  const handlePlanTypeFilterChange = (values: Set<string>) => {
    setSelectedPlanTypes(values);
    updateFilters({ tier: Array.from(values), page: 1 });
  };

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleStartDateChange = (date: Date | undefined) => {
    const val = date || null;
    setStartDate(val);
    updateFilters({ startDate: val ? fmt(val) : undefined, page: 1 });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    const val = date || null;
    setEndDate(val);
    updateFilters({ endDate: val ? fmt(val) : undefined, page: 1 });
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedStatuses(new Set());
    setSelectedRoles(new Set());
    setSelectedPlanTypes(new Set());
    setStartDate(null);
    setEndDate(null);
    updateFilters({ search: "", status: [], role: [], tier: [], startDate: undefined, endDate: undefined, page: 1 });
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: "paymentId", header: "Payment ID" },
    { accessorKey: "orderId", header: "Order ID" },
    {
      accessorKey: "userId.firstName",
      header: "Name",
      cell: ({ row }) =>
        `${capitalizeFirstLetter(row.original.userId?.firstName)} ${row.original.userId?.lastName}`,
    },
    { accessorKey: "userId.email", header: "Email" },
    {
      accessorKey: "threadsQuantity",
      header: "Threads",
      cell: ({ row }) => (row.original.threadsQuantity !== 0 ? row.original.threadsQuantity : "Unlimited"),
    },
    { accessorKey: "currency", header: "Currency", cell: ({ row }) => row.original.currency },
    {
      accessorKey: "",
      header: "Base Price",
      cell: ({ row }) => row.original.totalAmount - (row.original.gstAmount ?? 0),
    },
    {
      accessorKey: "gstAmount",
      header: "GST",
      cell: ({ row }) => row.original?.gstAmount ?? 0,
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => checkCurrency(row.original.totalAmount),
    },
    {
      accessorKey: "paymentType",
      header: "Payment Type",
      cell: ({ row }) => capitalizeFirstLetter(row.original.paymentType),
    },
    {
      accessorKey: "unitPrice",
      header: "Plan Type",
      cell: ({ row }) => row.original.planName || getPlanName(row.original.totalAmount),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => capitalizeFirstLetter(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: "Purchase Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    { id: "expand", cell: () => null },
  ];

  return (
    <>
      <UserFilters
        onSearch={setSearchQuery}
        selectedStatuses={selectedStatuses}
        handleStatusFilterChange={handleStatusFilterChange}
        selectedRoles={selectedRoles}
        handleRoleFilterChange={handleRoleFilterChange}
        selectedPlanTypes={selectedPlanTypes}
        handlePlanTypeFilterChange={handlePlanTypeFilterChange}
        planTypeOptions={planTypeOptions}
        search={searchQuery}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onReset={handleReset}
        onExport={downloadExcel}
      />
      <DataTable
        columns={columns}
        data={payments}
        pageInfo={pagination}
        loadMore={() => updateFilters({ page: pagination.currentPage + 1 })}
        loadPrevious={() => updateFilters({ page: pagination.currentPage - 1 })}
        setPageSize={(newSize) => updateFilters({ limit: newSize, page: 1 })}
        loading={loading}
        pageSize={filters.limit ?? 10}
        pageSizeOptions={[10, 20, 50]}
      />
    </>
  );
};

export default PaymentsTable;
