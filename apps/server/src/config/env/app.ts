import { z } from "zod";
import logger from "../../core/logger";

// Define the schema for app configuration
const appSchema = z.object({
  HOST: z.string(),
  PORT: z.number().or(z.string().transform(Number)),
  CLIENT_URL: z.string().url(),
  APP_ENV: z.string().default('development'),
});

export const getAppConfig = () => {
  const config = appSchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`App config validation error: ${errorMessages}`);
    throw new Error(`App config validation error: ${errorMessages}`);
  }

  return {
    host: config.data.HOST,
    port: config.data.PORT,
    clientUrl: config.data.CLIENT_URL,
    env: config.data.APP_ENV,
  };
};
