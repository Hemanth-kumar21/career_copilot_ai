const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

/** POST /api/interview/session - Start new session */
router.post('/session', authenticate, async (req, res, next) => {
  try {
    const { role } = req.body;
    // TODO: INSERT INTO interview_sessions
    res.json({ sessionId: `session_${Date.now()}`, role });
  } catch (err) { next(err); }
});

/** POST /api/interview/answer - Submit answer */
router.post('/answer', authenticate, async (req, res, next) => {
  try {
    const { sessionId, questionId, answer } = req.body;
    // TODO: Evaluate answer and store in interview_answers
    res.json({ success: true, score: null, feedback: 'Answer recorded.' });
  } catch (err) { next(err); }
});

/** GET /api/interview/history/:userId */
router.get('/history/:userId', authenticate, async (req, res, next) => {
  try {
    // TODO: SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY started_at DESC
    res.json({ sessions: [] });
  } catch (err) { next(err); }
});

module.exports = router;
