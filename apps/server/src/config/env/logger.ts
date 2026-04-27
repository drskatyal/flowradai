import { z } from "zod";

// Define the schema for logger configuration
const loggerSchema = z.object({
  LOGGER_LEVEL: z
    .enum(["error", "warn", "info", "verbose", "debug", "silly"])
    .default("info"),
  LOGGER_ENABLED: z
    .boolean()
    .or(z.string().transform((val) => val === "true"))
    .default(true),
});

// Export the validated logger configuration
export const getLoggerConfig = () => {
  const config = loggerSchema.safeParse(process.env);

  if (!config.success) {
    throw new Error(`Logger config validation error: ${config.error.format()}`);
  }

  return {
    level: config.data.LOGGER_LEVEL,
    enabled: config.data.LOGGER_ENABLED,
  };
};
