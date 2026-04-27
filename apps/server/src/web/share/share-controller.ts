import { Request, Response } from "express";
import shareService from "./share-service";
import logger from "../../core/logger";

class ShareController {
    async shareEmail(req: Request, res: Response) {
        try {
            const { fromEmail, toEmail, subject, message } = req.body;

            if (!fromEmail || !toEmail || !subject || !message) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const result = await shareService.sendShareEmail({
                fromEmail,
                toEmail,
                subject,
                message,
            });

            res.status(200).json({ message: "Email sent successfully", result });
        } catch (error: any) {
            logger.error("Error in ShareController.shareEmail:", error);
            res.status(500).json({ message: error.message || "Internal server error" });
        }
    }
}

export default new ShareController();
