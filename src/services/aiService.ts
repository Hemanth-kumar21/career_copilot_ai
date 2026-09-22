/**
 * aiService.ts — Career Copilot AI
 *
 * Context-aware AI service.
 *
 * Flow:
 *   1. Classify intent from user message
 *   2. Retrieve only relevant Career Hub data
 *   3. Build a grounded system prompt
 *   4. Try backend proxy (keeps API key server-side)
 *   5. Fall back to smart offline engine if backend unavailable
 *
 * The API key is NEVER exposed in frontend code.
 */

import type { StudentProfile } from '../context/AppContext';
import type { InterviewQuestion } from '../data/interviewQuestions';
import {
  retrieveContext,
  type CareerHubSnapshot,
  type IntentCategory,
} from './mentorContext';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth token helper
// ─────────────────────────────────────────────────────────────────────────────

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('cc_token') || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// System prompt builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the system prompt that grounds the AI in the student's actual data.
 * The prompt instructs the model to act as a career mentor, not a generic chatbot.
 */
function buildSystemPrompt(contextBlock: string, intents: IntentCategory[], hasStudentData: boolean): string {
  const isGeneralOnly = intents.every(i => i === 'GENERAL_KNOWLEDGE' || i === 'GENERAL_CAREER' || i === 'GREETING');

  const basePersona = `You are Career Copilot AI — a professional, context-aware career intelligence assistant for students. You help students bridge the gap between academia and industry.

Your behavior rules:
- Answer questions directly and practically. Do NOT start by repeating the student's profile back to them.
- Use student data as CONTEXT for your reasoning, not as content to recite.
- When recommending actions, explain WHY they are the right next step for THIS student.
- For career planning questions, use a clear structure: what to do, why, how, and one concrete next action.
- For general knowledge questions, give a clear answer, then connect it to the student's career direction if useful.
- NEVER fabricate student data. If information is missing, say "I don't have that information yet" and guide them to add it.
- Do NOT say things like "You have 50 problems solved" unless the student data confirms it.
- Keep answers focused — do not dump all available data into every response.
- Use markdown formatting (bold, bullet points) for clarity but keep it readable.
- Be conversational and encouraging, not robotic.`;

  if (!hasStudentData || isGeneralOnly) {
    return basePersona + `\n\nThis question appears to be about general career or technical knowledge. Answer clearly and helpfully. If relevant to a career in tech, mention how it applies practically.`;
  }

  return basePersona + `

The student's Career Hub data relevant to this question is provided below. Use it to personalize your answer:

${contextBlock}

IMPORTANT INSTRUCTIONS FOR THIS RESPONSE:
- Only reference data from the above context that is actually relevant to the question.
- If a section shows "Not yet..." or "No... yet", do not pretend that data exists.
- When recommending next steps, base them on the actual gaps shown in the data above.
- Do not repeat profile fields the student already knows (name, degree, etc.) unless they asked about it.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Offline intelligence engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a grounded, intelligent offline response using the retrieved context.
 * This is the fallback when the backend/AI API is not available.
 */
function generateOfflineResponse(
  message: string,
  intents: IntentCategory[],
  hub: CareerHubSnapshot,
): string {
  const lower = message.toLowerCase();
  const p = hub.profile;
  const ra = hub.resumeAnalysis;
  const stages = hub.roadmapStages;
  const coding = hub.codingStats;
  const interviews = hub.interviewHistory;

  const target = p?.targetRole || 'your target role';
  const domain = p?.targetCareer || 'your field';
  const allSkills = p
    ? [...new Set([...p.programmingLanguages, ...p.technicalSkills, ...p.tools, ...ra.extractedSkills].filter(Boolean))]
    : [...new Set(ra.extractedSkills)];

  // ── GREETING ──────────────────────────────────────────────────────────────
  if (intents.includes('GREETING')) {
    const name = p?.name ? `, ${p.name}` : '';
    if (!p) {
      return `Hello${name}! I'm your Career Copilot AI Mentor. Complete your onboarding profile so I can give you personalized guidance for your career journey. What would you like to explore?`;
    }
    const completedCount = stages.filter(s => s.status === 'completed').length;
    const inProgress = stages.find(s => s.status === 'in_progress');
    let status = '';
    if (completedCount > 0) status += ` You've completed ${completedCount} roadmap stage${completedCount > 1 ? 's' : ''}.`;
    if (inProgress) status += ` You're currently working on **${inProgress.title}**.`;
    return `Hello${name}! I'm your Career Copilot AI Mentor.${status} I know you're working toward becoming a **${target}**. What would you like to work on today?`;
  }

  // ── RESUME ────────────────────────────────────────────────────────────────
  if (intents.includes('RESUME')) {
    if (!ra.analyzed) {
      return `You haven't uploaded a resume yet. Head to **Career Hub → Resume Intelligence** and upload your PDF or DOCX resume. I'll extract your skills, analyze your content, score it, and give you personalized improvement suggestions.`;
    }
    const score = ra.score ?? 0;
    const scoreLabel = score >= 75 ? 'strong' : score >= 50 ? 'decent foundation' : 'needs improvement';
    let response = `Your resume currently scores **${score}/100** — ${scoreLabel}.\n\n`;

    if (ra.extractedSkills.length > 0)
      response += `**Skills found:** ${ra.extractedSkills.slice(0, 8).join(', ')}${ra.extractedSkills.length > 8 ? ` (+${ra.extractedSkills.length - 8} more)` : ''}\n\n`;

    if (ra.strengths.length > 0)
      response += `**Strengths:** ${ra.strengths.slice(0, 3).join(', ')}\n\n`;

    if (ra.missingSkills.length > 0)
      response += `**Missing for ${target}:** ${ra.missingSkills.slice(0, 4).join(', ')}\n\n`;

    if (ra.suggestions.length > 0) {
      response += `**Top improvements:**\n`;
      ra.suggestions.slice(0, 3).forEach((s, i) => { response += `${i + 1}. ${s}\n`; });
    }

    return response.trim();
  }

  // ── SKILLS / SKILL GAP ────────────────────────────────────────────────────
  if (intents.includes('SKILLS')) {
    if (allSkills.length === 0) {
      return `I don't have skill data for you yet. Two ways to add it:\n1. **Complete onboarding** — add your programming languages and tools.\n2. **Upload your resume** in Career Hub → Resume Intelligence — I'll extract your skills automatically.\n\nOnce I have your skills, I can tell you exactly what gaps exist for **${target}**.`;
    }

    const isGapQuestion = lower.includes('miss') || lower.includes('gap') || lower.includes('need') || lower.includes('lack');

    if (isGapQuestion) {
      const missing = ra.analyzed ? ra.missingSkills : [];
      let response = `Based on your profile, you currently have **${allSkills.length} skills**: ${allSkills.slice(0, 6).join(', ')}${allSkills.length > 6 ? '...' : ''}.\n\n`;

      if (missing.length > 0) {
        response += `**Skill gaps for ${target}:**\n`;
        missing.forEach(s => { response += `• ${s}\n`; });
        response += `\nThese are the skills your resume analysis identified as missing. Add them to your roadmap and start with the one most relevant to your next stage.`;
      } else {
        response += `Upload your resume in **Career Hub → Resume Intelligence** for a detailed gap analysis comparing your current skills against ${target} requirements.`;
      }
      return response;
    }

    return `**Your current skills (${allSkills.length} total):**\n${allSkills.slice(0, 10).join(', ')}${allSkills.length > 10 ? `\n\n...and ${allSkills.length - 10} more extracted from your resume.` : ''}\n\nThese come from your onboarding profile${ra.analyzed ? ' and resume analysis' : ''}. Visit **Skill Insights** in Career Hub for a categorized breakdown.`;
  }

  // ── ROADMAP ───────────────────────────────────────────────────────────────
  if (intents.includes('ROADMAP')) {
    if (stages.length === 0) {
      return `Your personalized roadmap hasn't been generated yet. Complete your onboarding and visit **Career Hub → Learning Roadmap**. It'll be tailored to your target role: **${target}**.`;
    }
    const completed = stages.filter(s => s.status === 'completed');
    const inProgress = stages.find(s => s.status === 'in_progress');
    const upcoming = stages.filter(s => s.status === 'not_started');

    let response = `**Your ${target} Roadmap** (${stages.length} stages total):\n\n`;
    if (completed.length > 0)
      response += `✅ **Completed (${completed.length}):** ${completed.map(s => s.title).join(', ')}\n\n`;
    if (inProgress)
      response += `🔵 **In Progress:** ${inProgress.title}\n   Skills: ${inProgress.skills.join(', ')}\n   Project: ${inProgress.project}\n\n`;
    if (upcoming.length > 0)
      response += `⏳ **Upcoming (${upcoming.length}):** ${upcoming.map(s => s.title).join(' → ')}\n\n`;

    const next = inProgress || upcoming[0];
    if (next)
      response += `**Next action:** ${inProgress ? 'Complete' : 'Start'} **${next.title}** — work on ${next.skills[0]} and build the **${next.project}**.`;

    return response.trim();
  }

  // ── CAREER GUIDANCE / WHAT SHOULD I LEARN / DO NEXT ──────────────────────
  if (intents.includes('CAREER_GUIDANCE') || (lower.includes('next') && lower.includes('learn'))) {
    if (!p) {
      return `To give you personalized guidance, I need your profile first. Complete the **onboarding** to tell me your target role, current skills, and goals — then I can map out exactly what you need to do next.`;
    }

    const inProgress = stages.find(s => s.status === 'in_progress');
    const nextStage  = stages.find(s => s.status === 'not_started');
    const missing    = ra.analyzed ? ra.missingSkills : [];

    let response = '';

    // 30-day plan
    if (lower.includes('30 day') || lower.includes('30-day') || lower.includes('weekly') || lower.includes('plan')) {
      response = `**30-Day Action Plan for ${target}:**\n\n`;
      response += `**Week 1–2 — Foundation**\n`;
      if (inProgress) {
        response += `• Complete your current roadmap stage: **${inProgress.title}**\n`;
        response += `• Build the stage project: **${inProgress.project}**\n`;
      } else if (nextStage) {
        response += `• Start roadmap stage: **${nextStage.title}** — focus on ${nextStage.skills.slice(0, 2).join(' and ')}\n`;
        response += `• Build the project: **${nextStage.project}**\n`;
      }
      if (allSkills.length > 0)
        response += `• Practice ${allSkills[0]} through small daily exercises\n`;
      response += `\n**Week 3 — Build & Practice**\n`;
      response += `• Solve 10–15 coding problems in Coding Practice (focus on arrays and strings)\n`;
      if (missing.length > 0)
        response += `• Start learning: **${missing[0]}** — this is a gap for ${target}\n`;
      response += `\n**Week 4 — Assessment**\n`;
      response += `• Do a Mock Interview in the Interview Lab\n`;
      response += `• Update your roadmap progress\n`;
      response += `• Upload/update your resume in Resume Intelligence\n\n`;
      response += `Adjust this plan based on your actual pace. Quality over quantity.`;
      return response;
    }

    // General "what should I do/learn next"
    response = `**Based on your Career Hub data:**\n\n`;

    if (inProgress) {
      response += `**Your current priority:** Complete **${inProgress.title}**\n`;
      response += `You're already in progress on this stage. Finish it before starting something new.\n`;
      response += `Skills to complete: ${inProgress.skills.join(', ')}\n`;
      response += `Project to build: **${inProgress.project}**\n\n`;
    } else if (nextStage) {
      response += `**Your next step:** Start **${nextStage.title}**\n`;
      response += `Skills to learn: ${nextStage.skills.join(', ')}\n`;
      response += `Project to build: **${nextStage.project}**\n\n`;
    } else if (allSkills.length > 0) {
      response += `**Deepen your existing skills** — you have ${allSkills.length} skills but no active roadmap stage. Visit Career Hub → Learning Roadmap to generate your path.\n\n`;
    }

    if (missing.length > 0) {
      response += `**Skill gaps to address for ${target}:**\n`;
      missing.slice(0, 3).forEach(s => { response += `• ${s}\n`; });
      response += `\n`;
    }

    if (coding.attempted === 0) {
      response += `**Also:** Start Coding Practice — you haven't attempted any problems yet. DSA skills are essential for ${target} interviews.\n\n`;
    } else if (coding.solved / coding.attempted < 0.5) {
      response += `**Also:** Your coding accuracy is ${Math.round((coding.solved/coding.attempted)*100)}%. Spend 15 min/day on problems in your weak topics.\n\n`;
    }

    if (interviews.length === 0) {
      response += `**Try a Mock Interview** when you feel ready — the Interview Lab will show you exactly what to improve.\n`;
    }

    return response.trim();
  }

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  if (intents.includes('PROJECTS')) {
    const inProgress = stages.find(s => s.status === 'in_progress');
    const nextStage  = stages.find(s => s.status === 'not_started');

    let response = `**Project recommendations for ${target}:**\n\n`;

    if (inProgress) {
      response += `**Immediate priority:** Build the project for your current roadmap stage:\n`;
      response += `→ **${inProgress.project}** (Stage: ${inProgress.title})\n`;
      response += `   Technologies: ${inProgress.skills.join(', ')}\n\n`;
    } else if (nextStage) {
      response += `**Start with:** **${nextStage.project}** (your next roadmap stage)\n`;
      response += `   Technologies: ${nextStage.skills.join(', ')}\n\n`;
    }

    response += `**Visit Project Explorer** in Career Hub for curated project ideas tailored to your ${domain} path — each one comes with a problem statement, technologies list, and expected outcomes.\n\n`;

    if (ra.analyzed && ra.missingSkills.length > 0)
      response += `**Tip:** Build a project that uses **${ra.missingSkills[0]}** — that's your biggest resume gap for ${target}.`;

    return response.trim();
  }

  // ── CODING ────────────────────────────────────────────────────────────────
  if (intents.includes('CODING')) {
    if (coding.attempted === 0) {
      return `You haven't attempted any coding problems yet. Head to **Career Hub → Coding Practice** to start. For ${target}, I recommend beginning with **Arrays and Strings** — they're the most common interview topics.\n\n**Tip:** Aim for 5–10 problems per week, focusing on understanding the approach rather than memorizing solutions.`;
    }

    const accuracy = Math.round((coding.solved / coding.attempted) * 100);
    const topics = Object.entries(coding.topicPerformance);
    const weak = topics.filter(([, v]) => v.attempted > 0 && v.solved / v.attempted < 0.5);
    const strong = topics.filter(([, v]) => v.solved / Math.max(v.attempted, 1) >= 0.7);

    let response = `**Your Coding Practice Stats:**\n`;
    response += `• Attempted: ${coding.attempted} problems\n`;
    response += `• Solved: ${coding.solved} problems\n`;
    response += `• Accuracy: ${accuracy}%\n\n`;

    if (weak.length > 0)
      response += `**Weak areas to focus on:** ${weak.map(([t]) => t).join(', ')}\n\n`;
    if (strong.length > 0)
      response += `**Strong areas:** ${strong.map(([t]) => t).join(', ')}\n\n`;

    if (accuracy < 50)
      response += `Your accuracy is below 50%. Slow down — focus on understanding each problem fully before moving to the next. Read the hints, study the approach, then re-attempt.`;
    else if (accuracy < 75)
      response += `Good progress! Focus on your weak topics to bring your accuracy above 75% before your target interviews.`;
    else
      response += `Strong coding performance! Start tackling harder problems and practice explaining your solutions aloud for interviews.`;

    return response.trim();
  }

  // ── INTERVIEW ─────────────────────────────────────────────────────────────
  if (intents.includes('INTERVIEW')) {
    if (interviews.length === 0) {
      return `You haven't completed a mock interview yet. Visit **Interview Lab** to start one for **${target}**.\n\nThe lab will ask you real technical questions, evaluate your answers, and give you detailed feedback on what you got right, what you missed, and what to study next.`;
    }

    const recent = interviews.find(s => s.completed);
    if (!recent) {
      return `You have interview sessions in progress but haven't completed one yet. Finish your current session in the **Interview Lab** to get your score and feedback.`;
    }

    let response = `**Your most recent mock interview:**\n`;
    response += `• Role: ${recent.role}\n`;
    response += `• Date: ${recent.date}\n`;
    response += `• Score: ${recent.percentage !== null ? `${recent.percentage}%` : 'N/A'}\n`;
    response += `• Questions answered: ${recent.questionsAnswered}\n\n`;

    if (recent.strengths.length > 0)
      response += `**Strengths:** ${recent.strengths.join(', ')}\n\n`;
    if (recent.weaknesses.length > 0) {
      response += `**Areas to improve:** ${recent.weaknesses.join(', ')}\n\n`;
      response += `**Recommended:** Study these areas and attempt another mock interview in 1–2 weeks to track your improvement.`;
    }

    return response.trim();
  }

  // ── GENERAL CAREER ────────────────────────────────────────────────────────
  if (intents.includes('GENERAL_CAREER')) {
    // Role comparison questions
    if (lower.includes('difference between') || lower.includes('vs ')) {
      return `That's a great comparison question. Both roles have distinct responsibilities:\n\n**Data Analyst** — focuses on analyzing existing data to find insights, create reports, and support business decisions. Core skills: SQL, Excel/Power BI, Statistics, Python basics.\n\n**Data Engineer** — builds the data infrastructure and pipelines that analysts use. Core skills: Python, SQL, Spark, Kafka, Cloud (AWS/GCP/Azure), ETL pipelines.\n\n**Which fits you?** ${p ? `For your goal of **${target}**, the ${target.toLowerCase().includes('engineer') ? 'Data Engineer' : 'Data Analyst'} path is more aligned.` : 'Complete your onboarding profile and I can map this to your career goals.'}`;
    }

    if (lower.includes('how to become') || lower.includes('how do i become')) {
      return `Becoming a ${target} requires:\n\n1. **Core skills** — master the fundamental technologies for the role\n2. **Projects** — build 2–3 solid portfolio projects\n3. **Practice** — solve DSA problems and do mock interviews\n4. **Resume** — a clean, skills-focused resume with GitHub links\n5. **Network** — LinkedIn profile, open source contributions\n\nYour Career Copilot roadmap in Career Hub maps out all the stages step-by-step. Check **Learning Roadmap** for your personalized path to **${target}**.`;
    }

    return `That's a great career question. ${p ? `For your **${target}** path, this is directly relevant. ` : ''}I recommend checking your **Career Hub** for personalized guidance — the Learning Roadmap and Skill Insights sections are built specifically around your career direction. What specific aspect would you like me to explain further?`;
  }

  // ── GENERAL KNOWLEDGE ─────────────────────────────────────────────────────
  if (intents.includes('GENERAL_KNOWLEDGE')) {
    // Python
    if (lower.includes('python')) {
      const useful = p && (target.toLowerCase().includes('data') || target.toLowerCase().includes('ml') || target.toLowerCase().includes('ai') || target.toLowerCase().includes('backend'));
      return `**Python** is a versatile, beginner-friendly programming language known for clean syntax and a massive ecosystem.\n\nKey uses:\n• Data Science & ML (Pandas, NumPy, TensorFlow, PyTorch)\n• Backend development (Django, Flask, FastAPI)\n• Automation and scripting\n• DevOps and cloud tools\n\n${useful ? `**For your ${target} career:** Python is highly recommended — it's essential for your target role. Add it to your skills if you haven't already.` : p ? `**For your ${target} career:** Python has some relevance but may not be your highest priority. Check your roadmap for what to focus on first.` : 'Complete your profile so I can tell you how Python fits your specific career goal.'}`;
    }

    // SQL
    if (lower.includes('sql')) {
      return `**SQL (Structured Query Language)** is the standard language for querying and managing relational databases.\n\nWhy it matters:\n• Used in virtually every software application\n• Essential for data roles\n• Required for most backend developer positions\n• Common in technical interviews\n\n${p ? `**For ${target}:** SQL is ${target.toLowerCase().includes('data') ? 'absolutely essential' : 'very useful'} for your target role. If it's not in your current skills, I'd recommend prioritizing it.` : ''}`;
    }

    return `Great question. Career Copilot specializes in career guidance, but I can help with general technical knowledge too. Could you be more specific about what aspect you'd like to understand? I'll give you a practical explanation and connect it to your career path if relevant.`;
  }

  // ── DEFAULT FALLBACK ──────────────────────────────────────────────────────
  return `${p ? `For your **${target}** career path, ` : ''}I'd recommend exploring your **Career Hub** for data-driven guidance. Here's what you can do right now:\n\n• **Learning Roadmap** — see your personalized stage-by-stage plan\n• **Skill Insights** — understand where you stand and what gaps exist\n• **Resume Intelligence** — get your resume scored and improved\n• **Interview Lab** — practice real technical questions\n\nWhat specific area would you like help with?`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Backend proxy calls
