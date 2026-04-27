"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/customs/dialog";
import { Gift, Copy, Check, Users, Award, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,

} from "@/components/ui/tooltip";
import { useReferral } from "./hooks/use-referral";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ReferAndEarn = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) => {
    const { user } = useUser();
    type PlanType = "monthly" | "yearly" | "referral" | "regular" | "coupon_code";

    const planType: PlanType =
        (user?.publicMetadata?.payment as any)?.planType ?? "regular";

    const isUnlimited = ["monthly", "yearly", "referral", "coupon_code"].includes(planType);
    const { rewards, referredUsers, stats, loading, activateReward } = useReferral();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [activating, setActivating] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("referred_only");

    const filteredRewards = rewards.filter((r) => r.status === activeTab);

    const referralCode = (user?.publicMetadata?.user as any)?.referralCode as string || "";
    const referralLink = `${window.location.origin}/auth/sign-up?ref=${referralCode}`;

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const handleActivate = async (rewardId: string) => {
        try {
            setActivating(rewardId);
            await activateReward(rewardId);
            await user?.reload();
            toast({
                title: "Success",
                description: "Referral plan activated successfully!",
                variant: "default",
            });
        } catch (error: any) {
            console.error(error.message || "Failed to activate plan");
            toast({
                title: "Error",
                description: error.message || "Failed to activate plan",
                variant: "destructive",
            });
        } finally {
            setActivating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending_activation: {
                label: "Pending Activation",
                className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
            },
            active: {
                label: "Active",
                className: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
            },
            expired: {
                label: "Expired",
                className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
            },
            completed: {
                label: "Completed",
                className: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
            },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
            <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", config.className)}>
                {config.label}
            </span>
        );
    };

    return (
        <Dialog
            open={isOpen}
            headerTitle={
                <div className="flex items-center gap-2">
                    Refer & Earn
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 shadow-lg p-3">
                                <ul className="list-disc list-inside space-y-1 font-normal text-xs">
                                    <li>New users get 50 credits when they sign up with your code</li>
                                    <li>You get a 15-day unlimited plan when they create their first report</li>
                                    <li>Plans must be activated within 45 days of being granted</li>
                                    <li>You can only activate when no other unlimited plan is active</li>
                                </ul>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            }
            icon={Gift}
            headerDescription="Share your referral code and earn rewards!"
            allowInteractionOutside={false}
            closeOnOutsideClick={true}
            onOpenChange={() => setIsOpen(false)}
            classNames={{
                content:
                    "w-full max-sm:p-3 max-w-3xl overflow-y-auto flex flex-col rounded-lg shadow-xl bg-white dark:bg-neutral-900",
                headerTitle: "text-lg font-semibold flex items-center gap-2",
            }}
        >
            <div className="flex flex-col gap-4 p-4">
                {/* Referral Code Section */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <h3 className="text-sm font-semibold mb-2 dark:text-white">Your Referral Code</h3>
                    <div className="flex items-center gap-2 mb-3">
                        <code className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md text-lg font-mono font-bold text-center">
                            {referralCode || "Loading..."}
                        </code>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(referralCode)}
                            className="shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            readOnly
                            value={referralLink}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm"
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(referralLink)}
                            className="shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Referrals</span>
                        </div>
                        <p className="text-2xl font-bold dark:text-white">{stats?.totalReferrals || 0}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Pending Rewards</span>
                        </div>
                        <p className="text-2xl font-bold dark:text-white">{stats?.pendingRewards || 0}</p>
                    </div>
                </div>

                {/* Rewards List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold dark:text-white">Your Rewards</h3>

                    {/* Tabs */}
                    <div className="flex p-1 space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        {["referred_only", "pending_activation", "active", "expired"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                    activeTab === tab
                                        ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                                )}
                            >
                                {tab.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    {loading && <p className="text-sm text-neutral-500 text-center py-4">Loading rewards...</p>}

                    {!loading && activeTab === "referred_only" ? (
                        referredUsers.length === 0 ? (
                            <p className="text-sm text-neutral-500 text-center py-4">
                                No referrals yet. Share your code!
                            </p>
                        ) : (
                            <div className="overflow-y-auto max-h-[350px] space-y-2">
                                {referredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300">
                                                {(user.name?.[0] || user.email[0]).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium dark:text-white">{user.email}</p>
                                                <p className="text-xs text-neutral-500">Joined: {new Date(user.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={cn("px-2 py-1 rounded-md text-xs font-medium",
                                            user.hasRewarded
                                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                                        )}>
                                            {user.hasRewarded ? "Rewarded" : "Referred"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <>
                            {!loading && filteredRewards.length === 0 && (
                                <p className="text-sm text-neutral-500 text-center py-4">
                                    No {activeTab.replace("_", " ")} rewards found.
                                </p>
                            )}
                            <div className="overflow-y-auto max-h-[350px]">
                                {filteredRewards.map((reward) => (
                                    <div
                                        key={reward.id}
                                        className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium dark:text-white">15-Day Unlimited Plan</span>
                                            {getStatusBadge(reward.status)}
                                        </div>
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 mb-2">
                                            <p>Granted: {new Date(reward.grantDate).toLocaleDateString()}</p>
                                            {reward.status === "pending_activation" && (
                                                <p>
                                                    Expires on: {new Date(reward.activationDeadline).toLocaleDateString()}
                                                </p>
                                            )}
                                            {reward.status === "active" && reward.expiryDate && (
                                                <p>Expires: {new Date(reward.expiryDate).toLocaleDateString()}</p>
                                            )}
                                        </div>

                                        {/* Referee Info */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300">
                                                {(reward.referredUserName?.[0] || "U").toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                                                    From: {reward.referredUserEmail || "Unknown User"}
                                                </p>
                                            </div>
                                        </div>

                                        {reward.status === "pending_activation" && (
                                            <Button
                                                size="sm"
                                                className="w-full mt-3"
                                                onClick={() => handleActivate(reward.id)}
                                                disabled={activating === reward.id || isUnlimited}
                                            >
                                                {activating === reward.id ? "Activating..." : "Activate Now"}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default ReferAndEarn;