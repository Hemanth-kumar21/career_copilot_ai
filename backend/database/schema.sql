-- ============================================================
-- Career Copilot AI — Production Database Schema
-- Compatible with MySQL 8.0.13+ / MariaDB 10.7+
-- ============================================================
-- Usage:
--   mysql -u <user> -p -e "CREATE DATABASE career_copilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--   mysql -u <user> -p career_copilot < schema.sql
-- ============================================================

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- ── users ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── student_profiles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id            CHAR(36)     NOT NULL,
  degree             VARCHAR(100),
  branch             VARCHAR(150),
  year               VARCHAR(50),
  semester           VARCHAR(50),
  target_career      VARCHAR(100),
  target_role        VARCHAR(100),
  preferred_domain   VARCHAR(100),
  short_term_goal    TEXT,
  long_term_goal     TEXT,
  current_struggle   TEXT,
  aspiration         TEXT,
  improvement_areas  TEXT,
  onboarding_complete TINYINT(1)  NOT NULL DEFAULT 0,
  created_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_user (user_id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── student_skills ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_skills (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  skill_name  VARCHAR(100) NOT NULL,
  category    ENUM('programming','technical','tools','soft','emerging') NOT NULL,
  evidence    ENUM('self_reported','resume','assessed') NOT NULL DEFAULT 'self_reported',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_skills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── resumes ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)     NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  score       TINYINT UNSIGNED,         -- 0–100
  analyzed_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── resume_analysis ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_analysis (
  id            CHAR(36)  NOT NULL DEFAULT (UUID()),
  resume_id     CHAR(36)  NOT NULL,
  analysis_type ENUM('skill','project','education','experience','strength','missing_skill','suggestion','certification') NOT NULL,
  content       TEXT      NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_analysis_resume FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── roadmap_templates ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_templates (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  role_id     VARCHAR(50)  NOT NULL,
  stage_order INT          NOT NULL,
  title       VARCHAR(150) NOT NULL,
  skills      JSON,
  objectives  JSON,
  project     VARCHAR(200),
  PRIMARY KEY (id),
  KEY idx_roadmap_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── roadmap_progress ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id                CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id           CHAR(36)  NOT NULL,
  template_stage_id CHAR(36),
  stage_title       VARCHAR(150),          -- denormalized for simplicity
  status            ENUM('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_roadmap_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_roadmap_template FOREIGN KEY (template_stage_id) REFERENCES roadmap_templates (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── coding_problems ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_problems (
  id          CHAR(36)     NOT NULL DEFAULT (UUID()),
  title       VARCHAR(200) NOT NULL,
  difficulty  ENUM('easy','medium','hard') NOT NULL,
  topic       VARCHAR(100),
  description TEXT         NOT NULL,
  examples    JSON,
  constraints JSON,
  hints       JSON,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── coding_attempts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_attempts (
  id           CHAR(36)   NOT NULL DEFAULT (UUID()),
  user_id      CHAR(36)   NOT NULL,
  problem_id   CHAR(36)   NOT NULL,
  answer       TEXT,
  solved       TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_attempts_user    FOREIGN KEY (user_id)    REFERENCES users (id)            ON DELETE CASCADE,
  CONSTRAINT fk_attempts_problem FOREIGN KEY (problem_id) REFERENCES coding_problems (id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── interview_sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id                 CHAR(36)     NOT NULL DEFAULT (UUID()),
  user_id            CHAR(36)     NOT NULL,
  role               VARCHAR(100) NOT NULL,
  total_score        SMALLINT,             -- sum of per-question scores
  percentage         TINYINT UNSIGNED,     -- 0–100
  completed          TINYINT(1)   NOT NULL DEFAULT 0,
  questions_answered TINYINT UNSIGNED     NOT NULL DEFAULT 0,
  started_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at       TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── interview_answers ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_answers (
  id               CHAR(36)  NOT NULL DEFAULT (UUID()),
  session_id       CHAR(36)  NOT NULL,
  question_id      VARCHAR(50) NOT NULL,
  student_answer   TEXT,
  score            TINYINT UNSIGNED,   -- 0–10
  feedback         TEXT,
  strengths        JSON,
  improvements     JSON,
  missing_concepts JSON,
  answered_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_answers_session FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ai_conversations ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_conversations (
  id         CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id    CHAR(36)  NOT NULL,
  role       ENUM('user','assistant') NOT NULL,
  content    TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Indexes for query performance ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_skills_user        ON student_skills     (user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user       ON resumes            (user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_resume    ON resume_analysis    (resume_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_user       ON roadmap_progress   (user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user      ON coding_attempts    (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user      ON interview_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_answers_session    ON interview_answers  (session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations   (user_id);
-- Cover date-range queries on conversations
CREATE INDEX IF NOT EXISTS idx_conversations_date ON ai_conversations   (user_id, created_at);
