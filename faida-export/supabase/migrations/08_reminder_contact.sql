-- =====================================================================
-- Faida Supabase Migration — 08_reminder_contact.sql
-- Run after 07. Safe to re-run.
--
-- Deadline reminders need a way to message users after the bot restarts,
-- but users are otherwise stored only as a salted hash. For users who send
-- REMINDERS ON, the bot stores their WhatsApp ID encrypted with
-- AES-256-GCM (key: REMINDER_ENCRYPTION_KEY, never stored in the database).
-- REMINDERS OFF sets it back to NULL.
-- =====================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS reminder_jid_enc TEXT;

COMMENT ON COLUMN users.reminder_jid_enc IS
  'AES-256-GCM encrypted WhatsApp ID, only while reminder_opt_in is true. Decryptable only by the bot.';

-- The opt-in invariant: no stored contact without consent
UPDATE users SET reminder_jid_enc = NULL WHERE reminder_opt_in = FALSE;
