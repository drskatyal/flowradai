import logger from "../../core/logger";
import cacheService from "../../core/cache/cache-service";
import { CACHE_KEYS } from "../../core/cache/cache-keys";
import { AIConfig } from "../../core/config/ai-config";
import { LLMType } from "../../core/llm/llm-service";
import SettingsModel, { AIServiceSettings, SETTINGS_KEYS } from "./settings-model";

/**
 * Get default AI service settings from ai-config.ts fallback values
 */
function getDefaultAIServiceSettings(): AIServiceSettings {
  return {
    defaultService: LLMType.GROK,
    llmConfig: {
      grok: {
        model: AIConfig.GROK.MODEL,
        temperature: AIConfig.GROK.TEMPERATURE,
        topP: AIConfig.GROK.TOP_P,
        maxTokens: 5000,
      },
      groq: {
        model: AIConfig.OPENAI_OSS.MODEL,
        temperature: AIConfig.OPENAI_OSS.TEMPERATURE,
        topP: AIConfig.OPENAI_OSS.TOP_P,
        maxTokens: 3000,
      },
      openrouter: {
        model: AIConfig.OPENROUTER.MODEL,
        temperature: AIConfig.OPENROUTER.TEMPERATURE,
        topP: AIConfig.OPENROUTER.TOP_P,
        maxTokens: AIConfig.OPENROUTER.MAX_COMPLETION_TOKEN,
      },
      gemini: {
        model: AIConfig.GEMINI_AI.MODEL,
        temperature: AIConfig.GEMINI_AI.TEMPERATURE,
        topP: 1,
        maxTokens: 8192,
      },
    },
    refinement: {
      defaultService: "gemini",
      config: {
        gemini: {
          model: AIConfig.GEMINI_AI.MODEL,
          temperature: AIConfig.GEMINI_AI.TEMPERATURE,
          topP: 1,
          maxTokens: 8192,
        },
        groq: {
          model: AIConfig.GROQ_REFINE.MODEL,
          temperature: AIConfig.GROQ_REFINE.TEMPERATURE,
          topP: AIConfig.GROQ_REFINE.TOP_P,
          maxTokens: AIConfig.GROQ_REFINE.MAX_TOKEN,
        },
      },
    },
    validation: {
      defaultService: "gemini",
      config: {
        gemini: {
          model: AIConfig.GEMINI_AI.MODEL,
          temperature: AIConfig.GEMINI_AI.TEMPERATURE,
          topP: 1,
          maxTokens: 2048,
        },
        grok: {
          model: AIConfig.GROK_VALIDATOR.MODEL,
          temperature: AIConfig.GROK_VALIDATOR.TEMPERATURE,
          topP: AIConfig.GROK_VALIDATOR.TOP_P,
          maxTokens: AIConfig.GROK_VALIDATOR.MAX_TOKEN,
        },
      },
    },
  };
}

class SettingsService {
  /**
   * Initialize default settings if they don't exist
   */
  async initializeSettings(): Promise<void> {
    try {
      const aiServiceSettings = await this.getAIServiceSettings();
      if (!aiServiceSettings) {
        const defaults = getDefaultAIServiceSettings();
        await this.saveAIServiceSettings(defaults);
        logger.info("AI service settings initialized with default values (all services)");
      } else {
        // Ensure all keys exist (migration: merge new defaults with existing)
        const defaults = getDefaultAIServiceSettings();
        const merged = this.deepMergeDefaults(defaults, aiServiceSettings);

        // Only save if there were new fields added
        if (JSON.stringify(merged) !== JSON.stringify(aiServiceSettings)) {
          await this.saveAIServiceSettings(merged);
          logger.info("AI service settings migrated with new default fields");
        }

        // Cache the default service
        cacheService.set(CACHE_KEYS.DEFAULT_MODEL_TYPE, merged.defaultService);
        // Cache the full settings
        cacheService.set(CACHE_KEYS.AI_SERVICE_SETTINGS, merged);
        logger.info(`AI service settings loaded and cached`);
      }
    } catch (error) {
      logger.error("Error initializing settings:", error);
    }
  }

