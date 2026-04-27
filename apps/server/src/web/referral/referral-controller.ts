import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import referralService from "./referral-service";
import logger from "../../core/logger";

class ReferralController {
    /**
     * Activate a pending referral reward
     */
    async activateReward(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const userId = req.auth().sessionClaims?.internalId;
            const { rewardId } = req.body;

            if (!rewardId) {
                return res.status(400).json({
                    success: false,
                    message: "Reward ID is required",
                });
            }

            const reward = await referralService.activateReferralPlan(userId, rewardId);

            return res.status(200).json({
                success: true,
                message: "Referral plan activated successfully",
                data: reward,
            });
        } catch (error: any) {
            logger.error(`Failed to activate referral reward: ${error.message}`);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to activate referral plan",
            });
        }
    }

    /**
     * Get all referral rewards for the authenticated user
     */
    async getRewards(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const userId = req.auth().sessionClaims?.internalId;
            const rewards = await referralService.getRewards(userId);

            return res.status(200).json({
                success: true,
                data: rewards,
            });
        } catch (error: any) {
            logger.error(`Failed to fetch referral rewards: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch referral rewards",
            });
        }
    }

    /**
     * Get referral statistics for the authenticated user
     */
    async getStats(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const userId = req.auth().sessionClaims?.internalId;
            const rewards = await referralService.getRewards(userId);

            // Calculate stats
            const totalReferrals = rewards.length;
            const successfulReferrals = rewards.filter(
                (r) => r.status !== "expired"
            ).length;
            const activeRewards = rewards.filter((r) => r.status === "active").length;
            const pendingRewards = rewards.filter(
                (r) => r.status === "pending_activation"
            ).length;

            return res.status(200).json({
                success: true,
                data: {
                    totalReferrals,
                    successfulReferrals,
                    activeRewards,
                    pendingRewards,
                },
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch referral statistics",
            });
        }
    }

    /**
     * Get all users referred by the authenticated user
     */
    async getReferredUsers(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const userId = req.auth().sessionClaims?.internalId;
            const users = await referralService.getReferredUsers(userId);

            return res.status(200).json({
                success: true,
                data: users,
            });
        } catch (error: any) {
            logger.error(`Failed to fetch referred users: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch referred users",
            });
        }
    }
}

export default new ReferralController();
