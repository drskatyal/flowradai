import logger from "../../core/logger";
import UserModel from "../user/user-model";
import ReferralRewardModel from "./referral-reward.model";
import creditService from "../credit/credit-service";
import subscriptionService from "../subscription/subscription-service";
import { clerkClient } from "@clerk/express";

const REFERRAL_CONFIG = {
    SIGNUP_CREDITS: 50,
    PLAN_ACTIVATION_WINDOW_DAYS: 45,
    PLAN_DURATION_DAYS: 15,
};

class ReferralService {
    /**
     * Processes the signup reward for a new user referred by a code.
     * - Finds referrer by code.
     * - Grants signup credits to the new user.
     * - Links the new user to the referrer.
     */
    async processSignupReward(newUserId: string, referralCode: string) {
        try {
            logger.info(`[REFERRAL] Processing signup reward for user ${newUserId} with code ${referralCode}`);

            if (!referralCode) {
                logger.warn(`[REFERRAL] No referral code provided`);
                return;
            }

            const referrer = await UserModel.findOne({ referralCode });
            if (!referrer) {
                logger.warn(`[REFERRAL] Invalid referral code used: ${referralCode}`);
                return;
            }
            logger.info(`[REFERRAL] Found referrer: ${referrer._id}`);

            const newUser = await UserModel.findById(newUserId);
            if (!newUser) {
                throw new Error("New user not found");
            }

            if (newUser.referredBy) {
                logger.warn(`[REFERRAL] User ${newUserId} already referred by ${newUser.referredBy}`);
                return;
            }

            // 1. Link Users
            newUser.referredBy = referrer._id.toString();
            await newUser.save();
            logger.info(`[REFERRAL] Linked user ${newUserId} to referrer ${referrer._id}`);

            // 2. Grant Credits to New User
            await creditService.createCredit({
                userId: newUserId,
                creditAmount: REFERRAL_CONFIG.SIGNUP_CREDITS,
                reason: "referral_signup",
                referredUserId: referrer._id.toString(),
            });
            logger.info(`[REFERRAL] Granted ${REFERRAL_CONFIG.SIGNUP_CREDITS} credits to user ${newUserId}`);

            logger.info(`[REFERRAL] Successfully processed signup reward for user ${newUserId} referred by ${referrer._id}`);
        } catch (error) {
            logger.error("[REFERRAL] Error processing signup reward", { error, newUserId, referralCode });
        }
    }

    /**
     * Triggers when a user creates their first report.
     * - Checks if user was referred.
     * - Creates a pending referral reward for the referrer.
     */
    async processFirstReportReward(userId: string) {
        try {
            logger.info(`[REFERRAL] Processing first report reward for user ${userId}`);

            const user = await UserModel.findById(userId);
            if (!user) {
                logger.warn(`[REFERRAL] User ${userId} not found`);
                return;
            }

            if (!user.referredBy) {
                logger.info(`[REFERRAL] User ${userId} was not referred by anyone`);
                return;
            }

            if (user.isReferralRewardClaimed) {
                logger.info(`[REFERRAL] User ${userId} has already claimed referral reward`);
                return;
            }

            const grantDate = new Date();
            const activationDeadline = new Date(grantDate);
            activationDeadline.setDate(activationDeadline.getDate() + REFERRAL_CONFIG.PLAN_ACTIVATION_WINDOW_DAYS);

            // Create Reward
            await ReferralRewardModel.create({
                referrerId: user.referredBy,
                referredUserId: userId,
                status: "pending_activation",
                grantDate,
                activationDeadline,
            });
            logger.info(`[REFERRAL] Created referral reward for referrer ${user.referredBy}`);

            // Mark user as having triggered the reward
            user.isReferralRewardClaimed = true;
            await user.save();
            logger.info(`[REFERRAL] Marked user ${userId} as having claimed reward`);

            logger.info(`[REFERRAL] Successfully created referral reward for referrer ${user.referredBy} triggered by ${userId}`);
        } catch (error) {
            logger.error("[REFERRAL] Error processing first report reward", { error, userId });
        }
    }

