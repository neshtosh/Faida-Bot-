/**
 * Faida Live Opportunities Fetcher
 * ──────────────────────────────────────────────────────────
 * Pulls grant and programme announcements from verified official
 * RSS feeds, validates links, and caches results for matching + AI.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { isVerifiedUrl, getVerifiedFeeds } = require("./sources");
const { logger } = require("./logger");

const CACHE_FILE = path.join(__dirname, "../../data/live-opportunities.json");
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15000;

let memoryCache = { opportunities: [], fetchedAt: 0 };

const DEFAULT_ELIGIBILITY = {
  minAge: 18,
  maxAge: 99,
  gender: "any",
  employed: "any",
  businessOwner: "any",
  disability: "any",
  counties: ["any"],
  sectors: ["any"],
  groupRequired: false,
};

/**
 * Strips HTML tags from a string.
 */
function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses RSS/Atom item blocks from feed XML.
 */
function parseRssItems(xml) {
  if (!xml) return [];

  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const block of blocks) {
    const title = stripHtml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const link =
      block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ||
      block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] ||
      "";
    const description = stripHtml(
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ||
        block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ||
        ""
    );
    const pubDate =
      block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ||
      block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim() ||
      "";

    if (title && link) items.push({ title, link, description, pubDate });
  }

  return items;
}

/**
 * Returns true if text matches Kenya-relevant keywords for a feed.
 */
function matchesKeywords(text, keywords) {
  const lower = (text || "").toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Guesses benefit category from announcement text.
 */
function guessCategory(text) {
  const lower = (text || "").toLowerCase();
  if (/loan|grant|fund|finance|tender|bursary|scholarship/.test(lower)) return "financial";
  if (/job|employment|training|skills|nys|ajira/.test(lower)) return "employment";
  if (/health|medical|hospital|sha|nhif/.test(lower)) return "health";
  if (/legal|court|lawyer/.test(lower)) return "legal";
  if (/housing|nyumba|boma/.test(lower)) return "housing";
  return "financial";
}

/**
 * Builds a stable ID from a source URL.
 */
function idFromLink(link) {
  return `live-${crypto.createHash("sha256").update(link).digest("hex").slice(0, 12)}`;
}

/**
 * Converts a verified RSS item into a benefit-shaped opportunity.
 */
function itemToOpportunity(item, sourceName) {
  if (!isVerifiedUrl(item.link)) return null;

  const text = `${item.title} ${item.description}`;
  return {
    id: idFromLink(item.link),
    name: item.title.slice(0, 120),
    provider: sourceName,
    category: guessCategory(text),
    emoji: "🆕",
    description: item.description || item.title,
    amount: "See official announcement",
    howToApply: `Visit the official link for full application details.\n${item.link}`,
    documents: "See official link",
    deadline: item.pubDate ? `Published: ${item.pubDate}` : "Check official link",
    link: item.link,
    sourceName,
    verified: true,
    fetchedAt: new Date().toISOString(),
    eligibility: { ...DEFAULT_ELIGIBILITY },
  };
}

/**
 * Fetches a URL with timeout.
 */
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "FaidaBot/1.0 (Kenya benefits; +https://munene.dev)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Loads cached opportunities from disk if present.
 */
function loadCacheFromDisk() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    if (raw && Array.isArray(raw.opportunities)) {
      memoryCache = { opportunities: raw.opportunities, fetchedAt: raw.fetchedAt || 0 };
    }
  } catch (_) {
    // ignore corrupt cache
  }
}

/**
 * Saves opportunities cache to disk.
 */
function saveCacheToDisk() {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(memoryCache, null, 2), "utf8");
}

/**
 * Fetches and validates opportunities from all verified feeds.
 */
