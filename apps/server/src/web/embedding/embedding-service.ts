import mongoose from "mongoose";
import { generateEmbedding } from "../../utils/embedding";
import aiConfigService from "../settings/ai-config-service";
import logger from "../../core/logger";
import { ITemplateModel } from "../template/template-model";
import { VoyageAIClient } from "voyageai";
import { getVoyageAiConfig } from "../../config/env/voyageai";
import { LLMWrapper } from "../../core/llm/llm-wrapper";

export interface TemplateMatch {
  template: Partial<ITemplateModel>;
  similarity: number;
}

const voyage = getVoyageAiConfig();
const voyageClient = new VoyageAIClient({
  apiKey: voyage.apiKey,
});

class EmbeddingService {
  /**
   * Generate embedding for input string
   */
  async generateInputEmbedding(input: string): Promise<number[] | null> {
    const provider = aiConfigService.getEmbeddingProvider();
    try {
      return await generateEmbedding(input, provider);
    } catch (error) {
      logger.error("Failed to generate embedding", { error });
      return null;
    }
  }

  /**
   * Find matching templates using MongoDB similarity search
   */
  async findMatchingTemplatesMongo(
    inputEmbedding: number[],
    specialityId: string,
    userId: string,
    threshold: number,
    limit: number
  ): Promise<TemplateMatch[]> {
    const db = mongoose.connection.db;
    const templatesCollection = db.collection("templates");

    const inputNorm = Math.sqrt(inputEmbedding.reduce((sum, val) => sum + val * val, 0));

    const results = await templatesCollection
      .aggregate([
        {
          $match: {
            specialityId: new mongoose.Types.ObjectId(specialityId),
            embedding: { $type: "array" },
            $or: [{ userId: userId }, { type: "private" }],
          },
        },
        {
          $addFields: {
            dotProduct: {
              $reduce: {
                input: {
                  $map: {
                    input: { $range: [0, { $size: "$embedding" }] },
                    as: "i",
                    in: {
                      $multiply: [
                        { $arrayElemAt: ["$embedding", "$$i"] },
                        { $arrayElemAt: [inputEmbedding, "$$i"] },
                      ],
                    },
                  },
                },
                initialValue: 0,
                in: { $add: ["$$value", "$$this"] },
              },
            },
            templateNorm: {
              $sqrt: {
                $sum: {
                  $map: {
                    input: "$embedding",
                    as: "val",
                    in: { $pow: ["$$val", 2] },
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            similarity: {
              $divide: ["$dotProduct", { $multiply: ["$templateNorm", inputNorm] }],
            },
          },
        },
        {
          $match: {
            similarity: { $gte: threshold },
          },
        },
        {
          $sort: { similarity: -1 },
        },
        {
          $limit: limit,
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            embedding: 1,
            userId: 1,
            similarity: 1,
            type: 1,
            category: 1,
            specialityId: 1,
          },
        },
      ])
      .toArray();

    return results.map((doc) => ({
      template: {
        _id: doc._id,
        title: doc.title,
        description: doc.description,
        embedding: doc.embedding,
        userId: doc.userId,
        type: doc.type,
        category: doc.category,
        specialityId: doc.specialityId
      },
      similarity: doc.similarity,
    }));
  }

  /**
   * Apply Voyage Reranker if provider is voyage
   */
  async rerankTemplates(
    query: string,
    matches: TemplateMatch[],
    limit: number
  ): Promise<TemplateMatch[]> {
    try {
      const rerankResponse = await LLMWrapper.executeSDKFunction({
        providerName: "Voyage",
        actionName: "Rerank Documents",
        execute: async () => {
          return await voyageClient.rerank({
            model: "rerank-2.5",
            query,
            documents: matches.map((m) => m.template.description || ""),
          });
        }
      });

      let reranked = rerankResponse.data.map((r, idx) => ({
        template: matches[idx].template,
        similarity: r.relevanceScore,
      }));

      reranked.sort((a, b) => b.similarity - a.similarity);
      return reranked.slice(0, limit);
    } catch (err) {
      logger.error("Voyage reranker failed", { error: err });
      return matches.slice(0, limit); // fallback
    }
  }
}

export default new EmbeddingService();
