/**
 * Faida Environment Validation
 * ──────────────────────────────────────────────────────────
 * Validates required environment variables on startup.
 * Production deployments must pass all checks before the bot starts.
 */

require("dotenv").config();

const DEFAULT_HASH_SALT = "change-this-to-a-random-string";

/**
 * Returns a list of missing or invalid environment variable names.
 */
function getEnvErrors() {
  const errors = [];
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    if (!process.env.NODE_ENV) errors.push("NODE_ENV");
    if (!process.env.PORT) errors.push("PORT");
    if (!process.env.FAIDA_HASH_SALT) {
      errors.push("FAIDA_HASH_SALT");
    } else if (process.env.FAIDA_HASH_SALT === DEFAULT_HASH_SALT) {
      errors.push("FAIDA_HASH_SALT (must not use the example default — set a unique random string)");
    }
  }

  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey =
    !!process.env.SUPABASE_ANON_KEY || !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (hasSupabaseUrl !== hasSupabaseKey) {
    errors.push(
      "SUPABASE_URL + (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY). " +
        "Set URL together with at least one key, or leave all blank."
    );
  }

  return errors;
}

/**
 * Validates environment variables and exits with a helpful message if invalid.
 */
function validateEnv() {
  const errors = getEnvErrors();

  if (errors.length === 0) return;

  console.error("\n╔══════════════════════════════════════════════╗");
  console.error("║  ❌  FAIDA — Missing environment variables   ║");
  console.error("╚══════════════════════════════════════════════╝\n");
  console.error("The bot cannot start until these are set:\n");

  for (const name of errors) {
    console.error(`  • ${name}`);
  }

  console.error("\nHow to fix:");
  console.error("  1. Copy .env.example to .env");
  console.error("  2. Fill in the missing values");
  console.error("  3. On Railway: Project → Variables → add each one\n");

  if (process.env.NODE_ENV === "production") {
    console.error("Production requires at minimum:");
    console.error("  NODE_ENV=production");
    console.error("  PORT=3000          (Railway sets this automatically)");
    console.error("  FAIDA_HASH_SALT=<random-string>\n");
  }

  process.exit(1);
}

module.exports = { validateEnv, getEnvErrors };
