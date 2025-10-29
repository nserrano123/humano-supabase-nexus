# ProspectMatcher Agent

An intelligent candidate-to-position matching agent that performs semantic analysis to evaluate prospect compatibility with job positions using advanced AI.

## Overview

ProspectMatcher analyzes job prospects from your database and semantically compares them against job position requirements to determine compatibility and generate detailed match scores with actionable insights.

## Features

- **Semantic Analysis**: Deep contextual understanding beyond keyword matching
- **Match Scoring**: Calculate compatibility scores (0-100 scale) for prospect-position pairs
- **Detailed Insights**: Identify strengths, gaps, and provide actionable recommendations
- **Batch Processing**: Match one prospect against multiple positions or vice versa
- **Automated Evaluation**: Auto-trigger matching when new prospects or positions are added
- **REST API**: Simple HTTP endpoints for integration
- **Semantic Search**: Find relevant prospects or positions using natural language queries

## Prerequisites

- Node.js 18+ or Bun
- Supabase account with database access
- OpenAI API key (for semantic matching)
- Access to the `prospect`, `job_position`, and `prospect_evaluation` tables

## Installation

1. **Navigate to the agent directory:**
   ```bash
   cd agents/prospect-matcher
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```env
   SUPABASE_URL=https://qiqxywhaggmjrbtvkanm.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENAI_API_KEY=your-openai-api-key
   PORT=3001
   ```

4. **Add agent to database:**
   ```bash
   # Run the SQL script in Supabase SQL Editor
   cat setup-agent.sql
   ```
   Copy the agent ID from the result for creating prospects.

## Running the Agent

### Development Mode
```bash
npm run dev
# or
bun run dev
```

### Production Mode
```bash
npm run build
npm start
# or
bun run build
bun start
```

The agent will start on `http://localhost:3001` (or your configured PORT).

## API Endpoints

### Base URL
```
http://localhost:3001/agents/prospect-matcher
```

### 1. Match Prospects to Positions

**POST** `/match`

Match prospects to positions and optionally save results to the database.

**Request Body:**
```json
{
  "prospect_id": "uuid",      // Optional: specific prospect
  "position_id": "uuid",      // Optional: specific position
  "auto_save": true           // Default: true - save to database
}
```

**Scenarios:**
- Both IDs: Match one prospect to one position
- Only `prospect_id`: Match prospect to all open positions
- Only `position_id`: Match all prospects to one position

**Response:**
```json
{
  "prospect_id": "uuid",
  "position_id": "uuid",
  "match_score": 78,
  "strengths": [
    "5+ years of Python development experience aligns with requirements",
    "Strong background in machine learning matches role needs",
    "Experience with large-scale systems relevant to position"
  ],
  "gaps": [
    "Limited experience with Kubernetes mentioned in requirements",
    "No specific AWS certification though AWS experience required"
  ],
  "recommendation": "Recommended - Strong candidate with minor skill gaps that can be addressed",
  "detailed_analysis": "The candidate demonstrates strong technical capabilities..."
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/agents/prospect-matcher/match \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "123e4567-e89b-12d3-a456-426614174000",
    "position_id": "987fcdeb-51a2-43f7-b456-426614174111"
  }'
```

### 2. Create New Prospect

**POST** `/create`

Add a new prospect to the database with optional auto-matching.

**Request Body:**
```json
{
  "agent_id": "uuid",              // Required: ProspectMatcher agent ID
  "name": "John Doe",              // Optional
  "email": "john@example.com",     // Optional
  "phone": "+1234567890",          // Optional
  "linkedin_url": "https://...",   // Optional
  "profile_text": "Experienced software engineer...",  // Optional
  "profile_json": {                // Optional: structured data
    "skills": ["Python", "React"],
    "years_experience": 5
  }
}
```

**Query Parameters:**
- `auto_match=true`: Automatically match against all open positions

**Response:**
```json
{
  "prospect": {
    "id": "uuid",
    "agent_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profile_text": "...",
    "created_at": "2025-10-28T..."
  },
  "evaluations": [...]  // If auto_match=true
}
```

**Example:**
```bash
curl -X POST "http://localhost:3001/agents/prospect-matcher/create?auto_match=true" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "abc-123",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "profile_text": "Senior full-stack developer with 8 years experience..."
  }'
```

### 3. Delete Prospect or Position

**DELETE** `/delete`

Remove a prospect or job position by ID.

**Query Parameters:**
- `type`: Either `prospect` or `position`
- `id`: UUID of the record to delete

**Response:**
```json
{
  "message": "Prospect deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3001/agents/prospect-matcher/delete?type=prospect&id=123e4567-e89b-12d3-a456-426614174000"
```

### 4. Semantic Search

**GET** `/search`

Search for prospects or positions using natural language queries with similarity scoring.

**Query Parameters:**
- `query`: Search terms (required)
- `type`: Either `prospects` or `positions` (required)
- `limit`: Max results (default: 10, max: 100)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profile_text": "...",
    ...
  }
]
```

**Example:**
```bash
curl "http://localhost:3001/agents/prospect-matcher/search?query=python+developer&type=prospects&limit=5"
```

### 5. Get All Prospects

**GET** `/prospects`

Retrieve all prospects from the database.

**Response:**
```json
[
  {
    "id": "uuid",
    "agent_id": "uuid",
    "name": "...",
    ...
  }
]
```

### 6. Get Open Positions

**GET** `/positions`

Retrieve all open and active job positions.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Senior Software Engineer",
    "description": "...",
    "evaluation_criteria": "...",
    "llm_score_threshold": 70,
    ...
  }
]
```

### 7. Get Evaluations

**GET** `/evaluations`

Retrieve evaluations for a specific prospect or position.

