"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/customs/dialog";
import { TicketPercent, Check, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCouponCode } from "./hooks/use-coupon-code";
import { useUser } from "@clerk/nextjs";

const CouponCode = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) => {
    const [code, setCode] = useState("");
    const { applyCoupon, getUserCoupons, applying, subscriptions, loading } =
        useCouponCode();
    const { toast } = useToast();
    const { user: authUser } = useUser();

    useEffect(() => {
        if (isOpen) {
            getUserCoupons();
        }
    }, [isOpen]);

    const handleApply = async () => {
        if (!code.trim()) {
            toast({
                title: "Error",
                description: "Please enter a coupon code",
                variant: "destructive",
            });
            return;
        }

        // Check if this coupon code has already been applied
        const alreadyApplied = subscriptions.some(
            (sub: any) => sub.couponCode?.toUpperCase() === code.toUpperCase()
        );

        if (alreadyApplied) {
            toast({
                title: "Already Applied",
                description: "You have already used this coupon code",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await applyCoupon(code.toUpperCase());
            toast({
                title: "Success",
                description: result.message || "Coupon code applied successfully!",
                variant: "default",
            });
            setCode("");
            getUserCoupons();

            // Reload Clerk user data to update navbar immediately
            if (authUser) {
                await authUser.reload();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to apply coupon code",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (startDate: string, endDate: string) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return {
                label: "Upcoming",
                className:
                    "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
            };
        } else if (now >= start && now <= end) {
            return {
                label: "Active",
                className:
                    "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
            };
        } else {
            return {
                label: "Expired",
                className:
                    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
            };
        }
    };

    const getRemainingDays = (endDate: string) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(diffDays, 0); // Never return negative days
    };

    // Get list of already used coupon codes
    const usedCouponCodes = subscriptions.map((sub: any) =>
        sub.couponCode?.toUpperCase()
    ).filter(Boolean);

    return (
        <Dialog
            open={isOpen}
            headerTitle="Apply Coupon Code"
            icon={TicketPercent}
            headerDescription="Enter your coupon code to activate special benefits"
            allowInteractionOutside={false}
            closeOnOutsideClick={true}
            onOpenChange={() => setIsOpen(false)}
            classNames={{
                content:
                    "w-full max-sm:p-3 max-w-2xl overflow-y-auto flex flex-col rounded-lg shadow-xl bg-white dark:bg-neutral-900",
                headerTitle: "text-lg font-semibold flex items-center gap-2",
            }}
        >
            <div className="flex flex-col gap-4 p-4">
                {/* Apply Coupon Section */}
                <div className="p-4 border rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 dark:text-white">
                        Enter Coupon Code
                    </h3>
                    <div className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Enter 8-character code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={8}
                            className="flex-1 uppercase font-mono"
                            disabled={applying}
                        />
                        <Button
                            onClick={handleApply}
                            disabled={applying || !code.trim()}
                            className="shrink-0"
                        >
                            {applying ? (
                                "Applying..."
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Apply
                                </>
                            )}
                        </Button>
                    </div>
                    {code.length === 8 && usedCouponCodes.includes(code.toUpperCase()) && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                            ⚠️ You have already used this coupon code
                        </div>
                    )}
                </div>

                {/* Active Coupons List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold dark:text-white">
                        Your Coupon Subscriptions
                    </h3>

                    {loading && (
                        <p className="text-sm text-neutral-500 text-center py-4">
                            Loading...
                        </p>
                    )}

                    {!loading && subscriptions.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-4">
                            No coupon codes applied yet. Enter a code above to get started!
                        </p>
                    )}

                    {!loading && subscriptions.length > 0 && (
                        <div className="overflow-y-auto max-h-[400px] space-y-2">
                            {subscriptions.map((subscription: any) => {
                                const status = getStatusBadge(
                                    subscription.startDate,
                                    subscription.endDate
                                );
                                const remainingDays = getRemainingDays(subscription.endDate);
                                const isActive = status.label === "Active";

                                return (
                                    <div
                                        key={subscription._id}
                                        className={cn(
                                            "p-4 border rounded-lg transition-all",
                                            isActive
                                                ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                                : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <TicketPercent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <code className="text-sm font-bold font-mono dark:text-white">
                                                    {subscription.couponCode}
                                                </code>
                                            </div>
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-md text-xs font-medium",
                                                    status.className
                                                )}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <Calendar className="w-4 h-4" />
                                                <div>
                                                    <p className="font-medium">Start Date</p>
                                                    <p>
                                                        {new Date(
                                                            subscription.startDate
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                                <Calendar className="w-4 h-4" />
                                                <div>
                                                    <p className="font-medium">End Date</p>
                                                    <p>
                                                        {new Date(
                                                            subscription.endDate
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-medium">
                                                        {remainingDays}{" "}
                                                        {remainingDays === 1 ? "day" : "days"} remaining
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

export default CouponCode;