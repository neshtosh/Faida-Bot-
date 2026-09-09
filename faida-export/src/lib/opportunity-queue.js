/**
 * Faida Opportunity Review Queue (Supabase)
 * ──────────────────────────────────────────────────────────
 * Scrapes verified sources and saves rows as "pending" for admin
 * approval on the dashboard. Runs on Railway (free) every 12 hours.
 */

const { getSupabaseClient, isSupabaseConfigured } = require("./supabase");
const { scrapeRawSources } = require("./opportunities");
const { logger } = require("./logger");

function benefitToRow(opp) {
  const source = opp.partner === "m-taji" ? "mtaji" : "rss";
  return {
    id: opp.id,
    source,
    source_name: opp.sourceName || opp.provider || "Verified source",
    link: opp.link,
    name: opp.name,
    provider: opp.provider || opp.sourceName || "",
    category: opp.category || "financial",
    emoji: opp.emoji || "🆕",
    description: opp.description || opp.name,
    amount: opp.amount || "",
    how_to_apply: opp.howToApply || "",
    documents: opp.documents || "See official link",
    deadline: opp.deadline || "Check official link",
    eligibility: opp.eligibility || {},
    raw_payload: { sourceName: opp.sourceName, fetchedAt: opp.fetchedAt },
    status: "pending",
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Scrapes the web and upserts pending rows into scraped_opportunities.
 * Skips links that are already approved or rejected.
 */
async function queueScrapedForReview() {
  if (!isSupabaseConfigured()) {
    return { scraped: 0, inserted: 0, updated: 0, skipped: 0 };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { scraped: 0, inserted: 0, updated: 0, skipped: 0 };

  const scraped = await scrapeRawSources();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const opp of scraped) {
    if (!opp?.link) continue;

    const { data: existing } = await supabase
      .from("scraped_opportunities")
      .select("id, status")
      .eq("link", opp.link)
      .maybeSingle();

    if (existing?.status === "approved" || existing?.status === "rejected") {
      skipped++;
      continue;
    }

    const payload = benefitToRow(opp);

    if (existing) {
      const { error } = await supabase
        .from("scraped_opportunities")
        .update({
          ...payload,
          status: "pending",
          reviewed_by: null,
          reviewed_at: null,
          approved_at: null,
        })
        .eq("id", existing.id);

      if (error) {
        logger.warn({ event: "queue_update_failed", link: opp.link, err: error.message });
        continue;
      }
      updated++;
    } else {
      const { error } = await supabase.from("scraped_opportunities").insert(payload);
      if (error) {
        if (error.code === "23505") {
          skipped++;
          continue;
        }
        logger.warn({ event: "queue_insert_failed", link: opp.link, err: error.message });
        continue;
      }
      inserted++;
    }
  }

  logger.info(
    { event: "opportunity_queue_scraped", scraped: scraped.length, inserted, updated, skipped },
    "Queued scraped opportunities for admin review"
  );

  return { scraped: scraped.length, inserted, updated, skipped };
}

module.exports = { queueScrapedForReview };
