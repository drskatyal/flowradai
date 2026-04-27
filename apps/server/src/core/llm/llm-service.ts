import OpenAI from 'openai';
import { Response } from 'express';
import { getGrokConfig } from '../../config/env/grok';
import { getInstructionsConfig, getOpenAiOssConfig, getPortkeyConfig, getGeminiConfig, getOpenRouterConfig, getAppConfig } from '../../config/env';
import aiConfigService from '../../web/settings/ai-config-service';
import logger from '../logger';
import { CommandType, Template, Compare } from '../../web/types';
import MessageModel from '../../web/message/message-model';
import { AssistantStream } from 'openai/lib/AssistantStream';
import specialityService from "../../web/speciality/speciality-service";
import { IDocumentModel } from '@/web/document/document-model';
import { Groq } from 'groq-sdk';

// Import newly created unified wrapper and types
import { LLMWrapper, LLMWrapperOptions, UnifiedChatMessageParam } from './llm-wrapper';
import type { ChatCompletionMessageParam as OpenAIChatMessageParam } from "openai/resources";
import type { ChatCompletionMessageParam as GroqChatMessageParam } from "groq-sdk/resources/chat/completions";

// Define LLM types
export enum LLMType {
  GROQ = 'groq',
  GROK = 'grok',
  GEMINI = 'gemini',
  OPENROUTER = 'openrouter',
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  instructions?: string;
}

export interface GenerateResponseParams {
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

// Interface for prompt instructions extracted from IPromptModel
export interface PromptInstructions {
  elaborateInstruction?: string;
  structuredReportingApproachInstruction?: string;
  regularInstruction?: string;
  defaultGrokInstructions?: string;
  defaultOpenaiInstructions?: string;
  defaultGeminiInstructions?: string;
  templateRegularInstruction?: string;
  textCorrectionInstruction?: string;
  refinementInstruction?: string;
  disabledRefinementInstructions?: string;
  actionModeRefinementInstruction?: string;
  wishperInstruction?: string;
  reportErrorValidationInstruction?: string,
  reportGuidelineInstruction?: string
}

class LLMService {
  private groqClient: OpenAI;
  private grokClient: OpenAI;
  private geminiClient: OpenAI;
  private openrouterClient: OpenAI;
  private grokConfig: ReturnType<typeof getGrokConfig>;
  private groqConfig: ReturnType<typeof getOpenAiOssConfig>;
  private geminiConfig: ReturnType<typeof getGeminiConfig>;
  private openrouterConfig: ReturnType<typeof getOpenRouterConfig>;
  private instructionsConfig: ReturnType<typeof getInstructionsConfig>;

  constructor() {
    const portkeyConfig = getPortkeyConfig();
    this.grokConfig = getGrokConfig();
    this.groqConfig = getOpenAiOssConfig();
    this.geminiConfig = getGeminiConfig();
    this.openrouterConfig = getOpenRouterConfig();
    this.instructionsConfig = getInstructionsConfig();

    const groqBaseOptions: any = {
      apiKey: process.env.GROQ_API_KEY || this.groqConfig.apiKey,
    };

    const grokBaseOptions: any = {
      apiKey: process.env.GROK_API_KEY,
      baseURL: aiConfigService.getGrokConfig().BASE_URL,
    };

    const geminiBaseOptions: any = {
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: this.geminiConfig.baseUrl,
    };

    const openrouterBaseOptions: any = {
      apiKey: process.env.OPENROUTER_API_KEY || this.openrouterConfig.apiKey,
      baseURL: this.openrouterConfig.baseUrl,
    };

    if (portkeyConfig.apiKey) {
      logger.info('Portkey API Key found, configuring LLM clients to use Portkey Gateway');

      // Groq Configuration with Portkey
      groqBaseOptions.baseURL = portkeyConfig.baseUrl;
      const groqHeaders: any = {
        'x-portkey-api-key': portkeyConfig.apiKey,
        'x-portkey-provider': 'groq',
      };

      // Grok (xAI) Configuration with Portkey
      grokBaseOptions.baseURL = portkeyConfig.baseUrl;
      const grokHeaders: any = {
        'x-portkey-api-key': portkeyConfig.apiKey,
        'x-portkey-provider': 'x-ai',
      };

      // Gemini Configuration with Portkey
      geminiBaseOptions.baseURL = portkeyConfig.baseUrl;
      const geminiHeaders: any = {
        'x-portkey-api-key': portkeyConfig.apiKey,
        'x-portkey-provider': 'google',
      };

      // OpenRouter Configuration with Portkey
      openrouterBaseOptions.baseURL = portkeyConfig.baseUrl;
      const openrouterHeaders: any = {
        'x-portkey-api-key': portkeyConfig.apiKey,
        'x-portkey-provider': 'openrouter',
      };

      if (portkeyConfig.configId) {
        logger.info(`Portkey Config ID found: ${portkeyConfig.configId}`);
        groqHeaders['x-portkey-config'] = portkeyConfig.configId;
        grokHeaders['x-portkey-config'] = portkeyConfig.configId;
        geminiHeaders['x-portkey-config'] = portkeyConfig.configId;
        openrouterHeaders['x-portkey-config'] = portkeyConfig.configId;
      }

      groqBaseOptions.defaultHeaders = groqHeaders;
      grokBaseOptions.defaultHeaders = grokHeaders;
      geminiBaseOptions.defaultHeaders = geminiHeaders;
      openrouterBaseOptions.defaultHeaders = openrouterHeaders;
    }

    this.groqClient = new OpenAI(groqBaseOptions);
    this.grokClient = new OpenAI(grokBaseOptions);
    this.geminiClient = new OpenAI(geminiBaseOptions);
    this.openrouterClient = new OpenAI(openrouterBaseOptions);
  }

