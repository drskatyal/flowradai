import express from "express";
import portkeyController from "./portkey-controller";
import authMiddleware from "../middlewares/clerk-authentication";
import adminMiddleware from "../middlewares/admin-middleware";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/providers", portkeyController.getProviders.bind(portkeyController));
router.get("/models/:slug", portkeyController.getModels.bind(portkeyController));
router.put("/config", portkeyController.updateConfig.bind(portkeyController));
// router.put("/audio-config", portkeyController.updateAudioConfig.bind(portkeyController));
router.put("/refine-config", portkeyController.updateRefineConfig.bind(portkeyController));
router.put("/validation-config", portkeyController.updateValidationConfig.bind(portkeyController));

export default router;