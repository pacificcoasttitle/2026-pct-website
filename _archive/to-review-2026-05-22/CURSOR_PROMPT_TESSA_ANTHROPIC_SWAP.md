# Cursor Prompt: Swap TESSA from OpenAI to Anthropic Claude

## Context

TESSA is PCT's AI assistant. She currently works through a proxy server at `tessa-proxy.onrender.com` that wraps OpenAI API calls. We're switching to Anthropic's Claude API.

The Render environment variable is already set:
- Variable name: `anthropic_key`
- The key is configured in Render's environment variables for the tessa-proxy service

## What to Change

### 1. Update the proxy server (`tessa-proxy` on Render)

Find the API call to OpenAI and replace it with Anthropic's API. Key differences:

**Endpoint:**
```
OLD: https://api.openai.com/v1/chat/completions
NEW: https://api.anthropic.com/v1/messages
```

**Headers:**
```js
// OLD (OpenAI)
headers: {
  'Authorization': `Bearer ${process.env.openai_key}`,
  'Content-Type': 'application/json'
}

// NEW (Anthropic)
headers: {
  'x-api-key': process.env.anthropic_key,
  'anthropic-version': '2023-06-01',
  'Content-Type': 'application/json'
}
```

**Request body:**
```js
// OLD (OpenAI)
{
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]
}

// NEW (Anthropic)
{
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  system: systemPrompt,  // system is a TOP-LEVEL field, NOT inside messages
  messages: [
    { role: 'user', content: userMessage }
  ]
}
```

**Response parsing:**
```js
// OLD (OpenAI)
const reply = data.choices[0].message.content

// NEW (Anthropic)
const reply = data.content[0].text
```

### 2. Important: Preserve the proxy's response format

The frontend expects the proxy to return data in a consistent shape. You have two options:

**Option A (Recommended): Keep the proxy's external API unchanged**
The proxy should still return the same shape to the frontend:
```json
{
  "choices": [{
    "message": {
      "content": "TESSA's response text here"
    }
  }]
}
```
This way NOTHING on the frontend changes. The proxy internally calls Anthropic but wraps the response in the old format. This is the cleanest approach.

**Option B: Update both proxy and frontend**
Have the proxy return Anthropic's native format and update the frontend to read `data.content[0].text`. This is more work for no real benefit right now.

### 3. Handle message history for multi-turn conversations

Anthropic requires strict alternation of `user` and `assistant` messages. The system prompt must NOT be in the messages array. When the frontend sends the full conversation history:

```js
// Extract system message and conversation messages separately
const systemMessage = messages.find(m => m.role === 'system')?.content || ''
const conversationMessages = messages.filter(m => m.role !== 'system')

// Send to Anthropic
{
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  system: systemMessage,
  messages: conversationMessages  // only user/assistant messages
}
```

### 4. Set max_tokens based on request type

- For prelim analysis (long structured output): `max_tokens: 4096`
- For general chat Q&A: `max_tokens: 1024` is fine
- You can detect this by checking if the user message contains PDF content (it'll be very long)

```js
const isPrelimAnalysis = messages.some(m => m.content.length > 5000)
const maxTokens = isPrelimAnalysis ? 4096 : 1024
```

### 5. Environment variable

The Anthropic API key is already in Render's environment variables as `anthropic_key`. Reference it as `process.env.anthropic_key`. You can remove the old `openai_key` variable from Render once confirmed working.

## Files to touch

- The proxy server file (likely `index.js` or `server.js` in the tessa-proxy repo) — this is the ONLY file that needs to change

## Testing

After deploying:
1. Open the PCT site and click "Ask TESSA"
2. Ask a simple question: "What is title insurance?"
3. Upload a test prelim PDF and verify the 7-section output still works
4. Check that conversation history (follow-up questions) still works
5. Verify transfer tax lookup still works (this doesn't use the AI — should be unaffected)

## Do NOT change

- Frontend components (TessaChatWidget, TessaContext, etc.)
- PDF.js text extraction
- Transfer tax endpoint (`/data.json`)
- System prompts (they work the same with Claude)
- The proxy's external API contract (if using Option A)
