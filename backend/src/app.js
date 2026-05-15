import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

import { requireAuth } from './middleware/requireAuth.js';

import chatRouter from './routes/chat.js';
import assessmentsRouter from './routes/assessments.js';
import suggestionsRouter from './routes/suggestions.js';
import actionsRouter from './routes/actions.js';
import statsRouter from './routes/dashboard/stats.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import journalRouter from './routes/journal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json({ limit: '200kb' }));


// attach request context
app.use((req, _res, next) => {
  req.context = {
    requestId: crypto.randomUUID?.() ?? String(Date.now())
  };
  next();
});

// -----------------------------------------------------------------------------
// Health
// -----------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// -----------------------------------------------------------------------------
// Public routes (NO AUTH REQUIRED)
// -----------------------------------------------------------------------------
app.use('/api/auth', authRouter);

// -----------------------------------------------------------------------------
// Protected routes (AUTH REQUIRED)
// -----------------------------------------------------------------------------
app.use('/api/chat', requireAuth, chatRouter);
app.use('/api/assessments', requireAuth, assessmentsRouter);
app.use('/api/suggestions', requireAuth, suggestionsRouter);
app.use('/api/actions', requireAuth, actionsRouter);
app.use('/api/dashboard', requireAuth, statsRouter);
app.use('/api/journal', requireAuth, journalRouter);

// admin (can add role checks later)
app.use('/api/admin', requireAuth, adminRouter);

// -----------------------------------------------------------------------------
// Serve Frontend Static Files
// -----------------------------------------------------------------------------
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// -----------------------------------------------------------------------------
// Global error handler (redacted)
// -----------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('[error]', err?.message);
  res.status(err?.status || 500).json({ error: 'internal_error' });
});

export default app;
