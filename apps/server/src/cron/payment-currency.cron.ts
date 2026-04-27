import cron from "node-cron";
import PaymentModel from "../web/payment/payment-model";
import logger from "../core/logger";

/**
 * Amount → Currency mapping
 */
const INR_AMOUNTS = [
    800, 944, 3000, 2800, 3304, 6000, 10000, 4500, 5310, 49000, 57820, 5000, 11022, 2500, 40020, 22000, 33000
];

const USD_AMOUNTS = [10, 25, 35, 70, 120, 59, 600];

const getCurrencyByAmount = (totalAmount: number): string | null => {
    if (INR_AMOUNTS.includes(Number(totalAmount))) return "INR";
    if (USD_AMOUNTS.includes(Number(totalAmount))) return "USD";
    return null;
};

const updatePaymentCurrency = async () => {
    logger.info("Payment currency cron started");

    try {
        const payments = await PaymentModel.find(
            {
                $or: [{ currency: { $exists: false } }, { currency: "" }],
            },
            { _id: 1, totalAmount: 1, paymentId: 1 }
        ).lean(); // 👈 IMPORTANT

        if (!payments.length) {
            logger.info("No payment records found for currency update");
            return;
        }

        const bulkOps = [];

        for (const payment of payments) {
            const currency = getCurrencyByAmount(payment.totalAmount);

            if (!currency) {
                logger.warn("Unknown amount, skipping", {
                    paymentId: payment.paymentId,
                    totalAmount: payment.totalAmount,
                });
                continue;
            }

            bulkOps.push({
                updateOne: {
                    filter: { _id: payment._id },
                    update: { $set: { currency } },
                },
            });
        }

        if (!bulkOps.length) {
            logger.info("No valid currency updates required");
            return;
        }

        const result = await PaymentModel.bulkWrite(bulkOps);

        logger.info("Payment currency cron completed", {
            matched: result.matchedCount,
            modified: result.modifiedCount,
        });
    } catch (error: any) {
        logger.error("Error in payment currency cron", {
            message: error.message,
            stack: error.stack,
        });
    }
};

/**
 * Runs every 10 seconds (testing)
 */
cron.schedule("*/10 * * * *", updatePaymentCurrency);

export default updatePaymentCurrency;
