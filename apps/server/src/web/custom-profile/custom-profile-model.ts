import mongoose, { Schema, Types, Document } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface ICustomProfileModel extends IBaseModel {
  userId: Types.ObjectId; // Reference to the UserModel
  content: string;        // Custom profile content
}

const customProfileSchema = new Schema<ICustomProfileModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },
    content: {
      type: String,
      default: "",
      required: false,
    },
  },
  {
    collection: "custom_profiles",
    timestamps: true,
  }
);

customProfileSchema.add(baseSchema.statics);

const CustomProfileModel = mongoose.model<ICustomProfileModel>(
  "CustomProfileModel",
  customProfileSchema
);

export default CustomProfileModel;
