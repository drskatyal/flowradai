import { first } from "lodash";
import { clerkClient } from "@clerk/express";
import logger from "../../core/logger";
import UserModel, { IUserModel } from "./user-model";
import referralService from "../referral/referral-service";
import creditService from "../credit/credit-service";
import CreditModel from "../credit/credit-model";
import SubscriptionModel from "../subscription/subscription-model";
import ThreadModel from "../thread/thread-model";
import couponCodeService from "../coupon-code/coupon-code-service";
import mailchimpService from "../mailchimp/mailchimp-service";

interface UserQueryFilters {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class UserService {
  // Helper method to generate random alphanumeric code
  private generateRandomCode(): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Helper method to generate unique referral code
  private async generateUniqueReferralCode(): Promise<string> {
    logger.debug("Generating unique referral code");
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      code = this.generateRandomCode();
      logger.debug(`Attempt ${attempts + 1}: Generated code ${code}`);

      const existingUser = await UserModel.findOne({ referralCode: code });
      if (!existingUser) {
        logger.debug(`Generated unique referral code: ${code}`);
        return code;
      }
      attempts++;
    }

    const fallbackCode = `${this.generateRandomCode()}${Date.now()
      .toString()
      .slice(-2)}`;
    logger.debug(
      `Using fallback code after ${maxAttempts} attempts: ${fallbackCode}`
    );
    return fallbackCode;
  }

