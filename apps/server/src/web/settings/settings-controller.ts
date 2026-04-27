import { Request, Response } from "express";
import logger from "../../core/logger";
import settingsService from "./settings-service";
import { LLMType } from "../../core/llm/llm-service";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import { AIServiceSettings } from "./settings-model";

class SettingsController {
  /**
   * Get AI service settings (full config for admin panel)
   */
  async getAIServiceSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await settingsService.getAIServiceSettingsWithDefaults();
      return res.status(200).json(settings);
    } catch (error) {
      logger.error("Error getting AI service settings:", error);
      return res.status(500).json({
        error: "Failed to retrieve AI service settings"
      });
    }
  }

  /**
   * Update AI service settings (full config from admin panel)
   */
  async updateAIServiceSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = req.body as AIServiceSettings;
      const adminId = req.auth().userId;

      // Basic validation: defaultService must be valid
      if (settings.defaultService && !Object.values(LLMType).includes(settings.defaultService)) {
        return res.status(400).json({
          error: `Invalid AI service type. Must be one of: ${Object.values(LLMType).join(", ")}`
        });
      }

      // Merge incoming partial update with existing settings
      const existing = await settingsService.getAIServiceSettingsWithDefaults();
      const merged = deepMerge(existing, settings);

      // Save the merged settings
      const updatedSettings = await settingsService.saveAIServiceSettings(merged);

      logger.info(`AI service settings updated by admin ${adminId}`);

      return res.status(200).json(updatedSettings);
    } catch (error) {
      logger.error("Error updating AI service settings:", error);
      return res.status(500).json({
        error: "Failed to update AI service settings"
      });
    }
  }

  /**
   * Get the default AI service (public endpoint)
   */
  async getDefaultAIService(req: AuthenticatedRequest, res: Response) {
    try {
      const defaultService = await settingsService.getDefaultAIService();
      return res.status(200).json({ defaultService });
    } catch (error) {
      logger.error("Error getting default AI service:", error);
      return res.status(500).json({
        error: "Failed to retrieve default AI service"
      });
    }
  }
}

/**
 * Deep merge two objects. Source values overwrite target values.
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      source[key] !== undefined &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      target[key] !== null
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

export default new SettingsController();
