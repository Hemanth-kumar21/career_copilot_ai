import { Link } from 'react-router-dom';
import {
  FileText, Zap, Map, Code2,
  MessageSquare, ArrowRight, TrendingUp, Target,
  BrainCircuit, AlertCircle, CheckCircle, BarChart2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import { ROLES } from '../data/roles';
import './Dashboard.css';

export default function Dashboard() {
  const { user, profile, resumeAnalysis, roadmapStages, codingStats, interviewHistory } = useApp();

  const allSkills = profile ? [...profile.programmingLanguages, ...profile.technicalSkills, ...profile.tools] : [];
  const matchedRole = profile ? ROLES.find(r => r.title === profile.targetRole) : null;
  const completedStages = roadmapStages.filter(s => s.status === 'completed').length;
  const inProgressStages = roadmapStages.filter(s => s.status === 'in_progress').length;
  const totalStages = roadmapStages.length;
  const roadmapPct = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  const lastInterview = interviewHistory[0];

  const missingCoreSkills = matchedRole
    ? matchedRole.coreSkills.filter(s =>
        !allSkills.some(us => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
      )
    : [];

  const nextStep = (() => {
    if (!profile) return 'Complete your student onboarding to get started.';
    if (!resumeAnalysis.analyzed) return 'Upload your resume in Career Hub for skill gap analysis.';
    if (interviewHistory.length === 0) return 'Attempt a mock interview to assess your readiness.';
    if (completedStages === 0 && totalStages > 0) return 'Begin Stage 1 of your learning roadmap.';
    if (codingStats.attempted < 5) return 'Practice more coding challenges to build problem-solving skills.';
    if (missingCoreSkills.length > 0) return `Focus on learning ${missingCoreSkills[0]} — a core skill for ${profile.targetRole}.`;
    return 'Keep building projects and refining your skills. You\'re on track!';
  })();

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content dashboard-page">
        <div className="dashboard-hero">
          <div className="container">
            <div className="dashboard-welcome animate-fade-in">
              <div className="welcome-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p>
                  {profile
                    ? `Tracking your journey toward ${profile.targetRole}`
                    : 'Complete your profile to start your personalized journey.'}
                </p>
              </div>
              {!profile && (
                <Link to="/onboarding" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                  Complete Setup <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container dashboard-content">
          {/* Next Best Step */}
          <div className="next-step-banner animate-fade-in">
            <div className="next-step-icon"><BrainCircuit size={20} /></div>
            <div className="next-step-text">
              <span className="next-step-label">Your Next Best Step</span>
              <p>{nextStep}</p>
            </div>
            <Link to="/career-hub" className="btn btn-primary btn-sm">
              Take Action <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stats row */}
          <div className="dashboard-stats animate-fade-in">
            {/* Career Goal */}
            <div className="stat-card">
              <div className="stat-card-icon target"><Target size={20} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Target Role</div>
                <div className="stat-card-value">{profile?.targetRole || '—'}</div>
                <div className="stat-card-sub">{profile?.targetCareer || 'Not set'}</div>
              </div>
            </div>

            {/* Resume */}
            <div className="stat-card">
              <div className="stat-card-icon resume"><FileText size={20} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Resume Score</div>
                <div className="stat-card-value">
                  {resumeAnalysis.analyzed ? `${resumeAnalysis.score}/100` : '—'}
                </div>
                <div className="stat-card-sub">
                  {resumeAnalysis.analyzed ? `${resumeAnalysis.extractedSkills.length} skills found` : 'Not analyzed'}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="stat-card">
              <div className="stat-card-icon skills"><Zap size={20} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Skills</div>
                <div className="stat-card-value">{allSkills.length > 0 ? allSkills.length : '—'}</div>
                <div className="stat-card-sub">
                  {allSkills.length > 0
                    ? `${missingCoreSkills.length} core gaps`
                    : 'Assessment pending'}
                </div>
              </div>
            </div>

            {/* Coding */}
            <div className="stat-card">
              <div className="stat-card-icon coding"><Code2 size={20} /></div>
              <div className="stat-card-content">
                <div className="stat-card-label">Coding</div>
                <div className="stat-card-value">{codingStats.solved}/{codingStats.attempted}</div>
                <div className="stat-card-sub">
                  {codingStats.attempted === 0 ? '0 attempts' : `${Math.round((codingStats.solved / codingStats.attempted) * 100)}% accuracy`}
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid animate-fade-in">
            {/* Roadmap Progress */}
            <div className="card dashboard-roadmap">
              <div className="dash-card-header">
                <Map size={18} />
                <h3>Roadmap Progress</h3>
                <Link to="/career-hub" className="card-link">View →</Link>
              </div>
              {totalStages > 0 ? (
                <div>
                  <div className="roadmap-progress-row">
                    <div className="roadmap-pct" style={{ color: roadmapPct > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {roadmapPct}%
                    </div>
                    <div className="roadmap-progress-info">
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${roadmapPct}%` }} /></div>
                      <div className="roadmap-progress-sub">{completedStages} completed · {inProgressStages} in progress · {totalStages - completedStages - inProgressStages} remaining</div>
                    </div>
                  </div>
                  <div className="roadmap-stages-preview">
                    {roadmapStages.slice(0, 4).map((stage) => (
                      <div key={stage.id} className={`stage-preview ${stage.status}`}>
                        <div className="stage-preview-dot" />
                        <span>{stage.title}</span>
                        <span className={`stage-badge ${stage.status}`}>
                          {stage.status === 'not_started' ? 'Not Started' : stage.status === 'in_progress' ? 'In Progress' : 'Done'}
                        </span>
                      </div>
                    ))}
                    {totalStages > 4 && <div className="stage-more">+{totalStages - 4} more stages</div>}
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p>Your personalized roadmap will appear here after your career profile is created.</p>
                  {!profile && <Link to="/onboarding" className="btn btn-secondary btn-sm">Complete Setup</Link>}
                </div>
              )}
            </div>

            {/* Skill Gaps */}
            <div className="card">
              <div className="dash-card-header">
                <TrendingUp size={18} />
                <h3>Skill Analysis</h3>
                <Link to="/career-hub" className="card-link">View →</Link>
              </div>
              {allSkills.length > 0 ? (
                <div>
                  <div className="skill-group">
                    <div className="skill-group-label">
                      <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                      Current Skills ({allSkills.length})
                    </div>
                    <div className="skill-tags">
                      {allSkills.slice(0, 8).map(s => (
                        <span key={s} className="skill-tag selected" style={{ cursor: 'default', fontSize: 12 }}>{s}</span>
                      ))}
                      {allSkills.length > 8 && <span className="tag">+{allSkills.length - 8}</span>}
                    </div>
                  </div>
                  {missingCoreSkills.length > 0 && (
                    <div className="skill-group">
                      <div className="skill-group-label">
                        <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
                        Core Gaps for {profile?.targetRole}
                      </div>
                      <div className="skill-tags">
                        {missingCoreSkills.map(s => (
                          <span key={s} className="skill-tag" style={{ cursor: 'default', borderStyle: 'dashed', fontSize: 12 }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p>Assessment pending. Add your skills during onboarding.</p>
                </div>
              )}
            </div>

            {/* Interview Performance */}
            <div className="card">
              <div className="dash-card-header">
                <MessageSquare size={18} />
                <h3>Interview Performance</h3>
                <Link to="/interview" className="card-link">Practice →</Link>
              </div>
              {interviewHistory.length > 0 ? (
                <div>
                  <div className="interview-history">
                    {interviewHistory.slice(0, 3).map(session => (
                      <div key={session.id} className="interview-hist-item">
                        <div className="hist-role">{session.role}</div>
                        <div className="hist-date">{new Date(session.date).toLocaleDateString()}</div>
                        <div
                          className="hist-score"
                          style={{ color: (session.percentage || 0) >= 60 ? 'var(--success)' : 'var(--warning)' }}
                        >
                          {session.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                  {lastInterview && (
                    <div className="last-interview-summary">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${lastInterview.percentage}%` }} />
                      </div>
                      <div className="progress-labels">
                        <span>Last Score</span>
                        <span>{lastInterview.percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p>No interview completed yet.</p>
                  <Link to="/interview" className="btn btn-secondary btn-sm">Start Mock Interview</Link>
                </div>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="card dashboard-ai-rec">
              <div className="dash-card-header">
                <BrainCircuit size={18} />
                <h3>AI Recommendations</h3>
                <Link to="/ai-mentor" className="card-link">Ask Mentor →</Link>
              </div>
              <div className="ai-recs">
                {!resumeAnalysis.analyzed && (
                  <div className="ai-rec-item">
                    <span className="rec-dot high" />
                    <div>
                      <div className="ai-rec-title">Analyze your resume</div>
                      <div className="ai-rec-sub">Unlock personalized skill gap insights and improvement tips</div>
                    </div>
                  </div>
                )}
                {profile && missingCoreSkills.slice(0, 2).map(skill => (
                  <div key={skill} className="ai-rec-item">
                    <span className="rec-dot medium" />
                    <div>
                      <div className="ai-rec-title">Learn {skill}</div>
                      <div className="ai-rec-sub">Core skill required for {profile.targetRole}</div>
                    </div>
                  </div>
                ))}
                {codingStats.attempted < 3 && (
                  <div className="ai-rec-item">
                    <span className="rec-dot low" />
                    <div>
                      <div className="ai-rec-title">Practice coding problems</div>
                      <div className="ai-rec-sub">Build problem-solving confidence for technical interviews</div>
                    </div>
                  </div>
                )}
                {interviewHistory.length === 0 && (
                  <div className="ai-rec-item">
                    <span className="rec-dot medium" />
                    <div>
                      <div className="ai-rec-title">Attempt your first mock interview</div>
                      <div className="ai-rec-sub">Identify conceptual gaps before real interviews</div>
                    </div>
                  </div>
                )}
                {resumeAnalysis.analyzed && missingCoreSkills.length === 0 && codingStats.attempted > 0 && (
                  <div className="ai-rec-item">
                    <span className="rec-dot low" />
                    <div>
                      <div className="ai-rec-title">Great progress!</div>
                      <div className="ai-rec-sub">Keep building projects and refining your portfolio</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coding Topic Breakdown */}
          {Object.keys(codingStats.topicPerformance).length > 0 && (
            <div className="card coding-breakdown animate-fade-in">
              <div className="dash-card-header">
                <BarChart2 size={18} />
                <h3>Coding Practice Breakdown</h3>
                <Link to="/career-hub" className="card-link">Practice →</Link>
              </div>
              <div className="topic-breakdown-grid">
                {Object.entries(codingStats.topicPerformance).map(([topic, stats]) => {
                  const pct = stats.attempted > 0 ? Math.round((stats.solved / stats.attempted) * 100) : 0;
                  return (
                    <div key={topic} className="topic-breakdown-item">
                      <div className="topic-breakdown-header">
                        <span className="topic-name">{topic}</span>
                        <span className="topic-score" style={{ color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)' }}>
                          {stats.solved}/{stats.attempted}
                        </span>
                      </div>
                      <div className="progress-bar" style={{ height: 5 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pct}% accuracy</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="quick-links animate-fade-in">
            <Link to="/career-hub" className="quick-link-card">
              <FileText size={20} />
              <span>Resume Intelligence</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/ai-mentor" className="quick-link-card">
              <BrainCircuit size={20} />
              <span>Ask AI Mentor</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/interview" className="quick-link-card">
              <MessageSquare size={20} />
              <span>Mock Interview</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/career-profile" className="quick-link-card">
              <Target size={20} />
              <span>Career Profile</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
