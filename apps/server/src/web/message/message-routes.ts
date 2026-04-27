import { Router } from "express";
import messageController from "./message-controller";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

const router = Router();

// Define routes for message operations
router.post("/", (req, res, next) =>
  messageController.createMessage(req as AuthenticatedRequest, res, next)
); // Create a new message

router.get("/:id", (req, res, next) =>
  messageController.getThreadMessagesById(req as any, res, next)
); // fetch all messages in thread

router.put("/:id", (req, res, next) =>
  messageController.updateMessage(req as any, res, next)
); // update a message

router.post("/applychanges", (req, res, next) =>
  messageController.createApplyChangesMessage(req as AuthenticatedRequest, res, next)
); // Create a apply changes message

export default router;
