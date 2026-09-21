import { useState } from 'react';
import {
  MessageSquare, Play, Send, ChevronRight, CheckCircle,
  XCircle, AlertCircle, Award, RefreshCw, Clock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp, type InterviewSession } from '../context/AppContext';
import { ROLES } from '../data/roles';
import { getInterviewQuestions } from '../data/interviewQuestions';
import { evaluateInterviewAnswer } from '../services/aiService';
import type { InterviewQuestion } from '../data/interviewQuestions';
import './InterviewLab.css';

interface QuestionResult {
  question: InterviewQuestion;
  studentAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  missingConcepts: string[];
}

// Phases:
//  setup      → configure + history view
//  answering  → student is writing an answer
//  evaluating → spinner while AI evaluates (brief)
//  reviewed   → evaluation result shown; student clicks Next
//  results    → final session summary
type Phase = 'setup' | 'answering' | 'evaluating' | 'reviewed' | 'results';

export default function InterviewLab() {
  const { profile, addInterviewSession, interviewHistory, addToast } = useApp();

  const [phase, setPhase]               = useState<Phase>('setup');
  const [selectedRole, setSelectedRole] = useState(profile?.targetRole || ROLES[0].title);
  const [questions, setQuestions]       = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ]         = useState(0);
  const [answer, setAnswer]             = useState('');
  const [results, setResults]           = useState<QuestionResult[]>([]);
  const [currentResult, setCurrentResult] = useState<QuestionResult | null>(null);
  const [finalSession, setFinalSession] = useState<InterviewSession | null>(null);

  // ── Start ──────────────────────────────────────────────────────────────────
  const startInterview = () => {
    const role = ROLES.find(r => r.title === selectedRole);
    const qs   = getInterviewQuestions(role?.id || 'fullstack', 5);
    setQuestions(qs);
    setCurrentQ(0);
    setResults([]);
    setAnswer('');
    setCurrentResult(null);
    setPhase('answering');
  };

  // ── Submit answer → evaluate → show reviewed card ─────────────────────────
  const submitAnswer = async () => {
    if (!answer.trim() && !window.confirm('Submit without an answer?')) return;

    const question = questions[currentQ];
    setPhase('evaluating');           // show spinner immediately

    let evaluation: Awaited<ReturnType<typeof evaluateInterviewAnswer>>;
    try {
      evaluation = await evaluateInterviewAnswer(question, answer, profile || null);
    } catch {
      // Fallback if something throws unexpectedly
      evaluation = {
        score: 0,
        feedback: 'Evaluation could not be completed. Please try again.',
        strengths: [],
        improvements: ['Re-attempt this question.'],
        missingConcepts: question.keyPoints,
      };
    }

    const result: QuestionResult = { question, studentAnswer: answer, ...evaluation };
    const newResults = [...results, result];
    setResults(newResults);
    setCurrentResult(result);
    setPhase('reviewed');             // ← always move out of 'evaluating'
  };

  // ── Next question or finish ────────────────────────────────────────────────
  const goNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setAnswer('');
      setCurrentResult(null);
      setPhase('answering');
    } else {
      finishInterview([...results]);
    }
  };

  // ── Build final session ────────────────────────────────────────────────────
  const finishInterview = (allResults: QuestionResult[]) => {
    const totalScore = allResults.reduce((sum, r) => sum + r.score, 0);
    const maxScore   = allResults.length * 10;
    const percentage = Math.round((totalScore / maxScore) * 100);

    const strengths  = [...new Set(allResults.flatMap(r => r.strengths))].slice(0, 3);
    const weaknesses = [...new Set(allResults.flatMap(r => r.improvements))].slice(0, 3);

    const session: InterviewSession = {
      id:               `session_${Date.now()}`,
      role:             selectedRole,
      date:             new Date().toISOString(),
      totalScore,
      percentage,
      completed:        true,
      questionsAnswered: allResults.length,
      strengths,
      weaknesses,
    };

    addInterviewSession(session);
    setFinalSession(session);
    setPhase('results');
    addToast('success', `Interview complete! Score: ${percentage}%`);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getDiffColor = (d: string) =>
    ({ easy: 'var(--success)', medium: 'var(--warning)', hard: 'var(--error)' }[d] || 'var(--text-muted)');
  const getScoreColor = (s: number) =>
    s >= 7 ? 'var(--success)' : s >= 4 ? 'var(--warning)' : 'var(--error)';

  // ══════════════════════════════════════════════════════════════════════════
  // SETUP PHASE
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'setup') {
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content interview-page">
          <div className="container">
            <div className="interview-header animate-fade-in">
              <div className="interview-badge"><MessageSquare size={14} /> Mock Interview Lab</div>
              <h1>Interview Simulator</h1>
              <p>Practice role-specific questions and get AI-powered evaluation and feedback.</p>
            </div>

            <div className="interview-setup">
              <div className="setup-card card">
                <h3>Configure Your Interview</h3>
                <div className="form-group">
                  <label className="form-label">Select Interview Role</label>
                  <select
                    className="form-input"
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                  >
                    {ROLES.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                  </select>
                </div>
                <div className="interview-info">
                  <div className="info-item"><Clock size={14} /> 5 Questions</div>
                  <div className="info-item"><Award size={14} /> AI Evaluated</div>
                  <div className="info-item"><CheckCircle size={14} /> Mixed Difficulty</div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={startInterview}>
                  <Play size={16} /> Begin Mock Interview
                </button>
              </div>

              {interviewHistory.length > 0 ? (
                <div className="card previous-sessions">
                  <h4>Previous Sessions</h4>
                  {interviewHistory.slice(0, 3).map(session => (
                    <div key={session.id} className="session-item">
                      <div className="session-role">{session.role}</div>
                      <div className="session-date">{new Date(session.date).toLocaleDateString()}</div>
                      <div
                        className="session-score"
                        style={{ color: (session.percentage || 0) >= 60 ? 'var(--success)' : 'var(--warning)' }}
                      >
                        {session.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ flex: 1 }}>
                  <div className="empty-state-icon"><MessageSquare size={24} /></div>
                  <h3>No interviews yet</h3>
                  <p>Start your first mock interview to see your performance history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ANSWERING PHASE
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'answering') {
    const question = questions[currentQ];
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content interview-page">
          <div className="container">
            <div className="interview-progress">
              <div className="progress-info">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedRole}</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
              </div>
            </div>

            <div className="question-card card animate-fade-in">
              <div className="question-header">
                <div className="question-meta">
                  <span className="badge" style={{ background: `${getDiffColor(question.difficulty)}20`, color: getDiffColor(question.difficulty) }}>
                    {question.difficulty}
                  </span>
                  <span className="tag">{question.category.replace('_', ' ')}</span>
                </div>
                <div className="question-num">Q{currentQ + 1}</div>
              </div>

              <h3 className="question-text">{question.question}</h3>

              <div className="answer-area">
                <label className="form-label">Your Answer</label>
                <textarea
                  className="form-input answer-textarea"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Write your answer here. Be as detailed and accurate as possible..."
                  rows={8}
                  autoFocus
                />
              </div>

              <div className="question-actions">
                <span className="answer-hint">Tip: Explain the concept clearly and include an example if possible.</span>
                <button className="btn btn-primary" onClick={submitAnswer}>
                  Submit Answer <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EVALUATING PHASE  (brief spinner — never hangs; always transitions out)
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'evaluating') {
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content interview-page">
          <div className="container">
            <div className="evaluating-state card">
              <div className="eval-icon"><Award size={28} /></div>
              <h3>Evaluating your answer…</h3>
              <p>Checking correctness, completeness, and technical accuracy</p>
              <div className="ai-dots"><div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // REVIEWED PHASE  (evaluation result card + key points)
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'reviewed' && currentResult) {
    const question = questions[currentQ];
    const isLast   = currentQ === questions.length - 1;
    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content interview-page">
          <div className="container">
            {/* Progress bar shows this question as done */}
            <div className="interview-progress">
              <div className="progress-info">
                <span>Question {currentQ + 1} of {questions.length} — Evaluated</span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedRole}</span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            <div className="result-card card animate-fade-in">
              {/* Header with score */}
              <div className="result-header">
                <h3>Question {currentQ + 1} Evaluation</h3>
                <div className="result-score" style={{ color: getScoreColor(currentResult.score) }}>
                  {currentResult.score}<small>/10</small>
                </div>
              </div>

              {/* Inline evaluation summary badge */}
              <div className={`eval-inline-badge ${currentResult.score >= 7 ? 'good' : currentResult.score >= 4 ? 'partial' : 'poor'}`}>
                {currentResult.score >= 7
                  ? <><CheckCircle size={14} /> Accurate answer — well done!</>
                  : currentResult.score >= 4
                  ? <><AlertCircle size={14} /> Partially correct — key points missing</>
                  : <><XCircle size={14} /> Needs significant improvement</>}
              </div>

              {/* AI feedback paragraph */}
              <div className="result-feedback">
                <p>{currentResult.feedback}</p>
              </div>

              {/* Student's submitted answer */}
              {currentResult.studentAnswer && (
                <div className="result-section">
                  <h5>Your Answer</h5>
                  <div className="student-answer">{currentResult.studentAnswer}</div>
                </div>
              )}

              {/* Reference answer */}
              <div className="result-section">
                <h5>Reference Answer Key Points</h5>
                <p className="reference-answer">{question.referenceAnswer}</p>
              </div>

              {/* Strengths / improvements / missing */}
              <div className="result-grid">
                {currentResult.strengths.length > 0 && (
                  <div className="result-list good">
                    <h5><CheckCircle size={14} /> Strengths</h5>
                    {currentResult.strengths.map((s, i) => <div key={i}>{s}</div>)}
                  </div>
                )}
                {currentResult.improvements.length > 0 && (
                  <div className="result-list improve">
                    <h5><AlertCircle size={14} /> Improvements</h5>
                    {currentResult.improvements.map((s, i) => <div key={i}>{s}</div>)}
                  </div>
                )}
                {currentResult.missingConcepts.length > 0 && (
                  <div className="result-list missing">
                    <h5><XCircle size={14} /> Missing Concepts</h5>
                    {currentResult.missingConcepts.map((s, i) => <div key={i}>{s}</div>)}
                  </div>
                )}
              </div>

              {/* Improvement tip */}
              <div className="result-tip">
                <AlertCircle size={13} />
                <span>
                  {currentResult.improvements[0]
                    ? `Tip: ${currentResult.improvements[0]}`
                    : 'Great answer — focus on edge cases for extra depth.'}
                </span>
              </div>

              {/* Navigation */}
              <div className="result-action">
                <button className="btn btn-primary" onClick={goNext}>
                  {isLast
                    ? <><Award size={16} /> View Final Results</>
                    : <>Next Question <ChevronRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RESULTS PHASE
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === 'results' && finalSession) {
    const pct        = finalSession.percentage || 0;
    const grade      = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Needs Practice';
    const gradeColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--info)' : pct >= 40 ? 'var(--warning)' : 'var(--error)';

    return (
      <div className="page-layout">
        <Navbar />
        <div className="page-content interview-page">
          <div className="container">
            <div className="final-results card animate-fade-in">
              <div className="final-header">
                <Award size={32} style={{ color: gradeColor }} />
                <div className="final-score" style={{ color: gradeColor }}>{pct}%</div>
                <div className="final-grade">{grade}</div>
                <p>{finalSession.role} · {finalSession.questionsAnswered} Questions</p>
              </div>

              <div className="final-breakdown">
                {results.map((r, i) => (
                  <div key={i} className="breakdown-item">
                    <span className="breakdown-q">Q{i + 1}: {r.question.question.slice(0, 60)}…</span>
                    <span className="breakdown-score" style={{ color: getScoreColor(r.score) }}>{r.score}/10</span>
                  </div>
                ))}
              </div>

              {finalSession.strengths.length > 0 && (
                <div className="final-section">
                  <h4>Your Strengths</h4>
                  {finalSession.strengths.map((s, i) => (
                    <div key={i} className="final-item good"><CheckCircle size={14} />{s}</div>
                  ))}
                </div>
              )}

              {finalSession.weaknesses.length > 0 && (
                <div className="final-section">
                  <h4>Areas to Improve</h4>
                  {finalSession.weaknesses.map((s, i) => (
                    <div key={i} className="final-item improve"><AlertCircle size={14} />{s}</div>
                  ))}
                </div>
              )}

              <div className="final-next">
                <h4>Recommended Next Steps</h4>
                <p>
                  {pct >= 70
                    ? 'Strong performance! Focus on advanced topics and system design. Practice more hard-difficulty questions.'
                    : pct >= 50
                    ? 'Good foundation. Review the missing concepts flagged above and practice more consistently.'
                    : 'Focus on understanding core concepts deeply. Use the AI Mentor to get explanations for topics you missed.'}
                </p>
              </div>

              <button className="btn btn-primary" onClick={() => { setPhase('setup'); setResults([]); setFinalSession(null); }}>
                <RefreshCw size={14} /> Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
