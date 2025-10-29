import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import matcherRoutes from './routes/matcher.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/agents/prospect-matcher', matcherRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ProspectMatcher Agent'
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'ProspectMatcher Agent',
    version: '1.0.0',
    description: 'Intelligent candidate-to-position matching using semantic analysis',
    endpoints: {
      health: 'GET /health',
      match: 'POST /agents/prospect-matcher/match',
      create: 'POST /agents/prospect-matcher/create',
      delete: 'DELETE /agents/prospect-matcher/delete',
      search: 'GET /agents/prospect-matcher/search',
      prospects: 'GET /agents/prospect-matcher/prospects',
      positions: 'GET /agents/prospect-matcher/positions',
      evaluations: 'GET /agents/prospect-matcher/evaluations'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ProspectMatcher Agent running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
