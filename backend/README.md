# Career Copilot AI — Backend API

Express.js REST API backend for the Career Copilot AI platform.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Security**: Helmet, CORS, express-rate-limit
- **File uploads**: Multer
- **Database**: MySQL or PostgreSQL (via `mysql2` / `pg`)

## Quick Start

```bash
# From the backend/ directory
npm install
cp .env.example .env   # fill in your values
npm start
```

The API will run on `http://localhost:3001`.

## Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_here_change_in_production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=career_copilot
DB_USER=root
DB_PASSWORD=your_db_password

# OpenAI (optional — app works offline without it)
OPENAI_API_KEY=sk-...
```

## Database Setup

```bash
# MySQL
mysql -u root -p < database/schema.sql

# PostgreSQL
psql -U postgres < database/schema.sql
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET/POST | `/api/profile/:userId` | Get/create student profile |
| POST | `/api/resume/analyze` | Upload + analyze resume |
| GET/PATCH | `/api/roadmap` | Get/update roadmap stages |
| POST | `/api/interview/session` | Start interview session |
| POST | `/api/interview/answer` | Submit + evaluate answer |
| GET | `/api/interview/history` | Get interview history |
| POST | `/api/mentor/chat` | Send message to AI mentor |
| GET | `/api/dashboard/:userId` | Get dashboard summary |
| GET | `/api/health` | Health check |

## Security Features

- Passwords hashed with bcryptjs (12 rounds)
- JWT authentication on all protected routes
- Rate limiting: 100 requests per 15 minutes per IP
- Helmet.js for security headers
- CORS restricted to FRONTEND_URL
- File upload validation (type + size)
- Parameterized queries (no SQL injection)
- Global error handler hides internal errors from users

## File Upload

Resume uploads accept: `.pdf`, `.doc`, `.docx`, `.txt` — max 5 MB.
Files are processed in memory (not stored to disk in this version).

## Development

```bash
# Install nodemon for hot reload
npm install -g nodemon
nodemon server.js
```

## Connecting to Frontend

Set these in the frontend `.env`:
```env
VITE_AI_API_URL=https://api.openai.com/v1
VITE_AI_API_KEY=sk-...
VITE_API_BASE_URL=http://localhost:3001
```

The frontend currently uses localStorage as a backend substitute.
Connect the frontend service calls to `/api/*` endpoints when the backend is live.
