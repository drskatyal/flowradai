import { google } from "googleapis";
import nodemailer from "nodemailer";
import logger from "../../core/logger";
import { getContactUsConfig } from "../../config/env/contact-us";
import { getGoogleSheetsConfig } from "../..//config/env";

const contactUsConfig = getContactUsConfig();
const googleSheetConfig = getGoogleSheetsConfig();

interface ContactUsParams {
  name: string;
  email: string;
  message: string;
  organization: string;
  phone_no: string;
  fbclid: string;
  gclid: string;
  utm_campaign: string;
  utm_medium: string;
  utm_source: string;
  utm_term: string;
}

class ContactUsService {
  private sheetsClient: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: googleSheetConfig.projectId,
        private_key_id: googleSheetConfig.privateKeyId,
        private_key: googleSheetConfig.privateKey?.replace(/\\n/g, "\n"),
        client_email: googleSheetConfig.clientEmail,
        client_id: googleSheetConfig.clientId,
        universe_domain: googleSheetConfig.universeDomain,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheetsClient = google.sheets({ version: "v4", auth });
  }

  private async addToGoogleSheet(data: ContactUsParams) {
    // Check if all UTM/tracking params are empty
    const hasTracking =
      data.utm_source || data.utm_medium || data.utm_campaign || data.utm_term || data.gclid || data.fbclid;

    if (!hasTracking) {
      logger.info("No tracking parameters provided. Skipping Google Sheet entry.");
      return;
    }

    const now = new Date();

    // Format: MM/DD/YY HH:mm:ss
    const formattedDate = now
      .toLocaleString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 24-hour format
      })
      .replace(",", "");

    try {
      const sheet = await this.sheetsClient.spreadsheets.values.append({
        spreadsheetId: googleSheetConfig.spreadsheetId,
        range: `${googleSheetConfig.sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              data.name,
              data.email,
              data.organization,
              data.phone_no,
              data.message,
              data.utm_source,
              data.utm_medium,
              data.utm_campaign,
              data.utm_term,
              data.gclid,
              data.fbclid,
              formattedDate,
            ],
          ],
        },
      });
      return sheet.data;
    } catch (error) {
      logger.error("Failed to add contact submission to Google Sheet:", error);
    }
  }

  async sendContactMessage(params: ContactUsParams) {
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

      // Conditionally include Tracking section in email
      const hasTracking =
        params.utm_source || params.utm_medium || params.utm_campaign || params.utm_term || params.gclid || params.fbclid;

      const trackingHtml = hasTracking
        ? `
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <h4 style="margin-bottom: 10px;">Tracking Information</h4>
        <p style="margin: 5px 0;"><strong>UTM Source:</strong> ${params.utm_source}</p>
        <p style="margin: 5px 0;"><strong>UTM Medium:</strong> ${params.utm_medium}</p>
        <p style="margin: 5px 0;"><strong>UTM Campaign:</strong> ${params.utm_campaign}</p>
        <p style="margin: 5px 0;"><strong>UTM Term:</strong> ${params.utm_term}</p>
        <p style="margin: 5px 0;"><strong>GCLID:</strong> ${params.gclid}</p>
        <p style="margin: 5px 0;"><strong>FBCLID:</strong> ${params.fbclid}</p>
      `
        : "";

      const mailOptions = {
        from: contactUsConfig.smtpUser,
        to: contactUsConfig.receiverEmail,
        subject: `New Contact Us Message from ${params.name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0a2540; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Flowrad AI - Contact Us Submission</h2>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa; color: #333;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${params.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${params.email}</p>
            <p style="margin: 5px 0;"><strong>Organization:</strong> ${params.organization}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${params.phone_no}</p>
            <p style="margin: 5px 0;"><strong>Message:</strong><br/>${params.message ?? ""}</p>
            ${trackingHtml}
          </div>
          <div style="background-color: #0a2540; color: #ffffff; padding: 10px; text-align: center; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Flowrad AI. All rights reserved.
          </div>
        </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);

      let sheetResponse = null;
      // Add to Google Sheet only if tracking info exists
      if (hasTracking) {
        sheetResponse = await this.addToGoogleSheet(params);
      }

      return {
        messageId: info.messageId,
        accepted: info.accepted,
        sheet: sheetResponse,
      };
    } catch (error) {
      logger.error("Error sending contact us email:", error);
      throw new Error("Failed to send contact us message. Please try again later.");
    }
  }
}

export default new ContactUsService();
