import { IReportValidatorStrategy } from "./strategies/interface";
import { GrokReportValidatorStrategy } from "./strategies/grok-strategy";
import { GeminiReportValidatorStrategy } from "./strategies/gemini-strategy";
import aiConfigService from "../settings/ai-config-service";

export type ValidatorMode = "grok" | "gemini";

class ReportValidatorService {
  private strategies: Record<ValidatorMode, IReportValidatorStrategy>;

  constructor() {
    this.strategies = {
      grok: new GrokReportValidatorStrategy(),
      gemini: new GeminiReportValidatorStrategy(),
    };
  }

  async checkReportErrors(
    report: string,
    findings: string,
    prompt: string,
    userId: string,
    threadId?: string,
    mode?: ValidatorMode,
  ) {
    const activeMode = mode || (aiConfigService.getDefaultValidationService() as ValidatorMode) || "gemini";
    const strategy = this.strategies[activeMode];
    if (!strategy) throw new Error(`Unsupported mode: ${activeMode}`);
    return strategy.checkReportErrors(report, findings, prompt, userId, threadId);
  }
}

export default new ReportValidatorService();
