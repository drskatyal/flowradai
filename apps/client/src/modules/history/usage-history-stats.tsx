import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingDown, Coins, BarChart3, Crown, Info } from "lucide-react";
import { UsageStats } from "./hooks/use-usage-history";

interface UsageHistoryStatsProps {
    stats: UsageStats | null;
    loading: boolean;
}

export const UsageHistoryStats = ({ stats, loading }: UsageHistoryStatsProps) => {
    const statCards = [
        {
            title: "Total Credits Purchased",
            value: stats?.totalPurchased,
            icon: <Wallet className="w-5 h-5" />,
            color: "bg-muted/50",
        },
        {
            title: "Total Credits Used",
            value: stats?.totalUsed,
            icon: <TrendingDown className="w-5 h-5" />,
            color: "bg-muted/50",
        },
        {
            title: "Available Balance",
            value: stats?.availableBalance,
            icon: <Coins className="w-5 h-5" />,
            color: "bg-muted/50",
            extra: stats?.currentPlan === "Unlimited" && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 mt-2 text-[10px] font-medium text-muted-foreground bg-secondary rounded-full border border-border w-fit">
                    <Info className="w-3 h-3" />
                    Paused during Unlimited Plan
                </div>
            )
        },
        {
            title: "Current Plan",
            value: stats?.currentPlan,
            icon: <Crown className="w-5 h-5" />,
            color: "bg-primary text-primary-foreground",
            isPlan: true
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
                <Card key={idx} className="border-border shadow-none overflow-hidden hover:bg-muted/5 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                            <div className={`p-2 rounded-lg ${card.color || 'bg-muted/50'}`}>
                                {card.icon}
                            </div>
                        </div>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-tight">
                                    {card.value}
                                </span>
                                {card.extra}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
