import mongoose, { Schema, Document } from "mongoose";
import { IBaseModel } from "../../models/base-model";

// Define the interface for WebSearchPrompt model
export interface IWebSearchPromptModel extends IBaseModel {
    prompt: string;
}

// Create the schema for web search prompt
const webSearchPromptSchema = new Schema({
    prompt: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret: Record<string, any>) => {
            ret.id = String(ret._id);
            delete ret._id;
            delete ret.__v;
        },
    },
});

// Add pre-query hooks to filter deleted records
webSearchPromptSchema.pre("find", function () {
    this.where({ isDeleted: false });
});

webSearchPromptSchema.pre("findOne", function () {
    this.where({ isDeleted: false });
});

// Method for soft deletion
webSearchPromptSchema.methods.delete = async function () {
    this.isDeleted = true;
    await this.save();
};

// Create and export the model
const WebSearchPromptModel = mongoose.model<IWebSearchPromptModel & Document>(
    "WebSearchPrompt",
    webSearchPromptSchema
);

export default WebSearchPromptModel;
