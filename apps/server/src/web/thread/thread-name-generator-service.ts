import logger from "../../core/logger";
import aiConfigService from "../settings/ai-config-service";

class ThreadNameGeneratorService {
    private readonly MAX_NAME_LENGTH = 50;
    private readonly MAX_WORDS = 6;
    private readonly API_TIMEOUT = 10000; // 10 seconds

    /**
     * Generate a concise, contextual thread name from findings using Gemini Flash 3
     * @param findings - The user's medical findings input
     * @returns A short, descriptive thread name (max 50 chars) or null if generation fails
     */
    async generateThreadName(findings: string): Promise<string | null> {
        try {
            // Validate input
            if (!findings || findings.trim().length === 0) {
                logger.warn("Empty findings provided for thread name generation");
                return null;
            }

            // Truncate very long findings to avoid token limits
            const truncatedFindings = findings.substring(0, 500);

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                logger.error("GEMINI_API_KEY is not set");
                return null;
            }

            const prompt = this.buildPrompt(truncatedFindings);
            const generatedName = await this.callGeminiAPI(prompt, apiKey);

            if (!generatedName) {
                return null;
            }

            // Sanitize and validate the generated name
            const sanitizedName = this.sanitizeName(generatedName);

            if (!sanitizedName || sanitizedName.length === 0) {
                logger.warn("Generated name is empty after sanitization");
                return null;
            }

            logger.info(`Successfully generated thread name: "${sanitizedName}"`);
            return sanitizedName;

        } catch (error) {
            logger.error("Error generating thread name with Gemini", error);
            return null;
        }
    }

    /**
     * Build the prompt for Gemini to generate thread name
     */
    private buildPrompt(findings: string): string {
        return `Based on the following medical findings, generate a concise, professional thread name.

                Requirements:
                - Maximum ${this.MAX_WORDS} words
                - Maximum ${this.MAX_NAME_LENGTH} characters
                - Use medical terminology when appropriate
                - Be specific and descriptive
                - Do NOT include dates, patient names, or IDs
                - Return ONLY the thread name, nothing else (no quotes, no explanations)

                Findings:
                ${findings}

                Thread Name:`;
    }

    /**
     * Call Gemini API to generate the thread name
     */
    private async callGeminiAPI(prompt: string, apiKey: string): Promise<string | null> {
        try {
            const geminiConfig = aiConfigService.getGeminiAIConfig();
            const url = `${geminiConfig.BASE_URL}/v1beta/models/${geminiConfig.MODEL}:generateContent?key=${apiKey}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3, // Slightly creative but consistent
                        maxOutputTokens: 30, // Short outputs only
                        topP: 0.95,
                    },
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                logger.error("Gemini API error", {
                    status: response.status,
                    error: errorData,
                });
                return null;
            }

            const data = await response.json();
            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                logger.error("Gemini response missing text field", data);
                return null;
            }

            return generatedText.trim();

        } catch (error) {
            if (error.name === "AbortError") {
                logger.error("Gemini API request timeout");
            } else {
                logger.error("Error calling Gemini API", error);
            }
            return null;
        }
    }

    /**
     * Sanitize the generated name to ensure it's safe and meets requirements
     */
    private sanitizeName(name: string): string {
        // Remove quotes if present
        let sanitized = name.replace(/^["']|["']$/g, "");

        // Remove any leading/trailing whitespace
        sanitized = sanitized.trim();

        // Remove newlines and multiple spaces
        sanitized = sanitized.replace(/\s+/g, " ");

        // Remove special characters that might cause issues (keep alphanumeric, spaces, hyphens, parentheses)
        sanitized = sanitized.replace(/[^\w\s\-().,]/g, "");

        // Truncate to max length
        if (sanitized.length > this.MAX_NAME_LENGTH) {
            sanitized = sanitized.substring(0, this.MAX_NAME_LENGTH);

            // Try to cut at last complete word
            const lastSpace = sanitized.lastIndexOf(" ");
            if (lastSpace > this.MAX_NAME_LENGTH * 0.7) {
                sanitized = sanitized.substring(0, lastSpace);
            }

            sanitized = sanitized.trim() + "...";
        }

        return sanitized;
    }

    /**
     * Get a fallback date-based thread name (matches current behavior)
     */
    getFallbackName(): string {
        const today = new Date();
        return today.toLocaleDateString("en-GB");
    }
}

export default new ThreadNameGeneratorService();
