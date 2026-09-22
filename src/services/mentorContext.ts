/**
 * mentorContext.ts — Career Copilot AI
 *
 * Context-retrieval and intent-classification engine for the AI Mentor.
 *
 * Responsibilities:
 *   1. Classify the user's question into one or more intent categories
 *   2. Retrieve ONLY the relevant Career Hub data for that intent
 *   3. Build a grounded, structured context string for the AI prompt
 *   4. Never fabricate student data — only include what actually exists
 */

import type {
  StudentProfile,
  ResumeAnalysis,
  RoadmapStage,
  CodingStats,
  InterviewSession,
} from '../context/AppContext';

// ─────────────────────────────────────────────────────────────────────────────
// Intent categories
// ─────────────────────────────────────────────────────────────────────────────

export type IntentCategory =
  | 'PROFILE'
  | 'RESUME'
  | 'SKILLS'
  | 'ROADMAP'
  | 'PROJECTS'
  | 'CODING'
  | 'INTERVIEW'
  | 'CAREER_GUIDANCE'
  | 'GENERAL_CAREER'
  | 'GREETING'
  | 'GENERAL_KNOWLEDGE';

// ─────────────────────────────────────────────────────────────────────────────
// Full Career Hub snapshot (passed in from AppContext)
// ─────────────────────────────────────────────────────────────────────────────

