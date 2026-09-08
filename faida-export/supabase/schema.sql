-- ============================================================
-- Faida Supabase — Consolidated Schema (excludes seed data)
-- ============================================================
--
-- This is a convenience copy of tables, indexes, RLS, and views.
-- If this is your FIRST time setting up Supabase, prefer the
-- step-by-step migrations in ./migrations/ applied in order
-- (00_init → 01_indexes → 02_rls → 03_seed_benefits → 04_views).
--
-- After running this file you MUST ALSO run:
--   ./migrations/03_seed_benefits.sql
-- to populate the benefits catalog with the 30 Kenyan benefits.
-- ============================================================

-- ── from 00_init.sql ──

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

-- ── from 01_indexes.sql ──

-- =====================================================================
-- Faida Supabase Migration — 01_indexes.sql
-- Run order: 2 of 5
-- Indexes to keep lookups & analytics queries fast.
-- Safe to re-run (all CREATE INDEX CONCURRENTLY IF NOT EXISTS where possible,
-- or wrapped with exception blocks).
-- =====================================================================

-- ---------- Benefits -----------------------------------------------------
CREATE INDEX IF NOT EXISTS benefits_category_idx ON benefits (category);
CREATE INDEX IF NOT EXISTS benefits_published_idx ON benefits (is_published);
CREATE INDEX IF NOT EXISTS benefits_priority_idx ON benefits (priority_weight DESC);

