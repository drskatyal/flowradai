"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/constants";
import {
  ColumnDef,
  ColumnFiltersState,
  Table as TableInstance,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageInfo?: Pagination;
  loadMore: () => void;
  loadPrevious: () => void;
  setPageSize: (newSize: number) => void;
  toolbar?: React.ComponentType<{ table: TableInstance<TData> }>;
  pageSizeOptions?: number[];
  pageSize: number;
  loading?: boolean;
  rowSelection?: any;
  setRowSelection?: React.Dispatch<React.SetStateAction<any>>;
  onSelectionChange?: (selectedRows: TData[]) => void;
  renderRow?: (props: {
    row: TData;
    rowContent: React.ReactNode;
  }) => React.ReactNode;
  getRowId?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageInfo,
  loadMore,
  loadPrevious,
  setPageSize,
  toolbar: Toolbar,
  pageSizeOptions,
  pageSize = 10,
  loading,
  rowSelection: externalRowSelection,
  setRowSelection: externalSetRowSelection,
  onSelectionChange,
  renderRow,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  
  const rowSelection = externalRowSelection !== undefined ? externalRowSelection : internalRowSelection;
  const setRowSelection = externalSetRowSelection !== undefined ? externalSetRowSelection : setInternalRowSelection;

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );


  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: getRowId,
  });

  return (
    <div className="space-y-4">
      {Toolbar && <Toolbar table={table} />}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: columns.length }).map(
                    (_, cellIndex) => (
                      <TableCell key={`skeleton-cell-${cellIndex}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : !table.getRowModel().rows?.length ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowContent = (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );

                return renderRow
                  ? React.cloneElement(
                      renderRow({
                        row: row.original as TData,
                        rowContent,
                      }) as React.ReactElement,
                      { key: row.id }
                    )
                  : rowContent;
              })
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        pageInfo={pageInfo}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageChange={(direction) => {
          if (direction === "next") {
            loadMore();
          } else {
            loadPrevious();
          }
        }}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
        }}
      />
    </div>
  );
}
