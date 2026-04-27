
import { Request, Response } from "express";
import MailChimpService from "./mailchimp-service"; 
import logger from "../../core/logger";

class MailchimpController {
  /** 
   * Add or update a single Mailchimp user 
   * POST /api/mailchimp/user
   */
  async createOrUpdateUser(req: Request, res: Response) {
    try {
      const { email, firstName, lastName } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const response = await MailChimpService.addOrUpdateUser({
        email,
        firstName,
        lastName,
      });

      logger.info(`Mailchimp user created/updated: ${email}`);
      return res.status(200).json({
        success: true,
        message: "User added or updated successfully",
        data: response,
      });
    } catch (error: any) {
      const msg = error.response?.data || error.message;
      logger.error(`Mailchimp createOrUpdateUser error: ${JSON.stringify(msg)}`);
      return res.status(500).json({
        success: false,
        message: "Failed to create or update user in Mailchimp",
        error: msg,
      });
    }
  }

  /** 
   * Get all users from Mailchimp list 
   * GET /api/mailchimp/users
   */
  async getUsers(req: Request, res: Response) {
    try {
      const { count, offset, status } = req.query;

      const users = await MailChimpService.getUsers({
        count: count ? Number(count) : 50,
        offset: offset ? Number(offset) : 0,
        status: status ? String(status) : "subscribed",
      });

      logger.info(`Mailchimp users fetched successfully`);
      return res.status(200).json({
        success: true,
        total: users.length,
        data: users,
      });
    } catch (error: any) {
      const msg = error.response?.data || error.message;
      logger.error(`Mailchimp getUsers error: ${JSON.stringify(msg)}`);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch Mailchimp users",
        error: msg,
      });
    }
  }

  /** 
   * Bulk sync multiple users 
   * POST /api/mailchimp/bulk-sync
   */
  async bulkSync(req: Request, res: Response) {
    try {
      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: "Users array is required" });
      }

      await MailChimpService.bulkSyncUsers(users);

      logger.info(`Bulk sync completed for ${users.length} users`);
      return res.status(200).json({
        success: true,
        message: `Bulk sync completed for ${users.length} users`,
      });
    } catch (error: any) {
      const msg = error.response?.data || error.message;
      logger.error(`Mailchimp bulkSync error: ${JSON.stringify(msg)}`);
      return res.status(500).json({
        success: false,
        message: "Failed to bulk sync users",
        error: msg,
      });
    }
  }
}

export default new MailchimpController();
