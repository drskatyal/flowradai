import OpenAI from "openai";
import aiConfigService from "../settings/ai-config-service";
import { LLMWrapper } from "../../core/llm/llm-wrapper";
import { getPortkeyConfig } from "../../config/env/portkey";
import { getAppConfig } from "../../config/env/app";

export type RefineMode = string;

class RefineService {
  async refineText(
    text: string,
    instruction: string,
    mode: RefineMode = aiConfigService.getDefaultRefinementService(),
    userId?: string,
    threadId?: string
  ): Promise<{ correctedText: string; service: string }> {
    const config = aiConfigService.getRefineConfig(mode);
    const portkeyConfig = getPortkeyConfig();
    const appConfig = getAppConfig();

    let client: OpenAI;

    if (portkeyConfig.apiKey) {
      // Infer provider from mode string
      let provider = "openai";
      const modeLower = mode.toLowerCase();
      if (modeLower.includes("groq")) provider = "groq";
      else if (modeLower.includes("gemini")) provider = "google";
      else if (modeLower.includes("openai")) provider = "openai";

      const headers: any = {
        "x-portkey-api-key": portkeyConfig.refine.apiKey,
        "x-portkey-provider": provider,
      };

      if (portkeyConfig.refine.configId) {
        headers["x-portkey-config"] = portkeyConfig.refine.configId;
      }

      client = new OpenAI({
        apiKey: "dummy-key", // Portkey will use the virtual key's actual stored provider key
        baseURL: portkeyConfig.baseUrl,
        defaultHeaders: headers,
      });
    } else {
      // Fallback if no portkey is configured (should have OpenAI configured normally)
      client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    const portkeyHeaders = {
      'x-portkey-metadata': JSON.stringify({
        _user: userId || "anonymous",
        environment: appConfig.env || 'development',
        feature: 'text-refine',
        // request_id: threadId || "123"
      })
    };

    const correctedText = await LLMWrapper.generateChatCompletion({
      client,
      model: config.MODEL,
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: text },
      ],
      temperature: config.TEMPERATURE,
      maxTokens: config.MAX_TOKEN,
      topP: config.TOP_P,
      providerName: `Refine-${mode}`,
      customHeaders: portkeyHeaders
    });

    return {
      correctedText,
      service: mode,
    };
  }
}

export default new RefineService();
