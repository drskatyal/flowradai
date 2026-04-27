"use client";

import React, { useEffect } from "react";
import { Dialog } from "@/components/customs/dialog";
import { Zap, Info, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "./hooks/use-subscription";
import { useStore } from "@/stores";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ExtendedUserPublicMetadata } from "../navbar";
import { useRouter } from "next/navigation";

const Subscription = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}) => {
    const user = useStore((state) => state.user);
    const { getUserPlan, planDetails, isLoading } = useSubscription();
    const { user: authUser } = useUser();

    const fetchSubscriptionPlanDetails = (id: string) => {
        try {
            getUserPlan(id);
        } catch (error) {
            console.log("error", error);
        }
    };

    const router = useRouter();

    useEffect(() => {
        if (user && !planDetails) {
            fetchSubscriptionPlanDetails(user._id);
        }
    }, [user]);

    const planType =
        (authUser?.publicMetadata as ExtendedUserPublicMetadata)?.payment
            ?.planType || "regular";
    const endDate = planDetails?.data?.endDate
        ? new Date(planDetails.data.endDate).toLocaleDateString()
        : "—";
    const credits = user?.availableCredits ?? 0;

    const isUnlimited =
        planType === "monthly" ||
        planType === "yearly" ||
        planType === "coupon_code" ||
        planType === "referral";

    const checkPlanType = () => {
        if (planType === "monthly") {
            return "Monthly Unlimited Plan";
        } else if (planType === "yearly") {
            return "Yearly Unlimited Plan";
        } else if (planType === "coupon_code") {
            return "Coupon Code Plan";
        } else if (planType === "referral") {
            return "Referral Plan";
        } else {
            return "Regular Plan";
        }
    };

    return (
        <Dialog
            open={isOpen}
            headerTitle="Subscription"
            icon={CalendarCheck2}
            headerDescription="Manage your AI assistant plan and credits."
            allowInteractionOutside={false}
            onOpenChange={() => setIsOpen(false)}
            classNames={{
                content:
                    "w-full max-w-md max-h-[80vh] flex flex-col rounded-lg shadow-xl bg-white dark:bg-neutral-900",
                headerTitle: "text-lg font-semibold flex items-center gap-2",
            }}
        >
            <div className="flex flex-col gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
                {/* Plan Header */}
                <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2 font-semibold text-base dark:text-white">
                        <Zap className="w-5 h-5" />
                        {checkPlanType()}
                    </div>
                    <span
                        className={cn(
                            "px-2 py-0.5 rounded-md text-sm font-medium",
                            planType === "regular"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        )}
                    >
                        {planType === "regular" ? "Active" : "Active"}
                    </span>
                </div>

                {/* Plan Details */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300">
                        <span>Current Available Credits</span>
                        <span>{isUnlimited ? "Unlimited" : credits}</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300">
                        <span>Remaining Credits</span>
                        <span>{credits}</span>
                    </div>
                    {isUnlimited && (
                        <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300">
                            <span>Plan Expire</span>
                            <span>{endDate}</span>
                        </div>
                    )}
                </div>

                {/* Unlimited Plan Note */}
                {isUnlimited && (
                    <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-xs rounded-md text-blue-800 dark:text-blue-100">
                        <Info className="w-4 h-4 mt-0.5" />
                        <span>
                            {planType === "coupon_code"
                                ? "Coupon code plan is active. Remaining credits will not be deducted."
                                : planType === "referral"
                                    ? "Referral plan is active. Remaining credits will not be deducted."
                                    : "Monthly/Yearly (unlimited) plan is active. Remaining credits will not be deducted."}
                        </span>
                    </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                    <Button
                        size="sm"
                        className="w-full"
                        onClick={() => router.push("/pricing")}
                    >
                        {planType === "regular" ? "Upgrade Plan" : "Manage Plan"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default Subscription;