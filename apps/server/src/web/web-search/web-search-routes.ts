import { Router } from "express";
import authMiddleware from "../middlewares/clerk-authentication";
import webSearchController from "./web-search-controller";

const router = Router();

router.get("/", authMiddleware, webSearchController.getWebSearches);
router.post("/", authMiddleware, webSearchController.webSearch);
router.delete("/:id", authMiddleware, webSearchController.deleteWebSearch);

export default router;