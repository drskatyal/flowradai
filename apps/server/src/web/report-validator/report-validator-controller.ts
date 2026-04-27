import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import ReportValidatorService from "./report-validator-service";
import logger from "../../core/logger";
import specialityService from "../speciality/speciality-service";

class ReportValidatorController {

    async checkReportError(
        req: AuthenticatedRequest,
        res: Response,
        _next: NextFunction
    ) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const specialityId = req.auth().sessionClaims?.user?.specialityId;
            const { report, findings, threadId } = req.body;

            if (!report || !findings) {
                logger.warn("Missing report or findings in request", { body: req.body });
                return res.status(400).json({
                    error: "Both 'report' and 'findings' fields are required"
                });
            }

            const prompt = await specialityService.getPromptBySpecialityId(specialityId);


            // Call service function
            const { validation, recommendation, corrected_report } =
                await ReportValidatorService.checkReportErrors(report, findings, prompt?.reportErrorValidationInstruction, userId, threadId);

            return res.status(200).json({
                success: true,
                validation,
                recommendation,
                corrected_report
            });
        } catch (error) {
            logger.error("Error in checkReportError controller", error);
            return res.status(500).json({
                error: "Failed to validate report",
                details: error instanceof Error ? error.message : error
            });
        }
    }
}

export default new ReportValidatorController();
