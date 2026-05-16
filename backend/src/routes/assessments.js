// src/routes/assessments.js

import { Router } from 'express';
import { z } from 'zod';

import { trackAssessment } from '../services/analytics.js';
import { setUserSeverity } from '../services/userState.js';

import {
  listAssessments,
  getAssessment
} from '../services/assessments.js';

import {
  scoreLikert,
  interpretPHQ9,
  interpretGAD7,
  interpretPSS10,
  interpretBurnout,
  interpretDaily
} from '../services/scoring.js';

import {
  saveLatestAssessment,
  getLatestAssessment,
  getAssessmentHistory
} from '../services/assessmentStore.js';

import { generateDynamicQuestions } from '../services/llm.js';

const router = Router();

// -----------------------------------------------------------------------------
// GET /assessments/list
// Returns list of available assessments (frontend cards)
// -----------------------------------------------------------------------------
router.get('/list', (_req, res) => {
  res.json({
    assessments: listAssessments()
  });
});

// -----------------------------------------------------------------------------
// GET /assessments/history
// Returns full history for charts
// -----------------------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await getAssessmentHistory(userId);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assessment history' });
  }
});

// -----------------------------------------------------------------------------
// GET /assessments/:type
// Returns questions + scale for a specific assessment
// -----------------------------------------------------------------------------
router.get('/:type', async (req, res) => {
  const type = req.params.type;
  const assessment = getAssessment(type);

  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  // --- DYNAMIC DAILY ASSESSMENT LOGIC ---
  if (type === 'daily') {
    try {
      const userId = req.user.userId;
      const history = await getAssessmentHistory(userId);

      // If user has history (e.g. at least 1 past check-in), generate dynamic questions
      if (history && history.length > 0) {
        // Grab last 7 days to give LLM context
        const recentHistory = history.slice(0, 7).map(h => ({
          date: new Date(h.timestamp).toISOString().split('T')[0],
          severity: h.severity,
          score: h.score,
          type: h.type
        }));

        const dynamicQuestions = await generateDynamicQuestions(recentHistory);

        if (dynamicQuestions && dynamicQuestions.length === assessment.items.length) {
          // Replace the static items with the dynamic ones
          const dynamicItems = assessment.items.map((item, index) => ({
            ...item,
            text: dynamicQuestions[index]
          }));

          return res.json({
            id: assessment.id,
            title: 'Your Custom Daily Check-in',
            description: 'These questions were generated specifically for you based on how you have been feeling lately.',
            scale: assessment.scale,
            items: dynamicItems
          });
        }
      }
    } catch (e) {
      console.error("Failed to generate dynamic assessment, falling back to static", e);
    }
  }

  // Fallback / standard response
  res.json({
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    scale: assessment.scale,
    items: assessment.items
  });
});

// -----------------------------------------------------------------------------
// POST /assessments/submit
// Scores assessment, stores latest summary, updates AI mental state
// -----------------------------------------------------------------------------
const submitSchema = z.object({
  type: z.string(),
  answers: z.array(
    z.union([
      z.number().min(0).max(10), // legacy format
      z.object({
        questionId: z.string().optional(),
        text: z.string().optional(),
        score: z.number().min(0).max(10)
      })
    ])
  )
});

router.post('/submit', async (req, res) => {
  try {
    const { type, answers } = submitSchema.parse(req.body);
    const assessment = getAssessment(type);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (answers.length !== assessment.items.length) {
      return res.status(400).json({
        error: 'Answer count does not match number of questions'
      });
    }

    const userId = req.user.userId;

    // --- REMOVED ONCE A DAY LIMIT FOR DAILY ASSESSMENT ---
    // The user can now take multiple daily tests.

    // ---------------------------------------------------------------------------
    // Score assessment
    // ---------------------------------------------------------------------------
    const numericalScores = answers.map(a => typeof a === 'number' ? a : a.score);
    const score = scoreLikert(numericalScores);

    let severity = 'unknown';
    if (type === 'phq9') severity = interpretPHQ9(score);
    if (type === 'gad7') severity = interpretGAD7(score);
    if (type === 'pss10') severity = interpretPSS10(score);
    if (type === 'burnout') severity = interpretBurnout(score);
    if (type === 'daily') severity = interpretDaily(score);

    // ---------------------------------------------------------------------------
    // Analytics (aggregate only, privacy-safe)
    // ---------------------------------------------------------------------------
    trackAssessment(type, severity);

    // ---------------------------------------------------------------------------
    // Authenticated user identity (JWT / Google OAuth)
    // ---------------------------------------------------------------------------

    const summary = {
      assessment: type,
      score,
      severity,
      submittedAt: Date.now(),
      answers // Pass answers to store
    };

    // ---------------------------------------------------------------------------
    // Persist assessment summary
    // ---------------------------------------------------------------------------
    await saveLatestAssessment(userId, summary);

    // ---------------------------------------------------------------------------
    // ✅ STEP 7.2 — Store severity for AI behavior adaptation
    // ---------------------------------------------------------------------------
    setUserSeverity(userId, type, severity);

    res.json({
      ...summary,
      message: 'Assessment submitted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to submit assessment: ${err.message}` });
  }
});

// -----------------------------------------------------------------------------
// GET /assessments/latest
// Returns latest assessment summary for the user
// -----------------------------------------------------------------------------
router.get('/latest', async (req, res) => {
  try {
    const userId = req.user.userId;
    const latest = await getLatestAssessment(userId);

    if (!latest) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      ...latest
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch latest assessment' });
  }
});

export default router;
