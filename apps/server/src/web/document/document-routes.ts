import { Router } from "express";
import documentController from "./document-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import authMiddleware from "../middlewares/clerk-authentication";

const router = Router();

// Create a new document (admin only)
router.post("/", authMiddleware, (req, res, next) => 
  documentController.createDocument(req as AuthenticatedRequest, res, next)
);

// Get all documents (with optional search)
router.get("/", authMiddleware, (req, res, next) => 
  documentController.getDocuments(req as AuthenticatedRequest, res, next)
);

// Get document by ID
router.get("/:id", authMiddleware, (req, res, next) => 
  documentController.getDocumentById(req as AuthenticatedRequest, res, next)
);

// Update document (admin only)
router.put("/:id", authMiddleware, (req, res, next) => 
  documentController.updateDocument(req as AuthenticatedRequest, res, next)
);

// Delete document (admin only)
router.delete("/:id", authMiddleware, (req, res, next) => 
  documentController.deleteDocument(req as AuthenticatedRequest, res, next)
);

export default router;