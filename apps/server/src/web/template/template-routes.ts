import { Router } from "express";
import templateController from "./template-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import authMiddleware from "../middlewares/clerk-authentication";

const router = Router();

// Create a new template
router.post("/", authMiddleware, (req, res, next) =>
  templateController.createTemplate(req as AuthenticatedRequest, res, next)
);

// Get all templates (with optional search)
router.get("/", authMiddleware, (req, res, next) =>
  templateController.getTemplates(req as AuthenticatedRequest, res, next)
);

// Get template by ID
router.get("/:id", authMiddleware, (req, res, next) =>
  templateController.getTemplateById(req as AuthenticatedRequest, res, next)
);

// Update template
router.put("/:id", authMiddleware, (req, res, next) =>
  templateController.updateTemplate(req as AuthenticatedRequest, res, next)
);

// Delete template
router.delete("/:id", authMiddleware, (req, res, next) =>
  templateController.deleteTemplate(req as AuthenticatedRequest, res, next)
);

// Clone template
router.post("/clone", authMiddleware, (req, res, next) =>
  templateController.cloneTemplate(req as AuthenticatedRequest, res, next)
);

// Bulk Clone templates
router.post("/bulk-clone", authMiddleware, (req, res, next) =>
  templateController.bulkCloneTemplates(req as AuthenticatedRequest, res, next)
);

export default router;