import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IPromptModel extends IBaseModel {
  specialityId: mongoose.Types.ObjectId; // Reference to SpecialityModel
  elaborateInstruction?: string;
  structuredReportingApproachInstruction?: string;
  regularInstruction?: string;
  defaultGrokInstructions?: string;
  defaultOpenaiInstructions?: string;
  defaultGeminiInstructions?: string;
  reportModificationInstructions?: string;
  templateRegularInstruction?: string;
  textCorrectionInstruction?: string;
  refinementInstruction?: string;
  disabledRefinementInstructions?: string;
  actionModeRefinementInstruction?: string;
  wishperInstruction?: string;
  reportErrorValidationInstruction?: string;
  reportGuidelineInstruction?: string;
}

const promptSchema = new Schema<IPromptModel>(
  {
    specialityId: {
      type: Schema.Types.ObjectId,
      ref: "SpecialityModel",
      required: true,
    },
    elaborateInstruction: { type: String, trim: true },
    structuredReportingApproachInstruction: { type: String, trim: true },
    regularInstruction: { type: String, trim: true },
    defaultGrokInstructions: { type: String, trim: true },
    defaultOpenaiInstructions: { type: String, trim: true },
    defaultGeminiInstructions: { type: String, trim: true },
    reportModificationInstructions: { type: String, trim: true },
    templateRegularInstruction: { type: String, trim: true },
    textCorrectionInstruction: { type: String, trim: true },
    refinementInstruction: { type: String, trim: true },
    disabledRefinementInstructions: { type: String, trim: true },
    actionModeRefinementInstruction: { type: String, trim: true },
    wishperInstruction: { type: String, trim: true },
    reportErrorValidationInstruction: { type: String, trim: true },
    reportGuidelineInstruction: { type: String, trim: true }
  },
  {
    collection: "prompts",
    timestamps: true,
  }
);

// Add shared/static methods from base schema
promptSchema.add(baseSchema.statics);

const PromptModel = mongoose.model<IPromptModel>("PromptModel", promptSchema);

export default PromptModel;