-- ---------- Users --------------------------------------------------------
CREATE INDEX IF NOT EXISTS users_last_seen_idx ON users (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS users_app_count_idx ON users (app_count DESC);

-- ---------- Sessions -----------------------------------------------------
CREATE INDEX IF NOT EXISTS sessions_last_activity_idx ON sessions (last_activity DESC);
CREATE INDEX IF NOT EXISTS sessions_step_idx ON sessions (step);
CREATE INDEX IF NOT EXISTS sessions_lang_idx ON sessions (language);

-- ---------- Applications -------------------------------------------------
CREATE INDEX IF NOT EXISTS apps_user_idx  ON applications (user_id_hash);
CREATE INDEX IF NOT EXISTS apps_benefit_idx  ON applications (benefit_id);
CREATE INDEX IF NOT EXISTS apps_status_idx  ON applications (status);
CREATE INDEX IF NOT EXISTS apps_completed_idx  ON applications (completed_at DESC);
CREATE INDEX IF NOT EXISTS apps_refcode_idx  ON applications (reference_code);
CREATE INDEX IF NOT EXISTS apps_user_completed_idx  ON applications (user_id_hash, completed_at DESC);

-- ---------- Application fields ------------------------------------------
CREATE INDEX IF NOT EXISTS app_fields_app_idx  ON application_fields (application_id);
CREATE INDEX IF NOT EXISTS app_fields_field_idx  ON application_fields (field_name);

-- ---------- Analytics events --------------------------------------------
CREATE INDEX IF NOT EXISTS events_type_idx ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS events_user_idx ON analytics_events (user_id_hash);
CREATE INDEX IF NOT EXISTS events_benefit_idx ON analytics_events (benefit_id);
CREATE INDEX IF NOT EXISTS events_created_idx ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS events_type_created_idx ON analytics_events (event_type, created_at DESC);

-- ---------- Audit log ----------------------------------------------------
CREATE INDEX IF NOT EXISTS audit_target_idx  ON audit_log (target_kind, target_id);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_log (created_at DESC);

-- ---------- Performance on common GIN lookups in JSONB ------------------
-- Used for "find sessions whose profile county = X" and similar dash filters.
CREATE INDEX IF NOT EXISTS sessions_profile_gin ON sessions USING GIN (profile jsonb_path_ops);
CREATE INDEX IF NOT EXISTS apps_meta_gin ON applications USING GIN (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS events_meta_gin ON analytics_events USING GIN (metadata jsonb_path_ops);

-- ── from 02_rls.sql ──

-- =====================================================================
-- Faida Supabase Migration — 02_rls.sql
-- Run order: 3 of 5
-- Row Level Security: deny anonymous access, allow service_role (used
-- by bot + dashboard backend) to bypass RLS entirely.
-- =====================================================================

-- ----- Benefits -----
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS benefits_service_all ON benefits;
CREATE POLICY benefits_service_all
  ON benefits
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin dashboard users (authenticated Supabase Auth) can READ benefits
-- but NOT mutate (mutations require service_role to keep writes audited)
DROP POLICY IF EXISTS benefits_authenticated_read ON benefits;
CREATE POLICY benefits_authenticated_read
  ON benefits
  FOR SELECT
  TO authenticated
  USING (is_published = TRUE OR auth.role() = 'service_role');

-- ----- Users -----
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_service_all ON users;
CREATE POLICY users_service_all
  ON users
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ----- Sessions -----
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_service_all ON sessions;
CREATE POLICY sessions_service_all
  ON sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ----- Applications -----
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS apps_service_all ON applications;
CREATE POLICY apps_service_all
  ON applications
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS apps_authenticated_read ON applications;
CREATE POLICY apps_authenticated_read
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'service_role');

-- ----- Application fields -----
ALTER TABLE application_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_fields_service_all ON application_fields;
CREATE POLICY app_fields_service_all
  ON application_fields
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ----- Analytics events -----
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_service_all ON analytics_events;
CREATE POLICY events_service_all
  ON analytics_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ----- Audit log -----
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_service_all ON audit_log;
CREATE POLICY audit_service_all
  ON audit_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================================
-- Summary of the RLS philosophy:
--   anon          → NOTHING (all tables deny)
--   authenticated → read-only on benefits (for future logged-in staff
--                   users); everything else deny
--   service_role  → ALL ROWS (bot and dashboard server use this role
--                   via SUPABASE_SERVICE_ROLE_KEY)
-- =====================================================================

-- ── from 04_views.sql ──

-- =====================================================================
-- Faida Supabase Migration — 04_views.sql
-- Run order: 5 of 5
-- Materialised views for the admin dashboard analytics.
-- Dashboard pages SELECT from these views instead of raw tables for speed.
-- =====================================================================

-- ---------------------------------------------------------------------
-- View: daily_active_users
-- 7 / 30 day DAU counts (integration)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW daily_active_users AS
  SELECT
    DATE(created_at) AS day,
    COUNT(DISTINCT user_id_hash) AS dau,
    COUNT(*) FILTER (WHERE event_type = 'session_start') AS sessions,
    COUNT(*) FILTER (WHERE event_type = 'application_complete') AS completed_apps
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND user_id_hash IS NOT NULL
  GROUP BY 1
  ORDER BY 1 DESC;

COMMENT ON VIEW daily_active_users IS 'Daily active users, sessions, completed apps for the last 30 days';

-- ---------------------------------------------------------------------
-- View: benefit_match_popularity
-- Which benefits are matched the most (served to users in the WhatsApp flow)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW benefit_match_popularity AS
  SELECT
    b.id          AS benefit_id,
    b.name        AS benefit_name,
    b.category    AS category,
    b.emoji,
    COUNT(*)        AS match_count,
    ROUND(
      COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0)::numeric(5,2),
      2
    )             AS pct_of_all,
    AVG((metadata->>'score')::numeric(5,2)) AS avg_score,
    MAX(ae.created_at)::date AS last_matched_on
  FROM analytics_events ae
  JOIN benefits b ON b.id = ae.benefit_id
  WHERE ae.event_type = 'benefit_matched'
  GROUP BY b.id, b.name, b.category, b.emoji
  ORDER BY match_count DESC
  LIMIT 100;

COMMENT ON VIEW benefit_match_popularity IS 'Top 100 benefits by number of matches served';

-- ---------------------------------------------------------------------
-- View: application_summary
-- Aggregated application stats per benefit, last 90 days
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW application_summary AS
  SELECT
    b.id            AS benefit_id,
    b.name          AS benefit_name,
    b.emoji,
    b.category,
    COUNT(a.id)                              AS total_submitted,
    COUNT(*) FILTER (WHERE a.status = 'submitted')  AS pending_review,
    COUNT(*) FILTER (WHERE a.status = 'approved')   AS approved,
    COUNT(*) FILTER (WHERE a.status = 'rejected')   AS rejected,
    AVG(EXTRACT(EPOCH FROM (a.completed_at - a.started_at)) / 60)::numeric(8,1)
                                                  AS avg_minutes_to_complete,
    COUNT(DISTINCT a.user_id_hash)                AS unique_users
  FROM applications a
  JOIN benefits b ON b.id = a.benefit_id
  WHERE a.completed_at >= NOW() - INTERVAL '90 days'
  GROUP BY b.id, b.name, b.emoji, b.category
  ORDER BY total_submitted DESC;

