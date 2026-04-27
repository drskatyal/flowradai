import { Router } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import subscriptionController from "./subscription-controller";

const router = Router();

router.put("/:id", (req, res, next) =>
    subscriptionController.getUserSubscription(req as any, res, next)
);

export default router;