const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('./auth');
const router = express.Router();

// ── Allowed file types ────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// ── Multer config — memory storage (no disk writes) ───────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB hard limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);
    const extOk  = ALLOWED_EXTENSIONS.includes(ext);

    if (mimeOk && extOk) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only PDF, Word (.doc/.docx), or plain text files are allowed.'), { status: 400 }), false);
    }
  },
});

/**
 * POST /api/resume/analyze
 * Receive and validate a resume file; return analysis placeholder.
 * Note: The production frontend uses resumeService.ts (client-side analysis).
 * This endpoint is wired up here for when server-side AI analysis is added.
 */
router.post('/analyze', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid resume file.' });
    }

    // Basic content sanity check — ensure it is not empty
    if (!req.file.buffer || req.file.buffer.length < 100) {
      return res.status(422).json({ error: 'The uploaded file appears to be empty or too small. Please upload a real resume.' });
    }

    const _targetRole = req.body.targetRole || '';

    // TODO: Wire up server-side text extraction + AI analysis here.
    // For now return success so client-side analysis can proceed.
    // Example server-side flow:
    //   const text = await extractText(req.file.buffer, req.file.mimetype);
    //   const analysis = await analyzeWithAI(text, targetRole);
    //   await saveAnalysis(req.user.userId, req.file.originalname, analysis);

    res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.buffer.length,
      message: 'File received. Analysis is handled client-side.',
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size must be under 5 MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
    next(err);
  }
});

/**
 * GET /api/resume/:userId
 * Retrieve the latest resume analysis for a user.
 */
router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    // Authorization check — users may only access their own data
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // TODO: SELECT resumes + resume_analysis WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 1
    res.json({ analyzed: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
