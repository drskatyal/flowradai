# LLM Service Integration Guide

This document provides guidance on integrating with the updated LLM service that now supports both OpenAI and Grok models.

## Overview

The LLM (Language Learning Model) service has been updated to support multiple model providers:

- **OpenAI**: Using the existing assistant-based implementation with threads
- **Grok**: Using a chat completions API with message history stored in our database

The system defaults to Grok as requested but allows selecting OpenAI when needed.

## Environment Configuration

The following environment variables are required for Grok:

```
GROK_API_KEY=your_grok_api_key
GROK_MODEL=grok-2-latest
GROK_BASE_URL=https://api.x.ai/v1
```

And for OpenAI (existing configuration):

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_assistant_id
OPENAI_MODEL=gpt-4o
OPENAI_TOP_P=1
OPENAI_TEMPERATURE=1
```

## API Changes

### Creating a Thread

When creating a thread, you can now specify which model to use:

```http
POST /api/threads
Content-Type: application/json

{
  "modelType": "grok" // or "openai"
}
```

If not specified, the system defaults to "grok".

### Creating Messages

The message creation endpoint remains the same, but the system will automatically use the model type associated with the thread:

```http
POST /api/messages
Content-Type: application/json

{
  "threadId": "thread_id",
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ],
  "commandType": "REGULAR" // or "ELABORATE" or "STRUCTURED_REPORTING"
}
```

### Getting Thread Messages

The endpoint to retrieve thread messages remains the same:

```http
GET /api/threads/:id/messages
```

The response format is standardized regardless of the underlying model provider:

```json
[
  {
    "role": "user",
    "content": "User message"
  },
  {
    "role": "assistant",
    "content": "Assistant response"
  }
]
```

## Implementation Details

- Messages for Grok-based threads are stored in the database in the `messages` collection
- Each message is associated with a thread via the `threadId` field
- For OpenAI threads, messages are still managed by OpenAI's thread system

## Client-Side Changes Required

1. Update API clients to handle both types of responses
2. Add optional model selection in thread creation forms
3. Ensure all message processing can handle both model types

## Future Plans

In the future, model selection will be configurable from the admin panel, allowing for dynamic switching between models without code changes. 