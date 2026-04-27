import { z } from "zod";
import logger from "../../core/logger";
import aiConfigService from "../../web/settings/ai-config-service";

const openAiOssSchema = z.object({
    MODEL: z.string(),
    TEMPERATURE: z.number().default(1),
    MAX_COMPLETION_TOKEN: z.number(),
    TOP_P: z.number().default(1),
    API_KEY: z.string().optional(),
    STREAM: z.boolean().default(false),
    REASONING_EFFORT: z.enum(["low", "medium", "high"]).default("medium"),
});

export const getOpenAiOssConfig = () => {
    // Read from DB-backed config service
    const dbConfig = aiConfigService.getOpenAIOSSConfig();
    const configData = {
        ...dbConfig,
        API_KEY: process.env.GROQ_API_KEY
    };

    const config = openAiOssSchema.safeParse(configData);

    if (!config.success) {
        const errorMessages = config.error.errors
            .map((err) => `${err.path.join(".")} - ${err.message}`)
            .join(", ");
        logger.error(`OpenAI OSS config validation error: ${errorMessages}`);
        throw new Error(`OpenAI OSS config validation error: ${errorMessages}`);
    }

    return {
        model: config.data.MODEL,
        temperature: config.data.TEMPERATURE,
        maxCompletionTokens: config.data.MAX_COMPLETION_TOKEN,
        topP: config.data.TOP_P,
        apiKey: config.data.API_KEY,
        stream: config.data.STREAM,
        reasoningEffort: config.data.REASONING_EFFORT,
    };
};
