const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/signup
 */
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // TODO: Replace in-memory store with real database queries:
    // const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // if (existing) return res.status(409).json({ error: 'Email already registered' });
    //
    // const passwordHash = await bcrypt.hash(password, 12);
    // const [result] = await db.query(
    //   'INSERT INTO users (id, name, email, password_hash) VALUES (UUID(), ?, ?, ?)',
    //   [name, email, passwordHash]
    // );
    // const userId = result.insertId;

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = require('crypto').randomUUID();
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      user: { id: userId, name, email },
      token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const { email, password } = req.body;

    // TODO: Replace with real database lookup:
    // const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    // if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    // const valid = await bcrypt.compare(password, user.password_hash);
    // if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    // const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    // return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });

    // ── NOTE: The current frontend uses localStorage for auth (no backend calls).
    // ── This backend route is ready for when the database integration is wired up.
    // ── Until then the frontend handles auth client-side via AppContext.
    return res.status(501).json({
      error: 'Backend database not yet connected. The frontend handles authentication locally.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Middleware: verify JWT Bearer token
 * Usage: router.get('/protected', authenticate, handler)
 */
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = auth.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = router;
module.exports.authenticate = authenticate;
