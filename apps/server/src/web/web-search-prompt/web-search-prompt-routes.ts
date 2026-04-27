import express from "express";
import webSearchPromptController from "./web-search-prompt-controller";
import authMiddleware from "../middlewares/clerk-authentication";
import adminMiddleware from "../middlewares/admin-middleware";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Routes for web search prompt management
router.get("/", webSearchPromptController.getPrompt);
router.put("/", webSearchPromptController.updatePrompt);


export default router;