    /**
     * Activates a pending referral reward.
     * - Validates activation window.
     * - Ensures no other unlimited plan is active.
     */
    async activateReferralPlan(userId: string, rewardId: string) {
        try {
            const reward = await ReferralRewardModel.findOne({ _id: rewardId, referrerId: userId });
            if (!reward) {
                throw new Error("Reward not found");
            }

            if (reward.status !== "pending_activation") {
                throw new Error("Reward is not pending activation");
            }

            if (new Date() > reward.activationDeadline) {
                reward.status = "expired";
                await reward.save();
                throw new Error("Reward has expired");
            }

            // Check for existing active main subscription
            const hasActiveSubscription = await subscriptionService.checkActiveSubscription(userId);
            if (hasActiveSubscription) {
                // We need to clarify "checkActiveSubscription". 
                // If it includes Referral Rewards, we need to be careful not to check 'itself' (though it's not active yet).
                // The requirement says: "If the user already has an active unlimited plan... they can activate... only after current plan expires."
                // checkActiveSubscription returns true if ANY plan is active.
                throw new Error("Cannot activate referral plan while another plan is active.");
            }

            // Activate
            const now = new Date();
            const expiryDate = new Date(now);
            expiryDate.setDate(expiryDate.getDate() + REFERRAL_CONFIG.PLAN_DURATION_DAYS);

            reward.status = "active";
            reward.activationDate = now;
            reward.expiryDate = expiryDate;
            await reward.save();

            const user = await UserModel.findById({ _id: userId });
            if (!user) {
                throw new Error("User not found");
            }

            await clerkClient.users.updateUserMetadata(user.clerkId, {
                publicMetadata: {
                    payment: {
                        planType: "referral",
                        planExpiry: expiryDate.toISOString()
                    },
                },
            });

            logger.info(`Activated referral plan for ${userId} (Reward: ${rewardId})`);
            return reward;
        } catch (error) {
            logger.error("Error activating referral plan", { error, userId, rewardId });
            throw error;
        }
    }

    /**
     * Checks if a user has an active referral plan running.
     */
    async hasActiveReferralPlan(userId: string): Promise<boolean> {
        const activeReward = await ReferralRewardModel.findOne({
            referrerId: userId,
            status: "active",
            activationDate: { $lte: new Date() },
            expiryDate: { $gte: new Date() }
        });
        return !!activeReward;
    }

    /**
     * Get all rewards for a user
     */
    async getRewards(userId: string) {
        const rewards = await ReferralRewardModel.find({ referrerId: userId }).sort({ createdAt: -1 }).lean();

        if (!rewards.length) return [];

        // Collect all referredUserIds
        const userIds = rewards.map(r => r.referredUserId);

        // Fetch users
        const users = await UserModel.find({ _id: { $in: userIds } }).select("email firstName lastName");

        // Map users for quick lookup
        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        // Attach user details to rewards
        return rewards.map(reward => ({
            ...reward,
            id: reward._id, // Ensure ID is available as string if needed by frontend
            referredUserEmail: userMap.get(reward.referredUserId)?.email || "Unknown User",
            referredUserName: `${userMap.get(reward.referredUserId)?.firstName || ""} ${userMap.get(reward.referredUserId)?.lastName || ""}`.trim()
        }));
    }
    /**
     * Get all users referred by a referrer
     */
    async getReferredUsers(referrerId: string) {
        try {
            const users = await UserModel.find({ referredBy: referrerId }).select("email createdAt firstName lastName isReferralRewardClaimed").sort({ createdAt: -1 });

            return users.map(user => ({
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName || ""}`.trim(),
                date: user.createdAt,
                hasRewarded: user.isReferralRewardClaimed || false
            }));
        } catch (error) {
            logger.error(`[REFERRAL] Error fetching referred users for ${referrerId}`, error);
            throw error;
        }
    }
}

export default new ReferralService();
