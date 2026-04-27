import OpenAI from 'openai';
import { Groq } from 'groq-sdk';
import logger from '../logger';

// Import both message param types with aliases
import type { ChatCompletionMessageParam as OpenAIChatMessageParam } from 'openai/resources';
import type { ChatCompletionMessageParam as GroqChatMessageParam } from 'groq-sdk/resources/chat/completions';

export type UnifiedChatMessageParam = OpenAIChatMessageParam | GroqChatMessageParam;

export interface LLMWrapperOptions {
  client: OpenAI | Groq;
  model?: string;
  messages: UnifiedChatMessageParam[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
  frequencyPenalty?: number;
  presencePenalty?: number;
  functions?: any[];
  functionCall?: any;
  reasoningEffort?: 'low' | 'medium' | 'high';
  providerName?: string; // e.g. "OpenAI", "Grok", "Groq", "Parallel"
  customHeaders?: Record<string, string>;
}

export class LLMWrapper {
  /**
   * Generates a non-streaming chat completion with centralized logging and error handling.
   */
  static async generateChatCompletion(options: LLMWrapperOptions): Promise<string> {
    const { client, providerName = 'Unknown provider' } = options;
    const startTime = Date.now();

    logger.info(`[${providerName}] Starting LLM request${options.model ? ` - Model: ${options.model}` : ''}`);
    try {
      let content = '';

      if (client instanceof Groq) {
        const groqParams: any = {
          messages: options.messages as GroqChatMessageParam[],
          temperature: options.temperature,
          max_completion_tokens: options.maxTokens,
          top_p: options.topP,
          stream: false,
          stop: null,
        };

        if (options.model) {
          groqParams.model = options.model;
        }

        // Only add reasoning_effort if provided and model supports it
        if (options.reasoningEffort) {
          groqParams.reasoning_effort = options.reasoningEffort;
        }

        const response = await client.chat.completions.create(
          groqParams, 
          options.customHeaders ? { headers: options.customHeaders } : undefined
        );
        content = response.choices[0]?.message?.content || '';
      } else {
        const openaiParams: any = {
          messages: options.messages as OpenAIChatMessageParam[],
          temperature: options.temperature,
          top_p: options.topP,
          max_tokens: options.maxTokens,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          ...(options.functions && { functions: options.functions }),
          ...(options.functionCall && { function_call: options.functionCall }),
        };

        if (options.model) {
          openaiParams.model = options.model;
        }

        // Only add reasoning_effort if provided
        if (options.reasoningEffort) {
          openaiParams.reasoning_effort = options.reasoningEffort;
        }

        const response = await client.chat.completions.create(
          openaiParams, 
          options.customHeaders ? { headers: options.customHeaders as any } : undefined
        );
        content = response.choices[0]?.message?.content || '';
      }

      const duration = Date.now() - startTime;
      logger.info(`[${providerName}] LLM request completed in ${duration}ms`);
      return content;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${providerName}] LLM request failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Generates a streaming chat completion, yielding text chunks.
   * Handles format variations between Groq, OpenAI, and Parallel outputs.
   */
  static async *streamChatCompletion(options: LLMWrapperOptions): AsyncGenerator<string, void, unknown> {
    const { client, providerName = 'Unknown provider' } = options;
    const startTime = Date.now();
    let isFirstChunk = true;

    logger.info(`[${providerName}] Starting streaming LLM request${options.model ? ` - Model: ${options.model}` : ''}`);

    try {
      let stream: any;

      if (client instanceof Groq) {
        const groqParams: any = {
          messages: options.messages as GroqChatMessageParam[],
          temperature: options.temperature,
          max_completion_tokens: options.maxTokens,
          top_p: options.topP,
          stream: true,
          stop: null,
        };

        if (options.model) {
          groqParams.model = options.model;
        }

        // Only add reasoning_effort if provided and model supports it
        if (options.reasoningEffort) {
          groqParams.reasoning_effort = options.reasoningEffort;
        }

        stream = await client.chat.completions.create(
          groqParams, 
          options.customHeaders ? { headers: options.customHeaders } : undefined
        );
      } else {
        const openaiParams: any = {
          messages: options.messages as OpenAIChatMessageParam[],
          temperature: options.temperature,
          top_p: options.topP,
          max_tokens: options.maxTokens,
          stream: true,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          ...(options.functions && { functions: options.functions }),
          ...(options.functionCall && { function_call: options.functionCall }),
        };

        if (options.model) {
          openaiParams.model = options.model;
        }

        // Only add reasoning_effort if provided
        if (options.reasoningEffort) {
          openaiParams.reasoning_effort = options.reasoningEffort;
        }

        stream = await client.chat.completions.create(
          openaiParams, 
          options.customHeaders ? { headers: options.customHeaders as any } : undefined
        );
      }

      for await (const chunk of stream) {
        if (isFirstChunk) {
          logger.info(`[${providerName}] First chunk received in ${Date.now() - startTime}ms`);
          isFirstChunk = false;
        }

        // Support for OpenAI/Groq standard 'chunk.choices'
        // Support for Parallel AI 'chunk.data.choices'
        let delta = chunk.choices?.[0]?.delta?.content || chunk.data?.choices?.[0]?.delta?.content;

        if (delta) {
          yield delta;
        }

        if (delta === null) {
          break; // end of stream
        }
      }

      const duration = Date.now() - startTime;
      logger.info(`[${providerName}] Streaming LLM request completed in ${duration}ms`);
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Enhanced error logging
      if (error.response) {
        logger.error(`[${providerName}] API Response Error:`, {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        logger.error(`[${providerName}] Request Error (no response):`, error.request);
      } else {
        logger.error(`[${providerName}] Error:`, error.message);
      }

      logger.error(`[${providerName}] Streaming LLM request failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Executes a generic AI SDK function (e.g., embeddings, reranking) with centralized logging.
   */
  static async executeSDKFunction<T>(options: {
    providerName: string;
    actionName: string;
    execute: () => Promise<T>;
  }): Promise<T> {
    const { providerName, actionName, execute } = options;
    const startTime = Date.now();

    logger.info(`[${providerName}] Starting ${actionName}`);
    try {
      const result = await execute();
      const duration = Date.now() - startTime;
      logger.info(`[${providerName}] ${actionName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${providerName}] ${actionName} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Executes a generic fetch request for AI APIs (e.g. Audio Transcription) with centralized logging.
   */
  static async executeFetch(options: {
    url: string;
    fetchOptions: any;
    providerName: string;
    actionName: string;
  }): Promise<any> {
    const { url, fetchOptions, providerName, actionName } = options;
    const startTime = Date.now();

    logger.info(`[${providerName}] Starting ${actionName} to ${url}`);
    try {
      // Using global fetch or requiring node-fetch is fine, we assume fetch is available in the environment
      // We will require node-fetch dynamically to be safe and cross-compatible in this node app
      const fetchData = await import('node-fetch').then((m) => m.default || m);
      const response = await fetchData(url, fetchOptions);

      const duration = Date.now() - startTime;
      logger.info(`[${providerName}] ${actionName} completed in ${duration}ms`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        logger.error(`[${providerName}] API error (${response.status}):`, errorData);
        throw new Error(`${providerName} request failed: ${errorData.error?.message || errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${providerName}] ${actionName} failed after ${duration}ms:`, error);
      throw error;
    }
  }
}