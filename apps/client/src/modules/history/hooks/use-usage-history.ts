import { useEffect, useState, useMemo } from "react";
import { serverAxios } from "@/lib/axios";

export interface UsageHistoryItem {
    id: string;
    date: string;
    type: "addition" | "deduction";
    description: string;
    impact: number;
    balanceAfter: number;
    planMode: "Unlimited" | "Credit Plan";
    isUnlimited: boolean;
    raw: any;
}

export interface UsageStats {
    totalPurchased: number;
    totalUsed: number;
    availableBalance: number;
    currentPlan: "Unlimited" | "Credit Plan";
}

export interface UnlimitedPlanInfo {
    type: string;
    expiry: string;
    startDate: string;
}

export const useUsageHistory = () => {
    const [history, setHistory] = useState<UsageHistoryItem[]>([]);
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [unlimitedPlan, setUnlimitedPlan] = useState<UnlimitedPlanInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1,
        limit: 10
    });

    // Local filter states
    const [search, setSearch] = useState("");
    const [activityFilter, setActivityFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await serverAxios.get(`/payment/billing-history`, {
                params: {
                    page,
                    limit,
                    search,
                    activityFilter,
                    planFilter
                }
            });
            if (response.data && response.data.success) {
                setHistory(response.data.data.history);
                setStats(response.data.data.stats);
                setUnlimitedPlan(response.data.data.unlimitedPlan);
                setPagination(response.data.data.pagination);
            }
        } catch (err: any) {
            console.error("Failed to fetch usage history:", err);
            setError(err.message || "Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, search, activityFilter, planFilter]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [search, activityFilter, planFilter]);

    return {
        history,
        stats,
        unlimitedPlan,
        loading,
        error,
        pagination,
        page,
        setPage,
        refresh: fetchHistory,
        filters: {
            search,
            setSearch,
            activityFilter,
            setActivityFilter,
            planFilter,
            setPlanFilter
        }
    }
}
