import fetch from "node-fetch";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { UploadedFile } from "express-fileupload";
import RefineService from "../refine/refine-service";
import { getInstructionsConfig } from "../../config/env/instructions";
import { AIConfig } from "../../core/config/ai-config";
import { getGroqConfig } from "../../config/env/groq";
import specialityService from "../speciality/speciality-service";
import { getMystralAiConfig } from "../../config/env/mystralai";
import { getGeminiTranscriptionConfig } from "../../config/env";
import { GEMINI_PROMPT } from "../../core/promts/promts";
import logger from "../../core/logger";

interface TranscriptionResult {
  text: string;
  rawText: string;
  success: boolean;
  timestamp: string;
  textLength: number;
  refined?: boolean;
  service?: 'groq' | 'voxtral' | 'gemini';
}

enum TranscriptionService {
  GROQ = 'groq',
  VOXTRAL = 'voxtral',
  GEMINI = 'gemini'
}

class AudioService {
  async transcribeAudioFile(
    audioFile: UploadedFile | UploadedFile[],
    autoRefine = false,
    actionMode = false,
    specialityId: string,
    transcriptionService: TranscriptionService = TranscriptionService.VOXTRAL
  ): Promise<TranscriptionResult> {
    let tempFilePath = "";

    try {
      const file = Array.isArray(audioFile) ? audioFile[0] : audioFile;
      if (!file) throw new Error("No file found in audio field");
      if (file.size === 0) throw new Error("Audio file is empty");

      const tempDir = os.tmpdir();
      const fileExtension = file.name.split(".").pop() || "webm";
      tempFilePath = path.join(tempDir, `recording-${Date.now()}.${fileExtension}`);
      await file.mv(tempFilePath);

      if (!fs.existsSync(tempFilePath) || fs.statSync(tempFilePath).size === 0) {
        throw new Error("Temporary file is missing or empty");
      }

      let result: TranscriptionResult;

      switch (transcriptionService) {
        case TranscriptionService.GROQ:
          result = await this.transcribeWithGroq(tempFilePath, actionMode, specialityId);
          break;
        case TranscriptionService.VOXTRAL:
          result = await this.transcribeWithVoxtral(tempFilePath, specialityId);
          break;
        case TranscriptionService.GEMINI:
          result = await this.transcribeWithGemini(tempFilePath, actionMode, autoRefine, specialityId);
          break;
        default:
          throw new Error(`Unsupported transcription service: ${transcriptionService}`);
      }

      fs.unlinkSync(tempFilePath);
      tempFilePath = "";

      if (result.text) {
        try {
          result = await this.refineTranscription(result, actionMode, autoRefine, specialityId);
        } catch (refineError) {
          logger.error("Grammar correction failed", refineError);
        }
      }

      return result;
    } catch (error) {
      logger.error("Error in transcription service", error);
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
          logger.warn("Temporary file deleted in error handler");
        } catch (cleanupError) {
          logger.warn("Failed to delete temporary file in error handler", cleanupError);
        }
      }
      throw error;
    }
  }

  private async transcribeWithGroq(
    tempFilePath: string,
    actionMode: boolean,
    specialityId: string
  ): Promise<TranscriptionResult> {
    const FormData = require("form-data");
    const formData = new FormData();

    const prompts = await specialityService.getPromptBySpecialityId(specialityId);
    const config = getInstructionsConfig();
    const groqConfig = getGroqConfig();

    formData.append("file", fs.createReadStream(tempFilePath));
    formData.append("model", actionMode ? AIConfig.GROQ_WHISPER.ACTION_MODE_MODEL : AIConfig.GROQ_WHISPER.MODEL);
    formData.append("language", AIConfig.GROQ_WHISPER.LANGUAGE);
    formData.append("temperature", AIConfig.GROQ_WHISPER.TEMPERATURE);
    formData.append("prompt", prompts?.wishperInstruction?.trim() || config.wishperPrompt);

    if (!groqConfig.apiKey) throw new Error("GROQ_API_KEY is not set in environment variables");

    const startTime = Date.now();
    const response = await fetch(`${AIConfig.GROQ_WHISPER.BASE_URL}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqConfig.apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const duration = Date.now() - startTime;
    logger.info(`AI Service Response Time (Audio Transcription): Groq - ${duration}ms`);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        logger.error("Groq API error", errorData);
        throw new Error(`Groq transcription failed: ${errorData.error?.message || JSON.stringify(errorData)}`);
      } catch {
        const errorText = await response.text();
        throw new Error(`Groq transcription failed: ${errorText}`);
      }
    }

    const data = await response.json();
    if (!data.text) throw new Error("Groq response missing text field");

    logger.info(`Groq transcription successful, text length: ${data.text.length}`);

    return {
      text: data.text,
      rawText: data.text,
      success: true,
      timestamp: new Date().toISOString(),
      textLength: data.text.length,
      service: "groq",
    };
  }

  private async transcribeWithVoxtral(
    tempFilePath: string,
    specialityId: string
  ): Promise<TranscriptionResult> {
    try {
      const mistralConfig = getMystralAiConfig();
      if (!mistralConfig.apiKey) throw new Error("MISTRAL_API_KEY is not set");

      const FormData = require("form-data");
      const prompts = await specialityService.getPromptBySpecialityId(specialityId);
      const config = getInstructionsConfig();

      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempFilePath));
      formData.append("model", mistralConfig.model);
      formData.append("response_format", "json");
      formData.append("language", mistralConfig.language);
      formData.append("temperature", mistralConfig.temperature);
      formData.append("prompt", prompts?.wishperInstruction?.trim() || config.wishperPrompt);

      const startTime = Date.now();
      const response = await fetch(`${AIConfig.MISTRAL_AI.BASE_URL}/audio/transcriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mistralConfig.apiKey}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const duration = Date.now() - startTime;
      logger.info(`AI Service Response Time (Audio Transcription): Voxtral - ${duration}ms`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Voxtral API error", errorData);
        throw new Error(`Voxtral transcription failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      if (!data.text) throw new Error("Voxtral response missing text field");

      logger.info(`Voxtral transcription successful, text length: ${data.text.length}`);

      return {
        text: data.text,
        rawText: data.text,
        success: true,
        timestamp: new Date().toISOString(),
        textLength: data.text.length,
        service: "voxtral",
      };
    } catch (error) {
      logger.error("Voxtral transcription error", error);
      throw new Error(`Voxtral transcription failed: ${error.message}`);
    }
  }

  private async transcribeWithGemini(
    tempFilePath: string,
    actionMode: boolean,
    autoRefine: boolean,
    specialityId: string
  ): Promise<TranscriptionResult> {
    try {
      const geminiConfig = getGeminiTranscriptionConfig();
      if (!geminiConfig.apiKey) throw new Error("GEMINI_API_KEY is not set");

      const prompts = await specialityService.getPromptBySpecialityId(specialityId);
      const config = getInstructionsConfig();

      // Read audio file as base64
      const audioBuffer = fs.readFileSync(tempFilePath);
      const base64Audio = audioBuffer.toString('base64');

      // Determine the mime type based on file extension
      const fileExtension = path.extname(tempFilePath).toLowerCase();
      const mimeTypeMap: { [key: string]: string } = {
        '.webm': 'audio/webm',
        '.mp3': 'audio/mp3',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.ogg': 'audio/ogg',
      };
      const mimeType = mimeTypeMap[fileExtension] || 'audio/webm';

      // Build the instruction based on mode
      let refinementInstruction = '';
      // if (actionMode) {
      //   refinementInstruction = prompts?.actionModeRefinementInstruction?.trim() || config.actionModeRefinementInstruction;
      // } else if (autoRefine) {
      //   refinementInstruction = prompts?.refinementInstruction?.trim() || config.refinementInstruction;
      // } else {
      //   refinementInstruction = prompts?.disabledRefinementInstructions?.trim() || config.disabledRefinementInstructions;
      // }


      // const geminiSystemPrompt = prompts?.geminiTranscriptionInstruction?.trim();
      const geminiSystemPrompt = 'You are radiology transcriptions assitent. You have to transcribe the audio file and return the text in the form of JSON with the key "text".';

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: geminiSystemPrompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Audio
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: geminiConfig.temperature,
          maxOutputTokens: geminiConfig.maxOutputToken,
        }
      };

      const startTime = Date.now();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiConfig.model}:generateContent?key=${geminiConfig.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const duration = Date.now() - startTime;
      logger.info(`AI Service Response Time (Audio Transcription): Gemini - ${duration}ms`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Gemini API error", errorData);
        throw new Error(`Gemini transcription failed: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error("Gemini response missing text field");
      }

      const transcribedText = data.candidates[0].content.parts[0].text.trim();

      logger.info(`Gemini transcription and refinement successful, text length: ${transcribedText.length}`);
      return {
        text: transcribedText,
        rawText: transcribedText,
        success: true,
        timestamp: new Date().toISOString(),
        textLength: transcribedText.length,
        refined: true, // Gemini handles refinement internally
        service: "gemini",
      };
    } catch (error) {
      logger.error("Gemini transcription error", error);
      throw new Error(`Gemini transcription failed: ${error.message}`);
    }
  }


  async refineTranscription(
    transcription: TranscriptionResult,
    actionMode: boolean = false,
    autoRefine: boolean = true,
    specialityId: string
  ): Promise<TranscriptionResult> {
    try {
      const config = getInstructionsConfig();
      const prompts = await specialityService.getPromptBySpecialityId(specialityId);

      const instruction = actionMode
        ? prompts?.actionModeRefinementInstruction?.trim() || config.actionModeRefinementInstruction
        : autoRefine
          ? prompts?.refinementInstruction?.trim() || config.refinementInstruction
          : prompts?.disabledRefinementInstructions?.trim() || config.disabledRefinementInstructions;

      const response = await RefineService.refineText(transcription.text, instruction);

      return {
        ...transcription,
        text: response.correctedText,
        textLength: response.correctedText.length,
        refined: true,
      };
    } catch (error) {
      logger.error("Error in grammar correction", error);
      throw error;
    }
  }

  getAvailableServices(): string[] {
    return Object.values(TranscriptionService);
  }

  isValidService(service: string): boolean {
    return Object.values(TranscriptionService).includes(service as TranscriptionService);
  }
}

export default new AudioService();
export { TranscriptionService };