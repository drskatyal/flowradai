import { Router } from "express";
import authMiddleware from ".././middlewares/clerk-authentication";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import adminMiddleware from "../middlewares/admin-middleware";
import paymentController from "./payment-controller";

const router = Router();

router.post("/create", authMiddleware, (req, res, next) =>
  paymentController.createPaymentLink(req as AuthenticatedRequest, res, next)
); // Create a new PaymentLink

router.post("/webhooks/razorpay", paymentController.handleRazorpayEvent);

// Add admin-only access to payments list
router.get("/all", authMiddleware, adminMiddleware, paymentController.getAllPayments);
router.get("/export", authMiddleware, adminMiddleware, paymentController.exportPayments);

// User access to their own payments
router.get("/history", authMiddleware, (req, res, next) =>
  paymentController.getUserPayments(req as AuthenticatedRequest, res)
);

router.get("/billing-history", authMiddleware, (req, res, next) =>
  paymentController.getBillingHistory(req as AuthenticatedRequest, res)
);

export default router;
