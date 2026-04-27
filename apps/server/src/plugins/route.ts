import { Express } from "express";
import audioRoutes from "../web/audio/audio-routes";
import messageRoutes from "../web/message/message-routes";
import authMiddleware from "../web/middlewares/clerk-authentication";
import { singleDeviceSessionMiddleware } from "../web/middlewares/session-management";
import paymentRoutes from "../web/payment/payment-routes";
import refineRoutes from "../web/refine/refine-routes";
import reportExportRoutes from "../web/report-export/report-export-routes";
import settingsRoutes from "../web/settings/settings-routes";
import templateRoutes from "../web/template/template-routes";
import threadRoutes from "../web/thread/thread-routes";
import userRoutes from "../web/user/user-routes";
import customProfileRoutes from "../web/custom-profile/custom-profile-routes";
import specialityRoutes from "../web/speciality/speciality-routes";
import documentRoutes from "../web/document/document-routes";
import contactUsRoutes from "../web/contact-us/contact-us-routes";
import embeddingRoutes from "../web/embedding/embedding-routes";
import reportValidatorRoutes from "../web/report-validator/report-validator-routes";
import reportGuidelineReoutes from "../web/report-guideline/report-guideline-routes";
import reportAnalysisRoutes from "../web/report-analysis/report-analysis-routes";
import subscriptionRoutes from "../web/subscription/subscription-route";
import mailchimpRoutes from "../web/mailchimp/mailchimp-routes";
import shareRoutes from "../web/share/share-routes";
import referralRoutes from "../web/referral/referral-routes";
import macroRoutes from "../web/macro/macro-routes";
import couponCodeRoutes from "../web/coupon-code/coupon-code-routes";
import webSearchRoutes from "../web/web-search/web-search-routes";
import webSearchPromptRoutes from "../web/web-search-prompt/web-search-prompt-routes";
import portkeyRoutes from "../web/portkey/portkey-routes";
import planRoutes from "../web/plan/plan-routes";
import sonioxRoutes from "../web/soniox/soniox-routes";
import { Plugin } from "./plugin";

class RoutesPlugin implements Plugin {
  install(app: Express): void {
    app.get("/", authMiddleware, (req, res) => {
      res.send({
        message: "Welcome to the Flowrad AI Report API",
        description: "This API provides endpoints for managing reports.",
      });
    });

    app.use("/users", userRoutes);

    // Apply session middleware to all authenticated routes
    app.use(
      "/thread",
      authMiddleware,
      singleDeviceSessionMiddleware,
      threadRoutes
    );

    app.use(
      "/message",
      authMiddleware,
      singleDeviceSessionMiddleware,
      messageRoutes
    );

    app.use("/payment", paymentRoutes);

    app.use("/settings", settingsRoutes);

    app.use("/web-search-prompt", webSearchPromptRoutes);

    app.use("/portkey", portkeyRoutes);

    app.use(
      "/template",
      authMiddleware,
      singleDeviceSessionMiddleware,
      templateRoutes
    );

    app.use(
      "/refine",
      authMiddleware,
      singleDeviceSessionMiddleware,
      refineRoutes
    );

    app.use(
      "/audio",
      authMiddleware,
      singleDeviceSessionMiddleware,
      audioRoutes
    );

    app.use(
      "/report-export",
      authMiddleware,
      singleDeviceSessionMiddleware,
      reportExportRoutes
    );

    app.use(
      "/custom-profile",
      authMiddleware,
      singleDeviceSessionMiddleware,
      customProfileRoutes
    );

    app.use(
      "/speciality",
      authMiddleware,
      singleDeviceSessionMiddleware,
      specialityRoutes
    );

    app.use(
      "/document",
      authMiddleware,
      singleDeviceSessionMiddleware,
      documentRoutes
    );

    app.use(
      "/contact-us",
      authMiddleware,
      singleDeviceSessionMiddleware,
      contactUsRoutes
    );

    app.use(
      "/embedding",
      authMiddleware,
      singleDeviceSessionMiddleware,
      embeddingRoutes
    );

    app.use(
      "/report",
      authMiddleware,
      singleDeviceSessionMiddleware,
      reportValidatorRoutes
    );

    app.use(
      "/guideline",
      authMiddleware,
      singleDeviceSessionMiddleware,
      reportGuidelineReoutes
    );

    app.use(
      "/report-analysis",
      authMiddleware,
      singleDeviceSessionMiddleware,
      reportAnalysisRoutes
    );

    app.use(
      "/subscription",
      authMiddleware,
      singleDeviceSessionMiddleware,
      subscriptionRoutes
    );

    app.use("/mailchimp", mailchimpRoutes);

    app.use("/share", authMiddleware, singleDeviceSessionMiddleware, shareRoutes);

    app.use(
      "/referral",
      authMiddleware,
      singleDeviceSessionMiddleware,
      referralRoutes
    );

    app.use(
      "/macro",
      authMiddleware,
      singleDeviceSessionMiddleware,
      macroRoutes
    );

    app.use(
      "/coupon-code",
      authMiddleware,
      singleDeviceSessionMiddleware,
      couponCodeRoutes
    );

    app.use(
      "/web-search",
      authMiddleware,
      singleDeviceSessionMiddleware,
      webSearchRoutes
    );

    app.use(
      "/plans",
      authMiddleware,
      singleDeviceSessionMiddleware,
      planRoutes
    );

    // Soniox temp-key endpoint — used by the lite single-file build
    // (the Next.js client uses /api/get-temporary-api-key; lite uses this)
    app.use('/soniox', authMiddleware, sonioxRoutes);

    // Add more routes here as needed
  }
}

export default RoutesPlugin;