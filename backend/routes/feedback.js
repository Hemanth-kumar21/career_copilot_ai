/**
 * feedback.js — Career Copilot AI
 * POST /api/feedback   — submit general feedback
 * POST /api/complaints — submit a complaint
 * GET  /api/feedback   — admin: list feedback (not exposed to students)
 */

const express  = require('express');
const router   = express.Router();

// ── In-memory store (replace with DB queries when backend DB is wired) ────────
// Structure mirrors the schema in database/schema.sql
const feedbackStore   = [];
const complaintStore  = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Sanitise a string: trim, collapse whitespace, strip <script> tags */
function sanitise(str = '') {
  return String(str)
    .trim()
    .replace(/\s{2,}/g, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .slice(0, 2000);
}

/** Very basic email check */
function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

// ── POST /api/feedback ────────────────────────────────────────────────────────
router.post('/feedback', (req, res) => {
  try {
    const { name, email, feedbackType, message, rating } = req.body;

    // Validate required fields
    const errors = [];
    if (!name  || sanitise(name).length < 2)        errors.push('Name is required.');
    if (!email || !isValidEmail(email))             errors.push('A valid email address is required.');
    if (!feedbackType)                              errors.push('Please select a feedback type.');
    if (!message || sanitise(message).length < 10)  errors.push('Please provide a feedback message (at least 10 characters).');

    if (errors.length > 0) {
      return res.status(422).json({ error: errors[0], errors });
    }

    // Optional rating must be 1–5 if provided
    const parsedRating = rating ? Number(rating) : null;
    if (parsedRating !== null && (parsedRating < 1 || parsedRating > 5 || !Number.isInteger(parsedRating))) {
      return res.status(422).json({ error: 'Rating must be a whole number between 1 and 5.' });
    }

    const ALLOWED_TYPES = [
      'General Feedback', 'Feature Suggestion', 'User Experience',
      'AI Mentor Feedback', 'Resume Intelligence Feedback', 'Career Hub Feedback', 'Other',
    ];
    if (!ALLOWED_TYPES.includes(feedbackType)) {
      return res.status(422).json({ error: 'Invalid feedback type.' });
    }

    const entry = {
      id:           `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId:       req.user?.userId || null,
      name:         sanitise(name),
      email:        email.trim().toLowerCase(),
      feedbackType: sanitise(feedbackType),
      message:      sanitise(message),
      rating:       parsedRating,
      createdAt:    new Date().toISOString(),
    };

    feedbackStore.push(entry);

    // Log server-side (never logged to client)
    console.log(`[FEEDBACK] id=${entry.id} type="${entry.feedbackType}" rating=${entry.rating ?? 'N/A'}`);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been submitted successfully.',
      id: entry.id,
    });
  } catch (err) {
    console.error('[FEEDBACK ERROR]', err);
    return res.status(500).json({ error: 'Something went wrong while submitting your feedback. Please try again.' });
  }
});

// ── POST /api/complaints ──────────────────────────────────────────────────────
router.post('/complaints', (req, res) => {
  try {
    const { name, email, category, description, priority, page } = req.body;

    const errors = [];
    if (!name  || sanitise(name).length < 2)             errors.push('Name is required.');
    if (!email || !isValidEmail(email))                  errors.push('A valid email address is required.');
    if (!category)                                       errors.push('Please select a complaint category.');
    if (!description || sanitise(description).length < 15) errors.push('Please describe the issue (at least 15 characters).');
    if (!priority)                                       errors.push('Please select a priority level.');

    if (errors.length > 0) {
      return res.status(422).json({ error: errors[0], errors });
    }

    const ALLOWED_CATEGORIES = [
      'Technical Issue', 'Login / Account Issue', 'AI Mentor Issue',
      'Resume Intelligence Issue', 'Career Hub Issue', 'Coding Practice Issue',
      'Interview Lab Issue', 'Dashboard Issue', 'Other',
    ];
    const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High'];

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res.status(422).json({ error: 'Invalid complaint category.' });
    }
    if (!ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(422).json({ error: 'Invalid priority value.' });
    }

    const entry = {
      id:          `cp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId:      req.user?.userId || null,
      name:        sanitise(name),
      email:       email.trim().toLowerCase(),
      category:    sanitise(category),
      description: sanitise(description),
      priority:    sanitise(priority),
      page:        sanitise(page || ''),
      status:      'open',
      createdAt:   new Date().toISOString(),
    };

    complaintStore.push(entry);
    console.log(`[COMPLAINT] id=${entry.id} category="${entry.category}" priority=${entry.priority}`);

    return res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted successfully. We appreciate you bringing this to our attention.',
      id: entry.id,
    });
  } catch (err) {
    console.error('[COMPLAINT ERROR]', err);
    return res.status(500).json({ error: 'Something went wrong while submitting your complaint. Please try again.' });
  }
});

module.exports = router;
