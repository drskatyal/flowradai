import { scheduleSubscriptionExpiryJob } from "./subscription-expiry.cron";
import { schedulePaymentGSTSyncJob } from "./gst-update.cron";
import updatePaymentCurrency from "./payment-currency.cron";
import { scheduleReferralExpiryJob } from "./referral-expiry.cron";
import logger from "../core/logger";


/**
 * Initialize all cron jobs in the application.
 */
export const initializeCronJobs = (): void => {
    logger.info("Initializing cron jobs...");

    scheduleSubscriptionExpiryJob();
    scheduleReferralExpiryJob();
    // schedulePaymentGSTSyncJob();
    // updatePaymentCurrency();

    // Add more jobs here if needed later
};