import { Response } from "express";
import { getInstructionsConfig, getOpenAiConfig, getRestrictionsConfig } from "../../config/env";
import logger from "../../core/logger";
import { CommandType, Message, Template, Compare } from "../types";
import llmService, { LLMType } from "../../core/llm/llm-service";
import MessageModel, { IMessageModel } from "./message-model";
import { IDocumentModel } from "../document/document-model";

export interface CreateMessageStreamParams {
  threadId: string;
  specialityId: string;
  userId: string;
  commandType?: CommandType;
  modelType?: LLMType;
  template?: Template | null;
  compare?: Compare | null;
  customInstructions?: string | null;
  res?: Response;
  document?: IDocumentModel | null;
}

const { maxAllowedMessages, maxTokensPerMessage } = getRestrictionsConfig();

export class MessageService {
  validateMessageInput(threadId: string, messages: Message[]): boolean {
    return Boolean(threadId && messages && messages.length > 0);
  }

  validateMessageLimit(threadMessages: any): boolean {
    if (Array.isArray(threadMessages)) {
      // For Grok (array of messages from database)
      return threadMessages && threadMessages.length < maxAllowedMessages * 2;
    } else {
      // For OpenAI (thread messages page)
      return (
        threadMessages && threadMessages.data.length < maxAllowedMessages * 2
      );
    }
  }

  getInstructionsForCommand(commandType?: CommandType): string {
    const prompts = null;
    return llmService.getInstructionsForCommand(prompts, commandType);
  }

  async createUserMessage(threadId: string, messages: Message[], modelType: LLMType = LLMType.GROK, isApplyChange: boolean) {
    try {
      const messageContent = messages?.[messages?.length - 1]?.content;
      return await llmService.createUserMessage(threadId, messageContent, modelType, isApplyChange);
    } catch (error) {
      logger.error("Error creating user message:", error);
      throw new Error(
        "Something went wrong while processing your message. Please try again later."
      );
    }
  }

  setupSSEHeaders(res: Response) {
    llmService.setupSSEHeaders(res);
  }

  async createMessageStream({
    threadId,
    specialityId,
    userId,
    commandType = CommandType.REGULAR,
    modelType = LLMType.GROK,
    template = null,
    customInstructions = null,
    res,
    document = null,
  }: CreateMessageStreamParams): Promise<any> {
    try {
      return await llmService.generateResponse({ threadId, specialityId, userId, commandType, modelType, template, customInstructions, res, document });
    } catch (error) {
      logger.error("Error creating message stream:", error);
      throw new Error(
        "Something went wrong while processing your response. Please try again later."
      );
    }
  }

  async createAssistantMessageStream(
    { threadId, message, isApplyChange }: { threadId: string; message: string; isApplyChange?: boolean },
    res: Response
  ): Promise<any> {
    if (!message || !res) return;

    try {
      // Save the full assistant message after streaming completes
      const assistantMessage = new MessageModel({
        threadId,
        content: message,
        role: 'assistant',
        isApplyChange,
        timestamp: new Date(),
      });

      await assistantMessage.save();

      // Send the full message at once
      res.json({ content: message });
      return message;
    } catch (error) {
      console.error('Streaming failed:', error);
      res.status(500).end('Error streaming assistant message');
    }
  }

  handleStreamEvents(stream: any, res: Response) {
    llmService.handleStreamEvents(stream, res);
  }

  async getThreadMessages(id: string, modelType: LLMType = LLMType.GROK) {
    try {
      return await llmService.getThreadMessages(id, modelType);
    } catch (error) {
      logger.error("Error getting thread messages:", error);
      throw new Error("Something went wrong while getting your messages.");
    }
  }

  async saveMessagesToDB(threadId: string, messages: any[]) {
    try {
      const savedMessages = [];
      for (const message of messages) {
        const newMessage = new MessageModel({
          threadId,
          content: message.content,
          role: message.role,
          timestamp: new Date(),
        });
        const savedMessage = await newMessage.save();
        savedMessages.push(savedMessage);
      }
      return savedMessages;
    } catch (error) {
      logger.error("Error saving messages to DB:", error);
      throw new Error("Something went wrong while saving messages.");
    }
  }

  async updateMessage(messageId: string, message: any) {
    try {
      return await MessageModel.findByIdAndUpdate(messageId, { content: message }, { new: true, runValidators: true });
    } catch (error) {
      logger.error("Error updating message:", error);
      throw new Error("Something went wrong while updating the message.");
    }
  }
}

export default new MessageService();
