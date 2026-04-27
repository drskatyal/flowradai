import logger from "../../core/logger";
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import couponCodeService from "./coupon-code-service";
import { CouponCodeValidationSchema, CouponCodeUpdateValidationSchema, ICouponCode } from "./coupon-code-model";
import mongoose from "mongoose";

class CouponCodeController {
    async createOrUpdateCouponCode(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id, ...payload } = req.body;

            // Use different validation schema for create vs update
            const validationSchema = id ? CouponCodeUpdateValidationSchema : CouponCodeValidationSchema;
            const validation = validationSchema.safeParse(payload);

            if (!validation.success) {
                logger.error("Coupon code validation failed", {
                    errors: validation.error.errors,
                    payload,
                    isUpdate: !!id,
                });
                return res.status(400).json({
                    error: "Validation Error",
                    details: validation.error.errors,
                });
            }

            // Convert allowedUsers to ObjectIds if they are strings
            const couponCodeData: Partial<ICouponCode> = {
                ...validation.data,
                allowedUsers: validation.data.allowedUsers?.map((userId: any) => {
                    // If it's already an ObjectId, return as is
                    if (userId instanceof mongoose.Types.ObjectId) {
                        return userId;
                    }
                    // If it's a string, convert to ObjectId
                    return new mongoose.Types.ObjectId(userId);
                }),
            };

            if (id) {
                // Update existing coupon code
                logger.info("Attempting to update coupon code", {
                    id,
                    userId,
                    allowedUsersCount: couponCodeData.allowedUsers?.length || 0,
                });
                const updatedCouponCode = await couponCodeService.updateCouponCode(
                    id,
                    userId,
                    couponCodeData
                );
                return res.status(200).json(updatedCouponCode);
            } else {
                // Create new coupon code
                logger.info("Attempting to create coupon code", {
                    userId,
                    code: couponCodeData.code,
                    allowedUsersCount: couponCodeData.allowedUsers?.length || 0,
                });
                const newCouponCode = await couponCodeService.createCouponCode(
                    userId,
                    couponCodeData
                );
                return res.status(201).json(newCouponCode);
            }
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error creating/updating coupon code", {
                error: err.message,
                stack: err.stack,
                body: req.body,
            });
            return res.status(500).json({ error: err.message });
        }
    }

    async getCouponCodes(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { limit = 10, skip = 0, search } = req.query;

            const result = await couponCodeService.getCouponCodes(
                userId,
                Number(limit),
                Number(skip),
                search as string
            );
            return res.status(200).json(result);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error getting coupon codes", { error });
            return res.status(500).json({ error: err.message });
        }
    }

    async getCouponCodeById(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.query;

            if (!id || typeof id !== "string") {
                return res.status(400).json({ error: "Coupon code ID is required" });
            }

            const couponCode = await couponCodeService.getCouponCodeById(id, userId);

            if (!couponCode) {
                return res.status(404).json({ error: "Coupon code not found" });
            }

            return res.status(200).json(couponCode);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error getting coupon code by id", { error });
            return res.status(500).json({ error: err.message });
        }
    }

    async deleteCouponCode(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.query;

            if (!id || typeof id !== "string") {
                return res.status(400).json({ error: "Coupon code ID is required" });
            }

            const result = await couponCodeService.deleteCouponCode(id, userId);
            return res.status(200).json(result);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error deleting coupon code", { error });
            return res.status(500).json({ error: err.message });
        }
    }

    async toggleCouponCodeStatus(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.body;

            if (!id || typeof id !== "string") {
                return res.status(400).json({ error: "Coupon code ID is required" });
            }

            const result = await couponCodeService.toggleCouponCodeStatus(id, userId);
            return res.status(200).json(result);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error toggling coupon code status", { error });
            return res.status(500).json({ error: err.message });
        }
    }

    async generateCouponCode(req: AuthenticatedRequest, res: Response) {
        try {
            const code = await couponCodeService.generateCouponCode();
            return res.status(200).json({ code });
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error generating coupon code", { error });
            return res.status(500).json({ error: err.message });
        }
    }

    async applyCouponCode(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { code } = req.body;

            if (!code || typeof code !== "string") {
                return res.status(400).json({ error: "Coupon code is required" });
            }

            const result = await couponCodeService.applyCouponCode(userId, code);
            return res.status(200).json(result);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error applying coupon code", { error });
            return res.status(400).json({ error: err.message });
        }
    }

    async getUserCouponSubscriptions(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;

            if (!userId) {
                return res.status(400).json({ error: "User ID not found" });
            }

            const subscriptions = await couponCodeService.getUserCouponSubscriptions(
                userId
            );
            return res.status(200).json(subscriptions);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error getting user coupon subscriptions", {
                error: err.message,
                stack: err.stack
            });
            return res.status(500).json({ error: err.message });
        }
    }

    async getCouponUsageDetails(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.query;

            if (!id || typeof id !== "string") {
                return res.status(400).json({ error: "Coupon code ID is required" });
            }

            const details = await couponCodeService.getCouponUsageDetails(id, userId);
            return res.status(200).json(details);
        } catch (error: unknown) {
            const err = error as Error;
            logger.error("Error getting coupon usage details", { error });
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new CouponCodeController();