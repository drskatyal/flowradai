import { serverAxios } from "@/lib/axios";

// Type definitions for AI service settings
export type LLMType = "grok" | "groq" | "gemini" | "openrouter";
export type TranscriptionType = "voxtral" | "gemini" | "groq";
export type RefineType = "gemini" | "groq";
export type ValidatorType = "gemini" | "grok";
export type ResearchType = "parallel-ai";
export type EmbeddingType = "voyage-ai";

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

export interface TranscriptionConfig {
  model: string;
  language: string;
  temperature: number;
  maxTokens?: number;
  prompt?: string;
}

export interface RefineConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

export interface ValidatorConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

export interface ResearchConfig {
  model: string;
  baseUrl: string;
}

export interface EmbeddingConfig {
  model: string;
  rerankModel: string;
}

export interface AIServiceSettings {
  defaultService: LLMType;
  llmConfig: Record<LLMType, LLMConfig>;

  transcription: {
    defaultService: TranscriptionType;
    config: Record<TranscriptionType, TranscriptionConfig>;
  };

  refinement: {
    defaultService: RefineType;
    config: Record<RefineType, RefineConfig>;
  };

  validation: {
    defaultService: ValidatorType;
    config: Record<ValidatorType, ValidatorConfig>;
  };

  research: {
    defaultService: ResearchType;
    config: Record<ResearchType, ResearchConfig>;
  };

  embeddings: {
    defaultService: EmbeddingType;
    config: Record<EmbeddingType, EmbeddingConfig>;
  };
}

// Function to fetch current AI service settings
export const fetchAIServiceSettings = async (): Promise<AIServiceSettings> => {
  const response = await serverAxios.get("/settings/ai-service");
  return response.data;
};

// Function to update AI service settings
export const updateAIServiceSettings = async (
  settings: Partial<AIServiceSettings>
): Promise<AIServiceSettings> => {
  const response = await serverAxios.put("/settings/ai-service", settings);
  return response.data;
};
