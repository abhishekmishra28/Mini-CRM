const { getClient, callWithFallback } = require("../config/gemini");
const Customer = require("../models/Customer");
const Campaign = require("../models/Campaign");

// ─── Fallback responses (no key OR all models rate-limited) ──────────────────

function getFallbackChat(prompt, isApiError = false) {
  const lower = prompt.toLowerCase();

  if (lower.includes("segment"))
    return {
      reply:
        "I can help you build a customer segment! Go to the Segments page and use the AI builder — describe your audience like 'customers who haven't purchased in 60 days'.",
    };

  if (lower.includes("campaign"))
    return {
      reply:
        "Let's plan a campaign! Head to Segments first to define your audience, then go to Campaigns to draft and send your message via WhatsApp, SMS, Email, or RCS.",
    };

  if (
    lower.includes("insight") ||
    lower.includes("analytics") ||
    lower.includes("performance")
  )
    return {
      reply:
        "Check the Analytics page for detailed campaign performance metrics — delivery rates, open rates, and click-through rates, plus revenue and customer trends.",
    };

  if (isApiError)
    return {
      reply:
        "The OpenRouter free tier is currently overloaded — all free models are rate-limited. You have two options:\n\n1. **Wait a few minutes** and try again (free quota resets periodically)\n2. **Add $1 credit** at openrouter.ai/credits — this instantly unlocks reliable access\n\nAll other CRM features (Segments, Campaigns, Analytics, Customers) work perfectly right now!",
    };

  return {
    reply:
      "Hi! I'm Xeno AI, powered by OpenRouter. I can help with segments, campaigns, and analytics insights. What would you like to do today?",
  };
}

function getFallbackSegment(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("high value") || lower.includes("vip"))
    return {
      name: "High-Value Customers",
      description: "Customers who have spent significantly",
      conditions: [{ field: "total_spent", op: "gte", value: 10000 }],
      operator: "AND",
    };
  if (
    lower.includes("inactive") ||
    lower.includes("lapsed") ||
    lower.includes("churn")
  )
    return {
      name: "Lapsed Customers",
      description: "Customers who haven't ordered in 90+ days",
      conditions: [{ field: "last_order_date", op: "days_ago_gt", value: 90 }],
      operator: "AND",
    };
  if (lower.includes("new"))
    return {
      name: "New Customers",
      description: "Customers who joined recently",
      conditions: [
        { field: "first_order_date", op: "days_ago_lt", value: 30 },
      ],
      operator: "AND",
    };
  return {
    name: "Active Shoppers",
    description: "Customers who order frequently",
    conditions: [
      { field: "order_count", op: "gte", value: 3 },
      { field: "last_order_date", op: "days_ago_lt", value: 60 },
    ],
    operator: "AND",
  };
}

function getFallbackMessage() {
  return "🛍️ Exclusive offer just for you! Shop now and get 20% off your next order. Use code XENO20 at checkout. Valid for 48 hours only!";
}

// ─── AI Functions ─────────────────────────────────────────────────────────────

async function chat(prompt, context = {}) {
  if (!getClient()) return getFallbackChat(prompt);

  const systemMessage = `You are Xeno AI, an intelligent CRM assistant for a fashion brand.
You help marketers create campaigns, build customer segments, and analyse performance data.

Current CRM context:
- Customers: ${context.totalCustomers || 0}
- Campaigns run: ${context.totalCampaigns || 0}
- Revenue tracked: ₹${(context.totalRevenue || 0).toLocaleString()}
- Recent campaigns: ${context.recentCampaigns?.join(", ") || "none yet"}

You can help with:
1. Creating customer segments → include action type "create_segment"
2. Drafting campaign messages → include action type "create_campaign"
3. Explaining performance insights
4. Recommending targeting strategies

Respond ONLY with valid JSON — no markdown fences, no explanation outside JSON.
If the user wants an action: { "reply": "...", "action": { "type": "create_segment|create_campaign|show_insights", "data": {} } }
Otherwise just: { "reply": "..." }`;

  try {
    const text = await callWithFallback([
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ]);

    if (!text) return getFallbackChat(prompt, true);

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return { reply: cleaned };
    }
  } catch (err) {
    console.error("OpenRouter chat error:", err.message);
    return getFallbackChat(prompt, true);
  }
}

async function generateSegment(prompt) {
  if (!getClient()) return JSON.stringify(getFallbackSegment(prompt));

  const systemMessage = `Convert the user's request into a CRM customer segment definition.
Return ONLY valid JSON — no markdown, no explanation, no code fences.

Available condition fields:
- total_spent (number) — ops: gt, gte, lt, lte, eq
- order_count (number) — ops: gt, gte, lt, lte, eq
- last_order_date — ops: days_ago_gt, days_ago_lt (value = number of days)
- first_order_date — ops: days_ago_gt, days_ago_lt (value = number of days)
- city (string) — ops: eq, neq, contains
- tags (string) — ops: contains

Output format exactly:
{
  "name": "",
  "description": "",
  "operator": "AND",
  "conditions": [
    { "field": "", "op": "", "value": "" }
  ]
}`;

  try {
    const text = await callWithFallback([
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ]);

    if (!text) return JSON.stringify(getFallbackSegment(prompt));
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
  } catch (err) {
    console.error("OpenRouter generateSegment error:", err.message);
    return JSON.stringify(getFallbackSegment(prompt));
  }
}

async function generateMessage(prompt) {
  if (!getClient()) return getFallbackMessage();

  const systemMessage = `You are a marketing copywriter for a fashion brand.
Generate a concise, compelling campaign message.
Rules:
- Maximum 160 characters
- Friendly, enthusiastic tone
- Include a clear call-to-action
- Return plain text ONLY — no quotes, no JSON, no markdown`;

  try {
    const text = await callWithFallback([
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ]);

    return text ?? getFallbackMessage();
  } catch (err) {
    console.error("OpenRouter generateMessage error:", err.message);
    return getFallbackMessage();
  }
}

async function getInsights() {
  if (!getClient())
    return "AI insights require an OpenRouter API key. Set OPENAI_API_KEY in server/.env.";

  const [customers, campaigns] = await Promise.all([
    Customer.find().limit(30).lean(),
    Campaign.find().lean(),
  ]);

  const systemMessage = `You are a senior CRM analyst. Analyse the following data and give 4 concise, actionable business insights.
Focus on: customer behaviour patterns, revenue trends, campaign effectiveness, and growth opportunities.
Be specific with numbers. Use **bold** for headings. Keep each insight to 2-3 sentences.`;

  const userMessage = `Customer data (${customers.length} records):
${JSON.stringify(customers)}

Campaign data (${campaigns.length} total):
${JSON.stringify(campaigns)}`;

  try {
    const text = await callWithFallback([
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ]);

    return (
      text ??
      "All AI models are currently busy. Please wait a moment and try again."
    );
  } catch (err) {
    console.error("OpenRouter getInsights error:", err.message);
    return "Unable to generate insights at this time. Please try again later.";
  }
}

module.exports = { chat, generateSegment, generateMessage, getInsights };