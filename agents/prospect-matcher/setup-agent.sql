-- Insert ProspectMatcher agent into the agent table
-- Run this script in your Supabase SQL editor or via psql

INSERT INTO agent (name, description, github_url)
VALUES (
  'ProspectMatcher',
  'Intelligent candidate-to-position matching agent that performs semantic analysis to evaluate prospect compatibility with job positions. Uses advanced AI to compare profiles against evaluation criteria and generates detailed match scores with actionable insights.',
  'https://github.com/your-org/humano-supabase-nexus/tree/main/agents/prospect-matcher'
)
ON CONFLICT (name) DO UPDATE
SET
  description = EXCLUDED.description,
  github_url = EXCLUDED.github_url;

-- Get the agent ID (you'll need this for creating prospects)
SELECT id, name, description
FROM agent
WHERE name = 'ProspectMatcher';
