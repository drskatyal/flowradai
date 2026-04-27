import ReportAnalysis from "./report-analysis-model"; // adjust path if needed
import logger from "../../core/logger";

export class ReportAnalysisService {
  /**
   * Create or update report analysis for a given thread
   */
  async createAnalysis(threadId: string, guideline: any, error: any) {
    try {
      if (!threadId) {
        throw new Error("Thread ID is required.");
      }

      const data = { guideline, error };

      // Upsert logic: update if threadId exists, otherwise create new
      const result = await ReportAnalysis.findOneAndUpdate(
        { threadId },
        { $set: data },
        { upsert: true, new: true }
      );

      logger.info(`Report analysis saved for thread: ${threadId}`);
      return result;
    } catch (err: any) {
      logger.error(`Failed to create report analysis for thread ${threadId}: ${err.message}`);
      throw new Error("Error creating report analysis. Please try again.");
    }
  }

  /**
   * Get report analysis by thread ID
   */
  async getAnalysis(threadId: string) {
    try {
      if (!threadId) {
        throw new Error("Thread ID is required.");
      }

      const result = await ReportAnalysis.findOne({ threadId });

      if (!result) {
        logger.warn(`No report analysis found for thread: ${threadId}`);
        return null;
      }

      logger.info(`Fetched report analysis for thread: ${threadId}`);
      return result;
    } catch (err: any) {
      logger.error(`Failed to fetch report analysis for thread ${threadId}: ${err.message}`);
      throw new Error("Error retrieving report analysis. Please try again.");
    }
  }
}

export default new ReportAnalysisService();
