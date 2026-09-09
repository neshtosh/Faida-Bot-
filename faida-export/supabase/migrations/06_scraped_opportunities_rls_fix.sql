-- Fix RLS policies for scraped_opportunities (service role + authenticated backend)

ALTER TABLE scraped_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS scraped_opportunities_service_all ON scraped_opportunities;

CREATE POLICY scraped_opportunities_service_all ON scraped_opportunities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
