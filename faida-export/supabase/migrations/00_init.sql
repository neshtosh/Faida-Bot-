-- =====================================================================
-- Faida Supabase Migration — 00_init.sql
-- Run order: 1 of 5
-- Creates the core tables used by the WhatsApp bot and Admin Dashboard.
-- Apply in Supabase Studio → SQL Editor → paste → Run.
-- =====================================================================

-- Ensure uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- Enum: benefit_category
-- Mirrors the bot's CATEGORIES const.
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE benefit_category AS ENUM (
    'financial', 'health', 'employment', 'legal', 'housing'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- Enum: gender_filter / tristate_flag
-- Enum versions of the bot's filter types, but stored as TEXT to keep
-- bot-sync simple. Kept here for documentation.
-- ---------------------------------------------------------------------

-- =====================================================================
-- Table: benefits
-- Single source of truth for the benefit catalog.
-- Supabase owns the "master" copy; bot reads from this (or mirrors to
-- JSON for offline use).
-- =====================================================================
CREATE TABLE IF NOT EXISTS benefits (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  provider           TEXT NOT NULL DEFAULT '',
  category           benefit_category NOT NULL,
  emoji              TEXT NOT NULL DEFAULT '📋',
  description        TEXT NOT NULL DEFAULT '',
  amount             TEXT NOT NULL DEFAULT '',
  how_to_apply       TEXT NOT NULL DEFAULT '',
  documents          TEXT NOT NULL DEFAULT '',
  deadline           TEXT NOT NULL DEFAULT 'Rolling',
  deadline_date      TEXT,                   -- format MM-DD, optional
  deadline_annual    BOOLEAN DEFAULT FALSE,
  link               TEXT NOT NULL DEFAULT '',

  -- Eligibility stored as JSONB (mirrors benefit.eligibility in bot)
  eligibility        JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Publication controls
  is_published       BOOLEAN NOT NULL DEFAULT TRUE,
  priority_weight    INTEGER NOT NULL DEFAULT 0,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  benefits IS 'Master benefit catalog; drives WhatsApp matches and dashboard.';
COMMENT ON COLUMN benefits.eligibility IS 'Raw eligibility rules JSON (minAge, maxAge, gender, counties, etc.)';
COMMENT ON COLUMN benefits.priority_weight IS 'Higher = boosted above equal-score matches. Use sparingly.';

-- =====================================================================
-- Table: users
-- Anonymised per-phone record. No PII — only the SHA-256 salted hash
-- of the phone number (see privacy.js → hashUserId).
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
  user_id_hash      TEXT PRIMARY KEY,
  language          TEXT,                    -- 'en' | 'sw' | null
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reminder_opt_in   BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent     JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile_snapshot  JSONB NOT NULL DEFAULT '{}'::jsonb,   -- latest age/county/...
  app_count         INTEGER NOT NULL DEFAULT 0,
  match_count       INTEGER NOT NULL DEFAULT 0
);

COMMENT ON TABLE users IS 'Anonymised users. user_id_hash = SHA-256(salt || phone)';

-- =====================================================================
-- Table: sessions
-- Conversation state. Mirrors the in-memory session shape.
-- Upserted at the end of each user message via session.persistSession.
-- =====================================================================
CREATE TABLE IF NOT EXISTS sessions (
  user_id_hash       TEXT PRIMARY KEY REFERENCES users(user_id_hash) ON DELETE CASCADE,
  step               TEXT NOT NULL DEFAULT 'welcome',
  language           TEXT,
  profile            JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_matches       JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback           JSONB,
  message_timestamps JSONB NOT NULL DEFAULT '[]'::jsonb,
  reminders_opt_in   BOOLEAN NOT NULL DEFAULT FALSE,
  reminders_sent     JSONB NOT NULL DEFAULT '{}'::jsonb,
  application_json   JSONB NOT NULL DEFAULT '{}'::jsonb,    -- active app state
  completed_apps     JSONB NOT NULL DEFAULT '[]'::jsonb,    -- summary of finished apps
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'Active (and recent) per-user conversation state. TTL 30 min enforced in bot.';

-- =====================================================================
-- Table: applications
-- Normalised record of completed applications. Each row is ONE citizen
-- successfully completing an application form for ONE benefit.
-- Dashboard's "Applications" page is a view over this table.
-- =====================================================================
CREATE TABLE IF NOT EXISTS applications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_hash       TEXT NOT NULL REFERENCES users(user_id_hash) ON DELETE CASCADE,
  benefit_id         TEXT NOT NULL REFERENCES benefits(id) ON DELETE RESTRICT,
  template_id        TEXT,                   -- e.g. loans-personal, education-bursary
  reference_code     TEXT NOT NULL UNIQUE,   -- human-readable ref like YEDF-A7K2
  status             TEXT NOT NULL DEFAULT 'submitted',
  -- submitted | in_review | approved | rejected | withdrawn
  started_at         TIMESTAMPTZ NOT NULL,
  completed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submission_mode    TEXT,                   -- 'mobile' | 'office' | null
  answers_summary    JSONB NOT NULL DEFAULT '{}'::jsonb,   -- PII-free summary
  metadata           JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE applications IS 'Normalised record of every completed application. Answers stored PII-free.';

-- =====================================================================
-- Table: application_fields
-- Individual field-level answers (for review UI, troubleshooting).
-- Keeps 1 row per answer-field; queries with
-- WHERE application_id = $1 ORDER BY field_index
-- =====================================================================
CREATE TABLE IF NOT EXISTS application_fields (
  id              BIGSERIAL PRIMARY KEY,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  field_name      TEXT NOT NULL,
  field_label     TEXT,
  field_type      TEXT,                    -- text / number / select / textarea
  value_text      TEXT,
  value_number    NUMERIC,
  field_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, field_name)
);

-- =====================================================================
-- Table: analytics_events
-- Append-only event log. Session manager writes a row per event.
-- High-volume; use the views in 04_views.sql for dashboards.
-- =====================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id             BIGSERIAL PRIMARY KEY,
  event_type     TEXT NOT NULL,            -- user_created|session_start|matches_served|benefit_matched|application_started|application_complete|reminder_sent|etc
  user_id_hash   TEXT REFERENCES users(user_id_hash) ON DELETE SET NULL,
  benefit_id     TEXT REFERENCES benefits(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE analytics_events IS 'Append-only event log. Source for the analytics views (04_views.sql).';

-- =====================================================================
-- Table: audit_log
-- Admin / dashboard operations. Every create/edit/delete of a benefit
-- writes a row here (to be implemented in dashboard API).
-- =====================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor       TEXT NOT NULL DEFAULT 'dashboard',
  action      TEXT NOT NULL,              -- benefit.create | benefit.update | benefit.delete | ...
  target_kind TEXT NOT NULL,              -- benefit
  target_id   TEXT NOT NULL,
  before      JSONB,
  after       JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
