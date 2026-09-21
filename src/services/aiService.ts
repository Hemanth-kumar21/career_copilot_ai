import type { StudentProfile } from '../context/AppContext';
import type { InterviewQuestion } from '../data/interviewQuestions';

// ── API base URL for backend proxy calls ─────────────────────────────────────
// Set VITE_API_BASE_URL in .env to point at your backend (e.g. http://localhost:3001).
// If not set, the app runs fully offline using smart fallback responses.
// The AI API key is NEVER exposed here — it lives only in backend/.env.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Auth token helper (stored by AppContext on login) ─────────────────────────
function getAuthToken(): string | null {
  try {
    const user = localStorage.getItem('cc_user');
    if (!user) return null;
    return localStorage.getItem('cc_token') || null;
  } catch {
    return null;
  }
}

// ── Offline fallback AI responses based on intent detection ──────────────────
function generateOfflineResponse(message: string, profile: StudentProfile | null): string {
  const lower = message.toLowerCase();

  const skills = profile ? [...profile.programmingLanguages, ...profile.technicalSkills] : [];
  const target = profile?.targetRole || 'your target role';
  const domain = profile?.targetCareer || 'your field';

  if (lower.includes('next') && (lower.includes('learn') || lower.includes('study'))) {
    if (skills.length === 0) return `To get started, complete your skill assessment in the onboarding so I can give you a personalized learning path. Once I know your current skills, I can tell you exactly what to learn next for ${target}.`;
    return `Based on your current skills (${skills.slice(0, 3).join(', ')}), your next priority should be deepening your understanding of core concepts before adding more tools. Focus on building 1-2 solid projects with what you already know, then expand into areas directly required for ${target}. Check your Personalized Roadmap for a detailed stage-by-stage plan.`;
  }

  if (lower.includes('project') && (lower.includes('build') || lower.includes('what') || lower.includes('recommend'))) {
    return `For a ${target} path, I recommend starting with projects that combine your existing skills with something new. Visit the **Project Explorer** in Career Hub for curated project ideas with problem statements and technologies tailored to your profile. Building real projects is the fastest way to close skill gaps.`;
  }

  if (lower.includes('interview') || lower.includes('prepare')) {
    return `For ${target} interviews, focus on: (1) **Core technical concepts** — understand fundamentals deeply, not just syntax. (2) **Problem solving** — practice DSA through the Coding Practice module. (3) **Communication** — explain your thinking clearly. Start with the Mock Interview Lab to practice real questions with AI evaluation.`;
  }

  if (lower.includes('resume') || lower.includes('cv')) {
    return `A strong resume for ${domain} should: highlight projects with measurable impact, list relevant skills clearly, include GitHub links, and tailor the objective to ${target}. Upload your resume in Career Hub → Resume Intelligence for AI-powered scoring and personalized improvement suggestions.`;
  }

  if (lower.includes('skill') && (lower.includes('missing') || lower.includes('gap') || lower.includes('need'))) {
    return `Your skill gaps depend on your current level vs. ${target} requirements. Visit **Skill Insights** in Career Hub for a detailed gap analysis based on your profile and resume. The Personalized Roadmap shows exactly which skills to acquire at each stage.`;
  }

  if (lower.includes('roadmap') || lower.includes('path') || lower.includes('plan')) {
    return `Your personalized roadmap is available in Career Hub → Learning Roadmap. It's broken into stages from foundations to career-ready, each with specific skills, objectives, and a project to build. Update your stage progress as you complete each section to get updated recommendations.`;
  }

  if (lower.includes('salary') || lower.includes('pay') || lower.includes('compensation')) {
    return `Salaries for ${target} roles vary by location and company size. Focus on building strong skills and a solid portfolio — that's what drives compensation. Career Copilot focuses on helping you become technically strong and interview-ready, which is the foundation for competitive offers.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    const name = profile?.name ? `, ${profile.name}` : '';
    return `Hello${name}! I'm your Career Copilot AI Mentor. I'm here to guide your journey toward becoming a ${target}. You can ask me about what to learn next, which projects to build, how to prepare for interviews, or how to improve your resume. What's on your mind?`;
  }

  // Default
  return `That's a great question for your ${target} journey. I'd recommend exploring your **Personalized Roadmap** and **Skill Insights** in Career Hub for data-driven guidance specific to your profile. Is there something specific about your learning path, projects, or interview prep I can help with?`;
}

