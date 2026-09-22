require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ── Validate required secrets at startup ──────────────────────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-secret-in-production') {
  console.warn('⚠️  WARNING: JWT_SECRET is not set or is using the default value. Set a strong secret in your .env file before deploying to production.');
}

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const resumeRoutes = require('./routes/resume');
const roadmapRoutes = require('./routes/roadmap');
const interviewRoutes = require('./routes/interview');
const mentorRoutes = require('./routes/mentor');
const dashboardRoutes  = require('./routes/dashboard');
const feedbackRoutes   = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Allowed CORS origins ───────────────────────────────────────────────────────
// FRONTEND_URL can be a single URL or a comma-separated list for multi-origin support
const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // allow embedding in iframes if needed for demos
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' is not allowed.`));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Global error handler — never expose internals to the client
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ERROR ${status}:`, err.message, err.stack);
  }
  const message = status < 500 ? err.message : 'An unexpected error occurred. Please try again.';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`Career Copilot API [${env}] running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
