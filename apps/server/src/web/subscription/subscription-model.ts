import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface ISubscriptionModel extends IBaseModel {
  userId: string;
  planType: "monthly" | "quarterly" | "yearly" | "regular" | 'referral' | "coupon_code";
  startDate: Date;
  endDate: Date;
  couponCode?: string;
}

const subscriptionSchema = new Schema<ISubscriptionModel>(
  {
    userId: {
      type: String,
      required: true,
      description: "User ID",
    },
    planType: {
      type: String,
      required: true,
      enum: ["monthly", "quarterly", "yearly", "regular", 'referral', 'coupon_code'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    couponCode: {
      type: String,
      required: false,
      uppercase: true,
      description: "Coupon code used for this subscription",
    },
  },
  { timestamps: true }
);

subscriptionSchema.add(baseSchema);

// Add compound index for efficient duplicate coupon code checks
subscriptionSchema.index({ userId: 1, couponCode: 1, isDeleted: 1 });

const SubscriptionModel = mongoose.model<ISubscriptionModel>(
  "Subscription",
  subscriptionSchema
);

export default SubscriptionModel;