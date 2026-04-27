import { NextFunction, Response } from "express";
import logger from "../../core/logger";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import refineService from "./refine-service";
import { getInstructionsConfig } from "../../config/env/instructions";
import specialityService from "../speciality/speciality-service";

class RefineController {
  async refineText(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { text, threadId } = req.body;
      const userId = req.auth().sessionClaims?.internalId;
      const specialityId = req.auth().sessionClaims.user?.specialityId;
      const prompts = await specialityService.getPromptBySpecialityId(specialityId);
      const instructionsConfig = getInstructionsConfig(); // Ensure this is defined

      const instruction =
        prompts?.textCorrectionInstruction?.trim() || instructionsConfig.textCorrectionInstruction;

      const response = await refineService.refineText(text, instruction, undefined, userId, threadId);
      res.status(200).json(response);
    } catch (error) {
      logger.error("Error refining text", error);
      res.status(500).json({
        message:
          error?.message ||
          "We encountered an issue refining the text. Please try again in a moment.",
      });
    }
  }
}

export default new RefineController();
