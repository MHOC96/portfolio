import { PORTFOLIO_SYSTEM_INSTRUCTION } from '../src/data/buildPortfolioContext.js';
import { PROVIDERS, getProviderConfig } from './_lib/providers.js';

// Server-side chat proxy. API keys stay in server env vars (never shipped to the browser).
//   LLM_PROVIDER = groq | gemini   (primary provider, default: groq)
//   LLM_FALLBACK = true | false    (try the other provider if the primary fails, default: true)

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;
const MAX_TOKENS = 1200;

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
};

const sanitize = (messages) =>
  (Array.isArray(messages) ? messages : [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.slice(0, MAX_CHARS),
    }))
    .slice(-MAX_MESSAGES);

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let messages;
  try {
    messages = sanitize((await readBody(req)).messages);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return sendJson(res, 400, { error: 'A user message is required' });
  }

  const configs = getProviderConfig(process.env);
  const primary = (process.env.LLM_PROVIDER || 'groq').trim().toLowerCase();
  if (!PROVIDERS[primary]) {
    return sendJson(res, 500, { error: `Unknown LLM_PROVIDER "${primary}". Use "groq" or "gemini".` });
  }

  const order = [primary];
  if (process.env.LLM_FALLBACK?.trim().toLowerCase() !== 'false') {
    order.push(...Object.keys(PROVIDERS).filter((name) => name !== primary));
  }
  const candidates = order.filter((name) => configs[name].apiKey);
  if (!candidates.length) {
    return sendJson(res, 500, { error: 'No LLM API key configured on the server.' });
  }

  const request = { system: PORTFOLIO_SYSTEM_INSTRUCTION, messages, maxTokens: MAX_TOKENS };
  let lastError;

  for (const name of candidates) {
    let started = false;
    try {
      for await (const text of PROVIDERS[name](configs[name], request)) {
        if (!started) {
          started = true;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('X-LLM-Provider', name);
        }
        res.write(text);
      }
      if (started) return res.end();
      lastError = new Error(`${name} returned an empty response`);
    } catch (error) {
      console.error(`[chat] ${name} failed:`, error.message);
      lastError = error;
      // Once text has been streamed we can't switch providers; end what we have.
      if (started) return res.end();
    }
  }

  return sendJson(res, 502, { error: lastError?.message || 'All providers failed' });
}
