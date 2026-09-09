-- =====================================================================
-- Faida — scraped_opportunities (admin review queue)
-- Run after 04_views.sql
-- Dashboard scrapes → pending → admin approves → bot reads approved
-- =====================================================================

CREATE TABLE IF NOT EXISTS scraped_opportunities (
  id              TEXT PRIMARY KEY,
  source          TEXT NOT NULL DEFAULT 'rss',       -- rss | mtaji | manual
  source_name     TEXT,
  link            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  provider        TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'financial',
  emoji           TEXT NOT NULL DEFAULT '🆕',
  description     TEXT NOT NULL DEFAULT '',
  amount          TEXT NOT NULL DEFAULT '',
  how_to_apply    TEXT NOT NULL DEFAULT '',
  documents       TEXT NOT NULL DEFAULT 'See official link',
  deadline        TEXT NOT NULL DEFAULT 'Check official link',
  eligibility     JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_payload     JSONB,
  status          TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  scraped_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_status
  ON scraped_opportunities (status, scraped_at DESC);

CREATE INDEX IF NOT EXISTS idx_scraped_opportunities_scraped_at
  ON scraped_opportunities (scraped_at DESC);

COMMENT ON TABLE scraped_opportunities IS
  'Web-scraped grants queue. Dashboard approves; WhatsApp bot shows status=approved only.';

-- RLS: service_role only (dashboard + bot use service key)
ALTER TABLE scraped_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scraped_opportunities_service_all ON scraped_opportunities;
CREATE POLICY scraped_opportunities_service_all ON scraped_opportunities
  FOR ALL USING (auth.role() = 'service_role');
