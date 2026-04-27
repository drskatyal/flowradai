import logger from "../../core/logger";
import CouponCodeModel, { ICouponCode } from "./coupon-code-model";
import UserModel from "../user/user-model";
import SubscriptionModel from "../subscription/subscription-model";
import { clerkClient } from "@clerk/express";
import mongoose from "mongoose";
import referralService from "../referral/referral-service";

class CouponCodeService {
    async createCouponCode(userId: string, payload: Partial<ICouponCode>) {
        try {
            // Ensure code is uppercase
            const code = payload.code?.toUpperCase();

            // Check if code already exists
            const existingCode = await CouponCodeModel.findOne({
                code,
                isDeleted: false,
            });

            if (existingCode) {
                throw new Error("Coupon code already exists");
            }

            const couponCode = await CouponCodeModel.create({
                ...payload,
                code,
                createdBy: userId,
            });
            return couponCode;
        } catch (error) {
            logger.error("Error creating coupon code", { error });
            throw error;
        }
    }

    async getCouponCodes(
        userId: string,
        limit = 10,
        skip = 0,
        searchQuery?: string
    ) {
        try {
            // Verify user is admin
            const user = await UserModel.findById(userId);
            if (!user || user.role !== "admin") {
                throw new Error("Unauthorized: Only admins can view coupon codes");
            }

            const query: {
                isDeleted: boolean;
                $or?: Array<{ name?: { $regex: string; $options: string }; code?: { $regex: string; $options: string } }>;
            } = {
                isDeleted: false,
            };

            // Search by name or code
            if (searchQuery) {
                query.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { code: { $regex: searchQuery.toUpperCase(), $options: "i" } },
                ];
            }

            const couponCodes = await CouponCodeModel.find(query)
                .populate("createdBy", "firstName lastName email")
                .populate("allowedUsers", "firstName lastName email")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const count = await CouponCodeModel.countDocuments(query);

            return { couponCodes, count };
        } catch (error) {
            logger.error("Error getting coupon codes", { error });
            throw error;
        }
    }

    async getCouponCodeById(id: string, userId: string) {
        try {
            // Verify user is admin
            const user = await UserModel.findById(userId);
            if (!user || user.role !== "admin") {
                throw new Error("Unauthorized: Only admins can view coupon codes");
            }

            const couponCode = await CouponCodeModel.findOne({
                _id: id,
                isDeleted: false,
            })
                .populate("createdBy", "firstName lastName email")
                .populate("allowedUsers", "firstName lastName email");

            return couponCode;
        } catch (error) {
            logger.error("Error getting coupon code by id", { error });
            throw error;
        }
    }

    async updateCouponCode(
        id: string,
        userId: string,
        payload: Partial<ICouponCode>
    ) {
        try {
            // Verify user is admin
            const user = await UserModel.findById(userId);
            if (!user || user.role !== "admin") {
                throw new Error("Unauthorized: Only admins can update coupon codes");
            }

            const couponCode = await CouponCodeModel.findOne({
                _id: id,
                isDeleted: false,
            });

            if (!couponCode) {
                throw new Error("Coupon code not found");
            }

            // Code and days cannot be changed after creation
            if (payload.code && payload.code !== couponCode.code) {
                throw new Error("Coupon code cannot be changed after creation");
            }
            if (payload.days && payload.days !== couponCode.days) {
                throw new Error("Days cannot be changed after creation");
            }

            // Update allowedUsers if provided
            if (payload.allowedUsers !== undefined) {
                // Convert all user IDs to ObjectIds
                payload.allowedUsers = payload.allowedUsers.map((id: any) => {
                    if (id instanceof mongoose.Types.ObjectId) {
                        return id;
                    }
                    return new mongoose.Types.ObjectId(id);
                }) as unknown as typeof payload.allowedUsers;

                logger.info("Updating allowed users", {
                    newCount: payload.allowedUsers.length,
                });
            }

            // Remove code and days from payload to prevent accidental updates
            delete payload.code;
            delete payload.days;

            Object.assign(couponCode, payload);
            await couponCode.save();
            return couponCode;
        } catch (error) {
            logger.error("Error updating coupon code", { error });
            throw error;
        }
    }

    async deleteCouponCode(id: string, userId: string) {
        try {
            // Verify user is admin
            const user = await UserModel.findById(userId);
            if (!user || user.role !== "admin") {
                throw new Error("Unauthorized: Only admins can delete coupon codes");
            }

            const couponCode = await CouponCodeModel.findOne({
                _id: id,
                isDeleted: false,
            });

            if (!couponCode) {
                throw new Error("Coupon code not found");
            }

            // Soft delete
            if (typeof couponCode.delete === "function") {
                await couponCode.delete();
            } else {
                couponCode.isDeleted = true;
                await couponCode.save();
            }

            return { message: "Coupon code deleted successfully" };
        } catch (error) {
            logger.error("Error deleting coupon code", { error });
            throw error;
        }
    }

    async toggleCouponCodeStatus(id: string, userId: string) {
        try {
            // Verify user is admin
            const user = await UserModel.findById(userId);
            if (!user || user.role !== "admin") {
                throw new Error(
                    "Unauthorized: Only admins can toggle coupon code status"
                );
            }

            const couponCode = await CouponCodeModel.findOne({
                _id: id,
                isDeleted: false,
            });

            if (!couponCode) {
                throw new Error("Coupon code not found");
            }

            couponCode.isActive = !couponCode.isActive;
            await couponCode.save();

            return couponCode;
        } catch (error) {
            logger.error("Error toggling coupon code status", { error });
            throw error;
        }
    }

    async generateCouponCode(): Promise<string> {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        let isUnique = false;

        // Keep generating until we find a unique code
        while (!isUnique) {
            code = "";
            for (let i = 0; i < 8; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Check if this code already exists
            const existingCode = await CouponCodeModel.findOne({
                code,
                isDeleted: false,
            });

            if (!existingCode) {
                isUnique = true;
            }
        }

        return code;
    }

    async applyCouponCode(userId: string, code: string) {
        try {
            // Find the coupon code
            const couponCode = await CouponCodeModel.findOne({
                code: code.toUpperCase(),
                isDeleted: false,
                isActive: true,
            });

            if (!couponCode) {
                throw new Error("Invalid or inactive coupon code");
            }

            // Check if user is in allowed users list (if allowToAllUsers is false and list is not empty)
            if (!couponCode.allowToAllUsers && couponCode.allowedUsers.length > 0) {
                const isAllowed = couponCode.allowedUsers.some(
                    (allowedUserId) => allowedUserId.toString() === userId
                );

                if (!isAllowed) {
                    throw new Error("You are not authorized to use this coupon code");
                }
            }

            // Check if user has already used this coupon code
            const existingSubscription = await SubscriptionModel.findOne({
                userId,
                planType: "coupon_code",
                couponCode: code.toUpperCase(),
                isDeleted: false,
            });

            logger.info("Checking for duplicate coupon code", {
                userId,
                code: code.toUpperCase(),
                existingSubscription: existingSubscription ? existingSubscription._id : null,
            });

            if (existingSubscription) {
                throw new Error("You have already used this coupon code");
            }

            // Check if user has an active referral plan
            const hasActiveReferral = await referralService.hasActiveReferralPlan(userId);
            if (hasActiveReferral) {
                throw new Error("Cannot apply coupon code while an active referral plan is running");
            }

            // Check if user has an active subscription
            const activeSubscription = await SubscriptionModel.findOne({
                userId,
                isDeleted: false,
                endDate: { $gte: new Date() },
            }).sort({ endDate: -1 });

            // Calculate start and end dates
            const now = new Date();
            let startDate = now;

            // If there's an active subscription, start after it ends
            if (activeSubscription && now <= new Date(activeSubscription.endDate)) {
                startDate = new Date(activeSubscription.endDate);
            }

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + couponCode.days);

            // Create new subscription
            const subscription = await SubscriptionModel.create({
                userId,
                planType: "coupon_code",
                couponCode: code.toUpperCase(),
                startDate,
                endDate,
                isDeleted: false,
            });

            // Get user and update Clerk metadata
            const user = await UserModel.findById(userId);
            if (user) {
                await clerkClient.users.updateUserMetadata(user.clerkId, {
                    publicMetadata: {
                        payment: {
                            planType: "coupon_code",
                            planExpiry: endDate.toISOString(),
                        },
                    },
                });
            }

            // Add user to appliedUsers list
            if (!couponCode.appliedUsers.some(id => id.toString() === userId)) {
                couponCode.appliedUsers.push(new mongoose.Types.ObjectId(userId));
                await couponCode.save();
            }

            logger.info("Coupon code applied successfully", {
                userId,
                code: code.toUpperCase(),
                days: couponCode.days,
                startDate,
                endDate,
            });

            return {
                success: true,
                subscription,
                message: `Coupon code applied successfully! ${couponCode.days} days added to your subscription.`,
            };
        } catch (error) {
            logger.error("Error applying coupon code", { error, userId, code });
            throw error;
        }
    }



    async getUserCouponSubscriptions(userId: string) {
        try {
            const subscriptions = await SubscriptionModel.find({
                userId,
                planType: "coupon_code",
                isDeleted: false,
            }).sort({ createdAt: -1 });

            return subscriptions;
        } catch (error) {
            logger.error("Error getting user coupon subscriptions", {
                error,
                userId,
            });
            throw error;
        }
    }

    async getCouponUsageDetails(couponCodeId: string, userId: string) {
        try {
            // Verify user is admin
            const user = await UserModel.findById(userId);
            if (!user || user.role !== "admin") {
                throw new Error("Unauthorized: Only admins can view coupon usage details");
            }

            // Get the coupon code with populated applied users
            const couponCode = await CouponCodeModel.findOne({
                _id: couponCodeId,
                isDeleted: false,
            }).populate("appliedUsers", "firstName lastName email clerkId");

            if (!couponCode) {
                throw new Error("Coupon code not found");
            }

            // If allowToAllUsers is true, only return applied users
            if (couponCode.allowToAllUsers) {
                const appliedUsers = (couponCode.appliedUsers as any[]).map((user: any) => ({
                    _id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    clerkId: user.clerkId,
                    hasUsed: true,
                }));

                return {
                    couponCode: {
                        code: couponCode.code,
                        name: couponCode.name,
                        days: couponCode.days,
                        isActive: couponCode.isActive,
                        allowToAllUsers: couponCode.allowToAllUsers,
                    },
                    stats: {
                        totalAllowed: 0, // Not applicable for allUsersAllow
                        totalApplied: appliedUsers.length,
                        totalPending: 0, // Not applicable for allUsersAllow
                    },
                    users: {
                        all: [],
                        applied: appliedUsers,
                        pending: [],
                    },
                };
            }

            // For restricted coupons (allowToAllUsers is false)
            // Get all allowed users
            const allAllowedUsers = await UserModel.find({
                _id: { $in: couponCode.allowedUsers },
            }).select("firstName lastName email clerkId");

            // Create a set of applied user IDs for quick lookup
            const appliedUserIds = new Set(
                couponCode.appliedUsers.map((u: any) => u._id.toString())
            );

            // Categorize users
            const allUsers = allAllowedUsers.map((user: any) => ({
                _id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                clerkId: user.clerkId,
                hasUsed: appliedUserIds.has(user._id.toString()),
            }));

            const appliedUsers = allUsers.filter((u) => u.hasUsed);
            const pendingUsers = allUsers.filter((u) => !u.hasUsed);

            return {
                couponCode: {
                    code: couponCode.code,
                    name: couponCode.name,
                    days: couponCode.days,
                    isActive: couponCode.isActive,
                    allowToAllUsers: couponCode.allowToAllUsers,
                },
                stats: {
                    totalAllowed: allUsers.length,
                    totalApplied: appliedUsers.length,
                    totalPending: pendingUsers.length,
                },
                users: {
                    all: allUsers,
                    applied: appliedUsers,
                    pending: pendingUsers,
                },
            };
        } catch (error) {
            logger.error("Error getting coupon usage details", { error, couponCodeId });
            throw error;
        }
    }
}

export default new CouponCodeService();