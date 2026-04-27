import { getReferralConfig } from "../../config/env";
import logger from "../../core/logger";
import subscriptionService from "../subscription/subscription-service";
import userService from "../user/user-service";
import CreditModel, { ICreditModel } from "./credit-model";

type CreditReason = "purchase" | "referral" | "referral_signup";


interface CreateCreditParams {
  userId: string;
  creditAmount: number;
  reason: CreditReason;
  referredUserId?: string;
  subscription?: string;
  gstRate?: number;
  paymentId?: string;
  totalAmount?: number;
  basePrice?: number;

}

const CREDIT_CONSTANTS = {
  REASONS: {
    PURCHASE: "purchase" as const,
    REFERRAL: "referral" as const,
    REFERRAL_SIGNUP: "referral_signup" as const,
  },
} as const;

class CreditService {
  private async findExistingReferralCredit(
    userId: string,
    referredUserId: string
  ): Promise<ICreditModel | null> {
    logger.info(
      `Checking referral credit history for referrer ${userId} and referred user ${referredUserId}`
    );
    const credit = await CreditModel.findOne({
      userId,
      reason: CREDIT_CONSTANTS.REASONS.REFERRAL,
      referredUserId,
    });
    logger.info(
      `User ${userId} ${credit ? "has" : "does not have"
      } existing referral credits for user ${referredUserId}`
    );
    return credit;
  }

  private async saveCredit(params: CreateCreditParams): Promise<ICreditModel> {
    const credit = new CreditModel(params);

    await userService.updateUserThreads(
      credit.userId,
      Number(credit.creditAmount)
    );

    await credit.save();
    return credit;
  }

  async createCredit(params: CreateCreditParams): Promise<ICreditModel> {
    try {
      logger.info("Creating credit with params:", params);

      // For referral_signup, we don't need to check for existing credits or subscriptions
      if (params.reason === CREDIT_CONSTANTS.REASONS.REFERRAL_SIGNUP) {
        logger.info(`Creating referral signup credit for user ${params.userId}`);
        return await this.saveCredit(params);
      }

      // For regular referral credits, check for duplicates
      if (
        params.reason === CREDIT_CONSTANTS.REASONS.REFERRAL &&
        params.referredUserId
      ) {
        const existingCredit = await this.findExistingReferralCredit(
          params.userId,
          params.referredUserId
        );

        if (existingCredit) {
          logger.warn(
            `Referral credit already exists for user ${params.userId} and referred user ${params.referredUserId}`
          );
          throw new Error(
            "Referral credit already exists for this referred user."
          );
        }
      }

      const credit = await this.saveCredit(params);
      logger.info("Credit record created successfully", {
        credit,
      });

      const user = await userService.getUserById(params.userId);

      subscriptionService.sendInvoice({
        totalAmount: params.totalAmount,
        basePrice: params.basePrice,
        gstRate: params.gstRate,
        subscription: params.subscription,
        user: user,
        paymentId: params.paymentId,
      })
      return credit;
    } catch (error) {
      logger.error("Credit creation failed", {
        error,
        ...params,
      });
      throw error;
    }
  }

  async addReferralCredits(
    referredBy: string,
    totalCredits: number,
    referredUserId: string
  ): Promise<void> {
    try {
      logger.info(
        `Starting referral credit process for referrer ${referredBy}, referred user ${referredUserId}`
      );
      logger.info(`New user purchased ${totalCredits} threads`);

      const { credits, threshold } = getReferralConfig();

      logger.info(
        `Referral config: ${credits} credits for purchases over ${threshold} threads`
      );

      const existingReferralCredit = await this.findExistingReferralCredit(
        referredBy,
        referredUserId
      );

      if (!existingReferralCredit && totalCredits >= threshold) {
        logger.info(`Adding ${credits} referral credits to user ${referredBy}`);
        await this.processReferralCredits(referredBy, credits, referredUserId);

        logger.info(
          `Successfully added referral credits to user ${referredBy}`
        );
      } else {
        logger.info(
          `User ${referredBy} not eligible for referral credits. Purchase: ${totalCredits}, Threshold: ${threshold}, Existing credit: ${!!existingReferralCredit}`
        );
      }
    } catch (error) {
      logger.error(
        `Failed to process referral credits for user ${referredBy}. Error: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  private async processReferralCredits(
    userId: string,
    credits: number,
    referredUserId: string
  ): Promise<void> {
    logger.info("Processing referral credits", {
      referrerId: userId,
      referredUserId,
      credits,
    });

    await this.createCredit({
      userId,
      creditAmount: credits,
      reason: CREDIT_CONSTANTS.REASONS.REFERRAL,
      referredUserId,
    });
  }

  async getCreditsByUserId(userId: string): Promise<ICreditModel[]> {
    try {
      return await CreditModel.find({ userId });
    } catch (error) {
      logger.error("Failed to fetch credits", { error, userId });
      throw error;
    }
  }
}

export default new CreditService();
