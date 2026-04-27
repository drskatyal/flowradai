import { Router } from "express";
import couponCodeController from "./coupon-code-controller";
import authMiddleware from "../middlewares/clerk-authentication";

const router = Router();

router.post(
    "/createOrUpdateCouponCode",
    authMiddleware,
    couponCodeController.createOrUpdateCouponCode
);
router.get(
    "/getCouponCodes",
    authMiddleware,
    couponCodeController.getCouponCodes
);
router.get(
    "/getCouponCodeById",
    authMiddleware,
    couponCodeController.getCouponCodeById
);
router.delete(
    "/deleteCouponCode",
    authMiddleware,
    couponCodeController.deleteCouponCode
);
router.post(
    "/toggleCouponCodeStatus",
    authMiddleware,
    couponCodeController.toggleCouponCodeStatus
);
router.get(
    "/generateCouponCode",
    authMiddleware,
    couponCodeController.generateCouponCode
);
router.post(
    "/applyCouponCode",
    authMiddleware,
    couponCodeController.applyCouponCode
);
router.get(
    "/getUserCouponSubscriptions",
    authMiddleware,
    couponCodeController.getUserCouponSubscriptions
);
router.get(
    "/getCouponUsageDetails",
    authMiddleware,
    couponCodeController.getCouponUsageDetails
);

export default router;