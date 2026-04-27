import { Router } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import reportExportController from "./report-export-controller";

const router = Router();

router.post("/", (req, res, next) =>
  reportExportController.docxReportExport(
    req as AuthenticatedRequest,
    res,
    next
  )
);

export default router;
