import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "../../core/logger";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import userService from "../user/user-service";
import { IThreadModel } from "./thread-model";
import threadService from "./thread-service";
import OpenAI from "openai";
import { LLMType } from "../../core/llm/llm-service";
import messageService from "../message/message-service";
import { clerkClient } from "@clerk/nextjs/server";
import referralService from "../referral/referral-service";

const openai = new OpenAI();

class ThreadController {
  private async createEmptyThread(userId: string, modelType: LLMType = LLMType.GROK) {
    const user = await userService.getUserById(userId);

    if (!user)
      throw new Error(
        "Unable to find your account. Please try logging in again."
      );

    const clerkUser = await (await clerkClient()).users.getUser(user.clerkId);
    const { publicMetadata } = clerkUser
    const planType = (publicMetadata as any).payment?.planType;

    // Check if user has active referral plan
    const hasActiveReferralPlan = await referralService.hasActiveReferralPlan(userId);
    const isUnlimited = ["monthly", "yearly", "referral", "coupon_code"].includes(planType) || hasActiveReferralPlan;

    // Only check credits when the plan is NOT unlimited (including referral plan)
    if (
      !isUnlimited &&
      (user?.availableCredits <= 0 || user?.totalCredits <= 0)
    ) {
      throw new Error(
        "Your report credits balance is zero. Purchase credits to proceed with this feature."
      );
    }

    try {
      // Generate a UUID as the thread ID for all thread types
      const threadId = uuidv4();

      const today = new Date();
      const threadName = today.toLocaleDateString("en-GB");

      const thread = {
        name: threadName,
        userId,
        threadId,
        status: "new",
        modelType, // Store which model is being used for this thread
      } as IThreadModel;

      return await threadService.createThread(thread);
    } catch (error) {
      logger.error("Error creating thread", error);
      throw new Error(
        "We encountered an issue creating your thread. Please try again in a moment."
      );
    }
  }

  async createThread(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      // Get model type from request body or default to Grok
      const modelType = (req.body.modelType || LLMType.GROK) as LLMType;
      const lastThread = await threadService.getLastUserThread(userId);

      const lastThreadMessages = await messageService.getThreadMessages(lastThread?.threadId);

      if (lastThread && lastThread.status === "new" && !lastThreadMessages.length) {
        return res.status(200).json(lastThread);
      }

      if (lastThread && lastThread.status === "new" && lastThreadMessages.length > 0) {
        await threadService.updateThread(
          lastThread.threadId,
          {
            status: "regular",
            name: lastThread.name,
            updatedAt: new Date(),
          },
          userId
        );
      }

      const newThread = await this.createEmptyThread(userId, modelType);

      return res.status(201).json(newThread);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getUserThreads(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const existingThreads = await threadService.getUserThreads(userId);
      // Get model type from query params or default to Grok
      const modelType = (req.query.modelType as LLMType) || LLMType.GROK;

      // If no threads, create a new one
      if (existingThreads.length === 0) {
        const newThread = await this.createEmptyThread(userId, modelType as LLMType);

        return res.status(200).json([newThread]);
      }

      return res.status(200).json(existingThreads);
    } catch (error) {
      return res.status(500).json({
        message:
          error.message ||
          "We couldn't load your threads at this time. Please refresh the page or try again later.",
      });
    }
  }

  async getThreadById(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.auth().sessionClaims.internalId;
      const thread = await threadService.getThreadById(id, userId);

      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }

      return res.status(200).json(thread);
    } catch (error) {
      return res.status(500).json({
        message: "Unable to retrieve the thread. Please try again later.",
      });
    }
  }

  async updateThread(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const updatedThreadData = req.body;
      const userId = req.auth().sessionClaims.internalId;

      const updatedThread = await threadService.updateThread(
        id,
        updatedThreadData,
        userId
      );

      if (!updatedThread) {
        return res.status(404).json({
          message:
            "This thread no longer exists or you don't have permission to modify it.",
        });
      }

      return res.status(200).json(updatedThread);
    } catch (error) {
      return res.status(500).json({
        message: "We couldn't save your changes. Please try again in a moment.",
      });
    }
  }

  async deleteThread(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.auth().sessionClaims.internalId;

      const deletedThread = await threadService.deleteThread(id, userId);

      if (!deletedThread) {
        return res
          .status(404)
          .json({ message: "This thread no longer exists." });
      }

      return res.status(200).json({ message: "Thread successfully deleted", thread: deletedThread });
    } catch (error) {
      return res.status(500).json({
        message: "Unable to delete the thread. Please try again later.",
      });
    }
  }

  async getReportStats(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const timezoneOffset = req.query.timezoneOffset ? Number(req.query.timezoneOffset) : 0;
      const filter = (req.query.filter as 'daily' | 'weekly' | 'monthly' | 'all') || 'daily';

      const stats = await threadService.getReportStats(userId, filter, timezoneOffset);
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching report stats:", error);
      return res.status(500).json({
        message: "Unable to fetch report statistics.",
      });
    }
  }

  async getReportHistory(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const filter = (req.query.filter as 'daily' | 'weekly' | 'monthly' | 'all') || 'daily';
      const timezoneOffset = req.query.timezoneOffset ? Number(req.query.timezoneOffset) : 0;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const history = await threadService.getReportHistory(userId, filter, timezoneOffset, page, limit);
      return res.status(200).json(history);
    } catch (error) {
      console.error("Error fetching report history:", error);
      return res.status(500).json({
        message: "Unable to fetch report history.",
      });
    }
  }
}

export default new ThreadController();