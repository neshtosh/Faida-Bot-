/**
 * Faida Privacy Utilities
 * ──────────────────────────────────────────────────────────
 * Hashes sensitive identifiers before storage or logging, and
 * encrypts the WhatsApp ID of users who opted in to reminders.
 */

const crypto = require("crypto");

const HASH_SALT = process.env.FAIDA_HASH_SALT || "faida-privacy-salt";

/**
 * Returns a SHA-256 hash of a WhatsApp user ID for safe storage.
 */
function hashUserId(userId) {
  return crypto.createHash("sha256").update(`${HASH_SALT}:${userId}`).digest("hex");
}

/**
 * Returns the 32-byte AES key derived from REMINDER_ENCRYPTION_KEY, or null.
 */
function getReminderKey() {
  const secret = process.env.REMINDER_ENCRYPTION_KEY;
  if (!secret) return null;
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Returns true when reminder contacts can be stored encrypted.
 */
function isReminderEncryptionConfigured() {
  return !!getReminderKey();
}

/**
 * Encrypts a WhatsApp ID (AES-256-GCM). Returns "iv.tag.ciphertext" (base64) or null.
 */
function encryptUserId(userId) {
  const key = getReminderKey();
  if (!key || !userId) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(userId, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((b) => b.toString("base64")).join(".");
}

/**
 * Decrypts a value from encryptUserId. Returns null if missing, tampered, or the key changed.
 */
function decryptUserId(payload) {
  const key = getReminderKey();
  if (!key || !payload) return null;
  try {
    const [iv, tag, ciphertext] = payload.split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch (_) {
    return null;
  }
}

module.exports = { hashUserId, encryptUserId, decryptUserId, isReminderEncryptionConfigured };