async function refreshOpportunities() {
  const feeds = getVerifiedFeeds();
  const found = [];
  const seenLinks = new Set();
  let feedsOk = 0;

  for (const feed of feeds) {
    try {
      const xml = await fetchWithTimeout(feed.url);
      const items = parseRssItems(xml);

      for (const item of items) {
        const text = `${item.title} ${item.description}`;
        if (!matchesKeywords(text, feed.keywords)) continue;

        const opp = itemToOpportunity(item, feed.name);
        if (!opp || seenLinks.has(opp.link)) continue;

        seenLinks.add(opp.link);
        found.push(opp);
      }

      feedsOk++;
    } catch (err) {
      logger.warn({ event: "feed_fetch_failed", feed: feed.id, err: err.message }, "Feed fetch failed");
    }
  }

  memoryCache = { opportunities: found, fetchedAt: Date.now() };
  saveCacheToDisk();

  logger.info(
    { event: "opportunities_refreshed", count: found.length, feedsOk },
    "Live opportunities refreshed"
  );

  return { count: found.length, feedsOk, feedsTotal: feeds.length };
}

/**
 * Returns cached live opportunities, refreshing if stale.
 */
async function getLiveOpportunities(forceRefresh = false) {
  if (!memoryCache.fetchedAt) loadCacheFromDisk();

  const stale = Date.now() - memoryCache.fetchedAt > CACHE_TTL_MS;
  if (forceRefresh || stale || memoryCache.opportunities.length === 0) {
    await refreshOpportunities();
  }

  return memoryCache.opportunities;
}

/**
 * Returns live opportunities as benefit objects for the matcher.
 */
function getCachedOpportunitiesAsBenefits() {
  if (!memoryCache.fetchedAt) loadCacheFromDisk();
  return memoryCache.opportunities || [];
}

/**
 * Formats opportunities for WhatsApp display.
 */
function formatOpportunitiesList(opportunities, lang, limit = 5) {
  const isSw = lang === "sw";
  const list = opportunities.slice(0, limit);

  if (list.length === 0) {
    return isSw
      ? `🔍 *Hakuna fursa mpya kutoka vyanzo vilivyothibitishwa kwa sasa.*\n\nJaribu tena baadaye au andika *REFRESH*.\n\nJibu *CHAT* kuuliza msaidizi wa AI.`
      : `🔍 *No new opportunities from verified sources right now.*\n\nTry again later or type *REFRESH*.\n\nReply *CHAT* to ask the AI assistant.`;
  }

  const header = isSw
    ? `🆕 *Fursa mpya kutoka vyanzo rasmi vilivyothibitishwa:*\n━━━━━━━━━━━━━━━━━━━━\n\n`
    : `🆕 *Latest opportunities from verified official sources:*\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  const cards = list
    .map((o, i) => {
      return (
        `*${i + 1}. ${o.emoji} ${o.name}*\n` +
        `${isSw ? "Chanzo" : "Source"}: ${o.sourceName}\n` +
        `${isSw ? "Kiungo" : "Link"}: ${o.link}`
      );
    })
    .join("\n\n─────────────────────\n\n");

  const footer = isSw
    ? `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ Fursa hizi zimetoka vyanzo rasmi pekee (.go.ke, usaid.gov, nk.)\n` +
      `Jibu *CHAT* kuuliza zaidi · *REFRESH* kusasisha · *MENU*`
    : `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ These come from verified official sources only (.go.ke, usaid.gov, etc.)\n` +
      `Reply *CHAT* to ask more · *REFRESH* to update · *MENU*`;

  return header + cards + footer;
}

/**
 * Starts a daily scheduler to refresh verified opportunities.
 */
function startOpportunityScheduler() {
  loadCacheFromDisk();

  refreshOpportunities().catch(() => {});

  setInterval(() => {
    refreshOpportunities().catch(() => {});
  }, CACHE_TTL_MS);
}

module.exports = {
  refreshOpportunities,
  getLiveOpportunities,
  getCachedOpportunitiesAsBenefits,
  formatOpportunitiesList,
  startOpportunityScheduler,
};
