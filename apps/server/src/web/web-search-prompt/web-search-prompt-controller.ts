import { Request, Response } from "express";
import logger from "../../core/logger";
import webSearchPromptService from "./web-search-prompt-service";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";

class WebSearchPromptController {
    /**
     * Get the currently active web search prompt
     */
    async getPrompt(req: AuthenticatedRequest, res: Response) {
        try {
            const prompt = await webSearchPromptService.getPrompt();

            if (!prompt) {
                // If no prompt exists, initialize with default
                await webSearchPromptService.initializeDefaultPrompt();
                const defaultPrompt = await webSearchPromptService.getPrompt();

                return res.status(200).json({
                    success: true,
                    data: defaultPrompt,
                });
            }

            return res.status(200).json({
                success: true,
                data: prompt,
            });
        } catch (error) {
            logger.error("Error getting active web search prompt:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve web search prompt",
            });
        }
    }

    /**
     * Update the web search prompt
     */
    async updatePrompt(req: AuthenticatedRequest, res: Response) {
        try {
            const { prompt } = req.body;
            const adminId = req.auth().userId;

            // Validate input
            if (!prompt) {
                return res.status(400).json({
                    success: false,
                    message: "Prompt is required",
                });
            }

            if (typeof prompt !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Prompt must be a string",
                });
            }

            if (prompt.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Prompt cannot be empty",
                });
            }

            if (prompt.length > 5000) {
                return res.status(400).json({
                    success: false,
                    message: "Prompt is too long (maximum 5000 characters)",
                });
            }

            // Update the prompt
            const updatedPrompt = await webSearchPromptService.updatePrompt(prompt);

            logger.info(`Web search prompt updated by admin ${adminId}`);

            return res.status(200).json({
                success: true,
                data: updatedPrompt,
                message: "Web search prompt updated successfully",
            });
        } catch (error) {
            logger.error("Error updating web search prompt:", error);
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to update web search prompt",
            });
        }
    }


}

export default new WebSearchPromptController();
