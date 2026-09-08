/**
 * Faida AI Assistant — OpenAI or Anthropic
 * ──────────────────────────────────────────────────────────
 * Powers conversational Q&A for users. Responses are grounded in
 * the benefits database, live verified opportunities, and the
 * user's session profile. Never invents unverified programmes.
 */

require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");
const staticBenefits = require("../db/benefits");
const { getCachedOpportunitiesAsBenefits } = require("./opportunities");
const { isVerifiedUrl } = require("./sources");
const { logger } = require("./logger");

const MAX_HISTORY = 8;
const MAX_REPLY_CHARS = 3800;

/**
 * Returns the configured AI provider: "openai", "anthropic", or null.
 */
function getAiProvider() {
  const configured = (process.env.AI_PROVIDER || "").toLowerCase();
  if (configured === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (configured === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";

  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

/**
 * Returns true if an AI API key is configured.
 */
function isAiAvailable() {
  return !!getAiProvider();
}

/**
 * Builds context about the user and available programmes.
 */
function buildSystemPrompt(session) {
  const lang = session.language === "sw" ? "Swahili" : "English";
  const profile = session.profile || {};
  const matches = (session.lastMatches || []).slice(0, 5);
  const live = getCachedOpportunitiesAsBenefits().slice(0, 5);

  const matchSummary =
    matches.length > 0
      ? matches
          .map((m) => `- ${m.benefit.name} (${m.benefit.link}) score:${m.score}`)
          .join("\n")
      : "None yet — user may not have completed the questionnaire.";

  const liveSummary =
    live.length > 0
      ? live.map((o) => `- ${o.name} (${o.link}) [${o.sourceName}]`).join("\n")
      : "No live feed items cached yet.";

  return (
    `You are Faida, a WhatsApp assistant helping Kenyans find government grants, NGO support, and verified benefits.\n\n` +
    `RULES:\n` +
    `- Reply in ${lang}.\n` +
    `- Only recommend programmes from the context below OR clearly marked verified live opportunities.\n` +
    `- NEVER invent grants, links, or phone numbers.\n` +
    `- If unsure, say so and tell the user to type MENU or visit an official .go.ke site.\n` +
    `- Keep answers concise for WhatsApp (under 600 words).\n` +
    `- Cite official links when mentioning a specific programme.\n` +
    `- Faida is free and confidential.\n\n` +
    `USER PROFILE:\n${JSON.stringify(profile, null, 2)}\n\n` +
    `USER'S LAST MATCHES:\n${matchSummary}\n\n` +
    `VERIFIED LIVE OPPORTUNITIES (from official RSS feeds):\n${liveSummary}\n\n` +
    `STATIC BENEFITS COUNT: ${staticBenefits.length} programmes in database.\n` +
    `User can type MENU to exit chat, OPPORTUNITIES for latest verified listings, RESULTS for their matches.`
  );
}

/**
 * Trims conversation history to the last N turns.
 */
function trimHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY);
}

/**
 * Calls OpenAI Chat Completions API.
 */
async function chatWithOpenAI(session, userMessage, history) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system = buildSystemPrompt(session);

  const messages = [
    { role: "system", content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "Sorry, I couldn't generate a response. Type MENU to continue."
  );
}

/**
 * Calls Anthropic Messages API.
 */
async function chatWithAnthropic(session, userMessage, history) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: buildSystemPrompt(session),
    messages,
  });

  return (
    response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim() || "Sorry, I couldn't generate a response. Type MENU to continue."
  );
}

/**
 * Sends a user message to the configured AI provider and returns the reply.
 */
async function chatWithFaida(session, userMessage) {
  const provider = getAiProvider();
  if (!provider) {
    throw new Error("AI not configured");
  }

  const history = trimHistory(session.aiHistory || []);
  let reply;

  if (provider === "openai") {
    reply = await chatWithOpenAI(session, userMessage, history);
  } else {
    reply = await chatWithAnthropic(session, userMessage, history);
  }

  const safeReply = sanitizeReply(reply);

  const newHistory = trimHistory([
    ...history,
    { role: "user", content: userMessage },
    { role: "assistant", content: safeReply },
  ]);

  logger.info({ event: "ai_chat_reply", provider, chars: safeReply.length }, "AI reply sent");

  return { reply: safeReply, history: newHistory };
}

/**
 * Removes suspicious unverified URLs from AI output.
 */
function sanitizeReply(text) {
  let result = text;

  const urlRegex = /https?:\/\/[^\s)>\]]+/gi;
  const urls = text.match(urlRegex) || [];

  for (const url of urls) {
    if (!isVerifiedUrl(url.replace(/[.,;]+$/, ""))) {
      result = result.replace(url, "[link removed — unverified source]");
    }
  }

  if (result.length > MAX_REPLY_CHARS) {
    result = result.slice(0, MAX_REPLY_CHARS - 20) + "\n\n_(message trimmed)_";
  }

  return result;
}

module.exports = { isAiAvailable, getAiProvider, chatWithFaida, buildSystemPrompt };
