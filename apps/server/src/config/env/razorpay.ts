import { z } from "zod";
import logger from "../../core/logger";

// Define the schema for razorpay configuration
const razorpaySchema = z.object({
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
});

export const getRazorpayConfig = () => {
  const config = razorpaySchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Razorpay config validation error: ${errorMessages}`);
    throw new Error(`Razorpay config validation error: ${errorMessages}`);
  }

  return {
    keyId: config.data.RAZORPAY_KEY_ID,
    keySecret: config.data.RAZORPAY_KEY_SECRET,
  };
};
