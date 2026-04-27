import express from "express";
import settingsController from "./settings-controller";
import authMiddleware from "../middlewares/clerk-authentication";
import adminMiddleware from "../middlewares/admin-middleware";

const router = express.Router();

// Public endpoint - no authentication required
router.get("/ai-service/default", settingsController.getDefaultAIService);

// Admin-only endpoints with authentication and admin check
// First ensure the user is authenticated
router.use(authMiddleware);
// Then check if they have admin privileges
router.use(adminMiddleware);

// Admin-only routes for managing settings
router.get("/ai-service", settingsController.getAIServiceSettings);
router.put("/ai-service", settingsController.updateAIServiceSettings);

export default router; 