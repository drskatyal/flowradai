import { Router } from "express";
import authMiddleware from "../middlewares/clerk-authentication";
import customProfileController from "./custom-profile-controller";

const router = Router();

// Create or Update profile
router.post("/", authMiddleware, customProfileController.createOrUpdateProfile);

// Get own profile
router.get("/", authMiddleware, customProfileController.getProfile);

export default router;
