import { Router } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import authMiddleware from "../middlewares/clerk-authentication";
import EmbeddingController from "./embedding-controller";;

const router = Router();

router.post("/generate", authMiddleware, (req, res, next) => 
    EmbeddingController.getEmbedding(req as AuthenticatedRequest, res, next)
);

export default router;