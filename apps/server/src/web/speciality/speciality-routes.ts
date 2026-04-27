import { Router } from "express";
import specialityController from "./speciality-controller";
import authMiddleware, { AuthenticatedRequest } from "../middlewares/clerk-authentication";

const router = Router();

// Create a new speciality
router.post("/", authMiddleware, (req, res, next) =>
  specialityController.createSpeciality(req as AuthenticatedRequest, res, next)
);

// Get all specialities (with optional search, pagination)
router.get("/", authMiddleware, (req, res, next) =>
  specialityController.getSpecialities(req as AuthenticatedRequest, res, next)
);

// Get speciality list
router.get("/speciality-list", authMiddleware, (req, res, next) =>
  specialityController.getSpecilalityList(req as AuthenticatedRequest, res, next)
);

// Get a speciality by ID
router.get("/:id", authMiddleware, (req, res, next) =>
  specialityController.getSpecialityById(req as AuthenticatedRequest, res, next)
);

// Update a speciality by ID
router.put("/:id", authMiddleware, (req, res, next) =>
  specialityController.updateSpeciality(req as AuthenticatedRequest, res, next)
);

// Delete a speciality by ID
router.delete("/:id", authMiddleware, (req, res, next) =>
  specialityController.deleteSpeciality(req as AuthenticatedRequest, res, next)
);

export default router;
