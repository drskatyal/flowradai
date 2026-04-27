import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

const geminiTranscriptionAiSchema = z.object({
  MODEL: z.string(),
  TEMPERATURE: z.number().default(1),
  API_KEY: z.string().optional(),
  MAX_OUTPUT_TOKEN: z.number().default(2048),
});

export const getGeminiTranscriptionConfig = () => {
  // Read from DB-backed config service
  const dbConfig = aiConfigService.getGeminiTranscriptionConfig();
  const configData = {
    ...dbConfig,
    API_KEY: process.env.GEMINI_API_KEY
  };
  
  const config = geminiTranscriptionAiSchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`GeminiAI Transcription config validation error: ${errorMessages}`);
    throw new Error(`GeminiAI Transcription config validation error: ${errorMessages}`);
  }

  return {
    model: config.data.MODEL,
    temperature: config.data.TEMPERATURE,
    apiKey: config.data.API_KEY,
    maxOutputToken: config.data.MAX_OUTPUT_TOKEN
  };
};
