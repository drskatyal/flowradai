import logger from "../../core/logger";
import WebSearchPromptModel, { IWebSearchPromptModel } from "./web-search-prompt-model";

// Default prompt for web search
export const DEFAULT_PROMPT = "You're a radiology assistant. Use web search to find the most appropriate answer to the radiologist query and respond with citations";

class WebSearchPromptService {
    /**
     * Initialize default web search prompt if it doesn't exist
     */
    async initializeDefaultPrompt(): Promise<void> {
        try {
            const existingPrompt = await this.getPrompt();

            if (!existingPrompt) {
                const newPrompt = new WebSearchPromptModel({
                    prompt: DEFAULT_PROMPT,
                });
                await newPrompt.save();
                logger.info("Default web search prompt initialized");
            } else {
                logger.info("Web search prompt already exists");
            }
        } catch (error) {
            logger.error("Error initializing default web search prompt:", error);
            throw error;
        }
    }

    /**
     * Get the currently active web search prompt
     */
    async getPrompt(): Promise<IWebSearchPromptModel | null> {
        try {
            const prompt = await WebSearchPromptModel.findOne({}).sort({ createdAt: -1 });
            return prompt;
        } catch (error) {
            logger.error("Error getting active web search prompt:", error);
            throw new Error("Failed to retrieve active web search prompt");
        }
    }

    /**
     * Update the web search prompt
     */
    async updatePrompt(promptText: string): Promise<IWebSearchPromptModel> {
        try {
            // Validate prompt
            if (!promptText || promptText.trim().length === 0) {
                throw new Error("Prompt cannot be empty");
            }

            if (promptText.length > 5000) {
                throw new Error("Prompt is too long (maximum 5000 characters)");
            }

            // Create new active prompt
            const newPrompt = new WebSearchPromptModel({
                prompt: promptText.trim(),
            });

            await newPrompt.save();
            logger.info("Web search prompt updated successfully");

            return newPrompt;
        } catch (error) {
            logger.error("Error updating web search prompt:", error);
            throw error;
        }
    }


}

export default new WebSearchPromptService();
