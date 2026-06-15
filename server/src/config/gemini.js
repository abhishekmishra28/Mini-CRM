const OpenAI = require("openai");

let _client = null;
let _initialized = false;

// Ordered list of free models — tried in sequence until one succeeds.
// Lighter models are listed first for faster responses.
const FREE_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",       // Fastest, smallest
  "google/gemma-4-26b-a4b-it:free",               // Google Gemma 4
  "openai/gpt-oss-20b:free",                       // OpenAI OSS 20B
  "openai/gpt-oss-120b:free",                      // OpenAI OSS 120B
  "nousresearch/hermes-3-llama-3.1-405b:free",    // Hermes 3 405B
  "meta-llama/llama-3.3-70b-instruct:free",       // Llama 3.3 70B
  "qwen/qwen3-next-80b-a3b-instruct:free",        // Qwen3 80B
];

const DEFAULT_MODEL = FREE_MODELS[0];

function getClient() {
  if (_initialized) return _client;
  _initialized = true;

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && apiKey !== "YOUR_OPENROUTER_KEY") {
    try {
      _client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
        timeout: 30_000,
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Xeno Mini CRM",
        },
      });
      console.log("✅ OpenRouter AI client initialized successfully");
    } catch (err) {
      console.warn("⚠️  OpenRouter AI initialization failed:", err.message);
      _client = null;
    }
  } else {
    console.warn(
      "⚠️  OPENAI_API_KEY not set in server/.env — AI features will return fallback responses"
    );
    _client = null;
  }

  return _client;
}

/**
 * Try each free model in sequence until one succeeds or all are exhausted.
 * Returns { content, model } on success, or throws on total failure.
 */
async function callWithFallback(messages, primaryModel = DEFAULT_MODEL) {
  const client = getClient();
  if (!client) return null;

  // Put the preferred model first, then try the rest
  const queue = [primaryModel, ...FREE_MODELS.filter((m) => m !== primaryModel)];

  for (const model of queue) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
      });
      const content = completion.choices[0]?.message?.content?.trim() ?? null;
      if (content) {
        if (model !== primaryModel) {
          console.log(`ℹ️  Used fallback model: ${model}`);
        }
        return content;
      }
    } catch (err) {
      const is429 = err.message?.includes("429") || err.status === 429;
      if (is429) {
        console.warn(`⚠️  Rate limited on ${model}, trying next...`);
        continue; // try next model
      }
      throw err; // non-rate-limit error — propagate
    }
  }

  // All models exhausted
  return null;
}

module.exports = { getClient, callWithFallback, DEFAULT_MODEL, FREE_MODELS };