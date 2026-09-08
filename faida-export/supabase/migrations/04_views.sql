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
