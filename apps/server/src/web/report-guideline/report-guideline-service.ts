import OpenAI from "openai";
import logger from "../../core/logger";
import { getParallelAiConfig } from "../../config/env/parallel-ai";

interface SearchReportGuidelineType {
  objective: string;
  searchQuery: string;
}

const parallelConfig = getParallelAiConfig();

class ReportGuidelineService {
  private client: OpenAI;
  private apiKey: string;

  constructor() {
    this.apiKey = parallelConfig.apiKey;
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: parallelConfig.baseUrl,
    });
  }

  /**
   * Generate a structured report guideline using Parallel (Chat API with JSON schema)
   * Supports streaming
   */
  async searchReportGuideline({
    objective,
    searchQuery,
  }: SearchReportGuidelineType): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      const startTime = Date.now();
      const response = await this.client.chat.completions.create({
        model: parallelConfig.model,
        stream: true,
        messages: [
          {
            role: "system",
            content: `${objective}
          
          IMPORTANT – STRICTLY FOLLOW THESE RULES (Highest Priority):
          
          1. All headings must be Markdown headings using ## for main sections.
          2. Each heading must be on its own line.
          3. Content must start on a new line immediately after the heading.
          4. Use - or • for bullet points.
          5. Use [link text](URL) for clickable links.
          6. Never put the heading and content on the same line.
          7. Include a blank line between sections for spacing.
          8. Do not include raw HTML, code fences, JSON, or any other metadata.
          9. Output plain Markdown text only, following these rules strictly.
          10. Output plain Markdown text only, following these rules strictly.
          11. CRITICAL: Use ONLY standard ASCII characters. NO fancy bullets (•), NO em-dashes (—), NO en-dashes (–). Use simple hyphens (-) only.`
          },
          {
            role: "user",
            content: searchQuery,
          },
        ],
      });

      logger.info("Parallel chat guideline streaming started");

      async function* streamChunks() {
        for await (const chunk of response) {
          // Cast to any since Parallel AI's structure differs from OpenAI's types
          const parallelChunk = chunk as any;
          let delta = parallelChunk.data?.choices?.[0]?.delta?.content;

          if (delta) {
            // Clean up encoding issues
            delta = delta
              .replace(/â¢/g, '•')  // Fix bullet points
              .replace(/â/g, '–')   // Fix en-dash
              .replace(/â/g, '—');  // Fix em-dash
            yield delta;
          }

          // Break when we get null content (end of stream)
          if (delta === null) {
            break;
          }
        }
        const duration = Date.now() - startTime;
        logger.info(`AI Service Response Time (Report Guideline): Parallel AI - ${duration}ms`);
      }

      return streamChunks();
    } catch (error) {
      logger.error("Error while generating report guideline:", error);
      throw error;
    }
  }
}

export default ReportGuidelineService;