import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

const openRouterSchema = z.object({
  API_KEY: z.string().optional(),
  MODEL: z.string(),
  BASE_URL: z.string(),
  TEMPERATURE: z.number().default(1),
  MAX_COMPLETION_TOKEN: z.number().default(8192),
  TOP_P: z.number().default(1),
});

export const getOpenRouterConfig = () => {
  const dbConfig = aiConfigService.getOpenRouterConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.OPENROUTER_API_KEY,
  };

  const config = openRouterSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`OpenRouter config validation error: ${errorMessages}`);
    throw new Error(`OpenRouter config validation error: ${errorMessages}`);
  }

  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: config.data.MODEL,
    baseUrl: config.data.BASE_URL,
    temperature: config.data.TEMPERATURE,
    maxCompletionTokens: config.data.MAX_COMPLETION_TOKEN,
    topP: config.data.TOP_P,
  };
};
