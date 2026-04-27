import { z } from "zod";
import logger from "../../core/logger";
import { PaymentConfig } from "../../core/config/payment-config";

const paymentSchema = z.object({
  PAYMENT_CURRENCY: z.enum(["INR", "USD"]),
  INR_PAYMENT_CURRENCY: z.enum(["INR"]),
  GST_AMMOUNT: z.number().transform(Number),
});

export const getPaymentConfig = () => {
  const config = paymentSchema.safeParse({ ...PaymentConfig });

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Payment config validation error: ${errorMessages}`);
    throw new Error(`Payment config validation error: ${errorMessages}`);
  }

  return {
    currency: config.data.PAYMENT_CURRENCY,
    inrCurrency: config.data.INR_PAYMENT_CURRENCY,
    gstAmmount: config.data.GST_AMMOUNT,
  };
};