COMMENT ON VIEW application_summary IS 'Application throughput per benefit (last 90 days)';

-- ---------------------------------------------------------------------
-- View: funnel_dropoff
-- Estimate of conversion from matched → started → completed per benefit
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW funnel_dropoff AS
WITH matched AS (
  SELECT benefit_id, COUNT(DISTINCT user_id_hash) AS users_matched
  FROM analytics_events
  WHERE event_type = 'benefit_matched'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1
),
started AS (
  SELECT benefit_id, COUNT(DISTINCT user_id_hash) AS users_started
  FROM analytics_events
  WHERE event_type = 'application_started'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1
),
completed AS (
  SELECT benefit_id, COUNT(DISTINCT user_id_hash) AS users_completed
  FROM analytics_events
  WHERE event_type = 'application_complete'
    AND created_at >= NOW() - INTERVAL '30 days'
  GROUP BY 1
)
SELECT
  b.id    AS benefit_id,
  b.name  AS benefit_name,
  b.emoji,
  COALESCE(m.users_matched, 0)         AS matched,
  COALESCE(s.users_started, 0)             AS started,
  COALESCE(c.users_completed, 0)          AS completed,
  CASE WHEN COALESCE(m.users_matched,0) > 0
       THEN ROUND(COALESCE(s.users_started,0)::numeric * 100 / m.users_matched, 2)
       ELSE 0 END                         AS pct_matched_to_started,
  CASE WHEN COALESCE(s.users_started, 0) > 0
       THEN ROUND(COALESCE(c.users_completed,0)::numeric * 100 / s.users_started, 2)
       ELSE 0 END                         AS pct_started_to_completed
FROM benefits b
LEFT JOIN matched m   ON m.benefit_id = b.id
LEFT JOIN started s ON s.benefit_id = b.id
LEFT JOIN completed c ON c.benefit_id = b.id
ORDER BY matched DESC;

COMMENT ON VIEW funnel_dropoff IS 'Conversion funnel per benefit (last 30 days)';

-- ---------------------------------------------------------------------
-- View: county_demographics
-- Aggregate per county from profile answers (county from sessions.profile)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW county_demographics AS
  SELECT
    COALESCE(profile->>'county', 'Unknown')    AS county,
    COUNT(DISTINCT user_id_hash)                AS users,
    COUNT(*) FILTER (
      WHERE (profile->>'gender') IS NOT NULL
    )                                           AS with_gender,
    AVG((profile->>'age')::int)::numeric(4,1)  AS avg_age
  FROM sessions
  WHERE profile IS NOT NULL
    AND profile <> '{}'::jsonb
  GROUP BY 1
  ORDER BY users DESC
  LIMIT 60;

COMMENT ON VIEW county_demographics IS 'County-level user counts from session profiles';

-- ---------------------------------------------------------------------
-- View: overview_kpis
-- Single-row summary for the dashboard Overview KPIs card.
-- Dashboard reads this as: SELECT * FROM overview_kpis
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW overview_kpis AS
  SELECT
    (SELECT COUNT(*) FROM users)                                                        AS total_users,
    (SELECT COUNT(*) FROM users WHERE last_seen_at >= NOW() - INTERVAL '7 days')        AS dau_7d,
    (SELECT COUNT(*) FROM sessions WHERE last_activity >= NOW() - INTERVAL '30 minutes')    AS active_now,
    (SELECT COUNT(*) FROM applications WHERE completed_at >= NOW() - INTERVAL '7 days')     AS apps_last_7d,
    (SELECT COUNT(*) FROM applications)                                                    AS apps_total,
    (SELECT COUNT(*) FROM benefits WHERE is_published = TRUE)                                AS benefits_published,
    (SELECT COUNT(*) FROM analytics_events WHERE created_at >= NOW() - INTERVAL '7 days' AND event_type = 'matches_served')
                                                                                          AS matches_last_7d,
    NOW()                                                                               AS updated_at;

COMMENT ON VIEW overview_kpis IS 'One-row snapshot used by the Overview page stat cards.';

