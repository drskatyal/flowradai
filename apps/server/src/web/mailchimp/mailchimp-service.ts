////mailchimp-service.ts
import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import logger from "../../core/logger";
import { getMailChimpConfig } from "../../config/env";

const config = getMailChimpConfig();

interface MailchimpUser {
  email: string;
  firstName?: string;
  lastName?: string;
}

class MailChimpService {
  private apiKey: string;
  private listId: string;
  private dataCenter: string;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor() {
    this.apiKey = config.mailchimpApiKey as string;
    this.listId = config.mailchimpListId as string;
    this.dataCenter = this.apiKey.split("-")[1]; // e.g. "us10"
    this.baseUrl = `https://${this.dataCenter}.api.mailchimp.com/3.0`;

    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: "anystring", // Mailchimp ignores username
        password: this.apiKey,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /** Add or update user in Mailchimp list */
  async addOrUpdateUser({ email, firstName, lastName }: MailchimpUser) {
    try {
      const emailHash = crypto
        .createHash("md5")
        .update(email.toLowerCase())
        .digest("hex");

      const payload = {
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName || "",
          LNAME: lastName || "",
        },
      };

      const response = await this.client.put(
        `/lists/${this.listId}/members/${emailHash}`,
        payload
      );

      logger.info(
        `Mailchimp user synced successfully: ${email} (Status: ${response.data.status})`
      );
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data || error.message;
      logger.error(`Mailchimp add/update failed for ${email}: ${JSON.stringify(msg)}`);
      throw error;
    }
  }

  /** Get all users from Mailchimp list */
  async getUsers(params: { count?: number; offset?: number; status?: string } = {}) {
    try {
      const { count = 50, offset = 0, status = "subscribed" } = params;

      const response = await this.client.get(`/lists/${this.listId}/members`, {
        params: { count, offset, status },
      });

      logger.info(`Retrieved ${response.data.members.length} Mailchimp users.`);
      return response.data.members;
    } catch (error: any) {
      const msg = error.response?.data || error.message;
      logger.error(`Mailchimp getUsers failed: ${JSON.stringify(msg)}`);
      throw error;
    }
  }

  /** Bulk sync multiple users */
  async bulkSyncUsers(users: MailchimpUser[] = []) {
    for (const user of users) {
      try {
        await this.addOrUpdateUser(user);
      } catch (err) {
        logger.warn(`Skipped user ${user.email} due to error.`);
      }
    }
    logger.info(`Bulk sync completed for ${users.length} users.`);
  }
}

export default new MailChimpService();
