import { Router } from "express";
import reportValidatorController from "./report-validator-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

const router = Router();

router.post("/validate", (req, res, next) =>
    reportValidatorController.checkReportError(req as AuthenticatedRequest, res, next)
);

export default router;