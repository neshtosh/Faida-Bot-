/**
 * Faida Approved Opportunities Store (Supabase)
 * ──────────────────────────────────────────────────────────
 * Reads admin-approved scraped opportunities from Supabase.
 * Used by the WhatsApp bot when dashboard sync is enabled.
 */

const { getSupabaseClient, isSupabaseConfigured } = require("./supabase");
const { logger } = require("./logger");

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

let approvedCache = { items: [], fetchedAt: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Maps a Supabase row to the benefit shape used by the matcher.
 */
function rowToBenefit(row) {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider || row.source_name || "Verified source",
    category: row.category || "financial",
    emoji: row.emoji || "🆕",
    description: row.description || row.name,
    amount: row.amount || "See listing",
    howToApply: row.how_to_apply || `Visit: ${row.link}`,
    documents: row.documents || "See official link",
    deadline: row.deadline || "Check official link",
    link: row.link,
    sourceName: row.source_name || "Faida Admin",
    verified: true,
    adminApproved: true,
    fetchedAt: row.approved_at || row.updated_at,
    eligibility: { ...DEFAULT_ELIGIBILITY, ...(row.eligibility || {}) },
  };
}

/**
 * Returns true when Supabase opportunity sync is available.
 */
function isOpportunityStoreConfigured() {
  return isSupabaseConfigured();
}

/**
 * Fetches approved opportunities from Supabase.
 */
async function fetchApprovedOpportunities(forceRefresh = false) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const stale = Date.now() - approvedCache.fetchedAt > CACHE_TTL_MS;
  if (!forceRefresh && approvedCache.items.length > 0 && !stale) {
    return approvedCache.items;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("scraped_opportunities")
    .select("*")
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(100);

  if (error) {
    logger.warn({ event: "approved_opportunities_fetch_failed", err: error.message });
    return approvedCache.items;
  }

  const items = (data || []).map(rowToBenefit);
  approvedCache = { items, fetchedAt: Date.now() };

  logger.info(
    { event: "approved_opportunities_loaded", count: items.length },
    "Loaded admin-approved opportunities from Supabase"
  );

  return items;
}

/**
 * Returns cached approved opportunities synchronously (may be empty until first fetch).
 */
function getCachedApprovedOpportunities() {
  return approvedCache.items || [];
}

/**
 * Clears the in-memory cache (e.g. after admin approval webhook).
 */
function clearApprovedCache() {
  approvedCache = { items: [], fetchedAt: 0 };
}

module.exports = {
  isOpportunityStoreConfigured,
  fetchApprovedOpportunities,
  getCachedApprovedOpportunities,
  clearApprovedCache,
  rowToBenefit,
};
