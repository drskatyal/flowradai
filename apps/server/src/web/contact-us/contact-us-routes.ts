import { Router } from "express";
import authMiddleware from "../middlewares/clerk-authentication";
import contactUsController from "./contact-us-controller";

const router = Router();

// Submit contact-us message
router.post("/", authMiddleware, contactUsController.sendMessage);

export default router;
