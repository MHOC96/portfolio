// LLM provider adapters. Each adapter returns an async generator of plain-text chunks,
// so the rest of the app never depends on a vendor-specific response format.

const pickKey = (value) => {
  const keys = (value || '').split(',').map((k) => k.trim()).filter(Boolean);
  if (!keys.length) return '';
  return keys[Math.floor(Math.random() * keys.length)]; // simple key rotation
};

export const getProviderConfig = (env) => ({
  groq: {
    apiKey: pickKey(env.GROQ_API_KEY),
    model: env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b',
  },
  gemini: {
    apiKey: pickKey(env.GEMINI_API_KEY),
    model: env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  },
});

async function* readSse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        yield JSON.parse(data);
      } catch {
        // Ignore malformed stream chunks.
      }
    }
  }
}

const errorFrom = async (response, name) => {
  let detail = response.statusText;
  try {
    const data = await response.json();
    detail = data?.error?.message || JSON.stringify(data);
  } catch {
    // keep statusText
  }
  const error = new Error(`${name} ${response.status}: ${detail}`);
  error.status = response.status;
  return error;
};

async function* streamGroq({ apiKey, model }, { system, messages, maxTokens }) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.3,
      max_completion_tokens: maxTokens,
      stream: true,
      reasoning_effort: 'low',
    }),
  });
  if (!response.ok) throw await errorFrom(response, 'Groq');

  for await (const chunk of readSse(response)) {
    const text = chunk.choices?.[0]?.delta?.content;
    if (text) yield text;
  }
}

async function* streamGemini({ apiKey, model }, { system, messages, maxTokens }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:streamGenerateContent?alt=sse`;

  const generationConfig = { temperature: 0.3, maxOutputTokens: maxTokens };
  // 2.5 "thinking" tokens would eat the output budget; a chat reply doesn't need them.
  if (/2\.5-flash/.test(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig,
    }),
  });
  if (!response.ok) throw await errorFrom(response, 'Gemini');

  for await (const chunk of readSse(response)) {
    const parts = chunk.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text && !part.thought) yield part.text;
    }
  }
}

export const PROVIDERS = { groq: streamGroq, gemini: streamGemini };
