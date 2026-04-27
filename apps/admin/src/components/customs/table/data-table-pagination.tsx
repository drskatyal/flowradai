import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/constants";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  pageInfo?: Pagination;
  onPageChange: (direction: "next" | "previous") => void;
  onPageSizeChange: (newSize: number) => void;
  pageSize: number;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  pageInfo,
  onPageChange,
  onPageSizeChange,
  pageSize = 10,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-4 xs:flex-row items-center justify-between xs:justify-end xs:px-2">
      <div className="flex w-full xs:w-fit items-center max-xs:justify-between gap-4 xs:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium hidden xs:block">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const newSize = Number(value);
              table.setPageSize(newSize);
              onPageSizeChange(newSize);
            }}
          >
            <SelectTrigger className="!ml-0 xs:!ml-2 h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center text-sm font-medium">
            Page {pageInfo?.currentPage} of {pageInfo?.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange("previous")}
              disabled={!pageInfo?.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange("next")}
              disabled={!pageInfo?.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
