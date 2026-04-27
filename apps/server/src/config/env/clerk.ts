import { z } from "zod";
import logger from "../../core/logger";

// Define the schema for Clerk configuration
const clerkSchema = z.object({
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_JWT_KEY: z.string(),
});

export const getClerkConfig = () => {
  const config = clerkSchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Clerk config validation error: ${errorMessages}`);
    throw new Error(`Clerk config validation error: ${errorMessages}`);
  }

  return {
    secretKey: config.data.CLERK_SECRET_KEY,
    publicKey: config.data.CLERK_PUBLISHABLE_KEY,
    jwtKey: config.data.CLERK_JWT_KEY,
  };
};
