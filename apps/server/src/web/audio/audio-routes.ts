import { Router } from "express";
import audioController from "./audio-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

const router = Router();

// Define route for audio transcription
router.post("/transcribe", (req, res, next) =>
  audioController.transcribeAudio(req as AuthenticatedRequest, res, next)
);

export default router; 