  async createOrUpdateUserByClerkId(
    userData: any,
    referralCode?: string,
    couponCode?: string
  ): Promise<IUserModel> {
    logger.info("Creating or updating user by ClerkId", {
      userData,
      clerkId: userData.id,
      referralCode,
      couponCode,
    });
    const clerkId = userData.id;
    // Handle both snake_case (webhook) and camelCase (API Client) formats
    const emailAddresses = userData.email_addresses || userData.emailAddresses;
    const email =
      emailAddresses?.[0]?.email_address || emailAddresses?.[0]?.emailAddress;

    if (!email) {
      logger.error("No email found for user", { clerkId });
      // You might want to throw or return here if email is critical
    }

    const users = await UserModel.find({ clerkId });
    let user = first(users);

    if (user) {
      logger.debug("Updating existing user", { userId: user.id });
      // Update existing user
      user.email = email;
      user.firstName = userData.first_name || user.firstName;
      user.lastName = userData.last_name || user.lastName;
      user = await user.save();
      logger.info(`User updated: ${user.id}`);

      if (referralCode) {
        await referralService.processSignupReward(user.id, referralCode);
      }

      if (couponCode) {
        try {
          await couponCodeService.applyCouponCode(user.id, couponCode);
          logger.info(
            `Coupon code ${couponCode} applied for existing user ${user.id}`
          );
        } catch (error: any) {
          logger.error(
            `Error applying coupon code for existing user: ${error.message}`
          );
        }
      }
    } else {
      logger.debug("Creating new user", { clerkId, email, referralCode });
      // Generate unique referral code for new user
      const userReferralCode = await this.generateUniqueReferralCode();
      // Create new user
      user = new UserModel({
        clerkId,
        email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        referralCode: userReferralCode,
      });
      user = await user.save();
      logger.info(`User created: ${user.id}`);

      if (user.totalCredits === 20 && user.availableCredits === 20) {
        await CreditModel.create({
          userId: user.id,
          creditAmount: 20,
          reason: "purchase",
        });
      }

      await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          internalId: user.id,
          thread: {
            totalCredits: user.totalCredits,
            availableCredits: user.availableCredits,
          },
          user: {
            status: user.status,
            referralCode: userReferralCode,
            role: user.role,
            specialityId: user.specialityId,
          },
        },
      });

      // Process referral if provided
      if (referralCode) {
        await referralService.processSignupReward(user.id, referralCode);
      }

      // Process coupon if provided
      if (couponCode) {
        try {
          await couponCodeService.applyCouponCode(user.id, couponCode);
          logger.info(
            `Coupon code ${couponCode} applied for new user ${user.id}`
          );
        } catch (error: any) {
          logger.error(
            `Error applying coupon code for new user: ${error.message}`
          );
        }
      }
      await mailchimpService.addOrUpdateUser({
        email,
        firstName: userData.first_name,
        lastName: userData.last_name,
      });
    }

    return user;
  }

  async updateUserThreads(
    userId: string,
    threadsToAdd: number
  ): Promise<IUserModel | null> {
    const user = await UserModel.findById(userId);

    if (!user) {
      logger.warn("Thread update failed - User not found", { userId });
      return null;
    }

    const previousBalance = user.availableCredits;
    const previousTotal = user.totalCredits;

    // Ensure we're working with numbers
    user.availableCredits = Number(previousBalance) + threadsToAdd;
    user.totalCredits = Number(previousTotal) + threadsToAdd;

    const updatedUser = await user.save();

    // Update Clerk metadata
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        thread: {
          totalCredits: user.totalCredits,
          availableCredits: user.availableCredits,
        },
      },
    });

    logger.info("Thread balance updated", {
      userId,
      previousBalance,
      newBalance: user.availableCredits,
      threadsAdded: threadsToAdd,
    });

    return user;
  }

  async decrementThreadBalance(userId: string): Promise<IUserModel | null> {
    const user = await UserModel.findById(userId);

    if (!user) {
      logger.warn(`User not found for thread balance update: ${userId}`);
      return null;
    }

    if (user.availableCredits <= 0) {
      logger.warn(`Insufficient thread balance for user: ${userId}`);
      return null;
    }

    // Decrease thread balance by 1
    user.availableCredits -= 1;

    await user.save();

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        thread: {
          totalCredits: user.totalCredits,
          availableCredits: user.availableCredits,
        },
      },
    });

    logger.info(
      `Decremented thread balance for user ${userId}: availableCredits=${user.availableCredits}`
    );

    return user;
  }

  async softDeleteUser(
    payload: Partial<Pick<IUserModel, "id" | "clerkId">>
  ): Promise<IUserModel | null> {
    const users = await UserModel.find(payload);

    let user = first(users);

    if (user) {
      await user.delete(); // Soft delete
      logger.info(`User soft deleted: ${user.id}`);
      return user;
    } else {
      logger.warn(
        `User not found for deletion: ${payload?.id || payload.clerkId}`,
        payload
      );
      return null;
    }
  }

  async getUserById(userId: string): Promise<IUserModel | null> {
    return await UserModel.findById(userId);
  }

  async updateUser(
    userId: string,
    updateUserPayload: Partial<IUserModel>
  ): Promise<IUserModel | null> {
    logger.info("Updating user", { userId, updateUserPayload });
    const user = await UserModel.findById(userId);

    if (!user) {
      logger.warn(`User not found for update: ${userId}`);
      return null;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        status: updateUserPayload.status,
        availableCredits: updateUserPayload.availableCredits,
        totalCredits: updateUserPayload.totalCredits,
        referralCode: user.referralCode,
        specialityId: updateUserPayload.specialityId,
        autoTemplate: updateUserPayload.autoTemplate,
        actionMode: updateUserPayload.actionMode,
        defaultTranscriptionModel: updateUserPayload.defaultTranscriptionModel,
        isErrorCheck: updateUserPayload.isErrorCheck,
        isReportGuideline: updateUserPayload.isReportGuideline,
        reportEmail: updateUserPayload.reportEmail,
        isTextAutoCorrection: updateUserPayload.isTextAutoCorrection,
        voiceCommandsEnabled: updateUserPayload.voiceCommandsEnabled,
      },
      { new: true }
    );

    if (updatedUser) {
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          user: {
            status: updatedUser.status,
            referralCode: updatedUser.referralCode,
            role: updatedUser.role,
            specialityId: updatedUser.specialityId,
          },
        },
      });
    }

    return updatedUser;
  }

  async updateUserByClerkId(
    clerkId: string,
    updateUserPayload: Partial<IUserModel>
  ): Promise<IUserModel | null> {
    logger.info("Updating user by Clerk ID", { clerkId, updateUserPayload });
    const user = await UserModel.findOne({ clerkId });

    if (!user) {
      logger.warn(`User not found for clerkId: ${clerkId}`);
      return null;
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { clerkId },
      {
        status: updateUserPayload.status,
        availableCredits: updateUserPayload.availableCredits,
        totalCredits: updateUserPayload.totalCredits,
        referralCode: user.referralCode,
        specialityId: updateUserPayload.specialityId,
        autoTemplate: updateUserPayload.autoTemplate,
        actionMode: updateUserPayload.actionMode,
        defaultTranscriptionModel: updateUserPayload.defaultTranscriptionModel,
        isErrorCheck: updateUserPayload.isErrorCheck,
        isReportGuideline: updateUserPayload.isReportGuideline,
        voiceCommandsEnabled: updateUserPayload.voiceCommandsEnabled,
      },
      { new: true }
    );

    if (updatedUser) {
      await clerkClient.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          user: {
            status: updatedUser.status,
            referralCode: updatedUser.referralCode,
            role: updatedUser.role,
            specialityId: updatedUser.specialityId,
          },
        },
      });
    }

    return updatedUser;
  }

  async verifyReferralCode(
    userId: string,
    referralCode: string
  ): Promise<boolean> {
    logger.debug("Verifying referral code", { referralCode });

    const user = await UserModel.findOne({ referralCode });

    const isVerified = user?.referralCode === referralCode;

    logger.debug("Referral code verification result", {
      isVerified,
      userId: user?.id,
      referralCode,
    });

    if (!isVerified) {
      logger.error("Invalid referral code", { referralCode });
      throw new Error("Invalid referral code");
    }

    logger.debug("Updating Clerk metadata with referral info", {
      clerkId: user.clerkId,
      referralCode,
      userId: user.id,
    });

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        referral: {
          code: referralCode,
          by: user.id,
        },
      },
    });

    return isVerified;
  }

  async getAllUsersByRole(
    filters: UserQueryFilters = {}
  ): Promise<{ users: IUserModel[]; total: number; pages: number }> {
    try {
      const { role = "user", search = "", page = 1, limit = 10 } = filters;

      logger.debug("Fetching users with filters", {
        role,
        search,
        page,
        limit,
      });

      // Build query conditions
      const query: any = {};

      if (search) {
        const searchParts = search.trim().split(/\s+/); // Split by spaces

        query.$and = searchParts.map((part) => ({
          $or: [
            { firstName: { $regex: part, $options: "i" } },
            { lastName: { $regex: part, $options: "i" } },
            { email: { $regex: part, $options: "i" } },
          ],
        }));
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const total = await UserModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Execute query with pagination
      const users = await UserModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      // Populate extra details (subscription, unlimited usage)
      const populatedUsers = await Promise.all(
        users.map(async (user) => {
          // Find active subscription
          // We define active as endDate >= now.
          // Note: userId in SubscriptionModel is string. user._id in lean is likely ObjectId.
          const subscription = await SubscriptionModel.findOne({
            userId: user._id.toString(),
            endDate: { $gte: new Date() },
          })
            .sort({ endDate: -1 })
            .lean();

          let unlimitedUsage: number | undefined = undefined;

          // If unlimited plan, count threads in the period
          if (
            subscription &&
            ["monthly", "yearly", "unlimited"].includes(subscription.planType)
          ) {
            unlimitedUsage = await ThreadModel.countDocuments({
              userId: user._id.toString(),
              createdAt: {
                $gte: subscription.startDate,
                $lte: subscription.endDate,
              },
            });
          }

          return {
            ...user,
            id: user._id.toString(), // Ensure id is present if using lean
            currentSubscription: subscription || undefined,
            unlimitedUsage,
          } as unknown as IUserModel;
        })
      );

      logger.info(`Found ${users.length} users with filters`, {
        total,
        page,
        totalPages,
        filters,
      });

      return {
        users: populatedUsers,
        total,
        pages: totalPages,
      };
    } catch (error) {
      logger.error("Error fetching users:", error);
      throw error;
    }
  }

  async skipOnboarding(clerkId: string): Promise<IUserModel | null> {
    try {
      // Find user by Clerk ID
      const user = await UserModel.findOne({ clerkId });

      if (!user) {
        logger.warn(`User not found for skipping onboarding: ${clerkId}`);
        throw new Error("User not found in database");
      }

      // Update user status to "active"
      user.status = "active";
      await user.save();

      // Clerk Metadata Update
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          user: {
            status: "active",
            referralCode: user.referralCode,
            role: user.role,
          },
        },
      });

      logger.info(`User onboarding skipped, status set to active: ${clerkId}`);

      return user;
    } catch (error) {
      logger.error("Error skipping onboarding", {
        error: error.message,
        clerkId,
      });
      throw error;
    }
  }
}

export default new UserService();
