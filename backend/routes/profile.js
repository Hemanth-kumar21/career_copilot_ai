const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

/** GET /api/profile/:userId */
router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    // TODO: SELECT * FROM student_profiles WHERE user_id = ?
    res.json({ profile: null });
  } catch (err) { next(err); }
});

/** POST /api/profile */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const profileData = req.body;
    // TODO: INSERT/UPDATE student_profiles
    res.json({ success: true, profile: profileData });
  } catch (err) { next(err); }
});

module.exports = router;
