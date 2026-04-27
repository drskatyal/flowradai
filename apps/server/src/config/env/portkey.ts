import { z } from "zod";
import logger from "../../core/logger";

const portkeySchema = z.object({
  API_KEY: z.string().optional(),
  CONFIG_ID: z.string().optional(),
  WORKSPACE_ID: z.string().optional(),
  AUDIO_API_KEY: z.string().optional(),
  AUDIO_CONFIG_ID: z.string().optional(),
  REFINE_API_KEY: z.string().optional(),
  REFINE_CONFIG_ID: z.string().optional(),
  VALIDATION_API_KEY: z.string().optional(),
  VALIDATION_CONFIG_ID: z.string().optional(),
});

export const getPortkeyConfig = () => {
  const configData = {
    API_KEY: process.env.PORTKEY_API_KEY,
    CONFIG_ID: process.env.PORTKEY_CONFIG_ID,
    WORKSPACE_ID: process.env.PORTKEY_WORKSPACE_ID,
    // AUDIO_API_KEY: process.env.PORTKEY_AUDIO_API_KEY,
    // AUDIO_CONFIG_ID: process.env.PORTKEY_AUDIO_CONFIG_ID,
    REFINE_API_KEY: process.env.PORTKEY_REFINE_API_KEY,
    REFINE_CONFIG_ID: process.env.PORTKEY_REFINE_CONFIG_ID,
    VALIDATION_API_KEY: process.env.PORTKEY_VALIDATION_KEY,
    VALIDATION_CONFIG_ID: process.env.PORTKEY_VALIDATION_CONFIG_ID,
  };

  const config = portkeySchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Portkey config validation error: ${errorMessages}`);
    throw new Error(`Portkey config validation error: ${errorMessages}`);
  }

  return {
    apiKey: config.data.API_KEY,
    configId: config.data.CONFIG_ID,
    workspaceId: config.data.WORKSPACE_ID,
    baseUrl: "https://api.portkey.ai/v1",
    // audio: {
    //   apiKey: config.data.AUDIO_API_KEY,
    //   configId: config.data.AUDIO_CONFIG_ID,
    // },
    refine: {
      apiKey: config.data.REFINE_API_KEY,
      configId: config.data.REFINE_CONFIG_ID
    },
    validation: {
      apiKey: config.data.VALIDATION_API_KEY,
      configId: config.data.VALIDATION_CONFIG_ID
    }
  };
};