import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import threadService from "../thread/thread-service";
import { CommandType, MessageRequest } from "../types";
import userService from "../user/user-service";
import messageService from "./message-service";
import { LLMType } from "../../core/llm/llm-service";
import settingsService from "../settings/settings-service";
import cacheService from "../../core/cache/cache-service";
import { CACHE_KEYS } from "../../core/cache/cache-keys";
import logger from "../../core/logger";
import MessageModel from "./message-model";
import { IDocumentModel } from "../document/document-model";
import { clerkClient } from "@clerk/nextjs/server";
import referralService from "../referral/referral-service";
import threadNameGeneratorService from "../thread/thread-name-generator-service";

class MessageController {
  async createMessage(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const startTime = Date.now();
      const {
        messages,
        threadId,
        commandType = CommandType.REGULAR,
        template = null,
        customInstructions = null as string | null,
        document = null as IDocumentModel | null,
        isApplyChange = false
      } = req.body as MessageRequest;
      const userId = req.auth().sessionClaims.internalId;
      const specialityId = req.auth().sessionClaims.user?.specialityId;

      if (!messageService.validateMessageInput(threadId, messages)) {
        return res
          .status(400)
          .send("Invalid input: Please provide both messages and thread ID");
      }

      // Get the thread to determine which model to use
      const thread = await threadService.getThreadById(threadId, userId);

      if (!thread) {
        return res
          .status(404)
          .send("Thread not found or you don't have access to it");
      }

      // Get model type from cache or settings service
      let modelType: LLMType;

      // Try to get from cache first
      const cachedModelType = cacheService.get<LLMType>(
        CACHE_KEYS.DEFAULT_MODEL_TYPE
      );

      if (cachedModelType) {
        logger.debug(`Using cached model type: ${cachedModelType}`);
        modelType = cachedModelType;
      } else {
        // If not in cache, get from settings service
        modelType = await settingsService.getDefaultAIService();
        logger.debug(`Using model type from settings: ${modelType}`);
      }

      // Get messages for this thread
      const threadMessages = await messageService.getThreadMessages(
        threadId,
        modelType
      );

      if (!messageService.validateMessageLimit(threadMessages)) {
        return res
          .status(400)
          .send(
            "Report message limit reached. Please purchase more reports to continue."
          );
      }

      // Create user message using the appropriate model
      await messageService.createUserMessage(threadId, messages, modelType, isApplyChange);

      // Set up SSE headers for streaming response
      messageService.setupSSEHeaders(res);

      // Update thread for first message
      if (thread.status === 'new' && (threadMessages.length > 0 || messages.length > 0)) {
        await threadService.updateThread(
          threadId,
          {
            status: "regular",
            name: thread.name,
            updatedAt: new Date(),
          },
          userId
        );

        const user = await (await clerkClient()).users.getUser(req.auth().userId);
        const { publicMetadata } = user
        const planType = (publicMetadata as any).payment?.planType;

        // Check if user has active referral plan
        const hasActiveReferralPlan = await referralService.hasActiveReferralPlan(userId);
        const isUnlimitedPlan = ["monthly", "yearly", "referral", "coupon_code"].includes(planType) || hasActiveReferralPlan;

        if (!isUnlimitedPlan) {
          await userService.decrementThreadBalance(userId);
        }
      }

      // Generate response using the appropriate model
      await messageService.createMessageStream({
        threadId,
        specialityId,
        userId,
        commandType,
        modelType,
        template,
        customInstructions,
        res,
        document,
      });

      const duration = Date.now() - startTime;
      logger.info(`Response Time (Message Creation): ${duration}ms`);

      // Schedule background operations to run after response is sent
      // This prevents blocking the user's response with AI thread naming and referral processing
      setImmediate(async () => {
        try {
          const messageCount = await MessageModel.countDocuments({ threadId });

          // After assistant message is created, generate AI thread name from the report output
          // This happens only for the first assistant message (messageCount = 2: 1 user + 1 assistant)
          if (messageCount === 2) {
            try {
              // Get the assistant's first message (the generated report)
              const assistantMessage = await MessageModel.findOne({
                threadId,
                role: 'assistant'
              }).sort({ createdAt: 1 });

              if (assistantMessage && assistantMessage.content) {
                logger.info(`Generating AI thread name from assistant report (length: ${assistantMessage.content.length})`);

                const aiGeneratedName = await threadNameGeneratorService.generateThreadName(
                  assistantMessage.content
                );

                if (aiGeneratedName) {
                  // Update thread name with AI-generated name
                  await threadService.updateThread(
                    threadId,
                    { name: aiGeneratedName },
                    userId
                  );
                  logger.info(`Thread name updated to: "${aiGeneratedName}" (AI-generated from report)`);
                } else {
                  logger.warn('AI thread name generation returned null, keeping date-based name');
                }
              }
            } catch (error) {
              logger.error('Error generating AI thread name from report, keeping date-based name', error);
            }
          }

          // Check if this is the first completed report for referral reward
          if (messageCount >= 2) {
            try {
              // Check if this is the first time reaching 2 messages for this user
              // Use aggregation to avoid N+1 query pattern
              const userThreads = await threadService.getUserThreads(userId);
              const threadIds = userThreads
                .map(t => t.threadId)
                .filter(id => id !== threadId); // Exclude current thread

              // Single aggregation query instead of loop with multiple countDocuments
              const existingCompletedThread = await MessageModel.aggregate([
                { $match: { threadId: { $in: threadIds } } },
                { $group: { _id: "$threadId", count: { $sum: 1 } } },
                { $match: { count: { $gte: 2 } } },
                { $limit: 1 }
              ]);

              const hasCompletedReportBefore = existingCompletedThread.length > 0;

              if (!hasCompletedReportBefore) {
                // This is the first completed report
                await referralService.processFirstReportReward(userId);
                logger.info(`Processed first report referral reward for user: ${userId}`);
              }
            } catch (referralError) {
              logger.error(`Failed to process referral reward for user ${userId}:`, referralError);
            }
          }
        } catch (error) {
          logger.error('Error in background post-message processing:', error);
        }
      });
    } catch (error) {
      return res
        .status(500)
        .send(
          "An error occurred while processing your request. Please try again later."
        );
    }
  }

  async getThreadMessagesById(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.auth().sessionClaims.internalId;

      // Check if thread belongs to user
      const userThread = await threadService.getThreadById(id, userId);

      if (!userThread) {
        return res.status(403).json({
          message: "You don't have permission to access this Report",
        });
      }

      // Get model type from thread
      const modelType = userThread.modelType || LLMType.GROK;

      // Get thread messages using the appropriate model
      const threadMessages = await messageService.getThreadMessages(
        id,
        modelType
      );

      // Since all messages are now stored in our database first, the response format is standardized
      return res.status(200).json(threadMessages);
    } catch (error) {
      return res
        .status(500)
        .send("Unable to retrieve messages. Please try again later");
    }
  }

  async updateMessage(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.auth().sessionClaims.internalId;

      // Find the message and check if the thread belongs to the user in a single query
      const message = await MessageModel.findOne({ _id: id }).populate({
        path: "threadId",
        match: { userId: userId },
        select: "userId",
      });

      if (!message || !message.threadId) {
        return res.status(403).json({
          message: "You do not have permission to update this message",
        });
      }

      // Update the message
      const updatedMessage = await messageService.updateMessage(id, content);

      return res.status(200).json({ updatedMessage });
    } catch (error) {
      return res.status(500).json({
        message: "Unable to update message. Please try again later.",
      });
    }
  }

  async createApplyChangesMessage(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { messages, message, threadId } = req.body;
      // Get model type from cache or settings service
      let modelType: LLMType;

      // Try to get from cache first
      const cachedModelType = cacheService.get<LLMType>(
        CACHE_KEYS.DEFAULT_MODEL_TYPE
      );

      if (cachedModelType) {
        logger.debug(`Using cached model type: ${cachedModelType}`);
        modelType = cachedModelType;
      } else {
        // If not in cache, get from settings service
        modelType = await settingsService.getDefaultAIService();
        logger.debug(`Using model type from settings: ${modelType}`);
      }

      // Create user message using the appropriate model
      await messageService.createUserMessage(threadId, messages, modelType, false);

      messageService.setupSSEHeaders(res);

      await messageService.createAssistantMessageStream({ threadId, message, isApplyChange: true }, res);

    } catch (error) {
      logger.debug(`Error in the apply chnages: ${error}`);
    }
  }
}

export default new MessageController();
