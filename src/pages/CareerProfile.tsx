import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, Target, TrendingUp, ArrowRight, BookOpen, Zap, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/roles';
import { generateCareerInsight } from '../services/aiService';
import Navbar from '../components/Navbar';
import './CareerProfile.css';

export default function CareerProfile() {
  const { profile, resumeAnalysis } = useApp();
  const navigate = useNavigate();
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    if (!profile) { navigate('/onboarding'); return; }
    generateCareerInsight(profile).then(text => {
      setInsight(text);
      setInsightLoading(false);
    });
  }, [profile]);

  if (!profile) return null;

  const matchedRole = ROLES.find(r => r.title.toLowerCase() === profile.targetRole.toLowerCase());
  const allSkills = [...profile.programmingLanguages, ...profile.technicalSkills, ...profile.tools];
  const skillLevel = allSkills.length <= 3 ? 'Beginner' : allSkills.length <= 8 ? 'Intermediate' : 'Advanced';

  const missingCoreSkills = matchedRole
    ? matchedRole.coreSkills.filter(s => !allSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())))
    : [];

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content cp-page">
        <div className="container">
          <div className="cp-header animate-fade-in">
            <div className="cp-header-left">
              <div className="cp-badge">
                <BrainCircuit size={14} />
                <span>AI Career Profile</span>
              </div>
              <h1>Your Career Profile</h1>
              <p>AI-generated analysis based on your academic background and skills</p>
            </div>
            <Link to="/career-hub" className="btn btn-primary">
              Open Career Hub <ArrowRight size={16} />
            </Link>
          </div>

          <div className="cp-grid">
            {/* Left column */}
            <div className="cp-left">
              {/* Identity card */}
              <div className="card cp-identity">
                <div className="cp-avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="cp-identity-info">
                  <h2>{profile.name}</h2>
                  <p>{profile.degree} · {profile.branch}</p>
                  <p className="cp-year">{profile.year}, {profile.semester}</p>
                </div>
                <div className="cp-skill-level">
                  <span className={`badge badge-${skillLevel === 'Beginner' ? 'muted' : skillLevel === 'Intermediate' ? 'primary' : 'success'}`}>
                    {skillLevel}
                  </span>
                </div>
              </div>

              {/* Career direction */}
              <div className="card cp-direction">
                <div className="cp-card-header">
                  <Target size={18} />
                  <h3>Career Direction</h3>
                </div>
                <div className="cp-direction-content">
                  <div className="cp-direction-row">
                    <span className="cp-direction-label">Current Stage</span>
                    <span className="cp-direction-value">{skillLevel} {profile.targetRole.split(' ').slice(-1)[0]} Developer</span>
                  </div>
                  <div className="cp-direction-arrow">↓</div>
                  <div className="cp-direction-row target">
                    <span className="cp-direction-label">Target Role</span>
                    <span className="cp-direction-value highlight">{profile.targetRole}</span>
                  </div>
                  <div className="cp-direction-row">
                    <span className="cp-direction-label">Domain</span>
                    <span className="cp-direction-value">{profile.targetCareer}</span>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="card">
                <div className="cp-card-header">
                  <Star size={18} />
                  <h3>Goals</h3>
                </div>
                <div className="cp-goals">
                  {profile.shortTermGoal && (
                    <div className="cp-goal">
                      <span className="cp-goal-label">Short Term</span>
                      <p>{profile.shortTermGoal}</p>
                    </div>
                  )}
                  {profile.longTermGoal && (
                    <div className="cp-goal">
                      <span className="cp-goal-label">Long Term</span>
                      <p>{profile.longTermGoal}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="cp-right">
              {/* AI Insight */}
              <div className="card cp-insight">
                <div className="cp-card-header">
                  <BrainCircuit size={18} />
                  <h3>AI Career Insight</h3>
                  <div className="ai-status" style={{ marginLeft: 'auto' }}>
                    <div className="status-dot" />
                    <span style={{ fontSize: 12, color: 'var(--success)' }}>AI Generated</span>
                  </div>
                </div>
                {insightLoading ? (
                  <div className="cp-insight-loading">
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: '60%' }} />
                  </div>
                ) : (
                  <p className="cp-insight-text">{insight}</p>
                )}
              </div>

              {/* Current Skills */}
              <div className="card">
                <div className="cp-card-header">
                  <Zap size={18} />
                  <h3>Current Skills</h3>
                  <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{allSkills.length} skills</span>
                </div>
                {allSkills.length > 0 ? (
                  <div className="cp-skills-group">
                    {profile.programmingLanguages.length > 0 && (
                      <div>
                        <div className="cp-skill-cat">Programming Languages</div>
                        <div className="skill-tags">
                          {profile.programmingLanguages.map(s => <span key={s} className="skill-tag selected" style={{ cursor: 'default' }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                    {profile.technicalSkills.length > 0 && (
                      <div>
                        <div className="cp-skill-cat">Technical Skills</div>
                        <div className="skill-tags">
                          {profile.technicalSkills.map(s => <span key={s} className="skill-tag selected" style={{ cursor: 'default' }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                    {profile.tools.length > 0 && (
                      <div>
                        <div className="cp-skill-cat">Tools</div>
                        <div className="skill-tags">
                          {profile.tools.map(s => <span key={s} className="skill-tag selected" style={{ cursor: 'default' }}>{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '32px 0' }}>
                    <p>No skills recorded yet. Update your profile to add skills.</p>
                  </div>
                )}
              </div>

              {/* Potential Skill Gaps */}
              <div className="card">
                <div className="cp-card-header">
                  <TrendingUp size={18} />
                  <h3>Potential Skill Gaps</h3>
                </div>
                {missingCoreSkills.length > 0 ? (
                  <div>
                    <p className="cp-gap-note">Core skills recommended for {profile.targetRole}:</p>
                    <div className="skill-tags" style={{ marginTop: 12 }}>
                      {missingCoreSkills.map(s => (
                        <span key={s} className="skill-tag" style={{ cursor: 'default', borderStyle: 'dashed' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : allSkills.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    Add your current skills to see gap analysis.
                  </p>
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--success)' }}>
                    ✓ You have the core skills for {profile.targetRole}. Focus on advanced skills and projects.
                  </p>
                )}
              </div>

              {/* Resume */}
              <div className="card">
                <div className="cp-card-header">
                  <BookOpen size={18} />
                  <h3>Resume Status</h3>
                </div>
                {resumeAnalysis.analyzed ? (
                  <div className="cp-resume-analyzed">
                    <div className="cp-resume-score">
                      <div className="score-circle">
                        <span>{resumeAnalysis.score}</span>
                        <small>/100</small>
                      </div>
                      <div>
                        <div className="score-label">Resume Score</div>
                        <div className="score-file">{resumeAnalysis.fileName}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="cp-resume-empty">
                    <p>No resume analyzed yet.</p>
                    <Link to="/career-hub" className="btn btn-secondary btn-sm">
                      Upload Resume →
                    </Link>
                  </div>
                )}
              </div>

              {/* Next step */}
              <div className="card cp-next-step">
                <h3>Recommended Next Step</h3>
                {matchedRole && missingCoreSkills.length > 0 ? (
                  <p>Start with <strong>{missingCoreSkills[0]}</strong> — it's the first core skill gap on your path to {profile.targetRole}.</p>
                ) : allSkills.length > 0 ? (
                  <p>Great foundation! Open your <strong>Learning Roadmap</strong> in Career Hub and start Stage 1.</p>
                ) : (
                  <p>Upload your resume and complete skill assessment to get your personalized next step.</p>
                )}
                <Link to="/career-hub" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                  Go to Career Hub →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
