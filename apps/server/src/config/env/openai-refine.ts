import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

const openaiRefineSchema = z.object({
  API_KEY: z.string().optional(),
  MODEL: z.string(),
  BASE_URL: z.string(),
  TOP_P: z.number().default(1),
  TEMPERATURE: z.number().default(1),
  MAX_TOKEN: z.number(),
});

export const getOpenaiRefineConfig = () => {
  // Read from DB-backed config service
  const dbConfig = aiConfigService.getRefineConfig("openai");
  const configData = {
    ...dbConfig,
    API_KEY: process.env.GROQ_API_KEY,
  };

  const config = openaiRefineSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Openai refine config validation error: ${errorMessages}`);
    throw new Error(`Openai refine config validation error: ${errorMessages}`);
  }

  return {
    apiKey: process.env.GROQ_API_KEY,
    model: config.data.MODEL,
    baseUrl: config.data.BASE_URL,
    topP: config.data.TOP_P,
    temperature: config.data.TEMPERATURE,
    maxToken: config.data.MAX_TOKEN,
  };
};
