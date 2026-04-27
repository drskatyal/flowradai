import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IMessageModel extends IBaseModel {
  threadId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isApplyChange: boolean;
}

const messageSchema = new Schema<IMessageModel>(
  {
    threadId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant"],
    },
    isApplyChange: {
      type: Boolean,
      required: false,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

messageSchema.add(baseSchema);

const MessageModel = mongoose.model<IMessageModel>("MessageModel", messageSchema);

export default MessageModel; 