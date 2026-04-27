import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

// Define the schema for GeminiAI configuration
const geminiAiSchema = z.object({
  MODEL: z.string(),
  TEMPERATURE: z.number().default(1),
  API_KEY: z.string().optional(),
});

export const getGeminiRefineConfig = () => {
  // Read from DB-backed config service
  const dbConfig = aiConfigService.getGeminiAIConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.GEMINI_API_KEY
  };

  const config = geminiAiSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`GeminiAI config validation error: ${errorMessages}`);
    throw new Error(`GeminiAI config validation error: ${errorMessages}`);
  }

  return {
    model: config.data.MODEL,
    temperature: config.data.TEMPERATURE,
    apiKey: config.data.API_KEY,
  };
};
