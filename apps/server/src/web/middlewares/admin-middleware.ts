import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./clerk-authentication";
import logger from "../../core/logger";
import { clerkClient } from "@clerk/nextjs/server";
interface User {
  role: string;
  status: string;
  referralCode: string;
}

const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user ID directly from auth.userId
    const userId = req.auth().userId;
    async function getUserData(userId) {
      const user = await (await clerkClient()).users.getUser(userId);
      return user.publicMetadata;
    }

    if (!userId) {
      logger.warn("No user ID found in admin check");
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required"
      });
    }

    const { user } = await getUserData(userId)  as { user: User };

    if (!user) {
      logger.warn("User not found in admin check", { userId });
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    if (user.role !== "admin") {
      logger.warn("Non-admin access attempt", { 
        userId,
        userRole: user.role 
      });
      return res.status(403).json({
        error: "Forbidden",
        message: "Admin access required"
      });
    }

    next();
  } catch (error) {
    logger.error("Error in admin middleware:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Error checking admin privileges"
    });
  }
};

export default adminMiddleware;