export interface CareerHubSnapshot {
  profile: StudentProfile | null;
  resumeAnalysis: ResumeAnalysis;
  roadmapStages: RoadmapStage[];
  codingStats: CodingStats;
  interviewHistory: InterviewSession[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent classification
// ─────────────────────────────────────────────────────────────────────────────

/** Keyword clusters per intent.  A message matches if it contains ≥1 keyword
 *  from the cluster (after lower-casing). */
const INTENT_SIGNALS: Record<IntentCategory, string[]> = {
  PROFILE: [
    'my profile', 'who am i', 'my background', 'my degree', 'my branch',
    'my year', 'my semester', 'about me', 'my academic', 'my education background',
  ],
  RESUME: [
    'resume', 'cv', 'resume score', 'resume analysis', 'resume improve',
    'my score', 'why is my score', 'resume feedback', 'resume strength',
    'resume weak', 'my resume', 'uploaded resume', 'resume gap',
  ],
  SKILLS: [
    'skill', 'skills i have', 'my skills', 'what do i know', 'current skill',
    'skill gap', 'missing skill', 'skill i lack', 'skill i need', 'technology i know',
    'what technologies', 'proficiency', 'what can i do',
  ],
  ROADMAP: [
    'roadmap', 'learning path', 'what stage', 'current stage', 'completed topic',
    'next topic', 'learning plan', 'what have i completed', 'stage progress',
    'what should i study', 'curriculum', 'syllabus',
  ],
  PROJECTS: [
    'project', 'what project', 'which project', 'build a project', 'project idea',
    'project recommend', 'strengthen portfolio', 'portfolio project',
    'side project', 'personal project', 'project to build',
  ],
  CODING: [
    'coding', 'leetcode', 'dsa', 'data structure', 'algorithm', 'problem solving',
    'coding practice', 'coding performance', 'weak topic', 'solved problem',
    'coding score', 'my coding', 'programming practice',
  ],
  INTERVIEW: [
    'interview', 'mock interview', 'interview score', 'interview performance',
    'last interview', 'interview result', 'how did i do', 'my interview',
    'interview feedback', 'interview weak', 'interview preparation',
    'prepare for interview', 'technical interview',
  ],
  CAREER_GUIDANCE: [
    'what should i do', 'what should i learn', 'learn next', 'next step',
    'what to focus', 'am i ready', 'career ready', 'career path',
    'career advice', 'career plan', 'how to become', 'how do i become',
    'improve myself', 'career goal', '30 day plan', 'weekly plan',
    'action plan', 'priority', 'what first',
  ],
  GENERAL_CAREER: [
    'what is a', 'what does a', 'difference between', 'role of a',
    'data engineer', 'data scientist', 'software engineer', 'full stack',
    'frontend developer', 'backend developer', 'devops', 'cloud engineer',
    'ml engineer', 'ai engineer', 'product manager', 'scrum', 'agile',
    'salary', 'job market', 'industry', 'placement', 'hiring',
    'what skills are required for', 'skills needed for',
  ],
  GREETING: [
    'hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon',
    'how are you', 'who are you', 'what can you do', 'help me',
  ],
  GENERAL_KNOWLEDGE: [
    'what is', 'explain', 'define', 'how does', 'how do', 'tell me about',
    'python', 'javascript', 'java', 'sql', 'html', 'css', 'react',
    'machine learning', 'deep learning', 'artificial intelligence', 'cloud',
    'docker', 'kubernetes', 'git', 'api', 'database', 'algorithm',
  ],
};

/**
 * Classify a message into one or more intents.
 * Returns intents in priority order (most specific first).
 */
export function classifyIntent(message: string): IntentCategory[] {
  const lower = message.toLowerCase();
  const matched: IntentCategory[] = [];

  // Priority order — more specific first
  const priorityOrder: IntentCategory[] = [
    'RESUME', 'CODING', 'INTERVIEW', 'ROADMAP',
    'SKILLS', 'PROJECTS', 'PROFILE',
    'CAREER_GUIDANCE', 'GENERAL_CAREER',
    'GREETING', 'GENERAL_KNOWLEDGE',
  ];

  for (const intent of priorityOrder) {
    if (INTENT_SIGNALS[intent].some(kw => lower.includes(kw))) {
      matched.push(intent);
    }
  }

  // Every message defaults to CAREER_GUIDANCE if nothing else matched
  if (matched.length === 0) matched.push('CAREER_GUIDANCE');

  return matched;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context retrievers — one per data domain
// ─────────────────────────────────────────────────────────────────────────────

function fmtProfile(p: StudentProfile): string {
  const skills = [
    ...p.programmingLanguages,
    ...p.technicalSkills,
    ...p.tools,
  ].filter(Boolean);

  return [
    `Name: ${p.name}`,
    `Degree: ${p.degree} in ${p.branch}`,
    `Year/Semester: ${p.year}, Semester ${p.semester}`,
    `Target Career: ${p.targetCareer}`,
    `Target Role: ${p.targetRole}`,
    `Preferred Domain: ${p.preferredDomain}`,
    skills.length > 0 ? `Self-reported Skills: ${skills.join(', ')}` : null,
    p.shortTermGoal ? `Short-term Goal: ${p.shortTermGoal}` : null,
    p.longTermGoal  ? `Long-term Goal: ${p.longTermGoal}` : null,
    p.currentStruggle ? `Currently Struggling With: ${p.currentStruggle}` : null,
    p.aspiration ? `Aspiration: ${p.aspiration}` : null,
    p.improvementAreas ? `Wants to Improve: ${p.improvementAreas}` : null,
  ].filter(Boolean).join('\n');
}

function fmtResume(ra: ResumeAnalysis): string {
  if (!ra.analyzed) return 'Resume: Not yet uploaded or analyzed.';

  const lines: string[] = [`Resume Score: ${ra.score ?? 'N/A'}/100`];
  if (ra.fileName) lines.push(`File: ${ra.fileName}`);
  if (ra.extractedSkills.length > 0)
    lines.push(`Extracted Skills: ${ra.extractedSkills.join(', ')}`);
  if (ra.education && ra.education.length > 0)
    lines.push(`Education Detected: ${ra.education.join(' | ')}`);
  if (ra.experience && ra.experience.length > 0)
    lines.push(`Experience Detected: ${ra.experience.join(' | ')}`);
  if (ra.projects.length > 0)
    lines.push(`Projects Found: ${ra.projects.join(', ')}`);
  if (ra.certifications && ra.certifications.length > 0)
    lines.push(`Certifications: ${ra.certifications.join(', ')}`);
  if (ra.strengths.length > 0)
    lines.push(`Resume Strengths: ${ra.strengths.join(', ')}`);
  if (ra.missingSkills.length > 0)
    lines.push(`Missing Skills (vs target role): ${ra.missingSkills.join(', ')}`);
  if (ra.suggestions.length > 0)
    lines.push(`Improvement Suggestions:\n${ra.suggestions.map((s,i) => `  ${i+1}. ${s}`).join('\n')}`);
  return lines.join('\n');
}

function fmtRoadmap(stages: RoadmapStage[]): string {
  if (stages.length === 0) return 'Learning Roadmap: Not yet generated.';

  const completed  = stages.filter(s => s.status === 'completed');
  const inProgress = stages.filter(s => s.status === 'in_progress');
  const notStarted = stages.filter(s => s.status === 'not_started');

  const lines: string[] = ['Learning Roadmap:'];
  if (completed.length > 0)
    lines.push(`  Completed Stages (${completed.length}): ${completed.map(s => s.title).join(', ')}`);
  if (inProgress.length > 0) {
    const s = inProgress[0];
    lines.push(`  Currently In Progress: ${s.title}`);
    lines.push(`    Skills in this stage: ${s.skills.join(', ')}`);
    lines.push(`    Project: ${s.project}`);
  }
  if (notStarted.length > 0)
    lines.push(`  Upcoming Stages (${notStarted.length}): ${notStarted.map(s => s.title).join(', ')}`);

  const nextStage = inProgress[0] || notStarted[0];
  if (nextStage && nextStage !== inProgress[0])
    lines.push(`  Next Stage to Start: ${nextStage.title} — Skills: ${nextStage.skills.join(', ')}`);

  return lines.join('\n');
}

function fmtCoding(stats: CodingStats): string {
  if (stats.attempted === 0) return 'Coding Practice: No problems attempted yet.';

  const accuracy = stats.attempted > 0
    ? Math.round((stats.solved / stats.attempted) * 100)
    : 0;

  const lines: string[] = [
    `Coding Practice: ${stats.attempted} attempted, ${stats.solved} solved (${accuracy}% accuracy)`,
  ];

  const topics = Object.entries(stats.topicPerformance);
  if (topics.length > 0) {
    const strong = topics.filter(([, v]) => v.solved / Math.max(v.attempted, 1) >= 0.7);
    const weak   = topics.filter(([, v]) => v.attempted > 0 && v.solved / v.attempted < 0.5);
    if (strong.length > 0)
      lines.push(`  Strong Topics: ${strong.map(([t]) => t).join(', ')}`);
    if (weak.length > 0)
      lines.push(`  Weak Topics (need practice): ${weak.map(([t]) => t).join(', ')}`);
  }

  return lines.join('\n');
}

function fmtInterviews(history: InterviewSession[]): string {
  if (history.length === 0) return 'Mock Interviews: No interview sessions completed yet.';

  const lines: string[] = [`Interview History: ${history.length} session(s) completed`];
  const recent = history.slice(0, 3);

  for (const s of recent) {
    const pct = s.percentage !== null ? `${s.percentage}%` : 'In progress';
    lines.push(`  • ${s.role} — ${s.date} — Score: ${pct} — Questions: ${s.questionsAnswered}`);
    if (s.strengths.length > 0)
      lines.push(`    Strengths: ${s.strengths.join(', ')}`);
    if (s.weaknesses.length > 0)
      lines.push(`    Weaknesses: ${s.weaknesses.join(', ')}`);
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Context selector — picks ONLY the sections relevant to the detected intents
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_TO_CONTEXT: Record<IntentCategory, Array<'profile' | 'resume' | 'skills' | 'roadmap' | 'coding' | 'interview'>> = {
  PROFILE:          ['profile'],
  RESUME:           ['profile', 'resume'],
  SKILLS:           ['profile', 'resume', 'roadmap'],
  ROADMAP:          ['profile', 'roadmap'],
  PROJECTS:         ['profile', 'resume', 'roadmap', 'coding'],
  CODING:           ['profile', 'coding'],
  INTERVIEW:        ['profile', 'interview'],
  CAREER_GUIDANCE:  ['profile', 'resume', 'roadmap', 'skills', 'coding', 'interview'],
  GENERAL_CAREER:   ['profile'],      // include profile for personalization only
  GREETING:         ['profile'],
  GENERAL_KNOWLEDGE: [],             // no student data needed
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface RetrievedContext {
  intents: IntentCategory[];
  contextBlock: string;   // formatted text block to inject into AI prompt
  hasStudentData: boolean;
}

/**
 * Classify the user's question and retrieve only the relevant
 * Career Hub data sections to include in the AI prompt.
 */
export function retrieveContext(
  message: string,
  hub: CareerHubSnapshot,
): RetrievedContext {
  const intents = classifyIntent(message);

  // Collect which data sections are needed
  const needed = new Set<'profile' | 'resume' | 'skills' | 'roadmap' | 'coding' | 'interview'>();
  for (const intent of intents) {
    for (const section of INTENT_TO_CONTEXT[intent]) {
      needed.add(section);
    }
  }

  // 'skills' is not a separate formatter — it's derived from profile + resume
  needed.delete('skills' as any);

  const sections: string[] = [];

  if (needed.has('profile') && hub.profile) {
    sections.push('=== STUDENT PROFILE ===\n' + fmtProfile(hub.profile));
  }

  if (needed.has('resume')) {
    sections.push('=== RESUME ANALYSIS ===\n' + fmtResume(hub.resumeAnalysis));
  }

  if (needed.has('roadmap')) {
    sections.push('=== LEARNING ROADMAP ===\n' + fmtRoadmap(hub.roadmapStages));
  }

  if (needed.has('coding')) {
    sections.push('=== CODING PRACTICE ===\n' + fmtCoding(hub.codingStats));
  }

  if (needed.has('interview')) {
    sections.push('=== INTERVIEW HISTORY ===\n' + fmtInterviews(hub.interviewHistory));
  }

  const hasStudentData = sections.length > 0;
  const contextBlock = sections.join('\n\n');

  return { intents, contextBlock, hasStudentData };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar summary helpers (used by AIMentor.tsx sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export interface SidebarSnapshot {
  targetRole: string;
  domain: string;
  skillCount: number;
  resumeScore: number | null;
  roadmapProgress: { completed: number; total: number } | null;
  codingProgress: { solved: number; attempted: number } | null;
  lastInterviewScore: number | null;
}

export function buildSidebarSnapshot(hub: CareerHubSnapshot): SidebarSnapshot {
  const p = hub.profile;

  const allSkills = p
    ? [...p.programmingLanguages, ...p.technicalSkills, ...p.tools,
       ...hub.resumeAnalysis.extractedSkills]
    : hub.resumeAnalysis.extractedSkills;
  const uniqueSkills = [...new Set(allSkills.filter(Boolean))];

  const roadmapProgress = hub.roadmapStages.length > 0
    ? {
        completed: hub.roadmapStages.filter(s => s.status === 'completed').length,
        total: hub.roadmapStages.length,
      }
    : null;

  const codingProgress = hub.codingStats.attempted > 0
    ? { solved: hub.codingStats.solved, attempted: hub.codingStats.attempted }
    : null;

  const lastInterview = hub.interviewHistory.find(s => s.completed);
  const lastInterviewScore = lastInterview?.percentage ?? null;

  return {
    targetRole: p?.targetRole || 'Not set',
    domain: p?.targetCareer || 'Not set',
    skillCount: uniqueSkills.length,
    resumeScore: hub.resumeAnalysis.analyzed ? (hub.resumeAnalysis.score ?? null) : null,
    roadmapProgress,
    codingProgress,
    lastInterviewScore,
  };
}
