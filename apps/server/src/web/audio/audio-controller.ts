import { Response, NextFunction } from "express";
import { FileArray } from "express-fileupload";
import audioService from "./audio-service";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

class AudioController {
  /**
   * Transcribe audio to text using Groq API
   */
  async transcribeAudio(req: AuthenticatedRequest & { files?: FileArray }, res: Response, _next: NextFunction) {
    try {
      // Check for files in the request
      const specialityId = req.auth().sessionClaims.user.specialityId
      if (!req.files) {
        console.error("No files object in request");
        return res.status(400).json({ error: "No audio file provided", details: "Files object missing in request" });
      }

      if (Object.keys(req.files).length === 0) {
        console.error("Empty files object in request");
        return res.status(400).json({ error: "No audio file provided", details: "Files object is empty" });
      }

      // Get the audio file from the request
      const audioFile = req.files.audio;

      // Parse autoRefine parameter (convert string 'true'/'false' to boolean)
      const autoRefine = req.body.autoRefine === 'true' || req.body.autoRefine === true;

      const actionMode = req.body.actionMode === 'true' || req.body.actionMode === true;

      if (!audioFile) {
        console.error("No 'audio' field in files object. Available fields:", Object.keys(req.files));
        return res.status(400).json({
          error: "No audio file provided",
          details: "No 'audio' field in request files",
          availableFields: Object.keys(req.files)
        });
      }

      // Use the service to handle transcription and pass autoRefine parameter
      const result = await audioService.transcribeAudioFile(audioFile, autoRefine, actionMode, specialityId);

      return res.json(result);
    } catch (error) {
      console.error("Error in transcription controller:", error);

      return res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

export default new AudioController(); 