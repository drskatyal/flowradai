import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";
import { getRestrictionsConfig } from "../../config/env";
import { LLMType } from "../../core/llm/llm-service";

const { maxAllowedMessages } = getRestrictionsConfig();

export interface IThreadModel extends IBaseModel {
  userId: string;
  threadId: string;
  name: string;
  status: "regular" | "archived" | "new" | "deleted";
  maxAllowedMessage: number;
  modelType?: LLMType;
}

const threadSchema = new Schema<IThreadModel>(
  {
    userId: {
      type: String,
      required: true,
    },
    threadId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      maxLength: 255,
    },
    status: {
      type: String,
      required: true,
      default: "new",
    },
    maxAllowedMessage: {
      type: Number,
      default: maxAllowedMessages,
      required: true,
      help: "Number of allowed messaged per thread",
    },
    modelType: {
      type: String,
      enum: Object.values(LLMType),
      default: LLMType.GROK,
    },
  },
  {
    collection: "threads",
    timestamps: true,
  }
);

threadSchema.add(baseSchema);

const ThreadModel = mongoose.model<IThreadModel>("ThreadModel", threadSchema);

export default ThreadModel;
