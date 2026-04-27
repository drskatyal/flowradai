import { NextFunction, Response } from 'express';
import logger from '../../core/logger';
import TemplateService from './template-service';
import { AuthenticatedRequest } from '../middlewares/clerk-authentication';
import { ITemplateModel } from './template-model';

class TemplateController {
  async createTemplate(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const userRole = req.auth().sessionClaims?.user?.role;

      // Set template type based on user role
      let templateType = req.body.type;
      if (!templateType) {
        // If no type is specified, use role-based defaults
        templateType = userRole === 'admin' ? 'private' : 'public';
      }

      const template = {
        title: req.body.title,
        description: req.body.description,
        userId,
        type: templateType,
        category: req.body.category,
        specialityId: req.body.specialityId || null,
        prompt: req.body.prompt
      } as ITemplateModel;

      const response = await TemplateService.createTemplate(template);

      res
        .status(200)
        .json({ message: 'Template created successfully', response });
    } catch (error) {
      logger.error('Error creating template', error);
      res.status(500).json({
        message: 'We encountered an issue creating your template. Please try again in a moment.'
      });
    }
  }

  async getTemplates(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const userRole = req.auth().sessionClaims?.user?.role;
      const {
        search = "",
        limit = 10,
        skip = 0,
        specialtyIds = "",
        categories = "",
        types = "",
        showMarketplace = "false",
        userSpecialityId,
      } = req.query;
      const toStringOrEmpty = (value: any): string =>
        Array.isArray(value)
          ? value[0]
          : typeof value === "string"
            ? value
            : "";
      const specialityId = toStringOrEmpty(userSpecialityId);

      // Parse specialtyIds if provided
      const parsedSpecialtyIds =
        specialtyIds &&
          typeof specialtyIds === "string" &&
          specialtyIds.length > 0
          ? specialtyIds.split(",")
          : [];

      // Parse categories if provided
      const parsedCategories =
        categories && typeof categories === "string" && categories.length > 0
          ? categories.split(",")
          : [];

      const parsedTypes =
        types && typeof types === "string" && types.length > 0
          ? types.split(",")
          : [];

      // Call service with appropriate parameters
      const response = await TemplateService.getTemplates(
        userId,
        search as string,
        Number(limit),
        Number(skip),
        userRole === "admin",
        parsedSpecialtyIds,
        parsedCategories,
        parsedTypes,
        specialityId,
        showMarketplace === "true"
      );

      res.status(200).json(response);
    } catch (error) {
      logger.error("Error fetching templates", error);
      res.status(500).json({
        message:
          "We encountered an issue fetching templates. Please try again in a moment.",
      });
    }
  }

  async getTemplateById(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const template = await TemplateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.status(200).json(template);
    } catch (error) {
      logger.error("Error fetching template", error);
      res.status(500).json({
        message:
          "We encountered an issue fetching the template. Please try again in a moment.",
      });
    }
  }

  async updateTemplate(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.auth().sessionClaims.internalId;
      const userRole = req.auth().sessionClaims?.user?.role;

      // Get the template to check ownership
      const template = await TemplateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Check if user is allowed to update the template
      // If template type is private and userId doesn't match, don't allow update
      // Admins can update any template
      if (
        template.type === "private" &&
        template.userId !== userId &&
        userRole !== "admin"
      ) {
        return res.status(403).json({
          message: "You do not have permission to update this template",
        });
      }

      const updateData = {
        ...req.body,
        specialityId: req.body.specialityId || null,
      };

      const updatedTemplate = await TemplateService.updateTemplate(
        id,
        updateData
      );

      res.status(200).json({
        message: "Template updated successfully",
        template: updatedTemplate,
      });
    } catch (error) {
      logger.error("Error updating template", error);
      res.status(500).json({
        message:
          "We encountered an issue updating the template. Please try again in a moment.",
      });
    }
  }

  async deleteTemplate(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userId = req.auth().sessionClaims.internalId;
      const userRole = req.auth().sessionClaims?.user?.role;

      // Get the template to check ownership
      const template = await TemplateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Check if user is allowed to delete the template
      // If template type is private and userId doesn't match, don't allow deletion
      // Admins can delete any template
      if (
        template.type === "private" &&
        template.userId !== userId &&
        userRole !== "admin"
      ) {
        return res.status(403).json({
          message: "You do not have permission to delete this template",
        });
      }

      await TemplateService.deleteTemplate(id);

      res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
      logger.error("Error deleting template", error);
      res.status(500).json({
        message:
          "We encountered an issue deleting the template. Please try again in a moment.",
      });
    }
  }

  async cloneTemplate(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Template ID is required" });
      }

      const response = await TemplateService.cloneTemplate(id, userId);

      res
        .status(200)
        .json({ message: "Template cloned successfully", response });
    } catch (error: any) {
      logger.error("Error cloning template", error);
      res.status(500).json({
        message:
          error.message ||
          "We encountered an issue cloning the template. Please try again in a moment.",
      });
    }
  }

  async bulkCloneTemplates(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Template IDs are required" });
      }

      const response = await TemplateService.bulkCloneTemplates(ids, userId);

      res
        .status(200)
        .json({ message: "Templates cloned successfully", response });
    } catch (error: any) {
      logger.error("Error bulk cloning templates", error);
      res.status(500).json({
        message:
          error.message ||
          "We encountered an issue cloning the templates. Please try again in a moment.",
      });
    }
  }
}

export default new TemplateController();
