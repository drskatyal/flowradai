# Grok Integration via OpenAI-Compatible API

## Overview

This implementation integrates X.AI's Grok model using their OpenAI-compatible API. According to X.AI's documentation (https://docs.x.ai/docs/guides/chat), Grok supports the OpenAI API standard, which allows us to use the same OpenAI SDK with different configuration.

## Key Changes

1. Instead of using direct REST API calls to Grok, we now use the OpenAI SDK with Grok's base URL and API key.
2. Created a separate OpenAI client instance specifically for Grok:
   ```typescript
   this.grokOpenAI = new OpenAI({
     apiKey: this.grokConfig.apiKey,
     baseURL: this.grokConfig.baseUrl,
   });
   ```

3. Standardized message format for both OpenAI and Grok, with proper type checking.
4. Implemented streaming capability for Grok responses using the OpenAI SDK's streaming interface.
5. All messages (from both OpenAI and Grok) are stored in our database for persistence.

## Benefits

- **Simplified Implementation**: Using the same SDK for both models reduces code complexity and maintenance.
- **Better Type Safety**: Proper TypeScript typing ensures API compatibility.
- **Streaming Support**: Improved user experience with streaming responses from both models.
- **Consistency**: Standardized approach for both OpenAI and Grok models.

## Configuration

Grok requires the following environment variables:

```
GROK_API_KEY=your_grok_api_key
GROK_MODEL=grok-2-latest
GROK_BASE_URL=https://api.x.ai/v1
```

## Usage

The system defaults to Grok but can be configured to use OpenAI:

```typescript
// To use Grok (default)
await messageService.createMessageStream(threadId, CommandType.REGULAR, LLMType.GROK, res);

// To use OpenAI
await messageService.createMessageStream(threadId, CommandType.REGULAR, LLMType.OPENAI, res);
```

## Troubleshooting

If you encounter issues with the Grok API:

1. Ensure your API key is valid and has sufficient credits
2. Check the Grok model name is correct
3. Verify the base URL is set correctly
4. Review X.AI's documentation for any API changes 