/**
 * M-Taji Partner Opportunities
 * ──────────────────────────────────────────────────────────
 * Fetches published opportunities from Faida's partner M-Taji
 * (https://www.m-taji.co.ke/opportunities) via their Supabase API.
 */

const crypto = require("crypto");
const { isVerifiedUrl } = require("./sources");
const { logger } = require("./logger");

const MTAJI_BASE_URL = "https://www.m-taji.co.ke";
const MTAJI_OPPORTUNITIES_PAGE = `${MTAJI_BASE_URL}/opportunities`;
const SOURCE_NAME = "M-Taji (Partner)";

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
 * Returns true when M-Taji Supabase credentials are configured.
 */
function isMtajiConfigured() {
  return !!(process.env.MTAJI_SUPABASE_URL && process.env.MTAJI_SUPABASE_ANON_KEY);
}

/**
 * Maps an M-Taji opportunity row to Faida's benefit shape.
 */
function mapMtajiRow(row) {
  if (!row || !row.id || !row.title) return null;
  if (row.listing_status && row.listing_status !== "published") return null;

  const link = `${MTAJI_BASE_URL}/opportunities/${row.id}`;
  const applyLink = row.apply_url && isVerifiedUrl(row.apply_url) ? row.apply_url : link;
  const text = `${row.title} ${row.description || ""} ${row.organization || ""} ${row.kind || ""}`;

  return {
    id: `mtaji-${crypto.createHash("sha256").update(row.id).digest("hex").slice(0, 12)}`,
    name: row.title.slice(0, 120),
    provider: row.organization || "M-Taji",
    category: guessCategory(text, row.kind),
    emoji: "🤝",
    description: row.description || `${row.title} — listed on M-Taji, Faida's partner platform.`,
    amount: row.amount || "See listing for details",
    howToApply: row.how_to_apply
      ? `${row.how_to_apply}\n\nApply: ${applyLink}`
      : `View and apply on M-Taji:\n${link}`,
    documents: "See M-Taji listing",
    deadline: row.deadline ? `Deadline: ${row.deadline}` : "Check listing for deadline",
    link,
    sourceName: SOURCE_NAME,
    partner: "m-taji",
    verified: true,
    fetchedAt: new Date().toISOString(),
    eligibility: { ...DEFAULT_ELIGIBILITY },
  };
}

/**
 * Guesses benefit category from M-Taji opportunity text.
 */
function guessCategory(text, kind) {
  const lower = `${text || ""} ${kind || ""}`.toLowerCase();
  if (/volunteer|job|employment|training|skills/.test(lower)) return "employment";
  if (/health|medical/.test(lower)) return "health";
  if (/legal/.test(lower)) return "legal";
  if (/housing/.test(lower)) return "housing";
  return "financial";
}

/**
 * Fetches published opportunities from M-Taji's Supabase REST API.
 */
async function fetchMtajiOpportunities() {
  if (!isMtajiConfigured()) {
    return { opportunities: [], ok: false, reason: "not_configured" };
  }

  const base = process.env.MTAJI_SUPABASE_URL.replace(/\/$/, "");
  const key = process.env.MTAJI_SUPABASE_ANON_KEY;
  const url =
    `${base}/rest/v1/opportunities` +
    "?select=*" +
    "&listing_status=eq.published" +
    "&order=created_at.desc" +
    "&limit=50";

  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`M-Taji API ${res.status}: ${body.slice(0, 200)}`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows)) {
    throw new Error("M-Taji API returned unexpected payload");
  }

  const opportunities = rows.map(mapMtajiRow).filter(Boolean);

  logger.info(
    { event: "mtaji_opportunities_fetched", count: opportunities.length },
    "M-Taji opportunities fetched"
  );

  return { opportunities, ok: true, count: opportunities.length };
}

module.exports = {
  isMtajiConfigured,
  mapMtajiRow,
  fetchMtajiOpportunities,
  MTAJI_OPPORTUNITIES_PAGE,
  SOURCE_NAME,
};
