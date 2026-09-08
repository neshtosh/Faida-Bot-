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
