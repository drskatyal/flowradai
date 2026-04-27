import logger from "../core/logger";
import OpenAI from "openai";
import { VoyageAIClient } from "voyageai";
import { getOpenAiConfig, getPortkeyConfig } from "../config/env";
import { getVoyageAiConfig } from "../config/env/voyageai";
import { LLMWrapper } from "../core/llm/llm-wrapper";

let xenovaEmbedder: any = null;

const { apiKey: openaiApiKey } = getOpenAiConfig();
const portkeyConfig = getPortkeyConfig();

const openaiOptions: any = {
  apiKey: openaiApiKey,
};

if (portkeyConfig.apiKey) {
  openaiOptions.baseURL = portkeyConfig.baseUrl;
  openaiOptions.defaultHeaders = {
    'x-portkey-api-key': portkeyConfig.apiKey,
    'x-portkey-provider': 'openai',
  };
}

const openai = new OpenAI(openaiOptions);

// Initialize the Voyage client
const voyage = getVoyageAiConfig();
const voyageClient = new VoyageAIClient({
  apiKey: voyage.apiKey,
});

// Choose provider: "xenova" | "openai" | "voyage"
let PROVIDER = "voyage";

export async function generateEmbedding(input: string, provider: string): Promise<number[]> {
  try {
    if (!input || typeof input !== "string") {
      const msg = "Invalid input provided to embedding generator";
      logger.warn(msg, { input });
      throw new Error(msg);
    }

    PROVIDER = provider;
    switch (PROVIDER) {
      case "xenova": {
        if (!xenovaEmbedder) {
          const { pipeline } = await import("@xenova/transformers");
          xenovaEmbedder = await pipeline(
            "feature-extraction",
            "Xenova/nomic-embed-text-v1"
          );
        }
        const results = await xenovaEmbedder(input, {
          pooling: "mean",
          normalize: true,
        });
        return Array.from(results.data);
      }

      case "openai": {
        const res = await LLMWrapper.executeSDKFunction({
          providerName: "OpenAI",
          actionName: "Generate Embedding",
          execute: async () => {
            return await openai.embeddings.create({
              model: "text-embedding-3-small",
              input,
            });
          }
        });
        const embedding = res?.data?.[0]?.embedding;
        if (!embedding) throw new Error("OpenAI response missing embedding data");
        return embedding;
      }

      case "voyage": {
        const res = await LLMWrapper.executeSDKFunction({
          providerName: "Voyage",
          actionName: "Generate Embedding",
          execute: async () => {
            return await voyageClient.embed({
              model: voyage.model,
              input,
              inputType: "document", // "query" for user queries
            });
          }
        });
        const embedding = res?.data?.[0]?.embedding;
        if (!embedding) throw new Error("Voyage response missing embedding data");
        return embedding;
      }

      default:
        throw new Error(`Unsupported embedding provider: ${PROVIDER}`);
    }
  } catch (error: any) {
    logger.error("Embedding generation failed", {
      provider: PROVIDER,
      message: error?.message || "Unknown error",
      stack: error?.stack,
    });
    throw new Error("Embedding generation failed. Please try again.");
  }
}
