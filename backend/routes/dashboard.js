const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

/** GET /api/dashboard/:userId */
router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    // TODO: Aggregate from all tables for this user
    // Joins: profile + resume + skills + roadmap + coding + interview
    res.json({
      profile: null,
      resumeScore: null,
      skillCount: 0,
      roadmapProgress: { completed: 0, total: 0 },
      codingStats: { attempted: 0, solved: 0 },
      lastInterview: null,
      nextStep: 'Complete your profile to get personalized recommendations.',
    });
  } catch (err) { next(err); }
});

module.exports = router;