**Query Parameters:**
- Either `prospect_id` or `position_id` (required)

**Response:**
```json
[
  {
    "id": "uuid",
    "prospect_id": "uuid",
    "job_position_id": "uuid",
    "llm_score": 78,
    "llm_evaluation": "Detailed analysis...",
    "created_at": "..."
  }
]
```

**Example:**
```bash
curl "http://localhost:3001/agents/prospect-matcher/evaluations?prospect_id=123e4567-e89b-12d3-a456-426614174000"
```

## Architecture

```
agents/prospect-matcher/
├── src/
│   ├── index.ts                 # Express server & application entry
│   ├── routes/
│   │   └── matcher.ts           # API route handlers
│   ├── services/
│   │   └── matcher.ts           # Semantic matching logic using OpenAI
│   ├── utils/
│   │   └── database.ts          # Supabase database operations
│   └── types/
│       └── database.ts          # TypeScript type definitions
├── package.json
├── tsconfig.json
├── .env.example
├── setup-agent.sql              # Database setup script
└── README.md
```

## Matching Algorithm

The ProspectMatcher uses a sophisticated semantic analysis approach:

1. **Profile Extraction**: Extracts relevant information from `prospect.profile_text` and `prospect.profile_json`

2. **Criteria Analysis**: Parses job requirements from `job_position.evaluation_criteria`

3. **Semantic Comparison**: Uses GPT-4 to perform deep contextual analysis including:
   - Technical skills alignment
   - Experience relevance
   - Cultural and soft skills fit
   - Growth potential assessment
   - Red flag identification

4. **Scoring**: Generates a 0-100 match score based on:
   - 90-100: Exceptional fit
   - 70-89: Strong fit
   - 45-69: Moderate fit
   - 25-44: Weak fit
   - 0-24: Poor fit

5. **Insights Generation**: Provides:
   - 3-5 key strengths
   - 2-4 notable gaps
   - Overall recommendation
   - Detailed 2-3 paragraph analysis

## Integration Example

### Automated Prospect Processing

```javascript
// When a new prospect is added
const response = await fetch(
  'http://localhost:3001/agents/prospect-matcher/create?auto_match=true',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: 'prospect-matcher-id',
      name: 'John Doe',
      email: 'john@example.com',
      profile_text: 'Senior software engineer with 10 years...'
    })
  }
);

const result = await response.json();
console.log(`Created prospect with ${result.evaluations.length} evaluations`);
```

### Manual Matching

```javascript
// Match a specific prospect to all positions
const response = await fetch(
  'http://localhost:3001/agents/prospect-matcher/match',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prospect_id: 'abc-123',
      auto_save: true
    })
  }
);

const matches = await response.json();
matches.forEach(match => {
  console.log(`Position: ${match.position_id}, Score: ${match.match_score}`);
});
```

## Database Schema

The agent works with the following tables:

### `prospect`
- `id`: UUID (PK)
- `agent_id`: UUID (FK → agent)
- `name`: text
- `email`: text
- `phone`: text
- `linkedin_url`: text
- `profile_text`: text (main content for matching)
- `profile_json`: jsonb
- `created_at`: timestamp

### `job_position`
- `id`: UUID (PK)
- `name`: text
- `description`: text
- `evaluation_criteria`: text (main content for matching)
- `llm_score_threshold`: numeric
- `is_open`: boolean
- `active`: boolean
- ... (other fields)

### `prospect_evaluation`
- `id`: UUID (PK)
- `prospect_id`: UUID (FK → prospect)
- `job_position_id`: UUID (FK → job_position)
- `llm_score`: numeric (match score)
- `llm_evaluation`: text (detailed analysis)
- `created_at`: timestamp

## Error Handling

The agent includes comprehensive error handling:

- **Validation Errors**: Returns 400 with details when request data is invalid
- **Not Found**: Returns 404 when prospect/position doesn't exist
- **Server Errors**: Returns 500 with error message for unexpected failures
- **Graceful Degradation**: Continues processing other records if one fails in batch operations

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key with database access |
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4 access |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment mode (development/production) |
| `DEFAULT_MATCH_THRESHOLD` | No | Default minimum score (default: 45) |
| `HIGH_MATCH_THRESHOLD` | No | High score threshold (default: 70) |

## Deployment

### Docker (Recommended)

```dockerfile
# Coming soon
```

### Traditional Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables on your server

3. Start the agent:
   ```bash
   npm start
   ```

### Supabase Edge Function (Alternative)

You can also deploy this as a Supabase Edge Function for tighter integration.

## Monitoring

The agent includes:
- Request logging to console
- Health check endpoint at `/health`
- Error tracking and reporting

## Troubleshooting

### Common Issues

1. **"Missing Supabase configuration"**
   - Ensure `.env` file exists with valid credentials
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

2. **"Failed to fetch prospects"**
   - Check Supabase service role key has proper permissions
   - Verify tables exist in your database

3. **OpenAI API errors**
   - Confirm `OPENAI_API_KEY` is valid
   - Check OpenAI account has available credits
   - Verify API rate limits aren't exceeded

4. **Low match scores**
   - Ensure `profile_text` contains detailed information
   - Verify `evaluation_criteria` has specific requirements
   - Check that profiles are in English (or adjust prompts)

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Hot Reload
```bash
npm run dev
```

## Future Enhancements

- [ ] Vector embeddings for true semantic search
- [ ] WebSocket support for real-time updates
- [ ] Batch processing queue for large-scale matching
- [ ] Custom matching algorithms per position
- [ ] Machine learning model fine-tuning
- [ ] Multi-language support
- [ ] Raindrop integration for LinkedIn profile ingestion
- [ ] Analytics dashboard

## License

MIT

## Support

For issues and questions, please open an issue in the GitHub repository.
