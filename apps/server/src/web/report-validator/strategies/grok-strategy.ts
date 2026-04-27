import OpenAI from "openai";
import aiConfigService from "../../settings/ai-config-service";
import logger from "../../../core/logger";
import { IReportValidatorStrategy } from "./interface";
import { LLMWrapper } from "../../../core/llm/llm-wrapper";
import { getPortkeyValidationConfig } from "../../../config/env/portkey-validation";
import { getAppConfig } from "../../../config/env/app";

export class GrokReportValidatorStrategy implements IReportValidatorStrategy {
  async checkReportErrors(report: string, findings: string, prompt: string, userId: string, threadId?: string) {
    const fullPrompt = `
${prompt}
List them clearly in an ordered list format (1, 2, 3, ...) under "error".

Output strictly in valid JSON with this structure:

{
  "Validation": "Structured tick-box validation: include 'coverage', 'numeric_laterality_check', and 'new_additions_positive_only'.",
  "recommendation": "Numbered list of correction recommendations only if significant errors exist; otherwise 'None'.",
  "corrected_report": "Full corrected report preserving original structure and tone."
}
`;
    const inputData = `Findings:\n${findings}\n\nReport:\n${report}`;

    try {
      // 1) Pull dynamic config override for Grok Validator
      const aiConfig = aiConfigService.getValidatorConfig("grok");
      
      // 2) Pull Portkey config
      const portkeyConfig = getPortkeyValidationConfig();
      const appConfig = getAppConfig();

      // 3) Init OpenAI SDK pointed at Portkey
      const client = new OpenAI({
        apiKey: "dummy", 
        baseURL: portkeyConfig.baseUrl,
        defaultHeaders: {
          "x-portkey-api-key": portkeyConfig.apiKey,
          "x-portkey-config": portkeyConfig.configId
        }
      });

      const portkeyHeaders = {
        'x-portkey-metadata': JSON.stringify({
          _user: userId,
          environment: appConfig.env,
          feature: 'report-validation',
          request_id: threadId
        })
      };

      const responseText = await LLMWrapper.generateChatCompletion({
        client,
        model: aiConfig.MODEL, // Although portkey routes, passing it down is typical
        messages: [
          { role: "system", content: fullPrompt },
          { role: "user", content: inputData },
        ],
        temperature: aiConfig.TEMPERATURE,
        maxTokens: aiConfig.MAX_TOKEN,
        topP: aiConfig.TOP_P,
        providerName: "ReportValidator:Grok",
        customHeaders: portkeyHeaders
      });

      // Parse JSON
      let cleanText = responseText;
      cleanText = cleanText.replace(/```json|```/g, '').trim();
      
      const firstBraceIndex = cleanText.indexOf('{');
      const lastBraceIndex = cleanText.lastIndexOf('}');
      if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
          cleanText = cleanText.substring(firstBraceIndex, lastBraceIndex + 1);
      }

      const parsed = JSON.parse(cleanText || "{}");
      return {
        validation: parsed.Validation,
        recommendation: parsed.recommendation,
        corrected_report: parsed.corrected_report,
      };
    } catch (error) {
      logger.error("Grok Validator Strategy API error:", error);
      throw error;
    }
  }
}
