import { Router } from "express";
import reportGuidelineController from "./report-guideline-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

const router = Router();

router.post("/", (req, res, next) =>
    reportGuidelineController.searchReportGuidelineUrl(req as AuthenticatedRequest, res, next)
);

export default router;