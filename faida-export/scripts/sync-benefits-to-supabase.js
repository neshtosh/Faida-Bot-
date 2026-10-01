#!/usr/bin/env node
/**
 * One-time sync: benefits.json → Supabase benefits table
 * Usage (from faida-export/): node scripts/sync-benefits-to-supabase.js
 */

require("dotenv").config();
const benefits = require("../src/db/benefits.json");
const { getSupabaseClient, isSupabaseConfigured } = require("../src/lib/supabase");

function toRow(b) {
  return {
    id: b.id,
    name: b.name,
    provider: b.provider || "",
    category: b.category,
    emoji: b.emoji || "📋",
    description: b.description || "",
    amount: b.amount || "",
    how_to_apply: b.howToApply || "",
    documents: b.documents || "",
    deadline: b.deadline || "Rolling",
    deadline_date: b.deadlineDate || null,
    deadline_annual: b.deadlineAnnual ?? false,
    link: b.link || "",
    eligibility: b.eligibility || {},
    is_published: true,
    priority_weight: 0,
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  if (!isSupabaseConfigured()) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = getSupabaseClient();
  const rows = benefits.map(toRow);

  const { error } = await supabase.from("benefits").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Sync failed:", error.message);
    process.exit(1);
  }

  console.log(`Synced ${rows.length} benefits to Supabase.`);
}

main();
