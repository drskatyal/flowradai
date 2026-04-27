import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IReferralRewardModel extends IBaseModel {
    referrerId: string;
    referredUserId: string;
    status: "pending_activation" | "active" | "expired" | "completed";
    grantDate: Date;
    activationDeadline: Date;
    activationDate?: Date;
    expiryDate?: Date;
}

const referralRewardSchema = new Schema<IReferralRewardModel>(
    {
        referrerId: {
            type: String,
            required: true,
            description: "User ID of the referrer",
        },
        referredUserId: {
            type: String,
            required: true,
            unique: true, // One reward per referred user
            description: "User ID of the new user who was referred",
        },
        status: {
            type: String,
            enum: ["pending_activation", "active", "expired", "completed"],
            default: "pending_activation",
            required: true,
        },
        grantDate: {
            type: Date,
            default: Date.now,
            required: true,
            description: "Date when the reward was earned (first report created)",
        },
        activationDeadline: {
            type: Date,
            required: true,
            description: "Date by which the plan must be activated (grantDate + 45 days)",
        },
        activationDate: {
            type: Date,
            description: "Date when the user activated the plan",
        },
        expiryDate: {
            type: Date,
            description: "Date when the 15-day plan expires",
        },
    },
    { timestamps: true }
);

referralRewardSchema.add(baseSchema);

const ReferralRewardModel = mongoose.model<IReferralRewardModel>(
    "ReferralReward",
    referralRewardSchema
);

export default ReferralRewardModel;
