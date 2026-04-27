/**
 * Default/fallback AI configuration values.
 * Runtime values come from the database (managed via admin panel).
 * API keys are NEVER stored here — they come from environment variables.
 */
export const AIConfig = {
  PORTKEY: {
    ENABLED: !!process.env.PORTKEY_API_KEY, // Enabled if API key exists
    PROVIDERS: {
      GROK: "@xai-prod",
      GROQ: "@groq-prod",
      PARALLEL: "@parallel-prod", // Parallel AI integration configured in Portkey
      SONIOX: "@soniox-prod", // Soniox integration (custom host)
    }
  },
  OPENAI: {
    ASSISTANT_ID: "asst_1RT6qxqzDDfKShRLJwNlg1zd",
    MODEL: "gpt-4o",
    TOP_P: 1,
    TEMPERATURE: 0.2,
  },
  GROK: {
    MODEL: "grok-4-1-fast-non-reasoning",
    BASE_URL: "https://api.x.ai/v1",
    TOP_P: 1,
    TEMPERATURE: 0.2,
  },
  GROK_VALIDATOR: {
    MODEL: "grok-4-1-fast-non-reasoning",
    BASE_URL: "https://api.x.ai/v1",
    TOP_P: 1,
    TEMPERATURE: 0,
    MAX_TOKEN: 1024,
  },
  GROQ_REFINE: {
    MODEL: "llama-3.3-70b-versatile",
    BASE_URL: "https://api.groq.com/openai/v1",
    TOP_P: 1,
    TEMPERATURE: 0,
    MAX_TOKEN: 2048,
    STREAM: "true"
  },
  GROQ_WHISPER: {
    MODEL: "whisper-large-v3-turbo",
    ACTION_MODE_MODEL: "whisper-large-v3",
    LANGUAGE: "en",
    BASE_URL: "https://api.groq.com/openai/v1",
    TEMPERATURE: 0
  },
  MISTRAL_AI: {
    MODEL: "voxtral-mini-2602",
    LANGUAGE: "en",
    BASE_URL: "https://api.mistral.ai/v1",
    TEMPERATURE: 0
  },
  GEMINI_AI: {
    MODEL: 'gemini-2.5-flash-lite',
    BASE_URL: "https://generativelanguage.googleapis.com",
    TEMPERATURE: 0
  },
  VOYAGE_AI: {
    MODEL: 'voyage-3.5-lite',
  },
  EMBEDDING_PROVIDER: 'voyage',  // Choose provider: "xenova" | "openai" | "voyage"
  PARALLEL_AI: {
    MODEL: 'speed',
    BASE_URL: "https://api.parallel.ai",
  },
  OPENAI_OSS: {
    MODEL: 'openai/gpt-oss-120b',
    TEMPERATURE: 0.2,
    MAX_COMPLETION_TOKEN: 8192,
    TOP_P: 1,
    STREAM: true,
    REASONING_EFFORT: "medium"
  },
  OPENROUTER: {
    MODEL: 'openai/gpt-4o',
    BASE_URL: "https://openrouter.ai/api/v1",
    TEMPERATURE: 0.2,
    MAX_COMPLETION_TOKEN: 8192,
    TOP_P: 1,
  },
  GEMINI_TRANSCRIPTION_AI: {
    MODEL: 'gemini-2.0-flash',
    TEMPERATURE: 0.1,
    MAX_OUTPUT_TOKEN: 2048
  }
};
