import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import {
  scrapeVerifiedOpportunitiesWithDebug,
  type ScrapedOpportunity,
} from "./scraper";

export type OpportunityStatus = "pending" | "approved" | "rejected";

export type OpportunityRow = ScrapedOpportunity & {
  status: OpportunityStatus;
  scraped_at: string;
  approved_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

function rowFromScraped(opp: ScrapedOpportunity) {
  return {
    id: opp.id,
    source: opp.source,
    source_name: opp.source_name,
    link: opp.link,
    name: opp.name,
    provider: opp.provider,
    category: opp.category,
    emoji: opp.emoji,
    description: opp.description,
    amount: opp.amount,
    how_to_apply: opp.how_to_apply,
    documents: opp.documents,
    deadline: opp.deadline,
    eligibility: opp.eligibility,
    raw_payload: opp.raw_payload ?? null,
    status: "pending" as const,
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function listOpportunities(
  status?: OpportunityStatus
): Promise<OpportunityRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("scraped_opportunities")
    .select("*")
    .order("scraped_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as OpportunityRow[];
}

/**
 * Inserts new scraped items as pending; skips links already approved/rejected.
 */
export async function queueScrapedOpportunities(): Promise<{
  scraped: number;
  inserted: number;
  updated: number;
  skipped: number;
  debug?: {
    mtaji: number;
    worldBank: number;
    rss: number;
    errors: string[];
  };
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const { opportunities: scraped, debug } = await scrapeVerifiedOpportunitiesWithDebug();
  console.log("[opportunitiesDb] scrape result:", debug);
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const opp of scraped) {
    const { data: existing } = await supabase
      .from("scraped_opportunities")
      .select("id, status")
      .eq("link", opp.link)
      .maybeSingle();

    if (existing?.status === "approved" || existing?.status === "rejected") {
      skipped++;
      continue;
    }

    const payload = rowFromScraped(opp);

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

      if (error) throw new Error(error.message);
      updated++;
    } else {
      const { error } = await supabase.from("scraped_opportunities").insert(payload);
      if (error) {
        if (error.code === "23505") {
          skipped++;
          continue;
        }
        throw new Error(error.message);
      }
      inserted++;
    }
  }

  return {
    scraped: scraped.length,
    inserted,
    updated,
    skipped,
    debug: {
      mtaji: debug.mtaji,
      worldBank: debug.worldBank,
      rss: debug.rss,
      errors: debug.errors,
    },
  };
}

export async function setOpportunityStatus(
  id: string,
  status: "approved" | "rejected",
  reviewedBy = "admin"
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");

  const now = new Date().toISOString();
  const patch: Record<string, string | null> = {
    status,
    reviewed_by: reviewedBy,
    reviewed_at: now,
    updated_at: now,
    approved_at: status === "approved" ? now : null,
  };

  const { data, error } = await supabase
    .from("scraped_opportunities")
    .update(patch)
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(`Opportunity '${id}' not found or update blocked. Check Supabase service role key.`);
  }
}

export function isOpportunitiesSyncReady(): boolean {
  return isSupabaseConfigured();
}
