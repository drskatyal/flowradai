import { z } from "zod";
import logger from "../../core/logger";

const portkeySchema = z.object({
  API_KEY: z.string().optional(),
  CONFIG_ID: z.string().optional(),
});

export const getPortkeyValidationConfig = () => {
  const configData = {
    API_KEY: process.env.PORTKEY_VALIDATION_KEY,
    CONFIG_ID: process.env.PORTKEY_VALIDATION_CONFIG_ID,
  };

  const config = portkeySchema.safeParse(configData);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Portkey Validation config error: ${errorMessages}`);
    throw new Error(`Portkey Validation config error: ${errorMessages}`);
  }
  return {
    apiKey: config.data.API_KEY,
    configId: config.data.CONFIG_ID,
    baseUrl: "https://api.portkey.ai/v1",
  };
};
