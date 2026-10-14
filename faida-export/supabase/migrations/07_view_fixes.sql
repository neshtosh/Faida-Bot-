-- =====================================================================
-- Faida Supabase Migration — 07_view_fixes.sql
-- Run after 06. Safe to re-run.
--
-- 1. benefit_match_popularity: the grand total was cast to numeric(5,2),
--    which overflows (error) once there are >= 1,000 benefit_matched events.
-- 2. county_demographics: guard the age cast so one non-integer age in a
--    profile doesn't break the whole view.
-- 3. Views run with the owner's rights by default, bypassing RLS, so the
--    anon key could read aggregate analytics through the REST API. Make
--    them security_invoker and revoke public access.
-- =====================================================================

CREATE OR REPLACE VIEW benefit_match_popularity AS
  SELECT
    b.id          AS benefit_id,
    b.name        AS benefit_name,
    b.category    AS category,
    b.emoji,
    COUNT(*)        AS match_count,
    ROUND(
      COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0),
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

CREATE OR REPLACE VIEW county_demographics AS
  SELECT
    COALESCE(profile->>'county', 'Unknown')    AS county,
    COUNT(DISTINCT user_id_hash)                AS users,
    COUNT(*) FILTER (
      WHERE (profile->>'gender') IS NOT NULL
    )                                           AS with_gender,
    AVG(
      CASE WHEN (profile->>'age') ~ '^\d{1,3}$' THEN (profile->>'age')::int END
    )::numeric(4,1)                             AS avg_age
  FROM sessions
  WHERE profile IS NOT NULL
    AND profile <> '{}'::jsonb
  GROUP BY 1
  ORDER BY users DESC
  LIMIT 60;

ALTER VIEW daily_active_users       SET (security_invoker = on);
ALTER VIEW benefit_match_popularity SET (security_invoker = on);
ALTER VIEW application_summary      SET (security_invoker = on);
ALTER VIEW funnel_dropoff           SET (security_invoker = on);
ALTER VIEW county_demographics      SET (security_invoker = on);
ALTER VIEW overview_kpis            SET (security_invoker = on);

REVOKE ALL ON daily_active_users, benefit_match_popularity, application_summary,
              funnel_dropoff, county_demographics, overview_kpis
  FROM anon, authenticated;

-- 02_rls.sql's apps_authenticated_read could never match (an "authenticated"
-- request never has role service_role). Drop it to avoid confusion.
DROP POLICY IF EXISTS apps_authenticated_read ON applications;
