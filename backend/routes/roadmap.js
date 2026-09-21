const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

/** GET /api/roadmap/:userId */
router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    // TODO: SELECT * FROM roadmap_progress WHERE user_id = ?
    res.json({ stages: [] });
  } catch (err) { next(err); }
});

/** PATCH /api/roadmap/stage/:stageId */
router.patch('/stage/:stageId', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    // TODO: UPDATE roadmap_progress SET status = ? WHERE id = ?
    res.json({ success: true, stageId: req.params.stageId, status });
  } catch (err) { next(err); }
});

module.exports = router;
