import logger from "../../core/logger";
import cacheService from "../../core/cache/cache-service";
import { CACHE_KEYS } from "../../core/cache/cache-keys";
import { AIConfig } from "../../core/config/ai-config";
import { AIServiceSettings, RefineType, ValidatorType } from "./settings-model";

/**
 * Centralized AI configuration service.
 * Reads from cache (loaded from DB at startup), falls back to ai-config.ts defaults.
 * All env config files should use this instead of importing AIConfig directly.
 */
class AIConfigService {
  /**
   * Get the full cached settings, or return defaults if cache is empty.
   */
  private getSettings(): AIServiceSettings | null {
    return cacheService.get<AIServiceSettings>(CACHE_KEYS.AI_SERVICE_SETTINGS) || null;
  }

  // ─── Grok LLM ────────────────────────────────────────────────────────
  getGrokConfig() {
    const s = this.getSettings();
    return {
      MODEL: s?.llmConfig?.grok?.model || AIConfig.GROK.MODEL,
      BASE_URL: AIConfig.GROK.BASE_URL,
      TOP_P: s?.llmConfig?.grok?.topP ?? AIConfig.GROK.TOP_P,
      TEMPERATURE: s?.llmConfig?.grok?.temperature ?? AIConfig.GROK.TEMPERATURE,
      REASONING_EFFORT: s?.llmConfig?.grok?.reasoningEffort || 'medium',
    };
  }

  // ─── Groq LLM (LLaMA via Groq) ───────────────────────────────────────
  getGroqLLMConfig() {
    const s = this.getSettings();
    return {
      MODEL: s?.llmConfig?.groq?.model || AIConfig.OPENAI_OSS.MODEL,
      TEMPERATURE: s?.llmConfig?.groq?.temperature ?? AIConfig.OPENAI_OSS.TEMPERATURE,
      MAX_COMPLETION_TOKEN: s?.llmConfig?.groq?.maxTokens ?? AIConfig.OPENAI_OSS.MAX_COMPLETION_TOKEN,
      TOP_P: s?.llmConfig?.groq?.topP ?? AIConfig.OPENAI_OSS.TOP_P,
      STREAM: AIConfig.OPENAI_OSS.STREAM,
      REASONING_EFFORT: s?.llmConfig?.groq?.reasoningEffort || AIConfig.OPENAI_OSS.REASONING_EFFORT,
    };
  }

  // ─── OpenRouter LLM ──────────────────────────────────────────────────
  getOpenRouterConfig() {
    const s = this.getSettings();
    return {
      MODEL: s?.llmConfig?.openrouter?.model || AIConfig.OPENROUTER.MODEL,
      TEMPERATURE: s?.llmConfig?.openrouter?.temperature ?? AIConfig.OPENROUTER.TEMPERATURE,
      MAX_COMPLETION_TOKEN: s?.llmConfig?.openrouter?.maxTokens ?? AIConfig.OPENROUTER.MAX_COMPLETION_TOKEN,
      TOP_P: s?.llmConfig?.openrouter?.topP ?? AIConfig.OPENROUTER.TOP_P,
      BASE_URL: AIConfig.OPENROUTER.BASE_URL,
    };
  }

  // ─── OpenAI (Legacy/Embeddings) ──────────────────────────────────────
  getOpenAIConfig() {
    const s = this.getSettings();
    return {
      ASSISTANT_ID: AIConfig.OPENAI.ASSISTANT_ID,
      MODEL: (s?.llmConfig as any)?.openai?.model || AIConfig.OPENAI.MODEL,
      TOP_P: (s?.llmConfig as any)?.openai?.topP ?? AIConfig.OPENAI.TOP_P,
      TEMPERATURE: (s?.llmConfig as any)?.openai?.temperature ?? AIConfig.OPENAI.TEMPERATURE,
    };
  }

  // ─── Deprecated / Shared Configs ────────────────────────────────────
  getOpenAIOSSConfig() {
    return this.getGroqLLMConfig();
  }

  // ─── Dynamic Refine Config ────────────────────────────────────────────
  getRefineConfig(serviceName: string) {
    const s = this.getSettings();
    const config = s?.refinement?.config?.[serviceName as RefineType];
    return {
      MODEL: config?.model || (serviceName === 'groq' ? AIConfig.GROQ_REFINE.MODEL : AIConfig.GEMINI_AI.MODEL),
      TEMPERATURE: config?.temperature ?? (serviceName === 'groq' ? AIConfig.GROQ_REFINE.TEMPERATURE : AIConfig.GEMINI_AI.TEMPERATURE),
      MAX_TOKEN: config?.maxTokens ?? (serviceName === 'groq' ? AIConfig.GROQ_REFINE.MAX_TOKEN : 2048),
      TOP_P: config?.topP ?? (serviceName === 'groq' ? AIConfig.GROQ_REFINE.TOP_P : 1.0),
    };
  }

