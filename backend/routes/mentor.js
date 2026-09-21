const express = require('express');
const { authenticate } = require('./auth');
const router = express.Router();

// ── AI client initialization — only if API key is configured ─────────────────
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  });
}

/**
 * POST /api/mentor/chat
 * Proxy AI mentor chat — API key stays server-side only
 */
router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { messages, profileContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemPrompt = buildSystemPrompt(profileContext);

    if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // Last 10 messages for context window
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      return res.json({ content: response.choices[0].message.content });
    }

    // Offline fallback — no API key configured
    const lastMessage = messages[messages.length - 1]?.content || '';
    res.json({ content: generateOfflineResponse(lastMessage, profileContext) });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service is currently busy. Please try again in a moment.' });
    }
    if (err.status === 401) {
      return res.status(503).json({ error: 'AI service configuration error. Please contact support.' });
    }
    next(err);
  }
});

/**
 * POST /api/mentor/evaluate
 * Proxy interview answer evaluation — API key stays server-side only
 */
router.post('/evaluate', authenticate, async (req, res, next) => {
  try {
    const { question, keyPoints, studentAnswer } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Question and student answer are required.' });
    }

    if (openai) {
      const prompt = `Evaluate this interview answer.

Question: ${question}
Reference Key Points: ${(keyPoints || []).join(', ')}
Student Answer: ${studentAnswer}

Respond in JSON only:
{
  "score": <0-10>,
  "feedback": "<2-3 sentence evaluation>",
  "strengths": ["<what was good>"],
  "improvements": ["<specific improvement>"],
  "missingConcepts": ["<concept not mentioned>"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    }

    // Offline keyword-based evaluation fallback
    res.json(offlineEvaluate(studentAnswer, keyPoints || []));
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service is currently busy. Please try again in a moment.' });
    }
    next(err);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(profile) {
  if (!profile) {
    return `You are Career Copilot AI, a personalized career mentor for students. Help with career planning, skill development, roadmaps, projects, and interview preparation. Be concise and practical.`;
  }
  const skills = [...(profile.programmingLanguages || []), ...(profile.technicalSkills || [])].join(', ');
  return `You are Career Copilot AI. Student: ${profile.name}, targeting ${profile.targetRole} in ${profile.targetCareer}. Current skills: ${skills || 'not specified'}. Answer directly, personalize based on this context. Do NOT repeat the student's information back — answer the actual question.`;
}

function generateOfflineResponse(message, profile) {
  const lower = (message || '').toLowerCase();
  const target = profile?.targetRole || 'your target role';

  if (lower.includes('next') && (lower.includes('learn') || lower.includes('study'))) {
    return `Based on your profile, focus next on the core skills most critical for ${target}. Check your Learning Roadmap in Career Hub for a detailed stage-by-stage plan with specific objectives and projects.`;
  }
  if (lower.includes('project') && (lower.includes('build') || lower.includes('recommend'))) {
    return `For a ${target} path, visit the Project Explorer in Career Hub for curated project ideas matched to your skills and role. Building real projects is the fastest way to close skill gaps.`;
  }
  if (lower.includes('interview') || lower.includes('prepare')) {
    return `For ${target} interviews: (1) Master core technical concepts deeply. (2) Practice DSA through the Coding Practice module. (3) Use the Mock Interview Lab to practice role-specific questions with AI evaluation.`;
  }
  if (lower.includes('skill') && (lower.includes('missing') || lower.includes('gap'))) {
    return `Your skill gaps are visible in Career Hub → Skill Insights based on your profile vs. ${target} requirements. The Learning Roadmap shows exactly which skills to acquire at each stage.`;
  }
  if (lower.includes('hello') || lower.includes('hi ') || lower.match(/^hi$/)) {
    const name = profile?.name ? `, ${profile.name}` : '';
    return `Hello${name}! I'm your Career Copilot AI Mentor. Ask me about what to learn next, which projects to build, how to prepare for interviews, or how to improve your resume.`;
  }
  return `Great question for your ${target} journey. Explore your Personalized Roadmap and Skill Insights in Career Hub for data-driven guidance. Is there something specific about learning, projects, or interview prep I can help with?`;
}

function offlineEvaluate(answer, keyPoints) {
  if (!answer || !answer.trim()) {
    return { score: 0, feedback: 'No answer provided.', strengths: [], improvements: ['Provide a complete answer.'], missingConcepts: keyPoints };
  }
  const lower = answer.toLowerCase();
  const matched = keyPoints.filter(kp =>
    kp.toLowerCase().split(' ').some(w => w.length > 3 && lower.includes(w))
  );
  const missed = keyPoints.filter(kp => !matched.includes(kp));
  const coverage = matched.length / Math.max(keyPoints.length, 1);
  const lengthScore = Math.min(answer.length / 150, 1);
  const score = Math.round((coverage * 0.7 + lengthScore * 0.3) * 10);

  const strengths = [];
  if (answer.length > 100) strengths.push('Provided a detailed answer');
  if (matched.length > 0) strengths.push(`Covered key concepts: ${matched.slice(0, 2).join(', ')}`);

  const improvements = [];
  if (missed.length > 0) improvements.push(`Cover these missing points: ${missed.slice(0, 2).join(', ')}`);
  if (answer.length < 80) improvements.push('Provide a more comprehensive answer');

  const feedback = score >= 7
    ? `Good answer covering the main concepts.${missed.length > 0 ? ` Adding depth on "${missed[0]}" would strengthen it.` : ' Well done!'}`
    : score >= 4
    ? `Partial answer — covers some aspects but misses key concepts. Review and explain the reasoning behind your points.`
    : `Needs significant improvement. Focus on understanding the core concepts before your next attempt.`;

  return { score, feedback, strengths, improvements: improvements.slice(0, 3), missingConcepts: missed.slice(0, 4) };
}

module.exports = router;
