import { Router, Request, Response } from 'express';
import { DatabaseService } from '../utils/database.js';
import { MatcherService } from '../services/matcher.js';
import { z } from 'zod';

const router = Router();
const db = new DatabaseService();
const matcher = new MatcherService();

// Validation schemas
const CreateProspectSchema = z.object({
  agent_id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  profile_text: z.string().optional(),
  profile_json: z.record(z.any()).optional()
});

const MatchRequestSchema = z.object({
  prospect_id: z.string().uuid().optional(),
  position_id: z.string().uuid().optional(),
  auto_save: z.boolean().default(true)
});

const SearchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['prospects', 'positions']),
  limit: z.number().min(1).max(100).default(10)
});

// POST /match - Perform matching
router.post('/match', async (req: Request, res: Response) => {
  try {
    const { prospect_id, position_id, auto_save } = MatchRequestSchema.parse(req.body);

    if (prospect_id && position_id) {
      // Match specific prospect to specific position
      const prospect = await db.getProspectById(prospect_id);
      const position = await db.getJobPositionById(position_id);

      if (!prospect) {
        return res.status(404).json({ error: 'Prospect not found' });
      }

      if (!position) {
        return res.status(404).json({ error: 'Job position not found' });
      }

      const result = await matcher.matchProspectToPosition(prospect, position);

      if (auto_save) {
        // Check if evaluation already exists
        const existing = await db.getExistingEvaluation(prospect_id, position_id);

        if (existing) {
          await db.updateEvaluation(prospect_id, position_id, {
            llm_score: result.match_score,
            llm_evaluation: result.detailed_analysis
          });
        } else {
          await db.createEvaluation({
            prospect_id,
            job_position_id: position_id,
            llm_score: result.match_score,
            llm_evaluation: result.detailed_analysis
          });
        }
      }

      return res.json(result);
    } else if (prospect_id) {
      // Match prospect to all open positions
      const prospect = await db.getProspectById(prospect_id);
      if (!prospect) {
        return res.status(404).json({ error: 'Prospect not found' });
      }

      const positions = await db.getOpenJobPositions();
      const results = await matcher.batchMatchProspect(prospect, positions);

      if (auto_save) {
        for (const result of results) {
          const existing = await db.getExistingEvaluation(prospect_id, result.position_id);

          if (existing) {
            await db.updateEvaluation(prospect_id, result.position_id, {
              llm_score: result.match_score,
              llm_evaluation: result.detailed_analysis
            });
          } else {
            await db.createEvaluation({
              prospect_id,
              job_position_id: result.position_id,
              llm_score: result.match_score,
              llm_evaluation: result.detailed_analysis
            });
          }
        }
      }

      return res.json(results);
    } else if (position_id) {
      // Match all prospects to specific position
      const position = await db.getJobPositionById(position_id);
      if (!position) {
        return res.status(404).json({ error: 'Job position not found' });
      }

      const prospects = await db.getProspects();
      const results = await matcher.batchMatchPosition(prospects, position);

      if (auto_save) {
        for (const result of results) {
          const existing = await db.getExistingEvaluation(result.prospect_id, position_id);

          if (existing) {
            await db.updateEvaluation(result.prospect_id, position_id, {
              llm_score: result.match_score,
              llm_evaluation: result.detailed_analysis
            });
          } else {
            await db.createEvaluation({
              prospect_id: result.prospect_id,
              job_position_id: position_id,
              llm_score: result.match_score,
              llm_evaluation: result.detailed_analysis
            });
          }
        }
      }

      return res.json(results);
    } else {
      return res.status(400).json({
        error: 'Must provide either prospect_id, position_id, or both'
      });
    }
  } catch (error) {
    console.error('Match error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// POST /create - Create new prospect
router.post('/create', async (req: Request, res: Response) => {
  try {
    const prospectData = CreateProspectSchema.parse(req.body);

    const prospect = await db.createProspect({
      agent_id: prospectData.agent_id,
      name: prospectData.name ?? null,
      email: prospectData.email ?? null,
      phone: prospectData.phone ?? null,
      linkedin_url: prospectData.linkedin_url ?? null,
      profile_text: prospectData.profile_text ?? null,
      profile_json: prospectData.profile_json ?? null
    });

    // Optionally trigger auto-matching
    if (req.query.auto_match === 'true') {
      const positions = await db.getOpenJobPositions();
      const results = await matcher.batchMatchProspect(prospect, positions);

      // Save evaluations
      for (const result of results) {
        await db.createEvaluation({
          prospect_id: prospect.id,
          job_position_id: result.position_id,
          llm_score: result.match_score,
          llm_evaluation: result.detailed_analysis
        });
      }

      return res.status(201).json({
        prospect,
        evaluations: results
      });
    }

    return res.status(201).json(prospect);
  } catch (error) {
    console.error('Create prospect error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// DELETE /delete - Remove prospect or position
router.delete('/delete', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.query;

    if (!type || !id) {
      return res.status(400).json({
        error: 'Must provide both type (prospect|position) and id'
      });
    }

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    if (type === 'prospect') {
      await db.deleteProspect(id);
      return res.json({ message: 'Prospect deleted successfully' });
    } else if (type === 'position') {
      await db.deleteJobPosition(id);
      return res.json({ message: 'Job position deleted successfully' });
    } else {
      return res.status(400).json({
        error: 'Invalid type. Must be either "prospect" or "position"'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET /search - Semantic search across prospects or positions
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, type, limit } = SearchSchema.parse({
      query: req.query.query,
      type: req.query.type,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    });

    if (type === 'prospects') {
      const results = await db.searchProspects(query);

      // Apply semantic ranking if we have many results
      if (results.length > limit) {
        const rankedResults = await matcher.semanticSearch(query, results, limit);
        return res.json(rankedResults);
      }

      return res.json(results.slice(0, limit));
    } else {
      const results = await db.searchJobPositions(query);
      return res.json(results.slice(0, limit));
    }
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET /prospects - Get all prospects
router.get('/prospects', async (_req: Request, res: Response) => {
  try {
    const prospects = await db.getProspects();
    return res.json(prospects);
  } catch (error) {
    console.error('Get prospects error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET /positions - Get all open positions
router.get('/positions', async (_req: Request, res: Response) => {
  try {
    const positions = await db.getOpenJobPositions();
    return res.json(positions);
  } catch (error) {
    console.error('Get positions error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET /evaluations - Get evaluations for a prospect or position
router.get('/evaluations', async (req: Request, res: Response) => {
  try {
    const { prospect_id, position_id } = req.query;

    if (prospect_id && typeof prospect_id === 'string') {
      const evaluations = await db.getEvaluationsForProspect(prospect_id);
      return res.json(evaluations);
    } else if (position_id && typeof position_id === 'string') {
      const evaluations = await db.getEvaluationsForPosition(position_id);
      return res.json(evaluations);
    } else {
      return res.status(400).json({
        error: 'Must provide either prospect_id or position_id'
      });
    }
  } catch (error) {
    console.error('Get evaluations error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;
