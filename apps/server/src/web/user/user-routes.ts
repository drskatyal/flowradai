import { Router } from "express";
import userController from "./user-controller";
import authMiddleware from "../middlewares/clerk-authentication";
import adminMiddleware from "../middlewares/admin-middleware";
import { singleDeviceSessionMiddleware } from "../middlewares/session-management";

const router = Router();

router.post("/webhooks/clerk", userController.handleClerkEvent);

router.get("/all", authMiddleware, adminMiddleware, userController.getAllUsers);

router.put("/:id", authMiddleware, singleDeviceSessionMiddleware, userController.updateUser);

router.put("/clerk/:clerkId", authMiddleware, singleDeviceSessionMiddleware, userController.updateUserByClerkId);

router.get("/:id", authMiddleware, singleDeviceSessionMiddleware, userController.getUser);

router.post(
  "/onboarding",
  authMiddleware,
  singleDeviceSessionMiddleware,
  userController.verifyOnboarding
);

router.post(
  "/ensure",
  authMiddleware,
  singleDeviceSessionMiddleware,
  userController.ensureUser
);

// Session management routes
router.post(
  "/:clerkId/force-logout",
  authMiddleware,
  adminMiddleware,
  userController.forceLogout
);

router.get(
  "/:clerkId/session-info",
  authMiddleware,
  singleDeviceSessionMiddleware,
  userController.getSessionInfo
);

export default router;
