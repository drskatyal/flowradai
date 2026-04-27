import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface ITemplateModel extends IBaseModel {
  title: string;
  description: string;
  userId: string;
  specialityId: mongoose.Types.ObjectId;
  type: "private" | "public";
  category: string;
  prompt: string;
  embedding?: number[];
  originalTemplateId?: string;
}

const templateSchema = new Schema<ITemplateModel>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    specialityId: {
      type: Schema.Types.ObjectId,
      ref: "SpecialityModel",
      required: false,
    },
    type: {
      type: String,
      required: true,
      default: "private",
    },
    category: {
      type: String,
      default: "",
      enum: ["normal", "abnormal", ""],
      required: false,
    },
    prompt: {
      type: String,
      required: false,
    },
    embedding: {
      type: [Number],
      default: [],
      required: false,
    },
    originalTemplateId: {
      type: String,
      required: false,
    },
  },
  {
    collection: "templates",
    timestamps: true,
  }
);

templateSchema.add(baseSchema.statics);

const TemplateModel = mongoose.model<ITemplateModel>(
  "TemplateModel",
  templateSchema
);

export default TemplateModel;