import { Request, Response, NextFunction } from "express";
import contactUsService from "./contact-us-service";
import logger from "../../core/logger";

interface Timing {
  start: number;
  end?: number;
}

class ContactUsController {
  async sendMessage(req: Request, res: Response, _next: NextFunction) {
    try {
      const {
        name,
        email,
        message,
        organization,
        phone_no = "",
        fbclid = "",
        gclid = "",
        utm_campaign = "",
        utm_medium = "",
        utm_source = "",
        utm_term = ""
      } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message: "Invalid input: Name, email, and message are required.",
        });
      }

      res.status(200).json({ message: "Message received. Thank you!" });

      // Background processing: non-blocking
      setImmediate(async () => {
        try {
          const timing: Timing = { start: Date.now() };
          timing.end = Date.now();
          await contactUsService.sendContactMessage({
            name,
            email,
            message,
            organization,
            phone_no,
            fbclid,
            gclid,
            utm_campaign,
            utm_medium,
            utm_source,
            utm_term,
          });
          timing['end'] = Date.now();
          logger.info(`Contact background done in ${timing.end - timing.start}ms`);
        } catch (bgErr) {
          logger.error("Background contact-us job failed:", bgErr);
        }
      });

    } catch (error) {
      logger.error("Error sending contact message:", error);
      return res
        .status(500)
        .json({ message: "Something went wrong. Please try again later." });
    }
  }
}

export default new ContactUsController();
