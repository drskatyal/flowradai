import TemplateModel, { ITemplateModel } from "./template-model";
import { generateEmbedding } from "../../utils/embedding";
import mongoose from "mongoose";
import aiConfigService from "../settings/ai-config-service";
import logger from "../../core/logger";

class TemplateService {
  async createTemplate(templateData: ITemplateModel): Promise<ITemplateModel> {
    try {
      // Step 1: Generate embedding from description
      const embedding = await generateEmbedding(templateData.description, aiConfigService.getEmbeddingProvider());

      // Step 2: Add embedding to templateData
      const newTemplate = new TemplateModel({
        ...templateData,
        embedding, // assuming schema has been updated with `embedding: [Number]`
      });

      // Step 3: Save to DB
      const savedTemplate = await newTemplate.save();

      logger.info("Template created successfully", {
        templateId: savedTemplate._id,
        userId: savedTemplate.userId,
      });

      return savedTemplate;
    } catch (error: any) {
      logger.error("Failed to create template with embedding", {
        message: error.message,
        stack: error.stack,
        templateTitle: templateData.title,
      });
      throw new Error("Template creation failed. Please try again later.");
    }
  }

  async getTemplateById(id: string): Promise<ITemplateModel | null> {
    return TemplateModel.findById(id);
  }

  async updateTemplate(id: string, templateData: Partial<ITemplateModel>): Promise<ITemplateModel | null> {
    try {
      // If description is provided and changed, regenerate embedding
      if (templateData.description) {
        const embedding = await generateEmbedding(templateData.description, aiConfigService.getEmbeddingProvider());
        templateData.embedding = embedding;
      }

      const updatedTemplate = await TemplateModel.findByIdAndUpdate(id, templateData, { new: true });

      if (updatedTemplate) {
        logger.info("Template updated successfully", {
          templateId: updatedTemplate._id,
          userId: updatedTemplate.userId,
        });
      } else {
        logger.warn("No template found for update", { templateId: id });
      }

      return updatedTemplate;
    } catch (error: any) {
      logger.error("Failed to update template", {
        message: error.message,
        stack: error.stack,
        templateId: id,
      });
      throw new Error("Template update failed. Please try again later.");
    }
  }

  async deleteTemplate(id: string): Promise<ITemplateModel | null> {
    return TemplateModel.findByIdAndDelete(id);
  }

  async getTemplates(
    userId: string,
    query: string = '',
    limit: number = 10,
    skip: number = 0,
    isAdmin: boolean,
    specialtyIds: string[] = [],
    categories: string[] = [],
    types: string[] = [],
    specialityId: string,
    showMarketplace: boolean = false
  ): Promise<{
    templates: ITemplateModel[],
    count: number
  }> {
    // Trim the query to remove leading/trailing spaces
    const trimmedQuery = query.trim();

    const searchCondition = trimmedQuery
      ? { title: { $regex: trimmedQuery, $options: 'i' } }
      : {};

    // Add specialty filter if provided
    const specialtyFilter = specialtyIds.length > 0
      ? {
        specialityId: {
          $in: specialtyIds.map(id => {
            try {
              return new mongoose.Types.ObjectId(id);
            } catch (e) {
              return id; // In case it's already an ObjectId or invalid ID
            }
          })
        }
      }
      : {};

    // Add category filter if provided
    const categoryFilter = categories.length > 0
      ? { category: { $in: categories } }
      : {};

    // Add category filter if provided
    const typeFilter = types.length > 0
      ? { type: { $in: types } }
      : {};

    let filterCondition: any;

    if (showMarketplace) {
      // Show ONLY marketplace templates (type: private)
      filterCondition = {
        type: "private",
        ...searchCondition,
        ...specialtyFilter,
        ...categoryFilter,
        ...typeFilter,
      };
    } else {
      // Show user's own templates (type: public) or what they've created
      const orConditions: any[] = [{ userId: userId }];
      filterCondition = {
        $or: orConditions,
        ...searchCondition,
        ...specialtyFilter,
        ...categoryFilter,
        ...typeFilter,
      };
    }

    const templates = await TemplateModel.find(filterCondition)
      .sort({ title: 1 })
      .limit(limit)
      .skip(skip);

    const count = await TemplateModel.countDocuments(filterCondition);

    return { templates, count };
  }

  async cloneTemplate(templateId: string, userId: string) {
    try {
      // Find the original template
      const originalTemplate = await TemplateModel.findOne({
        _id: templateId,
        type: "private",
      });

      if (!originalTemplate) {
        throw new Error(
          "Default template not found or is not available for cloning."
        );
      }

      // Check if user already has this template cloned
      const existingClone = await TemplateModel.findOne({
        userId,
        originalTemplateId: templateId,
      });

      if (existingClone) {
        return existingClone; // Already cloned
      }

      // Create a clone for the user
      const clonedTemplate = new TemplateModel({
        userId,
        title: originalTemplate.title,
        description: originalTemplate.description,
        type: "public", // Cloned templates are 'public' (Personal)
        category: originalTemplate.category,
        specialityId: originalTemplate.specialityId,
        prompt: originalTemplate.prompt,
        embedding: originalTemplate.embedding,
        originalTemplateId: templateId,
      });

      return await clonedTemplate.save();
    } catch (error: any) {
      logger.error("Error cloning template", { error });
      throw error;
    }
  }

  async bulkCloneTemplates(templateIds: string[], userId: string) {
    try {
      const results = [];
      for (const id of templateIds) {
        try {
          const cloned = await this.cloneTemplate(id, userId);
          results.push(cloned);
        } catch (error) {
          logger.error(`Error cloning template ${id}`, error);
        }
      }
      return results;
    } catch (error: any) {
      logger.error("Error bulk cloning templates", { error });
      throw error;
    }
  }

  async getAllTemplates(): Promise<ITemplateModel[]> {
    return TemplateModel.find({
      embedding: { $exists: true, $not: { $size: 0 } },
    });
  }
}

export default new TemplateService();