import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import ReportGuidelineService from "./report-guideline-service";
import logger from "../../core/logger";
import specialityService from "../speciality/speciality-service";

class ReportGuidelineController {
  private reportGuidelineService: ReportGuidelineService;

  constructor() {
    this.reportGuidelineService = new ReportGuidelineService();
  }

  async searchReportGuidelineUrl(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const specialityId = req.auth().sessionClaims?.user?.specialityId;
      const { findings } = req.body;

      const specialityPrompt =
        await specialityService.getPromptBySpecialityId(specialityId);

      // set up SSE response headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // keep-alive heartbeat (every 15s)
      const keepAlive = setInterval(() => {
        res.write(":\n\n"); // SSE comment
      }, 15000);

      const stream = await this.reportGuidelineService.searchReportGuideline({
        objective: specialityPrompt?.reportGuidelineInstruction,
        searchQuery: findings,
      });

      // stream chunks to client
      for await (const chunk of stream) {
        res.write(chunk);
      }

      clearInterval(keepAlive);
      res.end();
    } catch (error) {
      logger.error("Error in generateReportGuideline controller", error);

      if (!res.headersSent) {
        return res.status(500).json({
          error: "Failed to generate searchReportGuidelineUrl",
          details: error instanceof Error ? error.message : error,
        });
      } else {
        // if already streaming, send error as SSE event
        res.write(
          `event: error\ndata: ${JSON.stringify(
            error instanceof Error ? error.message : error
          )}\n\n`
        );
        res.end();
      }
    }
  }
}

export default new ReportGuidelineController();