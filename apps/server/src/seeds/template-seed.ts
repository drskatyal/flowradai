import TemplateModel from "../web/template/template-model";
import { generateEmbedding } from "../utils/embedding";
import logger from "../core/logger";
import aiConfigService from "../web/settings/ai-config-service";

export const seedTemplates = async () => {
  try {
    // Fetch all templates that have a description
    const templates = await TemplateModel.find({
      description: { $exists: true, $ne: "" },
    });

    logger.info?.(`Found ${templates.length} templates to update with embeddings.`);

    for (const template of templates) {
      try {
        const inputText = template.description.trim();
        if (!inputText) {
          logger.warn?.(`Skipping template ID ${template._id} due to empty description`);
          continue;
        }

        // Optional: clear existing embedding first
        await TemplateModel.findByIdAndUpdate(template._id, {
          $unset: { embedding: "" },
        });

        // Generate new embedding
        const embedding = await generateEmbedding(inputText, aiConfigService.getEmbeddingProvider());

        if (Array.isArray(embedding)) {
          await TemplateModel.findByIdAndUpdate(template._id, {
            $set: { embedding },
          });

          logger.info?.(`Updated embedding for template ID ${template._id}`);
        } else {
          logger.warn?.(`Failed to generate embedding for template ID ${template._id}`);
        }
      } catch (err) {
        logger.error?.(`Error processing template ID ${template._id}:`, err);
      }
    }

    logger.info?.("Template embedding regeneration completed.");
  } catch (err) {
    logger.error?.("Error fetching templates:", err);
  }
};