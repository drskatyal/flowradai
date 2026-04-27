import { NextFunction, Request, Response } from "express";
import Razorpay from "razorpay";
import {
  getAppConfig,
  getPaymentConfig,
  getRazorpayConfig,
} from "../../config/env";
import logger from "../../core/logger";
import creditService from "../credit/credit-service";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import userService from "../user/user-service";
import paymentService from "./payment-service";
import subscriptionService from "../subscription/subscription-service";
import ThreadModel from "../thread/thread-model";
import CreditModel from "../credit/credit-model";
import SubscriptionModel from "../subscription/subscription-model";
import ReferralRewardModel from "../referral/referral-reward.model";
import PaymentModel from "./payment-model";
import planService from "../plan/plan-service";

const { keyId, keySecret } = getRazorpayConfig();
const { currency, inrCurrency } = getPaymentConfig();
const { clientUrl } = getAppConfig();

const instance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// --------------------
// Helpers
// --------------------
const buildNotes = ({
  userId,
  threads,
  unitPrice,
  totalAmount,
  basePrice,
  gstRate,
  subscription,
  referredBy,
  gstAmount,
}: any): Record<string, string> => {
  const notes: Record<string, string> = {
    userId: String(userId),
    threadsQuantity: String(threads),
    unitPrice: String(unitPrice),
    totalAmount: String(totalAmount),
    basePrice: String(basePrice),
    gstRate: String(gstRate),
    subscription: String(subscription),
    gstAmount: String(gstAmount),
  };

  if (referredBy) {
    notes.referredBy = String(referredBy);
  }

  return notes;
};

