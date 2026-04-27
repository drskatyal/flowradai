// src/cron/payment-gst-sync.cron.ts

import cron from "node-cron";
import PaymentModel, { IPaymentModel } from "../web/payment/payment-model";
import logger from "../core/logger";

/**
 * ------------------------------------------------------
 * GST Configuration
 * ------------------------------------------------------
 */
const GST_PERCENTAGE = 18;

// GST is applicable ONLY for these total amounts
const GST_ALLOWED_AMOUNTS = [944, 3304, 5310, 57820];

/**
 * ------------------------------------------------------
 * GST calculation when totalAmount INCLUDES GST
 * Formula: total * 18 / 118
 * ------------------------------------------------------
 */
const calculateGSTInclusive = (totalAmount: number): number => {
    return Math.round(
        (totalAmount * GST_PERCENTAGE) / (100 + GST_PERCENTAGE)
    );
};

/**
 * ------------------------------------------------------
 * Sync GST for a single payment
 * ------------------------------------------------------
 */
const syncGSTAmount = async (payment: IPaymentModel) => {
    let newGSTAmount = 0;

    // GST only for allowed INR amounts
    if (
        payment.currency === "INR" &&
        GST_ALLOWED_AMOUNTS.includes(payment.totalAmount)
    ) {
        newGSTAmount = calculateGSTInclusive(payment.totalAmount);
    }

    // Idempotent check (also handles undefined → 0)
    if ((payment.gstAmount ?? 0) === newGSTAmount) {
        return;
    }

    logger.info("Updating GST amount", {
        paymentId: payment.paymentId,
        totalAmount: payment.totalAmount,
        oldGST: payment.gstAmount,
        newGST: newGSTAmount,
    });

    // Force set gstAmount even if field did not exist
    payment.gstAmount = newGSTAmount;
    payment.markModified("gstAmount");

    await payment.save();
};

/**
 * ------------------------------------------------------
 * Cron Job Scheduler
 * Runs every 10 minutes
 * ------------------------------------------------------
 */
export const schedulePaymentGSTSyncJob = (): void => {
    cron.schedule("*/10 * * * *", async () => {
        logger.info("Payment GST sync cron started");

        try {
            const payments = await PaymentModel.find({
                status: "paid",
            });

            logger.info(`Found ${payments.length} paid payments`);

            for (const payment of payments) {
                await syncGSTAmount(payment);
            }

            logger.info("Payment GST sync cron completed successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error("Payment GST sync cron failed", {
                    error: error.message,
                });
            } else {
                logger.error("Unknown error in payment GST sync cron");
            }
        }
    });
};
