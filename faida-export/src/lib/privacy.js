/**
 * Faida Privacy Utilities
 * ──────────────────────────────────────────────────────────
 * Hashes sensitive identifiers before storage or logging.
 */

const crypto = require("crypto");

const HASH_SALT = process.env.FAIDA_HASH_SALT || "faida-privacy-salt";

/**
 * Returns a SHA-256 hash of a WhatsApp user ID for safe storage.
 */
function hashUserId(userId) {
  return crypto.createHash("sha256").update(`${HASH_SALT}:${userId}`).digest("hex");
}

module.exports = { hashUserId };
