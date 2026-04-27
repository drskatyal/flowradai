import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface ISpecialityModel extends IBaseModel {
  userId: string;
  name: string;
  description: string;
  active: boolean;
  specialityButtonLabel: string;
  isButton: boolean;
  elaborateButtonLabel: string;
  isElaborateButton: boolean;
}

const specialitySchema = new Schema<ISpecialityModel>(
  {
    userId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    specialityButtonLabel: {
      type: String,
      required: false
    },
    isButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    elaborateButtonLabel: {
      type: String,
      required: false
    },
    isElaborateButton: {
      type: Boolean,
      required: false,
      default: true
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "specialities",
    timestamps: true,
    toJSON: { virtuals: true },  // Include virtuals in JSON
    toObject: { virtuals: true } // Include virtuals in JS objects
  }
);

// ✅ Virtual relation to PromptModel
specialitySchema.virtual('prompt', {
  ref: 'PromptModel',              // Name of the related model
  localField: '_id',               // Field on SpecialityModel
  foreignField: 'specialityId',    // Field on PromptModel
  justOne: true                    // Only one prompt per speciality
});

// Add shared/static methods from base schema
specialitySchema.add(baseSchema.statics);

// Final model
const SpecialityModel = mongoose.model<ISpecialityModel>("SpecialityModel", specialitySchema);

export default SpecialityModel;