class PaymentController {
  // --------------------
  // CREATE PAYMENT LINK
  // --------------------
  async createPaymentLink(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    const { name, email, referredBy, isCurrency, planSlug } = req.body;
    const userId = req.auth().sessionClaims.internalId;

    if (!planSlug) {
      return res.status(400).json({ message: "Please select a plan" });
    }

    if (!name || !email) {
      return res.status(400).json({
        message: "Please provide both name and email for the payment",
      });
    }

    try {
      // Load plan from DB
      const plan = await planService.getPlanBySlug(planSlug);
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }

      const isUnlimited = plan.threadsQuantity === 0;
      const threads = isUnlimited ? "unlimited" : plan.threadsQuantity;
      const subscription = plan.subscriptionType;

      const { totalAmount, basePrice, gstRate, gstAmount } =
        await paymentService.calculatePaymentAmount(planSlug, isCurrency);

      const unitPrice = isUnlimited ? 0 : totalAmount / (plan.threadsQuantity as number);

      const notes = buildNotes({
        userId,
        threads,
        unitPrice,
        totalAmount,
        basePrice,
        gstRate,
        subscription,
        referredBy,
        gstAmount,
      });

      const payload = {
        amount: Math.round(totalAmount * 100), // paise
        currency: isCurrency ? inrCurrency : currency,
        customer: { name, email },
        notify: { sms: true, email: true },
        reminder_enable: true,
        callback_url: `${clientUrl}/pricing/success`,
        notes,
      };

      const paymentLink = await instance.paymentLink.create(payload);

      logger.info("Payment link created successfully", {
        userId,
        planSlug,
        amount: totalAmount,
        subscription,
      });

      return res.status(200).json(paymentLink.short_url);
    } catch (error: any) {
      logger.error("Failed to create payment link", {
        error: error?.message || error,
        stack: error?.stack,
        userId,
        planSlug,
      });
      return res.status(500).json({
        message: "We couldn't create your payment link at this time. Please try again later.",
        detail: process.env.NODE_ENV !== "production" ? error?.message : undefined,
      });
    }
  }

  // --------------------
  // RAZORPAY WEBHOOK
  // --------------------
  async handleRazorpayEvent(req: Request, res: Response) {
    try {
      const { body } = req;
      const { event } = body;

      const notes = body?.payload?.payment_link?.entity?.notes;

      if (!notes) {
        logger.error("Invalid webhook payload received", { body });
        return res.status(400).json({ message: "Invalid webhook payload" });
      }

      const {
        userId,
        threadsQuantity,
        referredBy,
        subscription,
        totalAmount,
        basePrice,
        gstRate,
        gstAmount
      } = notes;

      if (!userId || !threadsQuantity) {
        logger.error("Missing required payment information", notes);
        return res.status(400).json({ message: "Missing payment information" });
      }

      switch (event) {
        case "payment_link.paid": {
          const paymentId = body.payload.payment.entity.id;
          const isUnlimited = threadsQuantity === "unlimited";
          const threads = isUnlimited ? null : Number(threadsQuantity);

          const user = await userService.getUserById(userId);
          if (!user) {
            logger.error("User not found", { userId });
            return res.status(404).json({ message: "User not found" });
          }

          // Save payment record
          await paymentService.createPayment(
            paymentId,
            body.payload.payment_link.entity
          );

          // Credits (only for limited plans)
          if (!isUnlimited && threads) {
            await creditService.createCredit({
              subscription,
              userId,
              totalAmount: Number(totalAmount),
              basePrice: Number(basePrice),
              gstRate: Number(gstRate),
              paymentId,
              creditAmount: threads,
              reason: "purchase",
            });
          }

          // Subscription (only for unlimited)
          if (isUnlimited) {
            await subscriptionService.createSubscription({
              subscription,
              userId,
              totalAmount: Number(totalAmount),
              basePrice: Number(basePrice),
              gstRate: Number(gstRate),
              paymentId,
            });
          }

          // Referral credits
          if (referredBy && !isUnlimited && threads) {
            await creditService.addReferralCredits(
              referredBy,
              threads,
              userId
            );
          }

          logger.info("Payment processed successfully", {
            paymentId,
            userId,
            threads: threadsQuantity,
          });
          break;
        }

        default:
          logger.warn("Unhandled webhook event", { event });
      }

      return res.status(200).json({ status: "success", event });
    } catch (error: any) {
      logger.error("Error processing Razorpay webhook", {
        error: error.message,
      });
      return res.status(500).json({
        status: "error",
        message: "Failed to process payment notification.",
      });
    }
  }

  // --------------------
  // GET PAYMENTS
  // --------------------
  async getAllPayments(req: Request, res: Response) {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as "paid" | "pending" | "failed",
        paymentType: req.query.paymentType as string,
        tier: req.query.tier as "basic" | "standard" | "pro" | "premier",
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await paymentService.getAllPaymentsWithUser(filters);

      return res.status(200).json({
        success: true,
        data: {
          payments: result.payments,
          pagination: result.pagination,
        },
      });
    } catch (error: any) {
      logger.error(`Error fetching payments: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }
  // --------------------
  // EXPORT PAYMENTS
  // --------------------
  async exportPayments(req: Request, res: Response) {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        paymentType: req.query.paymentType as string,
        tier: req.query.tier as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const data = await paymentService.exportPayments(filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error(`Error exporting payments: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }

  // --------------------
  // GET USER PAYMENTS
  // --------------------
  async getUserPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const filters = {
        search: req.query.search as string,
        status: req.query.status as "paid" | "pending" | "failed",
        paymentType: req.query.paymentType as string,
        tier: req.query.tier as "basic" | "standard" | "pro" | "premier",
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        userId: userId
      };

      const result = await paymentService.getAllPaymentsWithUser(filters);

      return res.status(200).json({
        success: true,
        data: {
          payments: result.payments,
          pagination: result.pagination,
        },
      });
    } catch (error: any) {
      logger.error(`Error fetching user payments: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }

  // --------------------
  // GET BILLING & USAGE HISTORY
  // --------------------
  async getBillingHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const {
        page = "1",
        limit = "10",
        search = "",
        activityFilter = "all",
        planFilter = "all"
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // 1. Fetch all relevant data concurrently (needed for accurate balance calculation)
      const [credits, threads, subscriptions, referralRewards, payments] = await Promise.all([
        CreditModel.find({ userId }).sort({ createdAt: 1 }),
        ThreadModel.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: 1 }),
        SubscriptionModel.find({ userId, isDeleted: { $ne: true } }).sort({ endDate: -1 }),
        ReferralRewardModel.find({ referrerId: userId, status: "active" }).sort({ expiryDate: -1 }),
        PaymentModel.find({ userId, status: "paid" }).sort({ createdAt: 1 }),
      ]);

      // 2. Prepare unified history list
      let history: any[] = [];

      // Add credit additions (purchases/referral rewards)
      credits.forEach((c) => {
        history.push({
          id: c._id,
          date: c.createdAt,
          type: "addition",
          description: c.reason === "purchase" ? `Credits Purchased - ${c.creditAmount} Credits Pack` :
            c.reason === "referral_signup" ? "Referral Signup Bonus" : "Referral Reward",
          impact: c.creditAmount,
          raw: c,
        });
      });

      // Add unlimited plan purchases from payment records (where threadsQuantity = 0)
      payments.forEach((p) => {
        if (p.threadsQuantity === 0) {
          history.push({
            id: p._id,
            date: p.createdAt,
            type: "unlimited_purchase",
            description: "Credits Purchased - unlimited Credits Pack",
            impact: 0,
            isUnlimited: true,
            raw: p,
          });
        }
      });

      // Add unlimited plan purchases (subscriptions)
      subscriptions.forEach((s) => {
        const planTypeLabel = s.planType === 'monthly' ? 'Monthly' :
          s.planType === 'quarterly' ? 'Quarterly' :
            s.planType === 'yearly' ? 'Yearly' :
              s.planType === 'referral' ? 'Referral Reward' : 'Regular';

        history.push({
          id: s._id,
          date: s.createdAt,
          type: "subscription",
          description: `Unlimited Plan Purchase - ${planTypeLabel}`,
          impact: 0,
          isUnlimited: true,
          raw: s,
        });
      });

      // Add deductions (report generated) with report names
      threads.forEach((t) => {
        const reportDate = new Date(t.createdAt);
        const isUnlimited = subscriptions.some(s =>
          reportDate >= new Date(s.startDate) && reportDate <= new Date(s.endDate)
        ) || referralRewards.some(r =>
          r.activationDate && r.expiryDate &&
          reportDate >= new Date(r.activationDate) && reportDate <= new Date(r.expiryDate)
        );

        // Use thread name if available, otherwise use generic description
        const reportName = t.name || "Untitled Report";
        const description = isUnlimited
          ? `Report Generated: ${reportName} (Unlimited Plan)`
          : `Report Generated: ${reportName}`;

        history.push({
          id: t._id,
          date: t.createdAt,
          type: "deduction",
          description,
          impact: isUnlimited ? 0 : -1,
          isUnlimited,
          raw: t,
        });
      });

      // Sort history chronologically to calculate running balance accurately
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let runningBalance = 0;
      let processedHistory = history.map((item) => {
        runningBalance += item.impact;
        return {
          ...item,
          balanceAfter: runningBalance,
          planMode: item.isUnlimited ? "Unlimited" : "Credit Plan",
        };
      });

      // 3. Apply Filters Server-Side
      if (search) {
        processedHistory = processedHistory.filter(item =>
          item.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (activityFilter === "purchases") {
        processedHistory = processedHistory.filter(item =>
          item.type === "addition" || item.type === "subscription" || item.type === "unlimited_purchase"
        );
      } else if (activityFilter === "usage") {
        processedHistory = processedHistory.filter(item => item.type === "deduction");
      }

      if (planFilter === "unlimited") {
        processedHistory = processedHistory.filter(item => item.planMode === "Unlimited");
      } else if (planFilter === "credit") {
        processedHistory = processedHistory.filter(item => item.planMode === "Credit Plan");
      }

      // Latest first for display
      processedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 4. Pagination
      const total = processedHistory.length;
      const pages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedHistory = processedHistory.slice(startIndex, startIndex + limitNum);

      // 5. Prepare Stats (always calculated from full data)
      const totalPurchased = credits.reduce((sum, c) => sum + (c.creditAmount || 0), 0);
      const totalUsed = threads.reduce((sum, t) => {
        const reportDate = new Date(t.createdAt);
        const isUnlimited = subscriptions.some(s =>
          reportDate >= new Date(s.startDate) && reportDate <= new Date(s.endDate)
        ) || referralRewards.some(r =>
          r.activationDate && r.expiryDate &&
          reportDate >= new Date(r.activationDate) && reportDate <= new Date(r.expiryDate)
        );
        return sum + (isUnlimited ? 0 : 1);
      }, 0);

      const availableBalance = totalPurchased - totalUsed;

      const now = new Date();
      const activeSub = subscriptions.find(s => now >= new Date(s.startDate) && now <= new Date(s.endDate));
      const activeRef = referralRewards.find(r => r.activationDate && r.expiryDate && now >= new Date(r.activationDate) && now <= new Date(r.expiryDate));
      const currentPlan = (activeSub || activeRef) ? "Unlimited" : "Credit Plan";

      // Calculate total duration including queued subscriptions
      let unlimitedPlanData = null;
      if (activeSub || activeRef) {
        // Get all future subscriptions (including current active one)
        const allFutureSubscriptions = subscriptions.filter(s => new Date(s.endDate) >= now);

        if (allFutureSubscriptions.length > 0) {
          // Find earliest start date and latest end date
          const earliestStart = allFutureSubscriptions.reduce((earliest, sub) => {
            const subStart = new Date(sub.startDate);
            return subStart < earliest ? subStart : earliest;
          }, new Date(allFutureSubscriptions[0].startDate));

          const latestEnd = allFutureSubscriptions.reduce((latest, sub) => {
            const subEnd = new Date(sub.endDate);
            return subEnd > latest ? subEnd : latest;
          }, new Date(allFutureSubscriptions[0].endDate));

          // Determine plan type (prioritize paid plans over coupon_code)
          const paidPlan = allFutureSubscriptions.find(s => ['monthly', 'yearly', 'quarterly'].includes(s.planType));
          const planType = paidPlan ? paidPlan.planType : allFutureSubscriptions[0].planType;

          unlimitedPlanData = {
            type: planType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            expiry: latestEnd,
            startDate: earliestStart,
          };
        } else if (activeRef) {
          unlimitedPlanData = {
            type: "Referral",
            expiry: activeRef.expiryDate,
            startDate: activeRef.activationDate,
          };
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          history: paginatedHistory,
          pagination: {
            total,
            pages,
            currentPage: pageNum,
            limit: limitNum,
          },
          stats: {
            totalPurchased,
            totalUsed,
            availableBalance,
            currentPlan,
          },
          unlimitedPlan: unlimitedPlanData,
        },
      });
    } catch (error: any) {
      logger.error("Error fetching billing history:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new PaymentController();