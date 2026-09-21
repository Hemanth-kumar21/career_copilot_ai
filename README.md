# Career Copilot AI

> **Bridge the Gap Between Academia and Industry with AI.**

A personalized AI career mentoring platform for students — from skill analysis to career readiness.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Environment Variables](#environment-variables)
6. [Development Setup](#development-setup)
7. [Database Setup](#database-setup)
8. [Production Build](#production-build)
9. [Deployment — Vercel + Railway (Recommended)](#deployment--vercel--railway-recommended)
10. [Deployment — VPS / Shared Hosting (Nginx)](#deployment--vps--shared-hosting-nginx)
11. [Domain & HTTPS Configuration](#domain--https-configuration)
12. [AI Configuration (Optional)](#ai-configuration-optional)
13. [Security Notes](#security-notes)
14. [Hackathon Demo Guide](#hackathon-demo-guide)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Problem:** Students graduate without knowing what skills they lack, which projects to build, or how to prepare for real interviews. Generic advice does not help.

**Solution:** Career Copilot AI creates a complete, personalized career journey for each student using AI analysis of their background, skills, and goals.

The system starts at zero — **no fake scores, no pre-filled achievements.** Every metric is earned through actual user activity.

---

## Features

| Feature | Description |
|---------|-------------|
| 🎯 Student Onboarding | 5-step profile setup (academic → career → skills → goals) |
| 📄 Resume Intelligence | Upload PDF/DOCX → extract skills → score (0–100) → gap report |
| 🗺️ Personalized Roadmap | Stage-by-stage plan for your specific target role |
| 🗂️ Project Explorer | Projects matched to your role, domain, and skills |
| 💻 Coding Practice | Easy/Medium/Hard problems with per-topic tracking |
| 🎙️ AI Mentor | Voice-enabled chat with context-aware career guidance |
| 🎤 Mock Interviews | Role-specific Q&A with AI evaluation + detailed feedback |
| 📊 Dashboard | Real-time progress across all modules |
| 🔐 Authentication | Secure signup/login, per-user isolated data |

---

## Architecture

```
career_copilot_ai/
├── src/                        # Frontend (React 19 + TypeScript + Vite)
│   ├── pages/                  # Route-level pages
│   │   ├── Home.tsx            # Landing page
│   │   ├── Login.tsx           # Authentication (demo profile seeding)
│   │   ├── Signup.tsx          # Registration
│   │   ├── Onboarding.tsx      # 5-step student profile setup
│   │   ├── CareerProfile.tsx   # AI-generated career profile view
│   │   ├── CareerHub.tsx       # Main workspace (6 modules)
│   │   ├── AIMentor.tsx        # Voice-enabled AI chat
│   │   ├── InterviewLab.tsx    # Mock interview simulator
│   │   └── Dashboard.tsx       # Personalized progress dashboard
│   ├── components/             # Shared UI components
│   ├── context/
│   │   └── AppContext.tsx      # Global state (auth, profile, resume, roadmap…)
│   ├── services/
│   │   ├── aiService.ts        # AI chat + interview evaluation (backend proxy)
│   │   └── resumeService.ts    # Resume parsing + analysis (client-side)
│   └── data/                   # Static data (roles, roadmaps, projects, questions)
├── backend/                    # Backend API (Node.js + Express)
│   ├── server.js               # Main server — CORS, rate limiting, helmet
│   ├── routes/
│   │   ├── auth.js             # Signup/Login + JWT middleware
│   │   ├── profile.js          # Student profile CRUD
│   │   ├── resume.js           # Resume upload + validation
│   │   ├── roadmap.js          # Roadmap progress
│   │   ├── interview.js        # Interview sessions
│   │   ├── mentor.js           # AI chat proxy (key stays server-side)
│   │   └── dashboard.js        # Aggregated dashboard data
│   └── database/
│       └── schema.sql          # Full production MySQL schema
├── public/
│   └── _redirects              # Netlify SPA routing fallback
├── vercel.json                 # Vercel SPA routing + security headers
├── nginx.conf                  # Nginx VPS configuration template
├── .env.example                # Frontend env variable template
├── backend/.env.example        # Backend env variable template
└── dist/                       # Production build output (generated)
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Pure CSS (custom design system, glassmorphism) |
| Routing | React Router v6 |
| Icons | Lucide React |
| State | React Context API + localStorage |
| Backend | Node.js + Express.js |
| Database | MySQL 8.0.13+ / MariaDB 10.7+ |
| Auth | JWT + bcrypt (cost 12) |
| AI | OpenAI API (with smart offline fallbacks) |
| Voice | Web Speech API (browser-native, no dependency) |
| Deployment | Vercel (frontend) + Railway/Render (backend) |

---

## Environment Variables

### Frontend (`/.env`)

```env
# Public variables — safe to include in browser bundle
VITE_APP_NAME=Career Copilot AI
VITE_APP_ENV=production

# Backend API base URL (no trailing slash)
# Development: http://localhost:3001
# Production:  https://api.your-domain.com
VITE_API_BASE_URL=http://localhost:3001
```

**Important:** Never add `VITE_AI_API_KEY` or any secret here. `VITE_` variables are bundled into browser JS.

### Backend (`/backend/.env`)

```env
PORT=3001

# Use a long random string — minimum 32 characters
JWT_SECRET=replace-with-a-long-random-secret-minimum-32-chars

# OpenAI API (optional — app works without it using smart offline responses)
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com/v1

# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=career_copilot
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# CORS — comma-separated list of allowed frontend origins
# Example: https://career-copilot.vercel.app,https://www.career-copilot.ai
FRONTEND_URL=http://localhost:5173
```

---

## Development Setup

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### 1. Clone and Install

```bash
git clone https://github.com/your-username/career-copilot-ai.git
cd career-copilot-ai
npm install
```

### 2. Configure Frontend

```bash
cp .env.example .env
# Edit .env — VITE_API_BASE_URL defaults to http://localhost:3001
```

### 3. Start Frontend Dev Server

```bash
npm run dev
# Open http://localhost:5173
```

The frontend works fully without the backend — authentication and all data are stored in localStorage. All AI responses use smart offline fallbacks.

### 4. (Optional) Start Backend

```bash
cd backend
npm install
cp ../.env.example .env    # then edit backend/.env.example → backend/.env
node server.js
# API running on http://localhost:3001
```

---

## Database Setup

### Create Database (MySQL)

```bash
# Connect as root or privileged user
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE career_copilot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'cc_user'@'localhost' IDENTIFIED BY 'strong-password-here';
GRANT ALL PRIVILEGES ON career_copilot.* TO 'cc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Apply Schema

```bash
mysql -u cc_user -p career_copilot < backend/database/schema.sql
```

### Verify Tables

```bash
mysql -u cc_user -p career_copilot -e "SHOW TABLES;"
```

Expected tables:
- `users`
- `student_profiles`
- `student_skills`
- `resumes`
- `resume_analysis`
- `roadmap_templates`
- `roadmap_progress`
- `coding_problems`
- `coding_attempts`
- `interview_sessions`
- `interview_answers`
- `ai_conversations`

---

## Production Build

```bash
# From project root
npm run build
```

Output goes to `dist/`. This is a fully self-contained static SPA ready to deploy to any CDN or static host.

---

## Deployment — Vercel + Railway (Recommended)

This is the simplest zero-config deployment path.

### Frontend → Vercel

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Set **Root Directory** to `/` (project root)
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Add environment variables in Vercel dashboard:
   ```
   VITE_APP_ENV=production
   VITE_API_BASE_URL=https://your-backend.railway.app
   ```
7. Click **Deploy**

The `vercel.json` in the repository handles SPA routing automatically — deep links like `/dashboard` and `/interview` will work correctly.

### Backend → Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select the `backend/` directory as the root (or set start command to `cd backend && node server.js`)
3. Add environment variables in Railway:
   ```
   PORT=3001
   JWT_SECRET=<your-strong-random-secret>
   OPENAI_API_KEY=<your-openai-key>
   FRONTEND_URL=https://your-app.vercel.app
   DB_HOST=<railway-mysql-host>
   DB_PORT=3306
   DB_NAME=career_copilot
   DB_USER=<railway-db-user>
   DB_PASSWORD=<railway-db-password>
   ```
4. Add a **MySQL** plugin from the Railway dashboard
5. Railway provides the DB credentials automatically as environment variables

---

## Deployment — VPS / Shared Hosting (Nginx)

### 1. Build frontend

```bash
npm run build
```

### 2. Upload dist/ to server

```bash
scp -r dist/ user@your-server:/var/www/career-copilot/
```

### 3. Configure Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/career-copilot
# Edit the file: replace 'your-domain.com' with your actual domain
sudo nano /etc/nginx/sites-available/career-copilot

sudo ln -s /etc/nginx/sites-available/career-copilot /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Start backend with PM2

```bash
cd /var/www/career-copilot/backend
npm install --production
npm install -g pm2
pm2 start server.js --name career-copilot-api
pm2 save
pm2 startup
```

---

## Domain & HTTPS Configuration

### Let's Encrypt (Free SSL)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
# Certbot automatically updates nginx.conf with SSL paths
sudo systemctl reload nginx
```

### DNS

Point your domain's `A` record to your server's IP address. For `www`, add a `CNAME` pointing to the root domain.

---

## AI Configuration (Optional)

The application works **without an OpenAI API key** using smart offline fallbacks that:
- Detect question intent (learn next, projects, interviews, skills, roadmap)
- Respond with personalized guidance based on the student's profile
- Evaluate interview answers using keyword matching

To enable real AI responses:
1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart the backend

The frontend **never sees the API key** — all AI calls are proxied through the backend.

---

## Security Notes

| Area | Implementation |
|------|---------------|
| Passwords | bcrypt with cost factor 12 |
| JWT | 7-day expiry, verified on every API request |
| API keys | Backend-only — never in frontend JS |
| File uploads | MIME type + extension validation, 5 MB limit, memory storage |
| Input validation | express-validator on all API routes |
| Security headers | Helmet.js — HSTS, XSS, content-type sniff prevention |
| Rate limiting | 100 requests per 15 minutes per IP |
| CORS | Explicit allowlist — no wildcard `*` with credentials |
| SQL injection | Parameterized queries (when database is connected) |
| Error messages | Internal errors never exposed to client |

**Before production deployment:**
- [ ] Set a strong `JWT_SECRET` (minimum 32 random characters)
- [ ] Set `OPENAI_API_KEY` in backend `.env` only
- [ ] Set `FRONTEND_URL` in backend `.env` to your exact production domain
- [ ] Set `VITE_API_BASE_URL` to your backend's production URL
- [ ] Enable HTTPS before going live
- [ ] Never commit `.env` files (covered by `.gitignore`)

---

## Hackathon Demo Guide (5–10 Minutes)

### Before the Demo
1. Open the app in Chrome (for Web Speech API support)
2. Log in with the **Demo Profile** for instant exploration, OR sign up fresh to show the real onboarding flow
3. Have a real PDF resume ready to upload

### Demo Flow

| Step | Action | What to Show |
|------|--------|--------------|
| 1 | Open landing page | Professional design, feature overview |
| 2 | Click "Get Started" → Signup | Clean form, instant redirect to onboarding |
| 3 | Complete Onboarding | 5 steps: Academic → Career → Skills → Goals |
| 4 | View Career Profile | AI-generated profile based on actual inputs |
| 5 | Career Hub → Resume Intelligence | Upload a real PDF resume |
| 6 | Wait for analysis | Progress steps, then real skill extraction and score |
| 7 | Show resume results | Score breakdown, extracted skills, improvement suggestions |
| 8 | Skill Insights tab | Skill gap analysis vs. target role |
| 9 | Learning Roadmap tab | Stage-by-stage personalized plan |
| 10 | Project Explorer tab | Role-matched project recommendations |
| 11 | AI Mentor page | Ask: *"What should I learn next?"* |
| 12 | (Optional) Enable voice input | Click mic → speak question → hear AI response |
| 13 | Interview Lab | Select role → answer 5 questions → get AI evaluation |
| 14 | Show final score | Deterministic: (total earned / max possible) × 100% |
| 15 | Dashboard | All real data aggregated — zero fake progress |

### Key Demo Points to Emphasize

- **Real data only** — dashboard shows actual user activity, not placeholder statistics
- **Resume score is deterministic** — same resume = same score every time
- **Interview score is calculated** — total earned points ÷ max possible × 100
- **AI key is never exposed** — inspect Network tab to verify no API key in browser
- **Works offline** — if AI API is unavailable, smart fallbacks respond correctly
- **Mobile-friendly** — demonstrate on phone for extra impact

---

## Troubleshooting

### Refreshing `/dashboard` shows 404

**Cause:** The hosting server is not configured for SPA routing.

**Fix:**
- **Vercel:** `vercel.json` is already included — this handles it automatically.
- **Netlify:** `public/_redirects` is already included — deploy to trigger.
- **Nginx:** Use the provided `nginx.conf` with `try_files $uri $uri/ /index.html;`.
- **Apache:** Add a `.htaccess` file in `dist/`:
  ```apache
  Options -MultiViews
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ index.html [QSA,L]
  ```

### CORS errors in the browser console

**Cause:** The backend `FRONTEND_URL` does not match the frontend's origin.

**Fix:** In `backend/.env`, set `FRONTEND_URL` to the exact origin of your frontend (no trailing slash):
```
FRONTEND_URL=https://your-app.vercel.app
```
For multiple origins (e.g., dev + prod):
```
FRONTEND_URL=http://localhost:5173,https://your-app.vercel.app
```

### AI Mentor gives generic responses

**Cause:** No `OPENAI_API_KEY` is configured. The app is using smart offline fallbacks.

**Fix:** Add a valid OpenAI API key to `backend/.env`. The responses will immediately improve.

### Resume upload fails

**Cause:** File is not PDF/DOCX/DOC/TXT, or exceeds 5 MB, or is corrupted.

**Fix:** Upload a real, text-based resume (not a scanned image). The app validates MIME type, file extension, and minimum size.

### Build fails with TypeScript error

```bash
# Check exact error
npm run build 2>&1

# Clean build cache and retry
rm -rf dist node_modules/.tmp
npm run build
```

### Backend won't start

```bash
cd backend
# Ensure .env exists
cp .env.example .env
# Edit .env with your values
node server.js
```

---

## Production Readiness Checklist

- [x] No `localhost` URLs in production code
- [x] No AI API keys in frontend JavaScript
- [x] Environment variables for all secrets
- [x] `.env` excluded from Git
- [x] SPA routing configured (Vercel + Netlify + Nginx)
- [x] CORS locked to specific origins (no wildcard)
- [x] File upload validation (MIME + extension + size)
- [x] Security headers (Helmet.js)
- [x] Rate limiting on API endpoints
- [x] Error messages sanitized (no stack traces to client)
- [x] Production build passes TypeScript + Vite (`npm run build`)
- [x] Database schema production-ready (utf8mb4, IF NOT EXISTS, indexes)
- [x] Resume scores deterministic (same input = same output)
- [x] Interview scores calculated (not random)
- [x] Dashboard shows real data (zero fake progress)

---

Built for **IBM Regional Hackathon 2025**

*Career Copilot AI — Your Personal AI Career Mentor*