  getInstructionsForCommand(prompts: PromptInstructions | null, commandType: CommandType = CommandType.REGULAR): string {
    const {
      elaborateInstruction: fallbackElaborate,
      regularInstruction: fallbackRegular,
      structuredReportingApproachInstruction: fallbackStructured,
    } = this.instructionsConfig;

    switch (commandType) {
      case CommandType.ELABORATE:
        return prompts?.elaborateInstruction?.trim() || fallbackElaborate;

      case CommandType.STRUCTURED_REPORTING:
        return prompts?.structuredReportingApproachInstruction?.trim() || fallbackStructured;

      default:
        return prompts?.regularInstruction?.trim() || fallbackRegular;
    }
  }

  getTemplateInstructionsForCommand(prompts: PromptInstructions | null, commandType: CommandType = CommandType.REGULAR): string {
    const {
      templateRegularInstruction: fallbackRegular,
      structuredReportingApproachInstruction: fallbackStructured,
    } = this.instructionsConfig;

    switch (commandType) {
      case CommandType.REGULAR:
        return prompts?.templateRegularInstruction?.trim() || fallbackRegular;

      case CommandType.STRUCTURED_REPORTING:
        return prompts?.structuredReportingApproachInstruction?.trim() || fallbackStructured;

      default:
        return '';
    }
  }

  async getThreadMessages(threadId: string, llmType: LLMType = LLMType.GROK) {
    try {
      // Always try to get messages from our database first
      const dbMessages = await MessageModel.find({ threadId }).sort({
        timestamp: 1,
      });

      // If we have messages in the database, return them
      if (dbMessages && dbMessages.length > 0) {
        return dbMessages;
      }

      // Return empty array if no messages found
      return [];
    } catch (error) {
      logger.error('Error getting thread messages:', error);
      throw new Error('Something went wrong while getting your messages.');
    }
  }

  async createUserMessage(
    threadId: string,
    message: string,
    llmType: LLMType = LLMType.GROK,
    isApplyChange: boolean
  ) {
    try {
      // Always store message in our database regardless of model type
      const newMessage = new MessageModel({
        threadId,
        content: message,
        role: 'user',
        isApplyChange,
        timestamp: new Date(),
      });
      await newMessage.save();

      return newMessage;
    } catch (error) {
      logger.error(`Error creating ${llmType} user message:`, error);
      throw new Error(
        'Something went wrong while processing your message. Please try again later.'
      );
    }
  }

