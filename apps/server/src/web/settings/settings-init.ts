import logger from "../../core/logger";
import cacheService from "../../core/cache/cache-service";
import { CACHE_KEYS } from "../../core/cache/cache-keys";
import settingsService from "./settings-service";

/**
 * Initialize application settings and cache default values.
 * Seeds all AI service configs to DB on first run (from ai-config.ts defaults).
 */
export const initializeSettings = async () => {
  try {
    logger.info("Initializing application settings");
    
    // Initialize settings in database (seeds defaults if empty, migrates if new fields)
    await settingsService.initializeSettings();
    
    // Get default AI service and cache it
    const defaultService = await settingsService.getDefaultAIService();
    cacheService.set(CACHE_KEYS.DEFAULT_MODEL_TYPE, defaultService);
    
    // Cache the full settings
    const fullSettings = await settingsService.getAIServiceSettings();
    if (fullSettings) {
      cacheService.set(CACHE_KEYS.AI_SERVICE_SETTINGS, fullSettings);
    }
    
    logger.info(`AI service settings initialized and cached (default: ${defaultService})`);
  } catch (error) {
    logger.error("Error initializing application settings:", error);
    throw new Error("Failed to initialize application settings");
  }
};