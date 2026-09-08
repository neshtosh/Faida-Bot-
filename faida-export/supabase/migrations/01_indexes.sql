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