  /**
   * Migrate legacy settings (e.g. openai -> groq for refinement)
   */
  private migrateLegacySettings(settings: any): any {
    if (!settings) return settings;

    // Migrate refinement
    if (settings.refinement) {
      if (settings.refinement.defaultService === "openai") {
        settings.refinement.defaultService = "groq";
      }
      if (settings.refinement.config && settings.refinement.config.openai) {
        settings.refinement.config.groq = { 
          ...settings.refinement.config.groq, 
          ...settings.refinement.config.openai 
        };
        delete settings.refinement.config.openai;
      }
    }

    return settings;
  }

  /**
   * Deep merge defaults with existing settings.
   * Existing values take priority; missing keys get default values.
   */
  private deepMergeDefaults(defaults: any, existing: any): any {
    const result = { ...defaults };
    for (const key of Object.keys(existing)) {
      if (
        existing[key] !== null &&
        typeof existing[key] === "object" &&
        !Array.isArray(existing[key]) &&
        typeof defaults[key] === "object" &&
        defaults[key] !== null
      ) {
        result[key] = this.deepMergeDefaults(defaults[key], existing[key]);
      } else {
        result[key] = existing[key];
      }
    }
    return result;
  }

  /**
   * Get AI service settings from DB
   */
  async getAIServiceSettings(): Promise<AIServiceSettings | null> {
    try {
      // Try cache first
      const cached = cacheService.get<AIServiceSettings>(CACHE_KEYS.AI_SERVICE_SETTINGS);
      if (cached) {
        return cached;
      }

      const settings = await SettingsModel.findOne({ key: SETTINGS_KEYS.AI_SERVICE });
      if (settings) {
        let value = settings.value as AIServiceSettings;
        
        // Migrate legacy settings on the fly
        value = this.migrateLegacySettings(value);
        
        // Cache the full settings & model type
        cacheService.set(CACHE_KEYS.AI_SERVICE_SETTINGS, value);
        cacheService.set(CACHE_KEYS.DEFAULT_MODEL_TYPE, value.defaultService);
        return value;
      }
      return null;
    } catch (error) {
      logger.error("Error getting AI service settings:", error);
      throw new Error("Failed to retrieve AI service settings");
    }
  }

  /**
   * Save or update AI service settings
   */
  async saveAIServiceSettings(settings: AIServiceSettings): Promise<AIServiceSettings> {
    try {
      const existingSettings = await SettingsModel.findOne({ key: SETTINGS_KEYS.AI_SERVICE });

      // Update caches
      cacheService.set(CACHE_KEYS.DEFAULT_MODEL_TYPE, settings.defaultService);
      cacheService.set(CACHE_KEYS.AI_SERVICE_SETTINGS, settings);

      if (existingSettings) {
        existingSettings.value = settings;
        existingSettings.markModified('value');
        await existingSettings.save();
        return existingSettings.value;
      } else {
        const newSettings = new SettingsModel({
          key: SETTINGS_KEYS.AI_SERVICE,
          value: settings,
          description: "AI service configuration settings (all services)"
        });
        await newSettings.save();
        return newSettings.value;
      }
    } catch (error) {
      logger.error("Error saving AI service settings:", error);
      throw new Error("Failed to save AI service settings");
    }
  }

  /**
   * Get default AI service
   */
  async getDefaultAIService(): Promise<LLMType> {
    try {
      const cachedModelType = cacheService.get<LLMType>(CACHE_KEYS.DEFAULT_MODEL_TYPE);
      if (cachedModelType) {
        return cachedModelType;
      }

      const settings = await this.getAIServiceSettings();
      const modelType = settings?.defaultService || LLMType.GROK;
      cacheService.set(CACHE_KEYS.DEFAULT_MODEL_TYPE, modelType);
      return modelType;
    } catch (error) {
      logger.error("Error getting default AI service:", error);
      return LLMType.GROK;
    }
  }

  /**
   * Get settings with fallback to defaults (never returns null)
   */
  async getAIServiceSettingsWithDefaults(): Promise<AIServiceSettings> {
    const settings = await this.getAIServiceSettings();
    if (settings) {
      return settings;
    }
    return getDefaultAIServiceSettings();
  }
}

export default new SettingsService();
