import nodemailer from "nodemailer";
import logger from "../../core/logger";
import { getContactUsConfig } from "../../config/env/contact-us";

const contactUsConfig = getContactUsConfig();

interface ShareEmailParams {
  fromEmail: string;
  toEmail: string;
  subject: string;
  message: string;
}

class ShareService {
  async sendShareEmail(params: ShareEmailParams) {
    try {
      const transporter = nodemailer.createTransport({
        host: contactUsConfig.smtpHost,
        port: contactUsConfig.smtpPort,
        secure: contactUsConfig.smtpSecure,
        auth: {
          user: contactUsConfig.smtpUser,
          pass: contactUsConfig.smtpPass,
        },
        pool: true
      });

      const mailOptions = {
        from: `"${params.fromEmail}" <${contactUsConfig.smtpUser}>`,
        to: params.toEmail,
        replyTo: params.fromEmail,
        subject: params.subject,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0a2540; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Shared Report</h2>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa; color: #333;">
            <div style="background-color: #ffffff; padding: 15px; border: 1px solid #ddd; border-radius: 4px;">
              ${params.message}
            </div>
          </div>
          <div style="background-color: #0a2540; color: #ffffff; padding: 10px; text-align: center; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Flowrad AI. All rights reserved.
          </div>
        </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        messageId: info.messageId,
        accepted: info.accepted,
      };
    } catch (error) {
      logger.error("Error sending share email:", error);
      throw new Error("Failed to send share email. Please try again later.");
    }
  }
}

export default new ShareService();
