import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit, Map, FolderOpen, Code2,
  MessageSquare, FileText, ArrowRight, CheckCircle,
  Shield
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const FEATURES = [
  { icon: BrainCircuit, title: 'AI Career Mentor', desc: 'Ask anything about your career, skills, or next steps. Get personalized, context-aware answers.', color: '#4f46e5' },
  { icon: FileText, title: 'Resume Intelligence', desc: 'Upload your resume for AI analysis — skill extraction, scoring, and actionable improvement tips.', color: '#7c3aed' },
  { icon: Map, title: 'Personalized Roadmap', desc: 'Stage-by-stage learning path crafted to bridge the gap between your current skills and target role.', color: '#0ea5e9' },
  { icon: FolderOpen, title: 'Project Explorer', desc: 'Curated project recommendations based on your branch, skills, and career goals.', color: '#10b981' },
  { icon: Code2, title: 'Coding Practice', desc: 'Structured coding challenges with topic-based tracking to sharpen your problem-solving skills.', color: '#f59e0b' },
  { icon: MessageSquare, title: 'Mock Interviews', desc: 'Role-specific interview simulation with AI evaluation, feedback, and improvement guidance.', color: '#ef4444' },
];

const STEPS = [
  { step: '01', title: 'Create Your Profile', desc: 'Share your academic background, skills, and career goals through a guided onboarding.' },
  { step: '02', title: 'AI Analyzes Your Path', desc: 'Our AI maps your current state to your target role and identifies skill gaps.' },
  { step: '03', title: 'Follow Your Roadmap', desc: 'Work through your personalized learning stages, projects, and practice challenges.' },
  { step: '04', title: 'Track Real Progress', desc: 'Every activity — resume, coding, interviews — updates your career readiness score.' },
];

const STATS = [
  { value: '8+', label: 'Career Domains Covered' },
  { value: '50+', label: 'Project Templates' },
  { value: 'AI', label: 'Powered Mentor' },
  { value: '100%', label: 'Personalized' },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-layout">
      <Navbar />

      {/* Hero */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <h1 className="hero-title animate-fade-in">
            Your Personal<br />
            <span className="gradient-text">AI Career Mentor</span>
          </h1>
          <p className="hero-subtitle animate-fade-in">
            Turn your academic journey into an industry-ready career path<br className="hide-mobile" />
            with personalized AI guidance — from skills to career readiness.
          </p>
          <div className="hero-cta animate-fade-in">
            <Link to="/signup" className="btn btn-primary btn-lg hero-btn-primary">
              Start My Career Journey <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Explore Career Copilot
            </Link>
          </div>

          {/* Journey visual */}
          <div className="hero-journey animate-fade-in">
            {['Profile', 'AI Analysis', 'Skills', 'Roadmap', 'Projects', 'Interview', 'Career Ready'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="journey-node">
                  <div className="journey-dot" style={{ animationDelay: `${i * 0.15}s` }} />
                  <span>{step}</span>
                </div>
                {i < 6 && <div className="journey-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(stat => (
              <div key={stat.label} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-badge">Platform Capabilities</div>
            <h2>Everything you need to<br /><span className="gradient-text">land your dream role</span></h2>
            <p>A complete career development platform that grows with you — from first skills to interview-ready.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feature-card reveal" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon" style={{ '--icon-color': f.color } as React.CSSProperties}>
                  <f.icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header reveal">
            <div className="section-badge">How It Works</div>
            <h2>From student to<br /><span className="gradient-text">career-ready professional</span></h2>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.step} className="step-card reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Mentor preview */}
      <section className="section ai-preview-section">
        <div className="container">
          <div className="ai-preview-inner reveal">
            <div className="ai-preview-text">
              <div className="section-badge">AI Mentor</div>
              <h2>Not generic advice.<br /><span className="gradient-text">Your specific next step.</span></h2>
              <p>Career Copilot understands your background, skills, and goals. Every answer is generated from your actual profile — not a one-size-fits-all template.</p>
              <div className="ai-features-list">
                {['Personalized learning recommendations', 'Skill gap analysis', 'Project guidance', 'Interview coaching', 'Resume feedback', 'Career path planning'].map(f => (
                  <div key={f} className="ai-feature-item">
                    <CheckCircle size={16} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup" className="btn btn-primary">
                Try AI Mentor <ArrowRight size={16} />
              </Link>
            </div>
            <div className="ai-preview-chat">
              <div className="chat-demo-card">
                <div className="chat-demo-header">
                  <BrainCircuit size={16} />
                  <span>Career Copilot AI</span>
                  <div className="ai-status"><div className="status-dot" /> Live</div>
                </div>
                <div className="chat-demo-messages">
                  <div className="chat-bubble user">What should I learn next?</div>
                  <div className="chat-bubble ai">
                    Based on your React skills and Full Stack Developer goal, your next priority is <strong>backend development</strong>.
                    <br /><br />
                    Start with Node.js + Express to build REST APIs, then connect to a database (MongoDB or PostgreSQL). This directly fills the gap between your current frontend skills and full-stack capability.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card reveal">
            <div className="cta-orb" />
            <div className="section-badge light">Start Today</div>
            <h2>Ready to bridge the gap?</h2>
            <p>Join students using Career Copilot AI to navigate their career path with confidence.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <div className="cta-trust">
                <Shield size={14} /> No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
