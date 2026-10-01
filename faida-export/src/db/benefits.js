/**
 * Faida Benefits Database
 * ──────────────────────────────────────────────────────────
 * Re-exports the cached benefit catalog (Supabase or JSON fallback).
 * Prefer require("../lib/benefits-store").getBenefits() in new code.
 */

const { getBenefits } = require("../lib/benefits-store");

module.exports = getBenefits();
