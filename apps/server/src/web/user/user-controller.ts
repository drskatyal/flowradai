import { Request, Response } from "express";
import logger from "../../core/logger";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import {
  revokeUserSession,
  getUserSessionInfo,
} from "../middlewares/session-management";
import userService from "./user-service";
import { clerkClient } from "@clerk/express";

class UserController {
  async handleClerkEvent(req: Request, res: Response) {
    try {
      const body = req.body;
      const event = body.type;
      const data = body.data;

      switch (event) {
        case "user.created":
          await userService.createOrUpdateUserByClerkId(data);
          break;

        case "user.updated":
          await userService.createOrUpdateUserByClerkId(data);
          break;

        case "user.deleted":
          await userService.softDeleteUser({ clerkId: data.id });
          break;

        default:
          logger.warn(`Unhandled event type: ${event}`);
      }

      return res.status(200).json({ status: "success", event });
    } catch (error: any) {
      logger.error(`Error processing Clerk event: ${error}`);
      return res.status(500).json({ status: "error", message: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const updateUserPayload = req.body;
    const updatedUser = await userService.updateUser(id, updateUserPayload);
    return res.status(200).json(updatedUser);
  }

  async updateUserByClerkId(req: Request, res: Response) {
    const { clerkId } = req.params;
    const updateUserPayload = req.body;

    try {
      const updatedUser = await userService.updateUserByClerkId(
        clerkId,
        updateUserPayload
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(updatedUser);
    } catch (error: any) {
      logger.error(`Error updating user by clerkId: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }

  async verifyOnboarding(req: AuthenticatedRequest, res: Response) {
    const userId = req.auth().userId;

    const { referralCode, isSkip } = req.body;
    if (isSkip) {
      // Skip onboarding and update user status
      const updatedUser = await userService.skipOnboarding(userId);

      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: "User not found or already onboarded" });
      }

      return res
        .status(200)
        .json({ message: "Onboarding skipped", user: updatedUser });
    } else {
      try {
        const verified = await userService.verifyReferralCode(
          userId,
          referralCode
        );
        return res.status(200).json(verified);
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
    }
  }

  async ensureUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { referralCode, couponCode } = req.body;
      const clerkId = req.auth().userId;

      const clerkUser = await clerkClient.users.getUser(clerkId);

      const user = await userService.createOrUpdateUserByClerkId(
        clerkUser,
        referralCode,
        couponCode
      );

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      logger.error(`Error in ensureUser: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      logger.error(`Error fetching user: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const filters = {
        role: req.query.role as string,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await userService.getAllUsersByRole(filters);

      return res.status(200).json({
        users: result.users,
        pagination: {
          total: result.total,
          pages: result.pages,
          currentPage: filters.page,
          limit: filters.limit,
        },
      });
    } catch (error: any) {
      logger.error(`Error fetching users: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Force logout a user by revoking their active session
   * POST /api/users/:clerkId/force-logout
   */
  async forceLogout(req: Request, res: Response) {
    const { clerkId } = req.params;

    try {
      const success = await revokeUserSession(clerkId);

      if (!success) {
        return res.status(404).json({
          error: "No active session found for this user",
        });
      }

      return res.status(200).json({
        message: "User session revoked successfully",
        clerkId,
      });
    } catch (error: any) {
      logger.error(`Error forcing logout for user ${clerkId}: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user's current session information
   * GET /api/users/:clerkId/session-info
   */
  async getSessionInfo(req: Request, res: Response) {
    const clerkId = req.params.clerkId;

    try {
      const sessionInfo = await getUserSessionInfo(clerkId);
      if (!sessionInfo) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(sessionInfo);
    } catch (error: any) {
      logger.error(`Error getting session info for user ${clerkId}: ${error}`);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController();