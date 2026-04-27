import { Response, NextFunction } from "express";
import CustomProfileService from "./custom-profile-service";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import logger from "../../core/logger"; 
import CustomProfileModel from "./custom-profile-model";

const createOrUpdateProfile = async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  try {
    const { content } = req.body;
    const userId = req.auth().sessionClaims.internalId;

    const profile = await CustomProfileService.createOrUpdateCustomProfile(userId, content);

    res.status(200).json({ message: "Profile saved", profile });
  } catch (err) {
    logger.error("Error creating or updating profile", {
      error: err,
    });
    res.status(500).json({ message: "Failed to create or update profile" });
  }
};

const getProfile = async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  try {
    const userId = req.auth().sessionClaims.internalId;
    const profile = await CustomProfileService.getCustomProfile(userId);

    if (!profile) {
      return res.status(200).json({ message: "Profile not found" });
    }

    res.status(200).json({ data: profile });
  } catch (err) {
    logger.error("Error getting profile", {
      error: err,
    });
    res.status(500).json({ message: "Failed to get profile" });
  }
};

export default {
  createOrUpdateProfile,
  getProfile,
};