// ── Backend proxy call ────────────────────────────────────────────────────────
async function callBackendMentor(
  messages: AIMessage[],
  profile: StudentProfile | null
): Promise<string | null> {
  if (!API_BASE) return null;
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE}/api/mentor/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages,
        profileContext: profile,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content || null;
  } catch {
    return null;
  }
}

async function callBackendEvaluate(
  question: InterviewQuestion,
  studentAnswer: string,
  _profile: StudentProfile | null
): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
} | null> {
  if (!API_BASE) return null;
  const token = getAuthToken();
  try {
    const res = await fetch(`${API_BASE}/api/mentor/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question: question.question,
        keyPoints: question.keyPoints,
        studentAnswer,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  messages: AIMessage[],
  profile: StudentProfile | null
): Promise<string> {
  // Try backend proxy first (AI key stays server-side)
  const backendResponse = await callBackendMentor(messages, profile);
  if (backendResponse) return backendResponse;

  // Offline fallback — smart intent-based responses
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
  const lastMessage = messages[messages.length - 1]?.content || '';
  return generateOfflineResponse(lastMessage, profile);
}

export async function evaluateInterviewAnswer(
  question: InterviewQuestion,
  studentAnswer: string,
  profile: StudentProfile | null
): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
}> {
  if (!studentAnswer.trim()) {
    return {
      score: 0,
      feedback: 'No answer was provided.',
      strengths: [],
      improvements: ['Provide a complete answer addressing the question.'],
      missingConcepts: question.keyPoints,
    };
  }

  // Try backend proxy first
  const backendResult = await callBackendEvaluate(question, studentAnswer, profile);
  if (backendResult) return backendResult;

  // Offline keyword-based evaluation
  await new Promise(resolve => setTimeout(resolve, 1200));

  const answerLower = studentAnswer.toLowerCase();
  const matchedPoints = question.keyPoints.filter(kp =>
    kp.toLowerCase().split(' ').some(word => word.length > 3 && answerLower.includes(word))
  );
  const missedPoints = question.keyPoints.filter(kp => !matchedPoints.includes(kp));

  const coverageRatio = matchedPoints.length / Math.max(question.keyPoints.length, 1);
  const lengthScore = Math.min(studentAnswer.length / 150, 1);
  const score = Math.round((coverageRatio * 0.7 + lengthScore * 0.3) * 10);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (studentAnswer.length > 100) strengths.push('Provided a detailed answer');
  if (matchedPoints.length > 0) strengths.push(`Covered key concepts: ${matchedPoints.slice(0, 2).join(', ')}`);
  if (studentAnswer.includes('example') || studentAnswer.includes('for instance')) strengths.push('Used examples to explain');

  if (missedPoints.length > 0) improvements.push(`Cover these missing points: ${missedPoints.slice(0, 2).join(', ')}`);
  if (studentAnswer.length < 80) improvements.push('Provide a more comprehensive answer with more detail');
  if (!studentAnswer.includes('because') && !studentAnswer.includes('therefore')) improvements.push('Explain the reasoning behind your points');

  const feedback = score >= 7
    ? `Good answer that covers the main concepts. ${missedPoints.length > 0 ? `Adding depth on ${missedPoints[0]} would make it stronger.` : 'Well done!'}`
    : score >= 4
    ? `Partial answer — you've covered some aspects but missed key concepts. Review the reference points and try to explain the underlying reasoning.`
    : `This answer needs significant improvement. Focus on understanding the core concepts before your next attempt.`;

  return { score, feedback, strengths, improvements: improvements.slice(0, 3), missingConcepts: missedPoints.slice(0, 4) };
}

export async function generateCareerInsight(profile: StudentProfile): Promise<string> {
  const skills = [...profile.programmingLanguages, ...profile.technicalSkills];
  const target = profile.targetRole;

  await new Promise(resolve => setTimeout(resolve, 600));

  if (skills.length === 0) {
    return `Your career profile has been created for ${target}. Complete your skill assessment and upload your resume to get a detailed AI analysis of your readiness.`;
  }

  const knownCount = skills.length;
  const level = knownCount <= 3 ? 'beginner' : knownCount <= 7 ? 'intermediate' : 'experienced';

  return `Based on your profile, you're at an ${level} level with ${knownCount} identified skills. Your target role as ${target} requires strong fundamentals and hands-on project experience. Your personalized roadmap is ready — start with Stage 1 and build consistently. Focus on quality projects over quantity of skills.`;
}

