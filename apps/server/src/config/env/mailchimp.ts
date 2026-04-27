
import { z } from "zod";
import logger from "../../core/logger";
import { AIConfig } from "../../core/config/ai-config";

const mailchimpSchema = z.object({
    MAILCHIMP_API_KEY: z.string(),
    MAILCHIMP_LIST_ID: z.string(),
});

export const getMailChimpConfig = () => {
    const config = mailchimpSchema.safeParse(process.env);

    if (!config.success) {
        const errorMessages = config.error.errors
            .map((err) => `${err.path.join(".")} - ${err.message}`)
            .join(", ");
        logger.error(`mailchimpSchema config validation error: ${errorMessages}`);
        throw new Error(`mailchimpSchema config validation error: ${errorMessages}`);
    }

    return {
        mailchimpApiKey: config.data.MAILCHIMP_API_KEY,
        mailchimpListId: config.data.MAILCHIMP_LIST_ID
    };
};