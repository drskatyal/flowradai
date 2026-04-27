import { Router } from "express";
import referralController from "./referral-controller";
import authMiddleware from "../middlewares/clerk-authentication";


const router = Router();

// All routes require authentication
router.use(authMiddleware);


// POST /api/referral/activate - Activate a pending reward
router.post("/activate", referralController.activateReward);

// GET /api/referral/rewards - Get all rewards
router.get("/rewards", referralController.getRewards);

// GET /api/referral/stats - Get referral statistics
router.get("/stats", referralController.getStats);

// GET /api/referral/users - Get all referred users
router.get("/users", referralController.getReferredUsers);

export default router;
