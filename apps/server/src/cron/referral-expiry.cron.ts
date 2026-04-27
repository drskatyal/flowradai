import cron from "node-cron";
import ReferralRewardModel from "../web/referral/referral-reward.model";
import SubscriptionModel from "../web/subscription/subscription-model";
import logger from "../core/logger";
import userService from "../web/user/user-service";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * 1️Get user's latest ACTIVE subscription
 * This handles fallback: if referral plan ends, do they have a paid plan?
 * Prioritizes paid plans (monthly, quarterly, yearly) over coupon_code
 */
const getLatestActiveSubscription = async (userId: string) => {
    // First, try to find a paid unlimited plan
    const paidSubscription = await SubscriptionModel.findOne({
        userId,
        isDeleted: false,
        endDate: { $gt: new Date() },
        planType: { $in: ["monthly", "quarterly", "yearly"] },
    }).sort({ endDate: -1 });

    if (paidSubscription) {
        return paidSubscription;
    }

    // If no paid plan, return any active subscription (including coupon_code)
    return SubscriptionModel.findOne({
        userId,
        isDeleted: false,
        endDate: { $gt: new Date() },
    }).sort({ endDate: -1 });
};

/**
 * 2️Update user plan in Clerk metadata
 */
const updateUserPlanInClerk = async (
    clerkId: string,
    planType: string,
    planExpiry?: string
) => {
    const clerk = await clerkClient();

    const metadata: any = {
        payment: {
            planType: planType ?? 'regular',
        },
    };

    // Only add planExpiry if it's provided (for unlimited plans)
    // For regular plans, explicitly set to null to remove it
    if (planExpiry) {
        metadata.payment.planExpiry = planExpiry;
    } else if (planType === 'regular') {
        metadata.payment.planExpiry = null;
    }

    await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: metadata,
    });
};

/**
 * 3️Main Cron Job
 * Runs every day at midnight to check for expired referral plans
 */
export const scheduleReferralExpiryJob = (): void => {
    // Run every day at 12:05 AM (offset from subscription cron to avoid conflicts)
    // 5 0 * * * on midnight 12:05 AM
    // */10 * * * * * on every 10 second
    cron.schedule("5 0 * * *", async () => {
        logger.info("[CRON] Referral expiry job started");

        const now = new Date();

        try {
            // Find ACTIVE referral rewards that have passed their expiry date
            const expiredRewards = await ReferralRewardModel.find({
                status: "active",
                expiryDate: { $lt: now },
            });

            logger.info(`[CRON] Found ${expiredRewards.length} expired referral plans`);

            for (const reward of expiredRewards) {
                try {
                    // 1. Mark reward as completed (finished duration)
                    reward.status = "completed";
                    await reward.save();
                    logger.info(`[CRON] Marked referral reward ${reward._id} as completed for user ${reward.referrerId}`);

                    // 2. Determine next plan for user
                    const userId = reward.referrerId;
                    const user = await userService.getUserById(userId);

                    if (!user) {
                        logger.warn(`[CRON] User ${userId} not found for reward ${reward._id}`);
                        continue;
                    }

                    // Check for active paid subscription to fallback to
                    const activeSubscription = await getLatestActiveSubscription(userId);

                    if (activeSubscription) {
                        logger.info(`[CRON] Falling back user ${userId} to active subscription ${activeSubscription.planType}`);
                        await updateUserPlanInClerk(
                            user.clerkId,
                            activeSubscription.planType,
                            activeSubscription.endDate.toISOString()
                        );
                    } else {
                        logger.info(`[CRON] Downgrading user ${userId} to regular plan`);
                        await updateUserPlanInClerk(user.clerkId, "regular");
                    }

                } catch (err) {
                    logger.error(`[CRON] Error processing reward ${reward._id}`, err);
                }
            }

            logger.info("[CRON] Referral expiry job completed");
        } catch (error: any) {
            logger.error("[CRON] Referral expiry job failed", error);
        }
    });
};