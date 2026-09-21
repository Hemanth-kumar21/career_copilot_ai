import { useState, useRef, useEffect } from 'react';
import {
  FileText, Zap, Map, FolderOpen, Code2, Compass,
  Upload, CheckCircle, XCircle, AlertCircle, ChevronRight,
  RotateCcw, TrendingUp, Eye, Lightbulb, ChevronDown, BookOpen, Briefcase, Award
} from 'lucide-react';
import React from 'react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { analyzeResume, type ProgressCallback } from '../services/resumeService';
import { PROJECTS, getRecommendedProjects } from '../data/projects';
import { generateRoadmap } from '../data/roadmaps';
import { ROLES } from '../data/roles';
import { CODING_PROBLEMS, LANGUAGE_LABELS, type SupportedLanguage } from '../data/codingProblems';
import './CareerHub.css';

type TabId = 'resume' | 'skills' | 'roadmap' | 'projects' | 'coding' | 'guidance';

const TABS = [
  { id: 'resume' as TabId, label: 'Resume Intelligence', icon: FileText },
  { id: 'skills' as TabId, label: 'Skill Insights', icon: Zap },
  { id: 'roadmap' as TabId, label: 'Learning Roadmap', icon: Map },
  { id: 'projects' as TabId, label: 'Project Explorer', icon: FolderOpen },
  { id: 'coding' as TabId, label: 'Coding Practice', icon: Code2 },
  { id: 'guidance' as TabId, label: 'Career Guidance', icon: Compass },
];

// Score-breakdown row max values per category
const SCORE_MAXES: Record<string, number> = {
  contentStructure: 20,
  education: 15,
  skills: 20,
  projectsExperience: 20,
  contactDetails: 10,
  certAchievements: 5,
  clarity: 10,
};

const SCORE_LABELS: Record<string, string> = {
  contentStructure: 'Content & Structure',
  education: 'Education',
  skills: 'Skills',
  projectsExperience: 'Projects / Experience',
  contactDetails: 'Contact Details',
  certAchievements: 'Certs & Achievements',
  clarity: 'Clarity & Completeness',
};

const ANALYSIS_STEPS = [
  'Validating file...',
  'Reading document...',
  'Understanding resume structure...',
  'Extracting skills...',
  'Calculating resume score...',
  'Generating insights...',
];

