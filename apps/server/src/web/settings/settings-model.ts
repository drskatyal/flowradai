import mongoose, { Schema, Document } from "mongoose";
import { IBaseModel } from "../../models/base-model";
import { LLMType } from "../../core/llm/llm-service";

// Define the interface for Settings model
export interface ISettingsModel extends IBaseModel {
  key: string;
  value: any;
  description?: string;
}

// Create the schema for settings - use SchemaDefinition type
const settingsSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret: Record<string, any>) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
    },
  },
});

// Add the same methods as baseSchema
settingsSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

settingsSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

// Method for soft deletion
settingsSchema.methods.delete = async function () {
  this.isDeleted = true;
  await this.save();
};

// Create and export the model
const SettingsModel = mongoose.model<ISettingsModel & Document>("Settings", settingsSchema);

export default SettingsModel;

// ─── Type definitions for AI service settings ────────────────────────────────

// LLM Config (Grok / OpenAI)
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}

// Transcription Config (Voxtral / Groq / Gemini)
export interface TranscriptionConfig {
  model: string;
  language: string;
  temperature: number;
  maxTokens?: number;
}

// Refine Config (Gemini / OpenAI)
export interface RefineConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

// Validator Config (Gemini / Grok)
export interface ValidatorConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

// Research Config (Parallel AI)
export interface ResearchConfig {
  model: string;
  baseUrl: string;
}

// Embedding Config (Voyage AI)
export interface EmbeddingConfig {
  model: string;
  rerankModel: string;
}

// Full AI Service Settings structure (matches admin panel UI)
export type TranscriptionType = 'voxtral' | 'gemini' | 'groq';
export type RefineType = 'gemini' | 'groq';
export type ValidatorType = 'gemini' | 'grok';
export type ResearchType = 'parallel-ai';
export type EmbeddingType = 'voyage-ai';

// Full AI Service Settings structure (matches admin panel UI)
export interface AIServiceSettings {
  defaultService: LLMType;
  llmConfig: Record<LLMType, LLMConfig>;

  refinement: {
    defaultService: RefineType;
    config: Record<RefineType, RefineConfig>;
  };

  validation: {
    defaultService: ValidatorType;
    config: Record<ValidatorType, ValidatorConfig>;
  };
}

// Define keys for settings to avoid string duplication
export const SETTINGS_KEYS = {
  AI_SERVICE: "ai_service",
};