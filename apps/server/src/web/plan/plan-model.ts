import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IPlanModel extends IBaseModel {
    name: string;
    slug: string; // e.g. "basic", "standard", "unlimited", "yearly-unlimited"
    subscriptionType: "regular" | "monthly" | "yearly";
    threadsQuantity: number; // 0 = unlimited
    usdPrice: number;
    inrPrice: number;
    gstPercent: number;
    features: string[];
    highlighted: boolean;
    isActive: boolean;
    sortOrder: number;
}

const planSchema = new Schema<IPlanModel>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        subscriptionType: {
            type: String,
            enum: ["regular", "monthly", "yearly"],
            required: true,
        },
        threadsQuantity: { type: Number, required: true, default: 0 },
        usdPrice: { type: Number, required: true },
        inrPrice: { type: Number, required: true },
        gstPercent: { type: Number, required: true, default: 18 },
        features: [{ type: String }],
        highlighted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    { collection: "plans", timestamps: true }
);

planSchema.add(baseSchema);

const PlanModel = mongoose.model<IPlanModel>("Plan", planSchema);

export default PlanModel;
