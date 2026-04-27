import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IPaymentModel extends IBaseModel {
  paymentId: string;
  orderId: string;
  paymentType: "razorpay" | "stripe";
  threadsQuantity: number;
  unitPrice: number;
  totalAmount: number;
  gstAmount: number;
  currency: string;
  userId: string;
  status: "paid" | "pending" | "failed";
  planName?: string;
}

const paymentSchema = new Schema<IPaymentModel>(
  {
    paymentId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },
    threadsQuantity: {
      type: Number,
      default: 0,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
    },
    planName: {
      type: String,
      default: null,
    },
  },
  {
    collection: "payments",
    timestamps: true,
  }
);

paymentSchema.add(baseSchema);

const PaymentModel = mongoose.model<IPaymentModel>(
  "PaymentModel",
  paymentSchema
);

export default PaymentModel;
