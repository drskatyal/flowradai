import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

// Define the schema for Grok configuration
const grokSchema = z.object({
  API_KEY: z.string().optional(), // Optional in AIConfig as we'll use env var
  MODEL: z.string(),
  BASE_URL: z.string(),
  TOP_P: z.number().default(1),
  TEMPERATURE: z.number().default(1),
  MAX_TOKENS: z.number().default(5000),
  REASONING_EFFORT: z.enum(["low", "medium", "high"]).default("medium"),
});

export const getGrokConfig = () => {
  // Read from DB-backed config service (falls back to ai-config.ts defaults)
  const dbConfig = aiConfigService.getGrokConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.GROK_API_KEY
  };

  const config = grokSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Grok config validation error: ${errorMessages}`);
    throw new Error(`Grok config validation error: ${errorMessages}`);
  }

  return {
    apiKey: process.env.GROK_API_KEY, // Use API key from environment variable
    model: config.data.MODEL,
    baseUrl: config.data.BASE_URL,
    topP: config.data.TOP_P,
    temperature: config.data.TEMPERATURE,
    maxCompletionTokens: config.data.MAX_TOKENS,
    reasoningEffort: config.data.REASONING_EFFORT,
  };
};