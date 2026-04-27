import { NextFunction, Response } from "express";
import logger from "../../core/logger";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import reportExportService from "./report-export-service";

class ReportExportController {
  async docxReportExport(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const htmlString = req.body?.element?.innerHTML;

      if (!htmlString) {
        return res.status(400).json({ message: "HTML content is missing." });
      }

      const buffer = await reportExportService.generateDocxFromHtml(htmlString);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Report.docx"'
      );

      return res.end(buffer);
    } catch (error: any) {
      logger.error("Error exporting DOCX", error);
      return res.status(500).json({
        message: error?.message || "Failed to export document.",
      });
    }
  }
}

export default new ReportExportController();
