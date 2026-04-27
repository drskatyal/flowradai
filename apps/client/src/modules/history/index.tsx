"use client";

import { useUsageHistory } from "./hooks/use-usage-history";
import { UsageHistoryStats } from "./usage-history-stats";
import { UsageHistoryTable } from "./usage-history-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Calendar, ArrowRight, History, CreditCard, XIcon } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ReportHistory = () => {
    const {
        history,
        stats,
        unlimitedPlan,
        loading,
        pagination,
        page,
        setPage,
        filters
    } = useUsageHistory();

    const router = useRouter();

    const isUnlimitedActive = stats?.currentPlan === "Unlimited";

    const handleClose = () => {
        router.push("/");
    };

    return (
        <>
            <button
                className="fixed top-3 right-3 sm:top-6 sm:right-6 z-50"
                onClick={handleClose}
            >
                <XIcon className="h-6 w-6" />
            </button>
            <div className="container mx-auto py-8 px-4 md:px-8 max-w-[1400px] space-y-8 animate-in fade-in duration-500">

                {/* 1. Unlimited Plan Banner - Monochrome Shadcn Style */}
                {isUnlimitedActive && unlimitedPlan && (
                    <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-2xl border border-primary/10">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-foreground/10 rounded-full backdrop-blur-sm border border-primary-foreground/20">
                                    <Crown className="w-8 h-8 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">Unlimited Reporting Plan Active</h3>
                                    <p className="text-primary-foreground/80 text-sm">
                                        Generate unlimited reports without any credit deductions.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 bg-primary-foreground/5 px-6 py-4 rounded-lg border border-primary-foreground/10 backdrop-blur-sm w-full md:w-auto overflow-hidden">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-bold mb-1">VALID UNTIL</span>
                                    <span className="text-lg font-bold">{dayjs(unlimitedPlan.expiry).format("MMM DD, YYYY")}</span>
                                </div>
                                <div className="w-[1px] h-8 bg-primary-foreground/20" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-bold mb-1">PLAN TYPE</span>
                                    <span className="text-lg font-bold capitalize">{unlimitedPlan.type}</span>
                                </div>
                            </div>
                        </div>
                        {/* subtle decorative overlays for premium feel without color */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    </div>
                )}

                {/* 2. Stats Grid */}
                <UsageHistoryStats stats={stats} loading={loading} />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* 3. Main Usage History Table (3/4 width) */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card className="border-border shadow-none bg-card overflow-hidden">
                            <CardHeader className="pt-6 px-6 pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-bold flex items-center gap-2 tracking-tight">
                                            <History className="w-5 h-5 text-muted-foreground" />
                                            Usage & Billing History
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground mt-1">
                                            Consolidated view of credit purchases and usage logs.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-0 pt-4">
                                <UsageHistoryTable
                                    history={history}
                                    loading={loading}
                                    pagination={pagination}
                                    page={page}
                                    setPage={setPage}
                                    filters={filters}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* 4. Sidebars (1/4 width) */}
                    <div className="space-y-6">

                        {/* Unlimited Plan Sidebar - Neutralized */}
                        <Card className={cn(
                            "border-border shadow-none overflow-hidden",
                            isUnlimitedActive ? "bg-muted/30" : "bg-muted/10"
                        )}>
                            <CardHeader className="p-5 pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                    <Crown className={cn("w-4 h-4", isUnlimitedActive ? "text-foreground" : "text-muted-foreground/50")} />
                                    Unlimited Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 pt-2 space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">STATUS</span>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                                        isUnlimitedActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {isUnlimitedActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>

                                {isUnlimitedActive && unlimitedPlan ? (
                                    <>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Activated</div>
                                                    <div className="text-sm font-bold text-foreground">
                                                        {dayjs(unlimitedPlan.startDate).format("MMM DD, YYYY")}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Zap className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Expires</div>
                                                    <div className="text-sm font-bold text-foreground">
                                                        {dayjs(unlimitedPlan.expiry).format("MMM DD, YYYY")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <div className="bg-background p-3 rounded-lg border border-border shadow-sm">
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Total Duration</div>
                                                <div className="text-sm font-bold text-foreground">
                                                    {dayjs(unlimitedPlan.expiry).diff(dayjs(unlimitedPlan.startDate), 'day')} Days Plan
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-4 text-center">
                                        <p className="text-xs text-muted-foreground italic font-medium">No active plan found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Call to Action Sidebar - High Contrast Black */}
                        <Card className="border-none bg-primary shadow-2xl overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="relative z-10 space-y-6">
                                    <div className="p-3 bg-primary-foreground/10 w-fit rounded-lg group-hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/10">
                                        <CreditCard className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-primary-foreground font-bold text-lg leading-tight tracking-tight">Need more credits?</h3>
                                        <p className="text-primary-foreground/70 text-sm leading-relaxed">
                                            Purchase more credits to continue generating professional reports.
                                        </p>
                                    </div>
                                    <Button onClick={() => router.push("/pricing")} className="w-full bg-primary-foreground text-primary font-bold py-6 group hover:bg-primary-foreground/90 transition-all border-none">
                                        Purchase Credits
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                                {/* Decorative circles */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportHistory;