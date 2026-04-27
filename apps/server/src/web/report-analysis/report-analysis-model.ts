import mongoose, { Schema } from "mongoose";
import baseSchema, { IBaseModel } from "../../models/base-model";

export interface IReportAnalysisModel extends IBaseModel {
  threadId: string;
  guideline: Record<string, any>;
  error: Record<string, any>;
}

const reportAnalysisSchema = new Schema<IReportAnalysisModel>({
  threadId: {
    type: String,
    required: true,
    index: true,
  },
  guideline: {
    type: Schema.Types.Mixed,
    default: {},
  },
  error: {
    type: Schema.Types.Mixed,
    default: {},
  },
});

reportAnalysisSchema.add(baseSchema);

const ReportAnalysis = mongoose.model<IReportAnalysisModel>(
  "ReportAnalysis",
  reportAnalysisSchema
);

export default ReportAnalysis;
