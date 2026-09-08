/**
 * Faida Supabase Client
 * ──────────────────────────────────────────────────────────
 * Optional database connection for session persistence and analytics.
 * Returns null when Supabase is not configured or unavailable.
 *
 * Prefers SUPABASE_SERVICE_ROLE_KEY (backend-only, bypasses RLS) when
 * available, because the bot needs to write to sessions / users /
 * applications tables that deny anonymous writes via RLS policies.
 */

require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

let client = null;
let configured = false;

function resolveCredentials() {
  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url) return null;
  if (serviceRole) return { url, key: serviceRole, role: "service_role" };
  if (anon) return { url, key: anon, role: "anon" };
  return null;
}

/**
 * Returns the Supabase client if URL and key are configured.
 */
function getSupabaseClient() {
  if (client) return client;

  const creds = resolveCredentials();
  if (!creds) return null;

  try {
    client = createClient(creds.url, creds.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    configured = true;
    return client;
  } catch (_) {
    return null;
  }
}

/**
 * Returns true if Supabase credentials are present.
 */
function isSupabaseConfigured() {
  return resolveCredentials() !== null;
}

/**
 * Returns the currently active key role: "service_role" | "anon" | null
 */
function getActiveRole() {
  const c = resolveCredentials();
  return c ? c.role : null;
}

module.exports = { getSupabaseClient, isSupabaseConfigured, getActiveRole };
