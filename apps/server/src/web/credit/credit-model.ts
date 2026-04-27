import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface ICreditModel extends IBaseModel {
  userId: string;
  creditAmount: number;
  reason: "purchase" | "referral" | "referral_signup";
  referredUserId?: string;
}


const creditSchema = new Schema<ICreditModel>(
  {
    userId: {
      type: String,
      required: true,
      help: "User ID",
    },
    creditAmount: {
      type: Number,
      required: true,
      default: 0,
      help: "Amount of credit added",
    },
    reason: {
      type: String,
      enum: ["purchase", "referral", "referral_signup"],
      required: true,
      default: "purchase",
      help: "Reason for credit addition",
    },
    referredUserId: {
      type: String,
      required: false,
      help: "Referred user ID",
    },
  },
  {
    collection: "credits",
    timestamps: true,
  }
);

creditSchema.add(baseSchema.statics);

const CreditModel = mongoose.model<ICreditModel>("CreditModel", creditSchema);

export default CreditModel;
