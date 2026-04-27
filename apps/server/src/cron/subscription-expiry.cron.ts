import cron from "node-cron";
import SubscriptionModel, {
    ISubscriptionModel,
} from "../web/subscription/subscription-model";
import logger from "../core/logger";
import userService from "../web/user/user-service";
import { clerkClient } from "@clerk/express";

/**
 * ------------------------------------------------------
 * 1️⃣ Get user's latest ACTIVE subscription
 * ------------------------------------------------------
 * - Finds any subscription that is:
 *   - Not deleted
 *   - End date is in the future
 * - Sorted by endDate DESC so longer plans (yearly) win
 * - Prioritizes paid plans (monthly, quarterly, yearly) over coupon_code
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

    // If no paid plan, return any active subscription (including coupon_code, referral)
    return SubscriptionModel.findOne({
        userId,
        isDeleted: false,
        endDate: { $gt: new Date() },
    }).sort({ endDate: -1 });
};

/**
 * ------------------------------------------------------
 * 2️⃣ Mark a subscription as expired
 * ------------------------------------------------------
 * - Only expires THIS subscription
 * - Does NOT downgrade the user directly
 */
const expireSubscription = async (subscription: ISubscriptionModel) => {
    logger.info("Expiring subscription", {
        subscriptionId: subscription._id,
        userId: subscription.userId,
        planType: subscription.planType,
    });

    subscription.isDeleted = true;
    await subscription.save();
};

/**
 * ------------------------------------------------------
 * 3️⃣ Update user plan in Clerk metadata
 * ------------------------------------------------------
 */
const updateUserPlanInClerk = async (
    clerkId: string,
    planType: string,
    subscriptionId?: string,
    planExpiry?: string
) => {
    const metadata: any = {
        payment: {
            planType,
            ...(subscriptionId && { subscriptionId }),
        },
    };

    // Only add planExpiry if it's provided (for unlimited plans)
    // For regular plans, explicitly set to null to remove it
    if (planExpiry) {
        metadata.payment.planExpiry = planExpiry;
    } else if (planType === 'regular') {
        metadata.payment.planExpiry = null;
    }

    await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: metadata,
    });
};

/**
 * ------------------------------------------------------
 * 4️⃣ Main Cron Job
 * ------------------------------------------------------
 * Runs every day at midnight
 */
export const scheduleSubscriptionExpiryJob = (): void => {
    /**
     * Cron expression:
     * "0 0 * * *" → Every day at 12:00 AM
     */

    // */10 * * * * * cron on every 10 second   
    // "0 0 * * *"  cron on every midnight
    cron.schedule("0 0 * * *", async () => {
        logger.info("Subscription expiry cron started");

        const now = new Date();

        try {
            /**
             * STEP 1:
             * Find all subscriptions that:
             * - Have expired
             * - Are still marked active (isDeleted: false)
             */
            const expiredSubscriptions = await SubscriptionModel.find({
                endDate: { $lt: now },
                isDeleted: false,
            });

            logger.info(
                `Found ${expiredSubscriptions.length} expired subscriptions`
            );

            /**
             * STEP 2:
             * Process each expired subscription independently
             */
            for (const subscription of expiredSubscriptions) {
                /**
                 * 2.1 Expire the current subscription
                 */
                await expireSubscription(subscription);

                /**
                 * 2.2 Check if user has ANOTHER active subscription
                 *     (example: yearly purchased while monthly was active)
                 */
                const activeSubscription = await getLatestActiveSubscription(
                    subscription.userId
                );

                /**
                 * 2.3 Fetch user to get Clerk ID
                 */
                const user = await userService.getUserById(subscription.userId);

                /**
                 * STEP 3:
                 * Decide user's plan
                 */
                if (activeSubscription) {
                    /**
                     * CASE A:
                     * User already has another active plan
                     * → Switch user to that plan
                     */
                    logger.info("Switching user to next active plan", {
                        userId: subscription.userId,
                        newPlan: activeSubscription.planType,
                    });

                    await updateUserPlanInClerk(
                        user.clerkId,
                        activeSubscription.planType,
                        activeSubscription._id.toString(),
                        activeSubscription.endDate.toISOString()
                    );
                } else {
                    /**
                     * CASE B:
                     * No active subscriptions found
                     * → Downgrade user to regular plan and remove planExpiry
                     */
                    logger.info("⬇Downgrading user to regular plan", {
                        userId: subscription.userId,
                    });

                    await updateUserPlanInClerk(user.clerkId, "regular");
                }
            }

            logger.info("Subscription expiry cron completed successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error("Subscription expiry cron failed", {
                    error: error.message,
                });
            } else {
                logger.error("Unknown error in subscription expiry cron");
            }
        }
    });
};