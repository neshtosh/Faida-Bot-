/**
 * Faida Benefits Store (Supabase)
 * ──────────────────────────────────────────────────────────
 * Loads the benefit catalog from Supabase when configured.
 * Falls back to benefits.json for offline / local dev.
 */

const jsonBenefits = require("../db/benefits.json");
const { getSupabaseClient, isSupabaseConfigured } = require("./supabase");
const { logger } = require("./logger");

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = jsonBenefits;
let fetchedAt = 0;

function rowToBenefit(row) {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider || "",
    category: row.category,
    emoji: row.emoji || "📋",
    description: row.description || "",
    amount: row.amount || "",
    howToApply: row.how_to_apply || "",
    documents: row.documents || "",
    deadline: row.deadline || "Rolling",
    deadlineDate: row.deadline_date || undefined,
    deadlineAnnual: row.deadline_annual || undefined,
    link: row.link || "",
    eligibility: row.eligibility || {},
  };
}

/**
 * Returns the cached benefit list (sync — safe during message handling).
 */
function getBenefits() {
  return cache;
}

/**
 * Refreshes benefits from Supabase.
 */
async function refreshBenefits(force = false) {
  if (!isSupabaseConfigured()) {
    cache = jsonBenefits;
    return cache;
  }

  const stale = Date.now() - fetchedAt > CACHE_TTL_MS;
  if (!force && cache.length > 0 && !stale) {
    return cache;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    cache = jsonBenefits;
    return cache;
  }

  const { data, error } = await supabase
    .from("benefits")
    .select("*")
    .eq("is_published", true)
    .order("priority_weight", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    logger.warn({ event: "benefits_fetch_failed", err: error.message }, "Benefits Supabase fetch failed");
    if (cache.length === 0) cache = jsonBenefits;
    return cache;
  }

  const items = (data || []).map(rowToBenefit);
  if (items.length > 0) {
    cache = items;
    fetchedAt = Date.now();
    logger.info({ event: "benefits_loaded_supabase", count: items.length }, "Loaded benefits from Supabase");
  } else if (cache.length === 0) {
    cache = jsonBenefits;
    logger.warn({ event: "benefits_supabase_empty" }, "Supabase benefits empty — using JSON fallback");
  }

  return cache;
}

function startBenefitsScheduler() {
  refreshBenefits(true).catch(() => {});
  setInterval(() => {
    refreshBenefits(false).catch(() => {});
  }, CACHE_TTL_MS);
}

module.exports = {
  getBenefits,
  refreshBenefits,
  startBenefitsScheduler,
};
