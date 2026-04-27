import { Router } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import threadController from "./thread-controller";

const router = Router();

router.post("/", (req, res, next) =>
  threadController.createThread(req as AuthenticatedRequest, res, next)
); // Create a new thread

router.get("/", (req, res, next) =>
  threadController.getUserThreads(req as AuthenticatedRequest, res, next)
); // Get all threads

router.get("/stats", (req, res, next) =>
  threadController.getReportStats(req as AuthenticatedRequest, res, next)
); // Get report stats

router.get("/history", (req, res, next) =>
  threadController.getReportHistory(req as AuthenticatedRequest, res, next)
); // Get report history

router.get("/:id", (req, res, next) =>
  threadController.getThreadById(req as any as AuthenticatedRequest, res, next)
); // Get a thread by ID

router.put("/:id", (req, res, next) =>
  threadController.updateThread(req as any as AuthenticatedRequest, res, next)
); // Update a thread by ID

router.delete("/:id", (req, res, next) =>
  threadController.deleteThread(req as any as AuthenticatedRequest, res, next)
); // Delete a thread by ID

export default router;
