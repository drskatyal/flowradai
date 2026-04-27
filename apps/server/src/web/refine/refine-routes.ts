import { Router } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import refineController from "./refine-controller";

const router = Router();

router.post("/findings-text/", (req, res, next) =>
  refineController.refineText(req as AuthenticatedRequest, res, next)
); // Create a new thread

export default router;
