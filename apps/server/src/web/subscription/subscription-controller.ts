import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import subscriptionService from "./subscription-service";
import logger from "../../core/logger";
class SubscriptionController {
    async getUserSubscription(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const { id } = req.params;

            const subscription = await subscriptionService.getSubscriptionById(id);

            if (!subscription) {
                logger.warn(`No subscription found for userId: ${id}`);
                return res.status(200).json({
                    success: false,
                    message: "Subscription not found",
                });
            }

            logger.info(`Subscription fetched successfully for userId: ${id}`);

            return res.status(200).json({
                success: true,
                data: subscription,
            });
        } catch (error: any) {
            logger.error(`Error in getUserSubscription for userId: ${req.params.id}`, {
                message: error.message,
                stack: error.stack,
            });

            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }
}

export default new SubscriptionController();