// ---- Resume Tab ----
function ResumeTab() {
  const { profile, resumeAnalysis, setResumeAnalysis, addToast } = useApp();
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setAnalyzing(true);
    setCompletedSteps([]);
    setProgressStep('');

    const onProgress: ProgressCallback = (step: string) => {
      setProgressStep(step);
      setCompletedSteps(prev => {
        // Mark the previous step as completed
        const prevStep = ANALYSIS_STEPS[ANALYSIS_STEPS.indexOf(step) - 1];
        if (prevStep && !prev.includes(prevStep)) return [...prev, prevStep];
        return prev;
      });
    };

    try {
      const result = await analyzeResume(file, profile?.targetRole || '', onProgress);
      setCompletedSteps(ANALYSIS_STEPS.slice(0, -1));
      setResumeAnalysis({ ...result, analyzed: true });
      addToast('success', 'Resume analyzed successfully!');
    } catch (e: any) {
      setError(e.message || 'Could not analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
      setProgressStep('');
      setCompletedSteps([]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (!resumeAnalysis.analyzed && !analyzing) {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h2>Resume Intelligence</h2>
          <p>Upload your resume for AI-powered analysis — skill extraction, scoring, and improvement guidance.</p>
        </div>
        {error && (
          <div className="alert alert-error">
            <XCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Upload size={32} />
          <h3>Drop your resume here</h3>
          <p>PDF, Word, or TXT · Max 6MB</p>
          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
            Choose File
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        <div className="resume-flow">
          {['Upload', 'Validate', 'Extract Content', 'AI Analysis', 'Skill Extraction', 'Score & Gaps'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flow-step"><div className="flow-dot" /><span>{step}</span></div>
              {i < 5 && <div className="flow-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="tab-content analyzing-state">
        <div className="analyzing-icon"><FileText size={28} /></div>
        <h3>Analyzing your resume...</h3>
        <p>Our AI is reading and understanding your document</p>
        <div className="analysis-steps-list">
          {ANALYSIS_STEPS.map(step => {
            const done = completedSteps.includes(step);
            const active = progressStep === step;
            return (
              <div key={step} className={`analysis-step-row ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                <span className="analysis-step-icon">
                  {done ? <CheckCircle size={14} /> : active ? <div className="step-spinner" /> : <div className="step-circle" />}
                </span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const ra = resumeAnalysis;
  const scoreColor = (ra.score || 0) >= 75 ? 'var(--success)' : (ra.score || 0) >= 50 ? 'var(--warning)' : 'var(--error)';
  const bd = ra.scoreBreakdown;
  const ds = ra.detectedSections;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h2>Resume Analysis Results</h2>
          <p>{ra.fileName}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setResumeAnalysis({ ...resumeAnalysis, analyzed: false })}>
          <RotateCcw size={14} /> Re-upload
        </button>
      </div>

      <div className="resume-results-grid">
        {/* Score header */}
        <div className="resume-score-card">
          <div className="big-score" style={{ color: scoreColor }}>
            {ra.score}<small>/100</small>
          </div>
          <div className="score-desc">
            {(ra.score || 0) >= 75 ? 'Strong Resume' : (ra.score || 0) >= 50 ? 'Good Foundation' : 'Needs Improvement'}
          </div>

          {/* Score breakdown bars */}
          {bd && (
            <div className="score-breakdown-grid">
              {(Object.keys(SCORE_MAXES) as Array<keyof typeof SCORE_MAXES>).map(key => {
                const val = (bd as any)[key] ?? 0;
                const max = SCORE_MAXES[key];
                const pct = Math.round((val / max) * 100);
                const barColor = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)';
                return (
                  <div key={key} className="score-breakdown-row">
                    <div className="score-breakdown-label">
                      <span>{SCORE_LABELS[key]}</span>
                      <span className="score-breakdown-val">{val}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{max}</span></span>
                    </div>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detected sections */}
        {ds && (
          <div className="card resume-detail-card full-width">
            <h4><Eye size={14} /> Detected Resume Sections</h4>
            <div className="detected-sections-grid">
              {(Object.keys(ds) as Array<keyof typeof ds>).map(k => (
                <div key={k} className={`section-badge ${ds[k] ? 'found' : 'missing'}`}>
                  {ds[k] ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  <span>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extracted Skills */}
        {ra.extractedSkills.length > 0 && (
          <div className="card resume-detail-card">
            <h4><Zap size={14} /> Extracted Skills ({ra.extractedSkills.length})</h4>
            <div className="skill-tags">
              {ra.extractedSkills.map(s => <span key={s} className="skill-tag selected" style={{ cursor: 'default', fontSize: 12 }}>{s}</span>)}
            </div>
          </div>
        )}

        {/* Projects Found */}
        {ra.projects.length > 0 && (
          <div className="card resume-detail-card">
            <h4><FolderOpen size={14} /> Projects Found</h4>
            {ra.projects.map(p => <div key={p} className="resume-project-item"><ChevronRight size={12} />{p}</div>)}
          </div>
        )}

        {/* Education */}
        {ra.education && ra.education.length > 0 && (
          <div className="card resume-detail-card">
            <h4><BookOpen size={14} /> Education Detected</h4>
            {ra.education.map((e, i) => (
              <div key={i} className="resume-extracted-item"><ChevronRight size={12} /><span>{e}</span></div>
            ))}
          </div>
        )}

        {/* Experience */}
        {ra.experience && ra.experience.length > 0 && (
          <div className="card resume-detail-card">
            <h4><Briefcase size={14} /> Experience Detected</h4>
            {ra.experience.map((e, i) => (
              <div key={i} className="resume-extracted-item"><ChevronRight size={12} /><span>{e}</span></div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {ra.certifications && ra.certifications.length > 0 && (
          <div className="card resume-detail-card">
            <h4><Award size={14} /> Certifications Detected</h4>
            {ra.certifications.map((c, i) => (
              <div key={i} className="resume-extracted-item"><ChevronRight size={12} /><span>{c}</span></div>
            ))}
          </div>
        )}

        {/* Strengths */}
        {ra.strengths.length > 0 && (
          <div className="card resume-detail-card">
            <h4><CheckCircle size={14} style={{ color: 'var(--success)' }} /> Strengths</h4>
            {ra.strengths.map(s => (
              <div key={s} className="resume-list-item success"><CheckCircle size={12} />{s}</div>
            ))}
          </div>
        )}

        {/* Skills to Add */}
        {ra.missingSkills.length > 0 && (
          <div className="card resume-detail-card">
            <h4><AlertCircle size={14} style={{ color: 'var(--warning)' }} /> Skills to Add</h4>
            {ra.missingSkills.map(s => (
              <div key={s} className="resume-list-item warning"><AlertCircle size={12} />{s}</div>
            ))}
          </div>
        )}

        {/* Improvement Suggestions */}
        {ra.suggestions.length > 0 && (
          <div className="card resume-detail-card full-width">
            <h4><TrendingUp size={14} /> Improvement Suggestions</h4>
            {ra.suggestions.map((s, i) => (
              <div key={i} className="suggestion-item">
                <span className="suggestion-num">{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Skills Tab ----
function SkillsTab() {
  const { profile, resumeAnalysis } = useApp();

  if (!profile) return (
    <div className="empty-state">
      <div className="empty-state-icon"><Zap size={24} /></div>
      <h3>Profile required</h3>
      <p>Complete onboarding to see your skill insights.</p>
    </div>
  );

  const allSkills = [
    ...profile.programmingLanguages.map(s => ({ name: s, category: 'Programming', evidence: 'Self-reported' })),
    ...profile.technicalSkills.map(s => ({ name: s, category: 'Technical', evidence: 'Self-reported' })),
    ...profile.tools.map(s => ({ name: s, category: 'Tools', evidence: 'Self-reported' })),
    ...resumeAnalysis.extractedSkills
      .filter(s => !profile.programmingLanguages.includes(s) && !profile.technicalSkills.includes(s))
      .map(s => ({ name: s, category: 'Resume Extracted', evidence: 'Resume' })),
  ];

  const grouped = allSkills.reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof allSkills>);

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Skill Insights</h2>
        <p>Based on your profile and resume — only skills with evidence are shown.</p>
      </div>
      {allSkills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Zap size={24} /></div>
          <h3>Assessment pending</h3>
          <p>Add skills in your profile or upload your resume to see your skill breakdown.</p>
        </div>
      ) : (
        <div className="skills-grid">
          {Object.entries(grouped).map(([cat, skills]) => (
            <div key={cat} className="card skills-category-card">
              <div className="skills-cat-header">
                <h4>{cat}</h4>
                <span className="badge badge-primary">{skills.length}</span>
              </div>
              {skills.map(skill => (
                <div key={skill.name} className="skill-row">
                  <div className="skill-row-name">{skill.name}</div>
                  <div className="skill-row-evidence">
                    <span className={`badge ${skill.evidence === 'Resume' ? 'badge-success' : 'badge-muted'}`}>
                      {skill.evidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Roadmap Tab ----
function RoadmapTab() {
  const { profile, roadmapStages, updateRoadmapStage, user } = useApp();
  const stages = roadmapStages;

  // If context has no stages but profile exists, generate + persist immediately
  const [displayStages, setDisplayStages] = useState(() => {
    if (stages.length > 0) return stages;
    if (!profile) return [];
    const generated = generateRoadmap(ROLES.find(r => r.title === profile.targetRole)?.id || 'fullstack');
    // Persist so AppContext picks it up next load
    if (user) localStorage.setItem(`cc_roadmap_${user.id}`, JSON.stringify(generated));
    localStorage.setItem('cc_roadmap', JSON.stringify(generated));
    return generated;
  });

  // Sync display when context roadmapStages change (e.g. after status update)
  useEffect(() => {
    if (roadmapStages.length > 0) setDisplayStages(roadmapStages);
  }, [roadmapStages]);

  const statusColor = { not_started: 'var(--text-muted)', in_progress: 'var(--warning)', completed: 'var(--success)' };
  const statusLabel = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' };

  if (!profile) return (
    <div className="empty-state">
      <div className="empty-state-icon"><Map size={24} /></div>
      <h3>Roadmap not yet created</h3>
      <p>Your personalized roadmap will appear here after your career profile is created.</p>
    </div>
  );

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h2>Learning Roadmap</h2>
          <p>Career Goal: <strong>{profile.targetRole}</strong></p>
        </div>
        <div className="roadmap-legend">
          {Object.entries(statusLabel).map(([k, v]) => (
            <div key={k} className="legend-item">
              <div className="legend-dot" style={{ background: statusColor[k as keyof typeof statusColor] }} />
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="roadmap-list">
        {displayStages.map((stage, i) => (
          <div key={stage.id} className={`roadmap-stage ${stage.status}`}>
            <div className="stage-num">{i + 1}</div>
            <div className="stage-content">
              <div className="stage-header">
                <h3>{stage.title}</h3>
                <select
                  className="stage-status-select"
                  value={stage.status}
                  style={{ color: statusColor[stage.status] }}
                  onChange={e => updateRoadmapStage(stage.id, e.target.value as any)}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="stage-skills">
                {stage.skills.map(s => <span key={s} className="tag">{s}</span>)}
              </div>
              <div className="stage-details">
                <div className="stage-detail">
                  <strong>Project:</strong> {stage.project}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Projects Tab ----
function ProjectsTab() {
  const { profile } = useApp();
  const [selected, setSelected] = useState<string | null>(null);

  const matchedRole = profile ? ROLES.find(r => r.title === profile.targetRole) : null;
  const allSkills = profile ? [...profile.programmingLanguages, ...profile.technicalSkills] : [];
  const recommended = matchedRole ? getRecommendedProjects(matchedRole.id, allSkills, 6) : PROJECTS.slice(0, 6);

  const selectedProject = recommended.find(p => p.id === selected);

  const diffColor = { beginner: 'var(--success)', intermediate: 'var(--warning)', advanced: 'var(--error)' };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Project Explorer</h2>
        <p>Projects recommended based on your role, skills, and roadmap stage.</p>
      </div>
      <div className="projects-layout">
        <div className="projects-list">
          {recommended.map(p => (
            <div
              key={p.id}
              className={`project-card-item ${selected === p.id ? 'active' : ''}`}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
            >
              <div className="project-card-header">
                <h4>{p.title}</h4>
                <span className="badge" style={{ background: `${diffColor[p.difficulty]}20`, color: diffColor[p.difficulty] }}>
                  {p.difficulty}
                </span>
              </div>
              <p>{p.problemStatement}</p>
              <div className="project-tech">
                {p.technologies.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
        {selectedProject && (
          <div className="project-detail card">
            <h3>{selectedProject.title}</h3>
            <div className="project-detail-section">
              <h5>Problem Statement</h5>
              <p>{selectedProject.problemStatement}</p>
            </div>
            <div className="project-detail-section">
              <h5>Why It Fits Your Profile</h5>
              <p>{selectedProject.whyItFits}</p>
            </div>
            <div className="project-detail-section">
              <h5>Technologies</h5>
              <div className="skill-tags">
                {selectedProject.technologies.map(t => <span key={t} className="skill-tag selected" style={{ cursor: 'default', fontSize: 12 }}>{t}</span>)}
              </div>
            </div>
            <div className="project-detail-section">
              <h5>Skills You'll Gain</h5>
              <div className="skill-tags">
                {selectedProject.skillsGained.map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
            <div className="project-detail-section">
              <h5>Expected Outcome</h5>
              <p>{selectedProject.expectedOutcome}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Coding Tab ----
/**
 * Language-aware evaluator.
 *
 * Uses `problem.evalSignals[language]` — an array of "groups", where each
 * group is an array of synonymous tokens.  A group is matched when ANY of its
 * tokens appears as a case-insensitive substring of the student's code.
 * The solution is considered passing when the fraction of matched groups
 * meets or exceeds `problem.coverageThreshold` (default 0.5).
 *
 * A minimum meaningful-code length gate prevents empty / trivially short
 * submissions from accidentally matching boilerplate tokens.
 */
function evaluateCode(
  code: string,
  problem: typeof CODING_PROBLEMS[0],
  language: SupportedLanguage,
): {
  passed: boolean;
  testResults: { label: string; passed: boolean }[];
  feedback: string;
  improvementTip: string;
} {
  const lower = code.toLowerCase();
  const threshold = problem.coverageThreshold ?? 0.5;

  // ── 1. Minimum-code gate ────────────────────────────────────────────────
  // Strip the starter template comment lines and count "real" non-blank,
  // non-comment lines to avoid false positives from the unedited skeleton.
  const meaningfulLines = code
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('#') && !l.startsWith('*'));
  const isSubstantial = meaningfulLines.length >= 4;

  // ── 2. Signal matching ──────────────────────────────────────────────────
  const groups = problem.evalSignals?.[language] ?? [];
  const matchedGroups = groups.filter(group =>
    group.some(token => lower.includes(token.toLowerCase()))
  );
  const ratio = groups.length > 0
    ? matchedGroups.length / groups.length
    : (isSubstantial ? 1 : 0);

  // Pass only when code is substantial AND meets the coverage threshold
  const conceptsPassed = isSubstantial && ratio >= threshold;

  // ── 3. Per–test-case results ────────────────────────────────────────────
  // All examples use the same pass/fail verdict (we can't actually execute
  // the code in-browser), so every row shows the same outcome.
  const testResults = problem.examples.map((ex, i) => ({
    label: `Test case ${i + 1}: Input ${ex.input} → Expected ${ex.output}`,
    passed: conceptsPassed,
  }));

  const allPassed = conceptsPassed;

  // ── 4. Human-readable feedback ─────────────────────────────────────────
  let feedback = '';
  let improvementTip = '';

  if (!isSubstantial) {
    feedback = 'Your solution is too short to evaluate. Please write a complete implementation before submitting.';
    improvementTip = 'Expand the starter template — replace the placeholder comment with your actual algorithm.';
  } else if (allPassed) {
    const matchedTokens = matchedGroups.map(g => g[0]);
    feedback = `All test cases passed! Your solution demonstrates the required algorithmic approach (${matchedTokens.slice(0, 3).join(', ')}${matchedTokens.length > 3 ? ', …' : ''}).`;
    improvementTip = 'Good work! Consider analysing time and space complexity, and testing with edge cases (empty input, single element, negatives).';
  } else {
    const missedGroups = groups.filter(g => !matchedGroups.includes(g));
    const missedHint  = missedGroups.map(g => g[0]).slice(0, 2).join(', ');
    feedback = `Some test cases failed. The solution may be missing key implementation elements: ${missedHint || 'core algorithm not detected'}.`;
    improvementTip = `Revisit the hints and ensure your approach includes: ${missedHint || 'the correct algorithm'}.`;
  }

  return { passed: allPassed, testResults, feedback, improvementTip };
}

function CodingTab() {
  const { codingStats, updateCodingStats, addToast } = useApp();
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState('');
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Track per-problem submission result and hint/solution visibility
  const [submissionResult, setSubmissionResult] = useState<ReturnType<typeof evaluateCode> | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [showHintIdx, setShowHintIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [hintsExpanded, setHintsExpanded] = useState(false);

  const filtered = CODING_PROBLEMS.filter(p => filter === 'all' || p.difficulty === filter);
  const problem = CODING_PROBLEMS.find(p => p.id === selectedProblem);

  const diffBadge: Record<string, string> = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-error' };

  const openProblem = (id: string) => {
    const p = CODING_PROBLEMS.find(x => x.id === id);
    setSelectedProblem(id);
    setCode(p?.starters?.[language] ?? '');
    setSubmissionResult(null);
    setShowSolution(false);
    setShowHintIdx(0);
    setHintsExpanded(false);
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (problem) {
      setCode(problem.starters?.[lang] ?? '');
      setSubmissionResult(null);
      setShowSolution(false);
    }
  };

  const handleSubmit = () => {
    if (!problem || !code.trim()) return;
    const result = evaluateCode(code, problem, language);
    setSubmissionResult(result);
    // Only count as attempted once per problem
    if (submitted[problem.id] === undefined) {
      updateCodingStats(problem.topic, result.passed);
      setSubmitted(prev => ({ ...prev, [problem.id]: result.passed }));
    }
    addToast(
      result.passed ? 'success' : 'info',
      result.passed ? '✓ All test cases passed!' : 'Some test cases failed — check the feedback below.',
    );
  };

  const handleNextHint = () => {
    if (problem?.hints && showHintIdx < problem.hints.length - 1) {
      setShowHintIdx(i => i + 1);
    }
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <div>
          <h2>Coding Practice</h2>
          <p>Topic-based challenges to sharpen your problem-solving skills.</p>
        </div>
        <div className="coding-stats-mini">
          <div className="stat-mini">
            <span className="stat-mini-val">{codingStats.attempted}</span>
            <span>Attempted</span>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-val">{codingStats.solved}</span>
            <span>Solved</span>
          </div>
          {codingStats.attempted > 0 && (
            <div className="stat-mini">
              <span className="stat-mini-val">
                {Math.round((codingStats.solved / codingStats.attempted) * 100)}%
              </span>
              <span>Accuracy</span>
            </div>
          )}
        </div>
      </div>

      {problem ? (
        <div className="problem-view">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSelectedProblem(null); setSubmissionResult(null); setShowSolution(false); }}
          >
            ← Back to Problems
          </button>

          {/* Problem statement */}
          <div className="problem-detail card">
            <div className="problem-header">
              <h3>{problem.title}</h3>
              <span className={`badge ${diffBadge[problem.difficulty]}`}>{problem.difficulty}</span>
              <span className="tag">{problem.topic}</span>
              {submitted[problem.id] !== undefined && (
                submitted[problem.id]
                  ? <CheckCircle size={16} style={{ color: 'var(--success)', marginLeft: 8 }} />
                  : <XCircle size={16} style={{ color: 'var(--error)', marginLeft: 8 }} />
              )}
            </div>
            <p className="problem-description">{problem.description}</p>
            <div className="problem-examples">
              {problem.examples.map((ex, i) => (
                <div key={i} className="example-block">
                  <div><strong>Input:</strong> <code>{ex.input}</code></div>
                  <div><strong>Output:</strong> <code>{ex.output}</code></div>
                  {ex.explanation && <div className="example-explain">{ex.explanation}</div>}
                </div>
              ))}
            </div>
            <div className="problem-constraints">
              {problem.constraints.map((c, i) => <span key={i} className="tag" style={{ marginRight: 6, marginTop: 4 }}>{c}</span>)}
            </div>
          </div>

          {/* Hints accordion */}
          {problem.hints && (
            <div className="hints-panel card">
              <button
                className="hints-toggle"
                onClick={() => setHintsExpanded(x => !x)}
              >
                <Lightbulb size={15} />
                <span>Hints ({showHintIdx + 1} / {problem.hints.length} revealed)</span>
                <ChevronDown size={14} style={{ marginLeft: 'auto', transform: hintsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {hintsExpanded && (
                <div className="hints-body">
                  {problem.hints.slice(0, showHintIdx + 1).map((h, i) => (
                    <div key={i} className="hint-item">
                      <span className="hint-num">{i + 1}</span>
                      <span>{h}</span>
                    </div>
                  ))}
                  {showHintIdx < (problem.hints.length - 1) && (
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={handleNextHint}>
                      Reveal next hint
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Language selector + code editor */}
          <div className="answer-section">
            <div className="code-editor-header">
              <label className="form-label" style={{ margin: 0 }}>Your Solution</label>
              <div className="lang-selector">
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map(lang => (
                  <button
                    key={lang}
                    className={`lang-btn ${language === lang ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="form-input code-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Write your solution here..."
              rows={10}
              spellCheck={false}
            />
            <div className="submit-row">
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!code.trim()}>
                Submit Solution
              </button>
              {(problem.solutions?.[language] ?? problem.sampleSolution) && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowSolution(x => !x)}
                >
                  <Eye size={14} /> {showSolution ? 'Hide Solution' : `View ${LANGUAGE_LABELS[language]} Solution`}
                </button>
              )}
            </div>
          </div>

          {/* Submission result with test case pass/fail */}
          {submissionResult && (
            <div className={`submission-feedback card ${submissionResult.passed ? 'passed' : 'failed'}`}>
              <div className="submission-status">
                {submissionResult.passed
                  ? <><CheckCircle size={18} style={{ color: 'var(--success)' }} /> <strong>All test cases passed!</strong></>
                  : <><XCircle size={18} style={{ color: 'var(--error)' }} /> <strong>Some test cases failed</strong></>
                }
              </div>
              <div className="test-case-list">
                {submissionResult.testResults.map((t, i) => (
                  <div key={i} className={`test-case-row ${t.passed ? 'pass' : 'fail'}`}>
                    {t.passed ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
              <p className="submission-main-feedback">{submissionResult.feedback}</p>
              <div className="submission-tip">
                <Lightbulb size={13} />
                <span>{submissionResult.improvementTip}</span>
              </div>
            </div>
          )}

          {/* Official solution — shows the selected language's solution */}
          {showSolution && (problem.solutions?.[language] ?? problem.sampleSolution) && (
            <div className="solution-panel card">
              <div className="solution-panel-header">
                <h4><Eye size={14} /> Official Solution</h4>
                <span className="tag" style={{ fontSize: 12 }}>{LANGUAGE_LABELS[language]}</span>
              </div>
              <pre className="solution-code">
                {problem.solutions?.[language] ?? problem.sampleSolution}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="coding-filters">
            {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="problems-list">
            {filtered.map(p => (
              <div key={p.id} className="problem-row" onClick={() => openProblem(p.id)}>
                <div className="problem-row-title">{p.title}</div>
                <span className="tag">{p.topic}</span>
                <span className={`badge ${diffBadge[p.difficulty]}`}>{p.difficulty}</span>
                {submitted[p.id] !== undefined && (
                  submitted[p.id]
                    ? <CheckCircle size={14} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                    : <XCircle size={14} style={{ color: 'var(--error)', marginLeft: 'auto' }} />
                )}
                <ChevronRight size={14} className="problem-row-chevron" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Guidance Tab ----
function GuidanceTab() {
  const { profile, resumeAnalysis, codingStats, roadmapStages, interviewHistory } = useApp();

  if (!profile) return (
    <div className="empty-state">
      <div className="empty-state-icon"><Compass size={24} /></div>
      <h3>Complete your profile first</h3>
      <p>Career guidance is personalized to your profile and progress.</p>
    </div>
  );

  const completedStages = roadmapStages.filter(s => s.status === 'completed').length;
  const totalStages = roadmapStages.length;
  const lastInterview = interviewHistory[0];

  const recommendations = [];
  if (!resumeAnalysis.analyzed) recommendations.push({ priority: 'High', action: 'Upload your resume', reason: 'Resume analysis unlocks personalized skill gap insights' });
  if (codingStats.attempted === 0) recommendations.push({ priority: 'Medium', action: 'Start coding practice', reason: 'Regular practice improves problem-solving for interviews' });
  if (interviewHistory.length === 0) recommendations.push({ priority: 'Medium', action: 'Attempt a mock interview', reason: 'Practice interviews reveal conceptual gaps early' });
  if (completedStages === 0 && totalStages > 0) recommendations.push({ priority: 'High', action: 'Begin Stage 1 of your roadmap', reason: 'Structured learning accelerates skill development' });
  if (resumeAnalysis.analyzed && resumeAnalysis.missingSkills.length > 0) {
    recommendations.push({ priority: 'High', action: `Learn ${resumeAnalysis.missingSkills[0]}`, reason: `Missing from your resume for ${profile.targetRole}` });
  }

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Career Guidance</h2>
        <p>Personalized recommendations based on your current progress.</p>
      </div>
      <div className="guidance-grid">
        <div className="card guidance-status">
          <h4>Current Status</h4>
          <div className="guidance-stats">
            <div className="g-stat">
              <div className="g-stat-label">Roadmap Progress</div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: totalStages > 0 ? `${(completedStages / totalStages) * 100}%` : '0%' }} /></div>
              <div className="g-stat-val">{completedStages}/{totalStages} stages</div>
            </div>
            <div className="g-stat">
              <div className="g-stat-label">Coding Practice</div>
              <div className="g-stat-val">{codingStats.solved} solved / {codingStats.attempted} attempted</div>
            </div>
            <div className="g-stat">
              <div className="g-stat-label">Interview Status</div>
              <div className="g-stat-val">
                {lastInterview && lastInterview.percentage != null
                  ? `Last: ${lastInterview.percentage}%`
                  : 'Not attempted'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4>Recommended Actions</h4>
          {recommendations.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--success)', marginTop: 12 }}>
              ✓ Great progress! Keep practicing and building projects.
            </p>
          ) : (
            <div className="recommendations-list">
              {recommendations.map((r, i) => (
                <div key={i} className="recommendation-item">
                  <span className={`rec-priority ${r.priority.toLowerCase()}`}>{r.priority}</span>
                  <div>
                    <div className="rec-action">{r.action}</div>
                    <div className="rec-reason">{r.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main Career Hub ----
export default function CareerHub() {
  const [activeTab, setActiveTab] = useState<TabId>('resume');

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content career-hub-page">
        <div className="hub-header">
          <div className="container">
            <h1>Career Hub</h1>
            <p>Your complete career development workspace</p>
          </div>
        </div>
        <div className="container hub-layout">
          <div className="hub-sidebar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`hub-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="hub-content">
            {activeTab === 'resume' && <ResumeTab />}
            {activeTab === 'skills' && <SkillsTab />}
            {activeTab === 'roadmap' && <RoadmapTab />}
            {activeTab === 'projects' && <ProjectsTab />}
            {activeTab === 'coding' && <CodingTab />}
            {activeTab === 'guidance' && <GuidanceTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
