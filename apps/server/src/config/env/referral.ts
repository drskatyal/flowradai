import { z } from "zod";
import logger from "../../core/logger";

// Define the schema for referral configuration
const referralSchema = z.object({
  REFERRAL_CREDITS: z.number().or(z.string().transform(Number)),
  REFERRAL_CREDITS_THRESHOLD: z.number().or(z.string().transform(Number)),
});

export const getReferralConfig = () => {
  const config = referralSchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Referral config validation error: ${errorMessages}`);
    throw new Error(`Referral config validation error: ${errorMessages}`);
  }

  return {
    credits: config.data.REFERRAL_CREDITS,
    threshold: config.data.REFERRAL_CREDITS_THRESHOLD,
  };
};
