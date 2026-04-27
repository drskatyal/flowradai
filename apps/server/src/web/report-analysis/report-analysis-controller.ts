import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import ReportAnalysisService from "./report-analysis-service";
import logger from "../../core/logger";

class ReportAnalysisController {
    /**
     * Create or update report analysis
     */
    async createReportAnalysis(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const { threadId, guideline, errors } = req.body;
            // Validate input
            if (!threadId) {
                logger.warn(`User ${req.auth().userId || "unknown"}: Thread ID missing in createReportAnalysis request`);
                return res.status(400).json({ success: false, message: "Thread ID is required" });
            }

            // Get existing analysis
            const existing = await ReportAnalysisService.getAnalysis(threadId);

            // Merge new values with existing ones
            const updatedData = {
                guideline: guideline !== undefined ? guideline : existing?.guideline,
                error: errors !== undefined ? errors : existing?.error,
            };

            const result = await ReportAnalysisService.createAnalysis(threadId, updatedData.guideline, updatedData.error);

            logger.info(`User ${req.auth().userId || "unknown"}: Report analysis saved for thread ${threadId}`);

            return res.status(200).json({
                success: true,
                message: "Report analysis saved successfully",
                data: result,
            });
        } catch (err: any) {
            logger.error(`User ${req.auth().userId || "unknown"}: createReportAnalysis failed: ${err.message}`);
            return res.status(500).json({
                success: false,
                message: "Failed to save report analysis",
                error: err.message,
            });
        }
    }

    /**
     * Get report analysis by thread ID
     */
    async getReportAnalysis(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const { id: threadId } = req.params;

            // Validate input
            if (!threadId) {
                logger.warn(`User ${req.auth().userId || "unknown"}: Thread ID missing in getReportAnalysis request`);
                return res.status(400).json({ success: false, message: "Thread ID is required" });
            }

            const result = await ReportAnalysisService.getAnalysis(threadId);

            if (!result) {
                return res.status(200).json({
                    status: 200,
                    success: false,
                    message: `No report analysis found for thread ID: ${threadId}`,
                });
            }

            return res.status(200).json({
                success: true,
                message: "Report analysis fetched successfully",
                data: result,
            });
        } catch (err: any) {
            logger.error(`User ${req.auth().userId || "unknown"}: getReportAnalysis failed: ${err.message}`);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch report analysis",
                error: err.message,
            });
        }
    }
}

export default new ReportAnalysisController();
