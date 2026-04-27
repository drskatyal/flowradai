import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import baseSchema, { IBaseModel } from "../../models/base-model";

export const CouponCodeValidationSchema = z.object({
    code: z
        .string()
        .min(8, "Code must be exactly 8 characters")
        .max(8, "Code must be exactly 8 characters")
        .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers")
        .transform((val) => val.toUpperCase()),
    name: z.string().optional(),
    days: z.number().int().positive("Days must be a positive number"),
    allowedUsers: z.array(z.any()).optional().default([]),
    allowToAllUsers: z.boolean().optional().default(false),
    isActive: z.boolean().optional(),
});

export const CouponCodeUpdateValidationSchema = z.object({
    code: z
        .string()
        .min(8, "Code must be exactly 8 characters")
        .max(8, "Code must be exactly 8 characters")
        .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers")
        .transform((val) => val.toUpperCase())
        .optional(),
    name: z.string().optional(),
    days: z.number().int().positive("Days must be a positive number").optional(),
    allowedUsers: z.array(z.any()).optional().default([]),
    allowToAllUsers: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export interface ICouponCode extends IBaseModel {
    code: string;
    name?: string;
    days: number;
    allowedUsers: mongoose.Types.ObjectId[]; // User references
    appliedUsers: mongoose.Types.ObjectId[]; // Users who have applied this coupon
    allowToAllUsers: boolean; // If true, coupon is valid for all users
    isActive: boolean;
    createdBy: string;
}

const couponCodeSchema = new Schema<ICouponCode>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        name: {
            type: String,
            required: false,
        },
        days: {
            type: Number,
            required: true,
            min: 1,
        },
        allowedUsers: {
            type: [{ type: Schema.Types.ObjectId, ref: "UserModel" }],
            required: false,
            default: [],
        },
        appliedUsers: {
            type: [{ type: Schema.Types.ObjectId, ref: "UserModel" }],
            required: false,
            default: [],
        },
        allowToAllUsers: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: String,
            required: true,
            ref: "UserModel",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: "coupon_codes",
        timestamps: true,
    }
);

couponCodeSchema.add(baseSchema.statics);

const CouponCodeModel = mongoose.model<ICouponCode>(
    "CouponCodeModel",
    couponCodeSchema
);

export default CouponCodeModel;