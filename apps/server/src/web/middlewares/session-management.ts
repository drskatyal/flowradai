import { NextFunction, Response } from "express";
import { clerkClient } from "@clerk/express";
import logger from "../../core/logger";
import { AuthenticatedRequest } from "./clerk-authentication";
import UserModel from "../user/user-model";

/**
 * Session Management Strategy
 * 
 * Options:
 * 1. BLOCK_NEW_LOGIN - Prevent new login if user is already logged in on another device
 * 2. REVOKE_OLD_SESSION - Automatically revoke old session and allow new login
 */
export enum SessionStrategy {
    BLOCK_NEW_LOGIN = "BLOCK_NEW_LOGIN",
    REVOKE_OLD_SESSION = "REVOKE_OLD_SESSION"
}

// Configure your preferred strategy here
let ACTIVE_STRATEGY: SessionStrategy = SessionStrategy.REVOKE_OLD_SESSION;

/**
 * Middleware to enforce single-device login
 * 
 * This middleware checks if a user is already logged in on another device.
 * Based on the configured strategy, it either:
 * - Blocks the new login attempt (BLOCK_NEW_LOGIN)
 * - Revokes the old session and allows the new login (REVOKE_OLD_SESSION)
 */
export const singleDeviceSessionMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const auth = req.auth();

        if (!auth || !auth.userId || !auth.sessionId) {
            return next();
        }

        const clerkId = auth.userId;
        const currentSessionId = auth.sessionId;

        // Find user in database
        const user = await UserModel.findOne({ clerkId });

        if (!user) {
            logger.warn(`User not found for clerkId: ${clerkId}`);
            return next();
        }

        logger.info("User found in database", {
            userId: user.id,
            clerkId,
            activeSessionId: user.activeSessionId,
            lastLoginAt: user.lastLoginAt
        });

        // Check if user has an active session
        if (user.activeSessionId && user.activeSessionId !== currentSessionId) {

            // Use type assertion to handle TypeScript enum narrowing
            const strategy = ACTIVE_STRATEGY as SessionStrategy;

            switch (strategy) {
                case SessionStrategy.BLOCK_NEW_LOGIN:
                    // Strategy 1: Block new login
                    logger.warn(`BLOCKING new login for user ${clerkId} - already logged in on another device`);

                    return res.status(403).json({
                        error: "ALREADY_LOGGED_IN",
                        message: "You are already logged in on another device. Please log out from the other device first.",
                        lastLoginAt: user.lastLoginAt,
                        code: "SINGLE_DEVICE_VIOLATION"
                    });

                case SessionStrategy.REVOKE_OLD_SESSION:
                    // Strategy 2: Revoke old session and allow new login
                    logger.info(`REVOKING old session for user ${clerkId} and allowing new login`);

                    try {
                        // Revoke the old session in Clerk
                        await clerkClient.sessions.revokeSession(user.activeSessionId);
                    } catch (error: any) {
                        logger.error(`Failed to revoke old session: ${error.message}`, {
                            sessionId: user.activeSessionId,
                            clerkId
                        });
                        // Continue anyway - the old session might already be invalid
                    }

                    // Update user with new session
                    user.activeSessionId = currentSessionId;
                    user.lastLoginAt = new Date();
                    await user.save();

                    break;
            }
        } else if (!user.activeSessionId || user.activeSessionId === currentSessionId) {
            // First login or same session - update session info
            const isFirstLogin = !user.activeSessionId;
            const isSameSession = user.activeSessionId === currentSessionId;

            user.activeSessionId = currentSessionId;
            user.lastLoginAt = new Date();
            await user.save();

            logger.info(`Session ${isFirstLogin ? 'initialized' : 'refreshed'} for user ${clerkId}`, {
                sessionId: currentSessionId,
                isNewSession: isFirstLogin
            });
        }

        next();
    } catch (error: any) {
        logger.error(`Error in single device session middleware: ${error.message}`, {
            error: error.stack,
            path: req.path
        });
        // Don't block the request on middleware errors
        next();
    }
};

/**
 * Manually revoke a user's active session
 * This can be called from an API endpoint to force logout a user
 */
export const revokeUserSession = async (clerkId: string): Promise<boolean> => {
    try {
        const user = await UserModel.findOne({ clerkId });

        if (!user || !user.activeSessionId) {
            logger.warn(`No active session found for user ${clerkId}`);
            return false;
        }

        // Revoke the session in Clerk
        await clerkClient.sessions.revokeSession(user.activeSessionId);

        // Clear session info in database
        user.activeSessionId = undefined;
        await user.save();

        logger.info(`Successfully revoked session for user ${clerkId}`);
        return true;
    } catch (error: any) {
        logger.error(`Failed to revoke session for user ${clerkId}: ${error.message}`);
        throw error;
    }
};

/**
 * Get user's active session info
 */
export const getUserSessionInfo = async (clerkId: string) => {
    try {
        const user = await UserModel.findOne({ clerkId });
        if (!user) {
            return null;
        }

        return {
            hasActiveSession: !!user.activeSessionId,
            sessionId: user.activeSessionId,
            lastLoginAt: user.lastLoginAt
        };
    } catch (error: any) {
        logger.error(`Failed to get session info for user ${clerkId}: ${error.message}`);
        throw error;
    }
};
