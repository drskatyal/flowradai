import { clerkMiddleware } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import logger from "../../core/logger";

// Clerk middleware automatically reads CLERK_SECRET_KEY from environment
// Make sure CLERK_SECRET_KEY is set in your environment variables
const clerkAuthMiddleware = clerkMiddleware();

export interface AuthenticatedRequest extends Request {
  auth: () => {
    userId: string;
    sessionId: string;
    sessionClaims: {
      internalId: string;
      user: {
        role: string;
        specialityId: string;
      };
    };
  };
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Clerk middleware handles async operations internally
  // We wrap it to ensure proper error handling
  const handleAuth = () => {
    try {
      clerkAuthMiddleware(req, res, (err?: any) => {
        if (err) {
          logger.error("Authentication error:", err);
          return res.status(401).json({
            error: "Unauthorized",
            message: "Authentication failed. Please ensure you have valid credentials.",
          });
        }
        next();
      });
    } catch (error) {
      logger.error("Authentication middleware error:", error);
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication failed. Please ensure you have valid credentials.",
      });
    }
  };

  handleAuth();
};

export default authMiddleware;
