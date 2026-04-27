import OpenAI from "openai";
import logger from "../../core/logger";
import { getParallelAiConfig } from "../../config/env/parallel-ai";
import webSearchPromptService, {
    DEFAULT_PROMPT,
} from "../web-search-prompt/web-search-prompt-service";

const parallelConfig = getParallelAiConfig();

class WebSearchService {
    private client: OpenAI;
    private apiKey: string;

    constructor() {
        this.apiKey = parallelConfig.apiKey;
        this.client = new OpenAI({
            apiKey: this.apiKey,
            baseURL: parallelConfig.baseUrl,
            defaultHeaders: {
                "parallel-beta": "search-extract-2025-10-10",
            },
        });
    }

    /**
     * Perform a web search using Parallel AI
     */
    async webSearch(query: string, history: Array<{ outputText: string }> = []) {
        try {
            // Fetch the active prompt from database
            let promptToUse = DEFAULT_PROMPT;

            try {
                const prompt = await webSearchPromptService.getPrompt();
                if (prompt && prompt.prompt) {
                    promptToUse = prompt.prompt;
                    logger.debug("Using custom web search prompt from database");
                } else {
                    logger.debug("Using default web search prompt");
                }
            } catch (promptError) {
                logger.warn(
                    "Failed to fetch web search prompt, using default:",
                    promptError
                );
            }

            const messages: any[] = [
                {
                    role: "system",
                    content: promptToUse,
                },
            ];

            // Combine identified context sections as an array with the current query
            let combinedContent = query;
            if (history.length > 0) {
                combinedContent = `Context from previous searches:\n${JSON.stringify(
                    history,
                    null,
                    2
                )}\n\nMy current query is:\n${query}`;
            }

            // Add as a single unified user prompt
            messages.push({ role: "user", content: combinedContent });

            logger.info(
                `[WebAssist] Sending LLM Input Messages:\n${JSON.stringify(
                    messages,
                    null,
                    2
                )}`
            );

            const response = await this.client.chat.completions.create({
                model: parallelConfig.model,
                messages,
                stream: true,
            });

            async function* streamChunks() {
                for await (const chunk of response) {
                    // Cast to any since Parallel AI's structure differs from OpenAI's types
                    const parallelChunk = chunk as any;
                    // check for both structure formats just in case
                    let delta =
                        parallelChunk.choices?.[0]?.delta?.content ||
                        parallelChunk.data?.choices?.[0]?.delta?.content;

                    if (delta) {
                        // Clean up encoding issues
                        delta = delta
                            .replace(/â¢/g, "•") // Fix bullet points
                            .replace(/â/g, "–") // Fix en-dash
                            .replace(/â/g, "—"); // Fix em-dash
                        yield delta;
                    }

                    // Break when we get null content (end of stream)
                    if (delta === null) {
                        break;
                    }
                }
            }

            return streamChunks();
        } catch (error) {
            logger.error("Error while performing web search:", error);
            throw error;
        }
    }
}

export default WebSearchService;