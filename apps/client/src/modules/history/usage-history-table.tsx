import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { UsageHistoryItem } from "./hooks/use-usage-history";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageHistoryTableProps {
    history: UsageHistoryItem[];
    loading: boolean;
    pagination: {
        total: number;
        pages: number;
        currentPage: number;
        limit: number;
    };
    page: number;
    setPage: (p: number) => void;
    filters: {
        search: string;
        setSearch: (s: string) => void;
        activityFilter: string;
        setActivityFilter: (s: string) => void;
        planFilter: string;
        setPlanFilter: (s: string) => void;
    };
}

export const UsageHistoryTable = ({
    history,
    loading,
    pagination,
    page,
    setPage,
    filters,
}: UsageHistoryTableProps) => {
    return (
        <div className="space-y-4">
            {/* Filters Header */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2 px-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search history..."
                            className="pl-9 h-10 border-input bg-background focus:ring-ring"
                            value={filters.search}
                            onChange={(e) => filters.setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={filters.activityFilter} onValueChange={filters.setActivityFilter}>
                        <SelectTrigger className="w-40 h-10 border-input bg-background">
                            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="All Activities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            <SelectItem value="purchases">Purchases</SelectItem>
                            <SelectItem value="usage">Usage</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.planFilter} onValueChange={filters.setPlanFilter}>
                        <SelectTrigger className="w-40 h-10 border-input bg-background">
                            <SelectValue placeholder="All Plans" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="unlimited">Unlimited Plan</SelectItem>
                            <SelectItem value="credit">Credit Plan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-card mx-6">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="font-semibold text-foreground w-[150px]">DATE</TableHead>
                            <TableHead className="font-semibold text-foreground">DESCRIPTION</TableHead>
                            <TableHead className="font-semibold text-foreground text-center">CREDITS IMPACT</TableHead>
                            <TableHead className="font-semibold text-foreground text-center">PLAN MODE</TableHead>
                            <TableHead className="font-semibold text-foreground text-right">BALANCE AFTER</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-border">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No history found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors border-border">
                                    <TableCell className="text-muted-foreground font-medium">
                                        {dayjs(item.date).format("MMM DD, YYYY")}
                                        <div className="text-[10px] text-muted-foreground/60">{dayjs(item.date).format("hh:mm A")}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground font-medium">{item.description}</span>
                                            {item.isUnlimited && item.type === 'deduction' && (
                                                <div className="p-1 text-muted-foreground group cursor-help">
                                                    <Info className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`font-bold ${item.impact > 0 ? "text-green-500" :
                                            item.impact < 0 ? "text-red-500" :
                                                "text-muted-foreground/50"
                                            }`}>
                                            {item.impact > 0 ? `+${item.impact}` : item.impact === 0 ? "—" : item.impact}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${item.planMode === "Unlimited"
                                            ? "bg-foreground text-background border-foreground"
                                            : "bg-secondary text-secondary-foreground border-border"
                                            }`}>
                                            {item.planMode}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-foreground">
                                        {item.balanceAfter}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            {!loading && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-border mt-auto">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold">{(page - 1) * pagination.limit + 1}</span> to{" "}
                        <span className="font-semibold">
                            {Math.min(page * pagination.limit, pagination.total)}
                        </span>{" "}
                        of <span className="font-semibold">{pagination.total}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-input"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center">
                                        {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2 text-muted-foreground font-medium">...</span>}
                                        <Button
                                            variant={page === p ? "default" : "outline"}
                                            size="sm"
                                            className={`h-9 w-9 p-0 font-bold ${page === p ? "bg-primary text-primary-foreground" : "border-input"}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </Button>
                                    </div>
                                ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-input"
                            disabled={page === pagination.pages}
                            onClick={() => setPage(page + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
