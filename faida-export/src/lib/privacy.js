/**
 * Faida Privacy Utilities
 * ──────────────────────────────────────────────────────────
 * Hashes identifiers before storage or logging, encrypts personal data
 * kept at rest (reminder contacts, form answers), and masks numbers in
 * free text before it is logged.
 */

const crypto = require("crypto");

const HASH_SALT = process.env.FAIDA_HASH_SALT || "faida-privacy-salt";

/** Bump when the privacy notice changes materially — users are asked again. */
const CONSENT_VERSION = 1;

/** Application form keys that hold identity / financial data. */
const PII_FIELD_KEYS = [
  "fullName", "idNumber", "phoneNumber", "email", "parentGuardianId",
  "studentIdNumber", "kraPin", "bankAccountNumber", "mpesaNumber",
  "ncpwdCertNumber", "businessRegNo", "groupRegNo",
];

/**
 * Returns a SHA-256 hash of a WhatsApp user ID for safe storage.
 */
function hashUserId(userId) {
  return crypto.createHash("sha256").update(`${HASH_SALT}:${userId}`).digest("hex");
}

/**
 * Returns the 32-byte AES key, or null. FAIDA_ENCRYPTION_KEY is the current
 * name; REMINDER_ENCRYPTION_KEY is still accepted.
 */
function getEncryptionKey() {
  const secret = process.env.FAIDA_ENCRYPTION_KEY || process.env.REMINDER_ENCRYPTION_KEY;
  if (!secret) return null;
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Returns true when personal data can be stored encrypted.
 */
function isEncryptionConfigured() {
  return !!getEncryptionKey();
}

/**
 * Encrypts a string (AES-256-GCM). Returns "iv.tag.ciphertext" (base64) or null.
 */
function encryptString(plaintext) {
  const key = getEncryptionKey();
  if (!key || plaintext == null) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((b) => b.toString("base64")).join(".");
}

/**
 * Decrypts a value from encryptString. Returns null if missing, tampered, or the key changed.
 */
function decryptString(payload) {
  const key = getEncryptionKey();
  if (!key || !payload || typeof payload !== "string") return null;
  try {
    const [iv, tag, ciphertext] = payload.split(".").map((p) => Buffer.from(p, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch (_) {
    return null;
  }
}

/** Encrypts any JSON-serialisable value, or returns null without a key. */
function encryptJson(value) {
  return encryptString(JSON.stringify(value));
}

/** Decrypts a value from encryptJson, or returns null. */
function decryptJson(payload) {
  const text = decryptString(payload);
  if (text == null) return null;
  try {
    return JSON.parse(text);
  } catch (_) {
    return null;
  }
}

/**
 * Masks likely personal identifiers in free text (ID / phone / account
 * numbers, emails, KRA PINs) before it is logged or stored.
 */
function maskPii(text) {
  if (!text) return text;
  return String(text)
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email]")
    .replace(/\b[A-Z]\d{9}[A-Z]\b/gi, "[kra-pin]")
    .replace(/\+?\d[\d\s-]{5,}\d/g, (m) => (m.replace(/\D/g, "").length >= 6 ? "[number]" : m));
}

module.exports = {
  hashUserId,
  CONSENT_VERSION,
  PII_FIELD_KEYS,
  isEncryptionConfigured,
  encryptString,
  decryptString,
  encryptJson,
  decryptJson,
  maskPii,
  // Names used by the reminder-contact code
  encryptUserId: encryptString,
  decryptUserId: decryptString,
  isReminderEncryptionConfigured: isEncryptionConfigured,
};
