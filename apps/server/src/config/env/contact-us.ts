import { z } from "zod";
import logger from "../../core/logger";

// Define the schema for GoDaddy SMTP configuration
const contactUsSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_SECURE: z.string().min(1), // "true" or "false"
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  CONTACT_RECEIVER_EMAIL: z.string().email().optional(),
});

export const getContactUsConfig = () => {
  const config = contactUsSchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`ContactUs config validation error: ${errorMessages}`);
    throw new Error(`ContactUs config validation error: ${errorMessages}`);
  }

  return {
    smtpHost: config.data.SMTP_HOST,
    smtpPort: parseInt(config.data.SMTP_PORT, 10),
    smtpSecure: config.data.SMTP_SECURE === "true",
    smtpUser: config.data.SMTP_USER,
    smtpPass: config.data.SMTP_PASS,
    receiverEmail: config.data.CONTACT_RECEIVER_EMAIL || config.data.SMTP_USER,
  };
};
