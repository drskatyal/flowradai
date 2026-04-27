import { Router } from "express";
import authMiddleware from "../middlewares/clerk-authentication";
import adminMiddleware from "../middlewares/admin-middleware";
import planController from "./plan-controller";

const router = Router();

// Public: client fetches active plans
router.get("/", planController.getPlans);
router.get("/check-slug", planController.checkSlug);

// Admin only: manage plans
router.post("/", authMiddleware, adminMiddleware, planController.createPlan);
router.put("/:id", authMiddleware, adminMiddleware, planController.updatePlan);
router.delete("/:id", authMiddleware, adminMiddleware, planController.deletePlan);

export default router;
