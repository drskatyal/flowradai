import { clerkClient } from '@clerk/express';
import logger from '../../core/logger';
import { IRazorpayPaymentLink } from '../types';
import userService from '../user/user-service';
import PaymentModel, { IPaymentModel } from './payment-model';
import UserModel from '../user/user-model';
import subscriptionService from '../subscription/subscription-service';
import planService from '../plan/plan-service';

interface PaymentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentType?: string;
  tier?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

type PaymentResult = {
  basePrice: number;
  gstRate: number;
  totalAmount: number;
  gstAmount: number;
};

class PaymentService {
  async createPayment(
    paymentId: string,
    paymentData: IRazorpayPaymentLink
  ): Promise<IPaymentModel> {
    const { status, notes, order_id: orderId, currency } = paymentData;

    const { userId, threadsQuantity, unitPrice, totalAmount, subscription, gstRate, gstAmount } = notes;

    if (!userId || !paymentId || !threadsQuantity) {
      logger.error('Missing required payment information', {
        userId,
        paymentId,
        threadsQuantity,
      });
      throw new Error('Invalid payment information provided');
    }

    // Create new payment record
    let reportQuantity: number;
    if (threadsQuantity === 'unlimited') {
      reportQuantity = 0;
    } else {
      reportQuantity = Number(threadsQuantity);
    }

    const payment = new PaymentModel({
      userId,
      status,
      paymentId,
      threadsQuantity: reportQuantity,
      unitPrice: Number(unitPrice),
      totalAmount: Number(totalAmount),
      gstAmount: Number(gstAmount) || 0,
      orderId,
      paymentType: 'razorpay',
      currency,
    });

    await payment.save();
    logger.info(`Payment created: ${payment.paymentId}`);

    const user = await userService.getUserById(userId);
    const isSubscription = await subscriptionService.checkActiveSubscription(userId);

    // Resolve and persist plan name so it survives plan deletion
    const planName = await planService.getPlanNameByAmount(payment.totalAmount);
    payment.planName = planName;
    await payment.save();

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        payment: {
          paymentId: payment.paymentId,
          paymentCreatedAt: payment.createdAt,
          paymentType: payment.paymentType,
          paymentAmount: payment.totalAmount,
          threadsQuantity: payment.threadsQuantity,
          planName,
          currency,
          ...(isSubscription === false && { planType: subscription })
        },
      },
    });

    return payment;
  }

  async calculatePaymentAmount(planSlug: string, isCurrency: boolean): Promise<PaymentResult> {
    return planService.calculatePaymentAmount(planSlug, isCurrency);
  }

  async getAllPaymentsWithUser(filters: PaymentQueryFilters = {}) {
    try {
      const {
        search = '',
        status,
        paymentType,
        page = 1,
        limit = 10,
        tier,
        startDate,
        endDate,
        userId,
      } = filters;

      logger.debug('Fetching payments with filters', {
        search,
        status,
        paymentType,
        page,
        limit,
        tier,
        startDate,
        endDate,
        userId,
      });

      // Build the base query
      const query: any = {};

      // Add status filter if provided
      if (status) {
        const statusArray = status.includes(',') ? status.split(',') : [status];

        query.status = { $in: statusArray };
      }

      // Add payment type filter if provided
      if (paymentType) {
        query.paymentType = paymentType;
      }

      // Add date range filter if provided
      if (startDate || endDate) {
        query.createdAt = {};

        if (startDate) {
          // Parse date components to create Date in server's local timezone
          const [year, month, day] = startDate.split('-').map(Number);
          const startDateTime = new Date(year, month - 1, day, 0, 0, 0, 0);
          query.createdAt.$gte = startDateTime;

          logger.debug('Start date filter', {
            input: startDate,
            parsed: startDateTime.toISOString(),
            localString: startDateTime.toString()
          });
        }

        if (endDate) {
          // Parse date components to create Date in server's local timezone
          const [year, month, day] = endDate.split('-').map(Number);
          const endDateTime = new Date(year, month - 1, day, 23, 59, 59, 999);
          query.createdAt.$lte = endDateTime;

          logger.debug('End date filter', {
            input: endDate,
            parsed: endDateTime.toISOString(),
            localString: endDateTime.toString()
          });
        }
      }

      // Add tier-based unit price filter (dynamic from DB)
      if (tier) {
        const tierArray = tier.includes(",") ? tier.split(",") : [tier];
        const allPlans = await planService.getAllPlans(true);
        let allTierAmounts: number[] = [];

        tierArray.forEach((slug) => {
          const plan = allPlans.find((p) => p.slug === slug);
          if (plan) {
            const inrTotal = Math.round(plan.inrPrice * (1 + plan.gstPercent / 100));
            allTierAmounts.push(plan.usdPrice, plan.inrPrice, inrTotal);
          }
        });

        if (allTierAmounts.length > 0) {
          query.totalAmount = { $in: [...new Set(allTierAmounts)] };
        }
      }

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // First get the user IDs that match the search criteria
      let userIds = [];

      if (search) {
        const searchParts = search.trim().split(/\s+/); // Split by one or more spaces

        const conditions = searchParts.map((part) => ({
          $or: [
            { firstName: { $regex: part, $options: 'i' } },
            { lastName: { $regex: part, $options: 'i' } },
            { email: { $regex: part, $options: 'i' } },
          ],
        }));

        const users = await UserModel.find({
          $and: conditions, // Ensure all terms match in any field
        }).select('_id');

        userIds = users.map((user) => user._id);
        query.userId = { $in: userIds };
      }

      // Add userId filter if provided directly
      if (userId) {
        query.userId = userId;
      }

      // Get total count for pagination
      const total = await PaymentModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Execute main query with pagination and populate more user details
      const payments = await PaymentModel.find(query)
        .populate({
          path: 'userId',
          model: UserModel,
          select:
            'firstName lastName email role status referralCode availableCredits totalCredits clerkId createdAt',
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      logger.info(`Found ${payments.length} payments`, {
        total,
        page,
        totalPages,
        filters,
      });

      return {
        payments,
        pagination: {
          total,
          pages: totalPages,
          currentPage: page,
          limit,
        },
      };
    } catch (error) {
      logger.error('Error fetching payments:', error);
      throw error;
    }
  }
  async exportPayments(filters: Omit<PaymentQueryFilters, 'page' | 'limit'> = {}) {
    try {
      const {
        search = '',
        status,
        paymentType,
        tier,
        startDate,
        endDate,
      } = filters;

      const query: any = {};

      if (status) {
        const statusArray = status.includes(',') ? status.split(',') : [status];
        query.status = { $in: statusArray };
      }

      if (paymentType) {
        query.paymentType = paymentType;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          const [year, month, day] = startDate.split('-').map(Number);
          query.createdAt.$gte = new Date(year, month - 1, day, 0, 0, 0, 0);
        }
        if (endDate) {
          const [year, month, day] = endDate.split('-').map(Number);
          query.createdAt.$lte = new Date(year, month - 1, day, 23, 59, 59, 999);
        }
      }

      if (tier) {
        const tierArray = tier.includes(",") ? tier.split(",") : [tier];
        const allPlans = await planService.getAllPlans(true);
        let allTierAmounts: number[] = [];
        tierArray.forEach((slug) => {
          const plan = allPlans.find((p) => p.slug === slug);
          if (plan) {
            const inrTotal = Math.round(plan.inrPrice * (1 + plan.gstPercent / 100));
            allTierAmounts.push(plan.usdPrice, plan.inrPrice, inrTotal);
          }
        });
        if (allTierAmounts.length > 0) {
          query.totalAmount = { $in: [...new Set(allTierAmounts)] };
        }
      }

      if (search) {
        const searchParts = search.trim().split(/\s+/);
        const conditions = searchParts.map((part) => ({
          $or: [
            { firstName: { $regex: part, $options: 'i' } },
            { lastName: { $regex: part, $options: 'i' } },
            { email: { $regex: part, $options: 'i' } },
          ],
        }));
        const users = await UserModel.find({ $and: conditions }).select('_id');
        query.userId = { $in: users.map((user) => user._id) };
      }

      const payments = await PaymentModel.find(query)
        .populate({
          path: 'userId',
          model: UserModel,
          select: 'firstName lastName email',
        })
        .sort({ createdAt: -1 });

      return Promise.all(payments.map(async (p) => {
        const user = p.userId as any;
        return {
          userName: user ? `${user.firstName} ${user.lastName}` : 'N/A',
          email: user?.email || 'N/A',
          plan: await this.getPlanTypeString(p.totalAmount, p.planName),
          baseAmount: (p.totalAmount - (p.gstAmount || 0)),
          gstAmount: p.gstAmount || 0,
          totalAmount: p.totalAmount,
          date: p.createdAt,
          transactionId: p.paymentId,
          currency: p.currency,
        };
      }));
    } catch (error) {
      logger.error('Error exporting payments:', error);
      throw error;
    }
  }

  private getPlanTypeString(amount: number, storedPlanName?: string) {
    // Use stored name first — survives plan deletion
    if (storedPlanName) return Promise.resolve(storedPlanName);
    return planService.getPlanNameByAmount(amount);
  }
}

export default new PaymentService();