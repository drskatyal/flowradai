import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

// Define the schema for Parallel AI configuration
const paralleAiSchema = z.object({
  MODEL: z.string(),
  API_KEY: z.string().optional(),
  BASE_URL: z.string(),
});

export const getParallelAiConfig = () => {
  // Read from DB-backed config service
  const dbConfig = aiConfigService.getParallelAIConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.PARALLEL_AI_API_KEY,
  };

  const config = paralleAiSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`ParallelAI config validation error: ${errorMessages}`);
    throw new Error(`ParallelAI config validation error: ${errorMessages}`);
  }

  return {
    model: config.data.MODEL,
    apiKey: config.data.API_KEY,
    baseUrl: config.data.BASE_URL,
  };
};
