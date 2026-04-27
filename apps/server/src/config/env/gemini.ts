import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

// Define the schema for Gemini configuration
const geminiSchema = z.object({
  API_KEY: z.string().optional(),
  MODEL: z.string(),
  BASE_URL: z.string().optional(),
  TEMPERATURE: z.number().default(1),
  MAX_TOKENS: z.number().default(8192),
});

export const getGeminiConfig = () => {
  // Read from DB-backed config service
  const dbConfig = aiConfigService.getGeminiAIConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.GEMINI_API_KEY
  };

  const config = geminiSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Gemini config validation error: ${errorMessages}`);
    throw new Error(`Gemini config validation error: ${errorMessages}`);
  }

  return {
    apiKey: process.env.GEMINI_API_KEY,
    model: config.data.MODEL,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    temperature: config.data.TEMPERATURE,
    maxCompletionTokens: config.data.MAX_TOKENS,
  };
};