// ─────────────────────────────────────────────────────────────────────────────

async function callBackendMentor(
  messages: AIMessage[],
  systemPrompt: string,
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
      body: JSON.stringify({ messages, systemPrompt }),
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

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a chat message to the AI mentor with full Career Hub context.
 *
 * @param messages  Conversation history
 * @param profile   Student profile (from AppContext)
 * @param hub       Full Career Hub snapshot — the AI will only read what's relevant
 */
export async function sendChatMessage(
  messages: AIMessage[],
  profile: StudentProfile | null,
  hub?: CareerHubSnapshot,
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || '';

  // Build Career Hub snapshot — use provided hub or minimal profile-only hub
  const snapshot: CareerHubSnapshot = hub || {
    profile,
    resumeAnalysis: { score: null, extractedSkills: [], projects: [], strengths: [], missingSkills: [], suggestions: [], analyzed: false },
    roadmapStages: [],
    codingStats: { attempted: 0, solved: 0, topicPerformance: {} },
    interviewHistory: [],
  };

  // Retrieve only the context relevant to this question
  const { intents, contextBlock, hasStudentData } = retrieveContext(lastMessage, snapshot);

  // Build the grounded system prompt
  const systemPrompt = buildSystemPrompt(contextBlock, intents, hasStudentData);

  // Try backend proxy first (keeps AI API key server-side)
  const backendResponse = await callBackendMentor(messages, systemPrompt);
  if (backendResponse) return backendResponse;

  // Offline fallback — smart intent-based engine
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  return generateOfflineResponse(lastMessage, intents, snapshot);
}

export async function evaluateInterviewAnswer(
  question: InterviewQuestion,
  studentAnswer: string,
  _profile: StudentProfile | null,
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
  const backendResult = await callBackendEvaluate(question, studentAnswer);
  if (backendResult) return backendResult;

  // Offline keyword-based evaluation
  await new Promise(resolve => setTimeout(resolve, 1200));

  const answerLower = studentAnswer.toLowerCase();
  const matchedPoints = question.keyPoints.filter(kp =>
    kp.toLowerCase().split(' ').some(word => word.length > 3 && answerLower.includes(word))
  );
  const missedPoints = question.keyPoints.filter(kp => !matchedPoints.includes(kp));

  const coverageRatio = matchedPoints.length / Math.max(question.keyPoints.length, 1);
  const lengthScore   = Math.min(studentAnswer.length / 150, 1);
  const score         = Math.round((coverageRatio * 0.7 + lengthScore * 0.3) * 10);

  const strengths: string[]    = [];
  const improvements: string[] = [];

  if (studentAnswer.length > 100) strengths.push('Provided a detailed answer');
  if (matchedPoints.length > 0)   strengths.push(`Covered key concepts: ${matchedPoints.slice(0, 2).join(', ')}`);
  if (studentAnswer.includes('example') || studentAnswer.includes('for instance'))
    strengths.push('Used examples to explain');

  if (missedPoints.length > 0)
    improvements.push(`Cover these missing points: ${missedPoints.slice(0, 2).join(', ')}`);
  if (studentAnswer.length < 80)
    improvements.push('Provide a more comprehensive answer with more detail');
  if (!studentAnswer.includes('because') && !studentAnswer.includes('therefore'))
    improvements.push('Explain the reasoning behind your points');

  const feedback = score >= 7
    ? `Good answer that covers the main concepts. ${missedPoints.length > 0 ? `Adding depth on ${missedPoints[0]} would make it stronger.` : 'Well done!'}`
    : score >= 4
    ? 'Partial answer — you\'ve covered some aspects but missed key concepts. Review the reference points and try to explain the underlying reasoning.'
    : 'This answer needs significant improvement. Focus on understanding the core concepts before your next attempt.';

  return {
    score,
    feedback,
    strengths,
    improvements: improvements.slice(0, 3),
    missingConcepts: missedPoints.slice(0, 4),
  };
}

export async function generateCareerInsight(profile: StudentProfile): Promise<string> {
  const skills = [...profile.programmingLanguages, ...profile.technicalSkills];
  const target = profile.targetRole;
  await new Promise(resolve => setTimeout(resolve, 600));

  if (skills.length === 0) {
    return `Your career profile has been created for **${target}**. Complete your skill assessment and upload your resume to get a detailed AI analysis of your readiness.`;
  }

  const level = skills.length <= 3 ? 'beginner' : skills.length <= 7 ? 'intermediate' : 'experienced';
  return `Based on your profile, you're at an **${level}** level with ${skills.length} identified skills. Your target role as **${target}** requires strong fundamentals and hands-on project experience. Your personalized roadmap is ready — start with Stage 1 and build consistently.`;
}
