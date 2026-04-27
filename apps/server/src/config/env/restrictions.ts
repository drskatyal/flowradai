import { z } from "zod";
import logger from "../../core/logger";
import { PricingConfig } from "../../core/config/pricing-config";

const restrictionsSchema = z.object({
  MAX_TOKENS_PER_MESSAGE: z
    .number()
    .default(2000)
    .or(z.string().transform(Number)),
  MAX_ALLOWED_MESSAGES_IN_REPORT: z.number().or(z.string().transform(Number)),
  FREE_REPORTS: z.number().or(z.string().transform(Number)),
});

export const getRestrictionsConfig = () => {
  const config = restrictionsSchema.safeParse({...PricingConfig});

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Restrictions config validation error: ${errorMessages}`);
    throw new Error(`Restrictions config validation error: ${errorMessages}`);
  }

  return {
    maxTokensPerMessage: config.data.MAX_TOKENS_PER_MESSAGE,
    maxAllowedMessages: config.data.MAX_ALLOWED_MESSAGES_IN_REPORT,
    freeReports: config.data.FREE_REPORTS,
  };
};
