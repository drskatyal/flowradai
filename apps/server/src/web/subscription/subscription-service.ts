import logger from "../../core/logger";
import SubscriptionModel from "./subscription-model";
import nodemailer from "nodemailer";
import { getContactUsConfig } from "../../config/env/contact-us";
import userService from "../user/user-service";
import referralService from "../referral/referral-service";

const contactUsConfig = getContactUsConfig();

export class SubscriptionService {
  async createSubscription({
    subscription,
    userId,
    totalAmount,
    basePrice,
    gstRate,
    paymentId,
  }) {
    logger.info("Creating subscription...", { userId, subscription });

    try {
      if (!userId) {
        throw new Error("User ID is required.");
      }

      if (!subscription) {
        throw new Error("Subscription type is required.");
      }

      /**
       * 1. Get latest non-deleted subscription
       */
      const lastSubscription = await SubscriptionModel.findOne({
        userId,
        isDeleted: false,
      }).sort({ endDate: -1 });

      /**
       * 2. Decide start date
       * - If active subscription exists → start after it ends
       * - Else → start now
       */
      const now = new Date();
      let startDate = now;

      if (
        lastSubscription &&
        now <= new Date(lastSubscription.endDate)
      ) {
        startDate = new Date(lastSubscription.endDate);
      }

      /**
       * 3. Calculate end date based on plan
       */
      const endDate = new Date(startDate);

      switch (subscription) {
        case "monthly":
          endDate.setDate(endDate.getDate() + 30);
          break;

        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;

        default:
          throw new Error("Invalid subscription type.");
      }

      /**
       * 4. Save subscription
       */
      const subscriptionPlan = new SubscriptionModel({
        userId,
        planType: subscription,
        startDate,
        endDate,
        isDeleted: false,
      });

      await subscriptionPlan.save();

      /**
       * 5. Send invoice
       */
      const user = await userService.getUserById(userId);

      await this.sendInvoice({
        totalAmount,
        basePrice,
        gstRate,
        paymentId,
        subscription,
        user,
      });

      logger.info("Subscription created successfully", {
        userId,
        planType: subscription,
        startDate,
        endDate,
      });

      return {
        success: true,
        message: "Subscription created successfully.",
      };
    } catch (error: any) {
      logger.error("Error creating subscription", {
        userId,
        error: error.message,
      });

      return {
        success: false,
        message: error.message || "Failed to create subscription.",
      };
    }
  }

  async sendInvoice(params: any) {
    try {
      const transporter = nodemailer.createTransport({
        host: contactUsConfig.smtpHost,
        port: contactUsConfig.smtpPort,
        secure: contactUsConfig.smtpSecure,
        auth: {
          user: contactUsConfig.smtpUser,
          pass: contactUsConfig.smtpPass,
        },
        pool: true,
      });

      const { totalAmount, basePrice, gstRate, subscription, user, paymentId } = params;

      const basePrices = [10, 35, 59, 600];
      const isBasePriceValid = basePrices.includes(Number(basePrice));

      const safeBasePrice = Number(basePrice) || 0;
      const safeTotalAmount = Number(totalAmount) || 0;
      const safeGstRate = Number(gstRate) || 0;

      // Choose currency symbol
      const currencySymbol = isBasePriceValid ? "$" : "₹";

      // Conditionally include GST row
      const gstRow = !isBasePriceValid
        ? `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">GST (${(safeGstRate * 100).toFixed(0)}%)</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${currencySymbol}${(safeBasePrice * safeGstRate).toFixed(2)}</td>
          </tr>
        `
        : "";

      const mailOptions = {
        from: contactUsConfig.smtpUser,
        to: user.email, // send to user
        subject: `Your Invoice - ${subscription} Subscription`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0a2540; color: #ffffff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Flowrad AI - Invoice</h2>
            </div>
            <div style="padding: 20px; background-color: #f8f9fa; color: #333;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${user.firstName + " " + user.lastName}</p>
              <p style="margin: 5px 0;"><strong>Subscription Plan:</strong> ${subscription}</p>
              <p style="margin: 5px 0;"><strong>Payment Id:</strong> ${paymentId}</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">Base Price</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${currencySymbol}${safeBasePrice.toFixed(2)}</td>
                </tr>
                ${gstRow}
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Total Amount</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${currencySymbol}${safeTotalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #0a2540; color: #ffffff; padding: 10px; text-align: center; font-size: 12px;">
              &copy; ${new Date().getFullYear()} FlowRad AI Technologies Pvt Ltd. All rights reserved.
            </div>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      // Log success
      logger.info("Invoice email sent successfully", {
        to: mailOptions.to,
        subscription,
        paymentId,
        isBasePriceValid,
      });

      return info;
    } catch (error) {
      logger.error("Error sending invoice email", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : null,
        params,
      });

      // Optionally rethrow to handle at upper level
      throw new Error("Failed to send invoice email");
    }
  }

  async getSubscriptionById(userId: string) {
    try {
      const subscription = await SubscriptionModel.findOne({ userId });

      if (!subscription) {
        logger.warn(`No subscription found for userId: ${userId}`);
        return null;
      }

      return subscription;
    } catch (error: any) {
      logger.error(`Error fetching subscription for userId: ${userId}`, {
        message: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to fetch subscription");
    }
  }

  async checkActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await SubscriptionModel.findOne({
        userId,
        isDeleted: false
      }).sort({ endDate: -1 }); // get the latest subscription if multiple exist

      const now = new Date();

      // Check regular subscription (including coupon_code)
      if (subscription) {
        const startDate = new Date(subscription.startDate);
        const endDate = new Date(subscription.endDate);
        const isActive = now >= startDate && now <= endDate;

        if (isActive) {
          logger.info(
            `Subscription for user ${userId} | Type: ${subscription.planType
            } | Start: ${startDate.toISOString()} | End: ${endDate.toISOString()} | Active: ${isActive}`
          );
          return true;
        }
      }

      // Check referral rewards (import at top of file)
      // const referralService = require("../referral/referral-service").default;
      const hasActiveReferralPlan = await referralService.hasActiveReferralPlan(userId);

      if (hasActiveReferralPlan) {
        logger.info(`User ${userId} has an active referral plan`);
        return true;
      }

      logger.info(`No active subscription or referral plan found for user: ${userId}`);
      return false;
    } catch (error) {
      logger.error(`Error checking subscription for user ${userId}: ${error}`);
      return false;
    }
  }
}

export default new SubscriptionService();