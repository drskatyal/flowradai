import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import logger from "../../core/logger";
import aiConfigService from "../settings/ai-config-service";
import embeddingService from "./embedding-service";

class EmbeddingController {
  getEmbedding = async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const { input, isTemplate, threshold = 0.5, limit = 1 } = req.body;

      const specialityId = req.auth()?.sessionClaims?.user?.specialityId;
      const userId = req.auth()?.sessionClaims?.internalId;
      const provider = aiConfigService.getEmbeddingProvider();

      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Input string is required." });
      }

      if (!specialityId) {
        return res.status(400).json({ message: "Speciality ID is required." });
      }

      // Generate embedding
      const inputEmbedding = await embeddingService.generateInputEmbedding(input);
      if (!inputEmbedding) {
        return res.status(500).json({ message: "Failed to generate embedding." });
      }

      // Handle template matching
      if (isTemplate) {
        let matches = await embeddingService.findMatchingTemplatesMongo(
          inputEmbedding,
          specialityId,
          userId,
          threshold,
          limit * 5  // multiple of 5 for reranker function
        );

        // If provider is voyage, rerank results
        if (provider === "voyage" && matches.length > 0) {
          matches = await embeddingService.rerankTemplates(input, matches, limit * 5);
        }

        return res.status(200).json({
          embedding: inputEmbedding,
          matchingTemplates: matches,
          totalMatches: matches.length,
        });
      }

      // Otherwise just return embedding
      return res.status(200).json({ embedding: inputEmbedding });
    } catch (error) {
      logger.error("Error in getEmbedding", { error });
      return res.status(500).json({ message: "Internal server error." });
    }
  };
}

export default new EmbeddingController();