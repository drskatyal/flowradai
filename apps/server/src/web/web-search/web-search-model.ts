import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IWebSearchModel extends IBaseModel {
    userId: mongoose.Types.ObjectId;
    inputText: string;
    outputText: string;
}

const webSearchSchema = new Schema<IWebSearchModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "UserModel",
            required: true,
            help: "User's internal Database ID",
        },
        inputText: {
            type: String,
            required: true,
            help: "The search query",
        },
        outputText: {
            type: String,
            required: true,
            help: "The search results/AI response",
        },
    },
    {
        collection: "web_searches",
        timestamps: true,
    }
);

webSearchSchema.add(baseSchema.statics);

const WebSearchModel = mongoose.model<IWebSearchModel>(
    "WebSearchModel",
    webSearchSchema
);

export default WebSearchModel;