  async generateResponse({
    threadId,
    specialityId,
    userId,
    commandType = CommandType.REGULAR,
    modelType = LLMType.GROK,
    template = null,
    customInstructions = null,
    res,
    document,
  }: GenerateResponseParams): Promise<string> {
    try {
      // For both models, get messages from our database
      const messages = await MessageModel.find({ threadId }).sort({
        timestamp: 1,
      });

      //get prompts from database that bind with users speciality
      const prompts = await specialityService.getPromptBySpecialityId(specialityId);

      let systemContent = '';

      // 1. Default Instructions
      let defaultInstructions = '';
      if (messages?.length > 2) {
        defaultInstructions = prompts?.reportModificationInstructions?.trim() ||
          this.instructionsConfig?.reportModificationInstructions;
      } else {
        if (document) {
          defaultInstructions = document.prompt;
        } else {
          switch (modelType) {
            case LLMType.GROK:
              defaultInstructions = prompts?.defaultGrokInstructions?.trim() || this.instructionsConfig.defaultGrokInstructions;
              break;
            case LLMType.GEMINI:
              defaultInstructions = prompts?.defaultGeminiInstructions?.trim() || this.instructionsConfig.defaultGrokInstructions; // Fallback to grok if gemini is not in config for now but use gemini prompt if available
              break;
            case LLMType.OPENROUTER:
            case LLMType.GROQ:
            default:
              defaultInstructions = prompts?.defaultOpenaiInstructions?.trim() || this.instructionsConfig.defaultOpenaiInstructions;
              break;
          }
        }
      }


      if (defaultInstructions && !template?.isTemplate) {
        systemContent += `=== CORE INSTRUCTIONS ===\n${defaultInstructions}\n\n`;
      }

      // 2. Custom Instructions
      if (customInstructions) {
        systemContent += `=== CUSTOM INSTRUCTIONS (HIGH PRIORITY) ===\n`;
        systemContent += `${customInstructions}\n\n`;
      }

      // 3. Command Instructions
      let instructions = '';
      if (!document) {
        if (template?.isTemplate) {
          instructions = this.getTemplateInstructionsForCommand(prompts, commandType);
        } else {
          instructions = this.getInstructionsForCommand(prompts, commandType);
        }
      }

      if (instructions) {
        systemContent += `=== COMMAND INSTRUCTIONS ===\n${instructions}\n\n`;
      }

      // 4. Template Mode
      if (template?.isTemplate) {
        systemContent += `=== TEMPLATE MODE ACTIVE ===\n`;
        if (template.description) {
          systemContent += `${template.description}\n`;
        }
        if (template.prompt) {
          systemContent += `${template.prompt}\n`;
        }
        systemContent += `\n`;
      }

      // 5. Final Integration Rules
      systemContent += `=== EXECUTION PRIORITY ===\n`;
      systemContent += `1. Follow CUSTOM INSTRUCTIONS (if present) as highest priority\n`;
      systemContent += `2. Apply CORE INSTRUCTIONS as base behavior\n`;
      systemContent += `3. Execute COMMAND INSTRUCTIONS for task completion\n`;
      systemContent += `4. Use active modes (Template/Comparison) for response styling\n`;

      const formattedMessages: UnifiedChatMessageParam[] = [];

      formattedMessages.push({
        role: 'system',
        content: systemContent
      });

      // Add the rest of the messages, filtering out unsupported roles
      for (const msg of messages) {
        // Only add messages with supported roles
        if (['user', 'assistant', 'system'].includes(msg.role)) {
          formattedMessages.push({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          });
        }
      }

      // Choose the client/config based on the model type
      let client: any;
      let config: any;
      let providerName: string;

      switch (modelType) {
        case LLMType.GROK:
          client = this.grokClient;
          config = getGrokConfig();
          providerName = 'Grok';
          break;
        case LLMType.GEMINI:
          client = this.geminiClient;
          config = getGeminiConfig();
          providerName = 'Google Gemini';
          break;
        case LLMType.OPENROUTER:
          client = this.openrouterClient;
          config = getOpenRouterConfig();
          providerName = 'OpenRouter';
          break;
        case LLMType.GROQ:
        default:
          client = this.groqClient;
          config = getOpenAiOssConfig();
          providerName = 'Groq OSS';
          break;
      }

      const appConfig = getAppConfig();
      const portkeyHeaders = {
        'x-portkey-metadata': JSON.stringify({
          _user: userId,
          environment: appConfig.env,
          feature: 'report-generation',
          request_id: threadId
        })
      };

      // If streaming response is requested
      if (res) {
        let streamOptions: LLMWrapperOptions;

        switch (modelType) {
          case LLMType.GROK:
            streamOptions = {
              client,
              model: config.model,
              messages: formattedMessages,
              temperature: config.temperature,
              topP: config.topP,
              maxTokens: config.maxCompletionTokens,
              stream: true,
              providerName,
              functions: this.instructionsConfig.functionConfig.functions,
              functionCall: this.instructionsConfig.functionConfig.function_call,
            };
            break;
          case LLMType.GEMINI:
            streamOptions = {
              client,
              model: config.model,
              messages: formattedMessages,
              temperature: config.temperature,
              topP: config.topP,
              maxTokens: config.maxCompletionTokens,
              stream: true,
              providerName,
            };
            break;
          case LLMType.OPENROUTER:
            streamOptions = {
              client,
              model: config.model,
              messages: formattedMessages,
              temperature: config.temperature,
              topP: config.topP,
              maxTokens: config.maxCompletionTokens,
              stream: true,
              providerName,
            };
            break;
          case LLMType.GROQ:
          default: {
            const ossConfig = getOpenAiOssConfig();
            const portkeyConfig = getPortkeyConfig();

            let groqClient: any;
            if (portkeyConfig.apiKey) {
              // Use OpenAI SDK wrapper for Groq through Portkey to avoid /openai/v1 prefix issues
              const headers: any = {
                'x-portkey-api-key': portkeyConfig.apiKey,
                'x-portkey-provider': 'groq',
              };

              if (portkeyConfig.configId) {
                headers['x-portkey-config'] = portkeyConfig.configId;
              }

              groqClient = new OpenAI({
                apiKey: process.env.GROQ_API_KEY || ossConfig.apiKey,
                baseURL: portkeyConfig.baseUrl,
                defaultHeaders: headers
              });
            } else {
              groqClient = new Groq({ apiKey: ossConfig.apiKey });
            }
            streamOptions = {
              client: groqClient,
              model: ossConfig.model,
              messages: formattedMessages,
              temperature: ossConfig.temperature,
              topP: ossConfig.topP,
              maxTokens: ossConfig.maxCompletionTokens,
              stream: true,
              reasoningEffort: (ossConfig as any).REASONING_EFFORT as 'low' | 'medium' | 'high',
              providerName: 'Groq OSS',
            };
            break;
          }
        }

        streamOptions.customHeaders = portkeyHeaders;

        let fullResponse = '';
        const streamGenerator = LLMWrapper.streamChatCompletion(streamOptions);

        for await (const chunk of streamGenerator) {
          if (chunk) {
            fullResponse += chunk;
            res.write(chunk);
          }
        }

        // Save the complete response to database
        if (fullResponse) {
          const assistantMessage = new MessageModel({
            threadId,
            content: fullResponse,
            role: 'assistant',
            timestamp: new Date(),
          });
          await assistantMessage.save();
        }

        res.end();
        return fullResponse;
      } else {
        // If no streaming is needed, use the non-streaming version
        const content = await LLMWrapper.generateChatCompletion({
          client,
          model: config.model,
          messages: formattedMessages,
          temperature: config.temperature,
          topP: config.topP,
          maxTokens: modelType === LLMType.GROK ? 5000 : (config as any).maxCompletionTokens || 3000,
          frequencyPenalty: 0.2,
          presencePenalty: 0.0,
          reasoningEffort: (config as any).reasoningEffort,
          providerName,
          customHeaders: portkeyHeaders,
        });

        // Save to database
        if (content) {
          const assistantMessage = new MessageModel({
            threadId,
            content,
            role: 'assistant',
            timestamp: new Date(),
          });
          await assistantMessage.save();
        }

        return content;
      }
    } catch (error) {
      logger.error(`Error generating ${modelType} response:`, error);
      throw new Error(
        'Something went wrong while processing your response. Please try again later.'
      );
    }
  }

  handleStreamEvents(stream: AssistantStream, res: Response) {
    stream.on('textDelta', (delta) => {
      res.write(delta.value);
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (error) => {
      logger.error('Stream error:', error);
      res.write(
        JSON.stringify({
          success: false,
          error: 'An error occurred while processing your request',
        })
      );
      res.end();
    });
  }

  setupSSEHeaders(res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  }
}

export default new LLMService();
