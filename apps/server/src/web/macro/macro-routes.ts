import { Router } from "express";
import macroController from "./macro-controller";
import authMiddleware from "../middlewares/clerk-authentication";

const router = Router();

router.post("/createOrUpdateMacro", authMiddleware, macroController.createOrUpdateMacro);
router.get("/getMacros", authMiddleware, macroController.getMacros);
router.get("/getMacroById", authMiddleware, macroController.getMacroById);
router.delete("/deleteMacro", authMiddleware, macroController.deleteMacro);
router.post("/cloneMacro", authMiddleware, macroController.cloneMacro);
router.post("/bulkCloneMacros", authMiddleware, macroController.bulkCloneMacros);

export default router;

