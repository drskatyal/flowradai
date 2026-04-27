import { Router } from "express";
import reportAnalysisController from "./report-analysis-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import authMiddleware from "../middlewares/clerk-authentication";

const router = Router();


router.post("/", (req, res, next) =>
    reportAnalysisController.createReportAnalysis(req as AuthenticatedRequest, res, next)
);

router.get("/:id", authMiddleware, (req, res, next) => 
    reportAnalysisController.getReportAnalysis(req as AuthenticatedRequest, res, next)
  );

export default router;