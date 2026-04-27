import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

// Define the schema for Mistral AI configuration
const mystarlAiSchema = z.object({
  MODEL: z.string(),
  TEMPERATURE: z.number().default(1),
  LANGUAGE: z.string(),
  API_KEY: z.string().optional(),
});

export const getMystralAiConfig = () => {
  // Read from DB-backed config service
  const dbConfig = aiConfigService.getMistralAIConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.MISTRAL_API_KEY
  };
  
  const config = mystarlAiSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`MystarlAI config validation error: ${errorMessages}`);
    throw new Error(`MystarlAI config validation error: ${errorMessages}`);
  }

  return {
    model: config.data.MODEL,
    temperature: config.data.TEMPERATURE,
    language: config.data.LANGUAGE,
    apiKey: config.data.API_KEY,
  };
};
