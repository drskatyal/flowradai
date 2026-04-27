import { z } from "zod";
import logger from "../../core/logger";
import { AIConfig } from "../../core/config/ai-config";

// Define the schema for OpenAI configuration
const openAiSchema = z.object({
  ASSISTANT_ID: z.string(),
  MODEL: z.string(),
  TOP_P: z.number().default(1),
  TEMPERATURE: z.number().default(1),
  API_KEY: z.string().optional(), // Optional in AIConfig as we'll use env var
});

export const getOpenAiConfig = () => {
  // Merge AIConfig with API_KEY from environment
  const configData = {
    ...AIConfig.OPENAI,
    API_KEY: process.env.OPENAI_API_KEY
  };
  
  const config = openAiSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`OpenAI config validation error: ${errorMessages}`);
    throw new Error(`OpenAI config validation error: ${errorMessages}`);
  }

  return {
    assistantId: config.data.ASSISTANT_ID,
    model: config.data.MODEL,
    topP: config.data.TOP_P,
    temperature: config.data.TEMPERATURE,
    apiKey: process.env.OPENAI_API_KEY, // Use API key from environment variable
  };
};
