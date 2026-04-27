import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IDocumentModel extends IBaseModel {
  title: string;
  description: string;
  userId: string;
  specialityId: mongoose.Types.ObjectId;
  category: string;
  prompt: string;
}

const documentSchema = new Schema<IDocumentModel>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
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
    category: {
      type: String,
      default: "",
      enum: ["normal", "abnormal"],
      required: false,
    },
    prompt: {
      type: String,
      required: false,
    }
  },
  {
    collection: "ducuments",
    timestamps: true,
  }
);

documentSchema.add(baseSchema.statics);

const DocumentModel = mongoose.model<IDocumentModel>("DocumentModel", documentSchema);

export default DocumentModel;
