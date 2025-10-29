# ProspectMatcher Quick Start Guide

Get the ProspectMatcher agent up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd agents/prospect-matcher
npm install
# or
bun install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
SUPABASE_URL=https://qiqxywhaggmjrbtvkanm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
OPENAI_API_KEY=sk-...
PORT=3001
```

**Getting your Supabase Service Role Key:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (NOT the "anon" key)

**Getting your OpenAI API Key:**
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with "sk-")

## Step 3: Setup Database

Run the SQL script in your Supabase SQL Editor:

```sql
INSERT INTO agent (name, description, github_url)
VALUES (
  'ProspectMatcher',
  'Intelligent candidate-to-position matching agent',
  'https://github.com/your-org/humano-supabase-nexus/tree/main/agents/prospect-matcher'
);

SELECT id, name FROM agent WHERE name = 'ProspectMatcher';
```

Save the returned `id` - you'll need it when creating prospects.

## Step 4: Start the Agent

```bash
npm run dev
```

You should see:
```
ProspectMatcher Agent running on port 3001
Environment: development
Health check: http://localhost:3001/health
```

## Step 5: Test the Agent

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T...",
  "service": "ProspectMatcher Agent"
}
```

### Create a Test Prospect
```bash
curl -X POST http://localhost:3001/agents/prospect-matcher/create \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "YOUR-AGENT-ID-HERE",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "profile_text": "Senior software engineer with 8 years of experience in Python, JavaScript, and cloud technologies. Strong background in building scalable web applications and RESTful APIs. Experience with React, Node.js, PostgreSQL, and AWS. Led teams of 3-5 developers on multiple projects."
  }'
```

### Match Against All Open Positions
```bash
curl -X POST http://localhost:3001/agents/prospect-matcher/match \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "YOUR-PROSPECT-ID",
    "auto_save": true
  }'
```

## Example Workflow

### 1. Get all open positions
```bash
curl http://localhost:3001/agents/prospect-matcher/positions
```

### 2. Create a new prospect with auto-matching
```bash
curl -X POST "http://localhost:3001/agents/prospect-matcher/create?auto_match=true" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "YOUR-AGENT-ID",
    "name": "Sarah Chen",
    "email": "sarah@example.com",
    "profile_text": "Full-stack developer specializing in React and Node.js..."
  }'
```

### 3. View evaluations for a prospect
```bash
curl "http://localhost:3001/agents/prospect-matcher/evaluations?prospect_id=YOUR-PROSPECT-ID"
```

### 4. Search for prospects
```bash
curl "http://localhost:3001/agents/prospect-matcher/search?query=python+developer&type=prospects&limit=5"
```

## Common Use Cases

### Auto-match all prospects to a new position
```bash
curl -X POST http://localhost:3001/agents/prospect-matcher/match \
  -H "Content-Type: application/json" \
  -d '{
    "position_id": "YOUR-POSITION-ID",
    "auto_save": true
  }'
```

### Find best matches for a specific position
```bash
# Get all prospects matched to a position (sorted by score)
curl "http://localhost:3001/agents/prospect-matcher/evaluations?position_id=YOUR-POSITION-ID"
```

### Re-evaluate a specific prospect-position pair
```bash
curl -X POST http://localhost:3001/agents/prospect-matcher/match \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "PROSPECT-ID",
    "position_id": "POSITION-ID",
    "auto_save": true
  }'
```

## Understanding Match Scores

The agent returns scores on a 0-100 scale:

- **90-100**: Exceptional fit - Candidate exceeds most requirements
- **70-89**: Strong fit - Meets most requirements with minor gaps
- **45-69**: Moderate fit - Meets some requirements, notable gaps
- **25-44**: Weak fit - Significant gaps in key areas
- **0-24**: Poor fit - Does not meet fundamental requirements

Each result includes:
- `match_score`: Numeric score
- `strengths`: 3-5 key areas where candidate excels
- `gaps`: 2-4 areas where candidate falls short
- `recommendation`: Summary recommendation
- `detailed_analysis`: 2-3 paragraph detailed explanation

## Frontend Integration

### React Example

```typescript
import { supabase } from '@/integrations/supabase/client';

async function matchProspect(prospectId: string) {
  const response = await fetch(
    'http://localhost:3001/agents/prospect-matcher/match',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prospect_id: prospectId,
        auto_save: true
      })
    }
  );

  const matches = await response.json();

  // Refresh evaluations in UI
  const { data } = await supabase
    .from('prospect_evaluation')
    .select('*')
    .eq('prospect_id', prospectId);

  return data;
}
```

## Troubleshooting

### Port already in use
```bash
# Change port in .env
PORT=3002
```

### OpenAI rate limits
```bash
# Add delays between requests or upgrade OpenAI plan
# The agent handles rate limits gracefully
```

### Database connection issues
```bash
# Verify Supabase credentials
# Check service role key has proper permissions
# Ensure tables exist: prospect, job_position, prospect_evaluation
```

## Next Steps

1. Read the full [README.md](./README.md) for detailed API documentation
2. Customize the matching prompt in `src/services/matcher.ts`
3. Adjust score thresholds in `.env`
4. Set up automated triggers for new prospects
5. Deploy to production

## Production Deployment

For production, consider:
- Setting `NODE_ENV=production`
- Using a process manager (PM2, systemd)
- Setting up monitoring and logging
- Configuring CORS properly
- Using HTTPS
- Rate limiting API endpoints

## Getting Help

- Check the [README.md](./README.md) for full documentation
- Review error logs in the console
- Verify environment variables are set correctly
- Test with simple prospects first

Happy matching!