  // ─── Groq Whisper ─────────────────────────────────────────────────────
  getGroqWhisperConfig() {
    return {
      MODEL: AIConfig.GROQ_WHISPER.MODEL,
      ACTION_MODE_MODEL: AIConfig.GROQ_WHISPER.ACTION_MODE_MODEL,
      LANGUAGE: AIConfig.GROQ_WHISPER.LANGUAGE,
      BASE_URL: AIConfig.GROQ_WHISPER.BASE_URL,
      TEMPERATURE: AIConfig.GROQ_WHISPER.TEMPERATURE,
    };
  }

  // ─── Mistral AI (Voxtral) ────────────────────────────────────────────
  getMistralAIConfig() {
    return {
      MODEL: AIConfig.MISTRAL_AI.MODEL,
      LANGUAGE: AIConfig.MISTRAL_AI.LANGUAGE,
      BASE_URL: AIConfig.MISTRAL_AI.BASE_URL,
      TEMPERATURE: AIConfig.MISTRAL_AI.TEMPERATURE,
    };
  }

  // ─── Gemini AI (Thread Name) ─────────────────────────────────
  getGeminiAIConfig() {
    const s = this.getSettings();
    return {
      MODEL: AIConfig.GEMINI_AI.MODEL,
      BASE_URL: AIConfig.GEMINI_AI.BASE_URL,
      TEMPERATURE: AIConfig.GEMINI_AI.TEMPERATURE,
    };
  }

  // ─── Gemini Transcription ─────────────────────────────────────────────
  getGeminiTranscriptionConfig() {
    return {
      MODEL: AIConfig.GEMINI_TRANSCRIPTION_AI.MODEL,
      TEMPERATURE: AIConfig.GEMINI_TRANSCRIPTION_AI.TEMPERATURE,
      MAX_OUTPUT_TOKEN: AIConfig.GEMINI_TRANSCRIPTION_AI.MAX_OUTPUT_TOKEN,
    };
  }

  // ─── Voyage AI ────────────────────────────────────────────────────────
  getVoyageAIConfig() {
    return {
      MODEL: AIConfig.VOYAGE_AI.MODEL,
    };
  }

  // ─── Parallel AI ──────────────────────────────────────────────────────
  getParallelAIConfig() {
    return {
      MODEL: AIConfig.PARALLEL_AI.MODEL,
      BASE_URL: AIConfig.PARALLEL_AI.BASE_URL,
    };
  }

  // ─── Embedding Provider ───────────────────────────────────────────────
  getEmbeddingProvider(): string {
    return AIConfig.EMBEDDING_PROVIDER;
  }

  // ─── Default Transcription Service ────────────────────────────────────
  getDefaultTranscriptionService(): string {
    return "groq";
  }

  // ─── Default Refinement Service ───────────────────────────────────────
  getDefaultRefinementService(): string {
    const s = this.getSettings();
    return s?.refinement?.defaultService || "gemini";
  }

  // ─── Default Validation Service ───────────────────────────────────────
  getDefaultValidationService(): string {
    const s = this.getSettings();
    return s?.validation?.defaultService || "gemini";
  }

  // ─── Dynamic Validator Config ──────────────────────────────────────────
  getValidatorConfig(serviceName: string) {
    const s = this.getSettings();
    const config = s?.validation?.config?.[serviceName as ValidatorType];
    return {
      MODEL: config?.model || (serviceName === 'grok' ? AIConfig.GROK_VALIDATOR.MODEL : AIConfig.GEMINI_AI.MODEL),
      TEMPERATURE: config?.temperature ?? (serviceName === 'grok' ? AIConfig.GROK_VALIDATOR.TEMPERATURE : AIConfig.GEMINI_AI.TEMPERATURE),
      MAX_TOKEN: config?.maxTokens ?? (serviceName === 'grok' ? AIConfig.GROK_VALIDATOR.MAX_TOKEN : 2048),
      TOP_P: config?.topP ?? (serviceName === 'grok' ? AIConfig.GROK_VALIDATOR.TOP_P : 1.0),
    };
  }
}

export default new AIConfigService();
