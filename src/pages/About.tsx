import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, FileText, Zap, Map, FolderOpen, Code2,
  Mic, LayoutDashboard, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Star, Send, X,
  Lightbulb, Target, BookOpen, ArrowRight, Sparkles,
  MessageSquare, Flag, Shield, Users, Telescope
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import './About.css';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: FileText, name: 'Resume Intelligence', desc: 'Upload your resume for AI-powered scoring, skill extraction, gap analysis, and improvement suggestions.' },
  { icon: Zap,      name: 'Skill Insights',      desc: 'See your current skills categorised by evidence — from your profile, resume, and activity.' },
  { icon: Map,      name: 'Learning Roadmap',    desc: 'A personalized stage-by-stage roadmap from your current level to your target role.' },
  { icon: FolderOpen, name: 'Project Explorer',  desc: 'Curated project ideas matched to your skills, roadmap stage, and career direction.' },
  { icon: Code2,    name: 'Coding Practice',     desc: 'In-platform coding problems with test-case feedback, hints, and language support.' },
  { icon: BrainCircuit, name: 'AI Mentor',       desc: 'A context-aware career mentor that reads your Career Hub data before answering.' },
  { icon: Mic,      name: 'Interview Lab',        desc: 'AI-evaluated mock interviews with scores, missed concepts, and improvement guidance.' },
  { icon: LayoutDashboard, name: 'Progress Dashboard', desc: 'All your real activity — resume, roadmap, coding, and interviews — in one place.' },
];

const PROBLEMS = [
  {
    icon: Telescope,
    title: 'Information Overload',
    desc: 'Students have access to many learning resources but may not know which ones to prioritise for their specific career goals.',
  },
  {
    icon: Users,
    title: 'Generic Advice',
    desc: 'Standard career advice is not equally useful for every student. A fresher and a final-year student need different next steps.',
  },
  {
    icon: Code2,
    title: 'Lack of Structured Practice',
    desc: 'Students need integrated opportunities to practice coding, build projects, improve their resume, and run through mock interviews.',
  },
  {
    icon: Target,
    title: 'Unclear Next Steps',
    desc: 'Students often know their target career but struggle to identify the most practical immediate action to take.',
  },
];

const FLOW_STEPS = [
  'Student Profile', 'Resume & Skills', 'Skill Gap Analysis',
  'Personalized Roadmap', 'Projects & Coding', 'AI Mentor',
  'Mock Interview', 'Progress & Dashboard',
];

const FAQ_ITEMS = [
  {
    q: 'What is Career Copilot AI?',
    a: 'Career Copilot AI is a student-focused AI career platform that connects your academic profile, skills, resume, learning roadmap, coding practice, and mock interviews into one continuous career journey.',
  },
  {
    q: 'Who is Career Copilot AI designed for?',
    a: 'It is designed for students — particularly engineering and technology students — who want structured, personalized guidance to move from their current academic stage toward their target career.',
  },
  {
    q: 'How does the AI Mentor work?',
    a: 'The AI Mentor reads your Career Hub data — your profile, resume analysis, roadmap progress, coding stats, and interview history — and uses only the relevant information to answer your specific question. It does not repeat your profile at you; it uses it as context.',
  },
  {
    q: 'Can the AI Mentor answer general career questions?',
    a: 'Yes. You can ask general questions about roles, technologies, learning paths, or industry concepts. When your profile is available, the AI Mentor will connect the answer to your personal career direction.',
  },
  {
    q: 'How does Career Copilot personalize recommendations?',
    a: 'Recommendations are based on your actual activity — your onboarding data, resume analysis results, roadmap stage, coding history, and interview performance. The platform does not fabricate data or show generic defaults.',
  },
  {
    q: 'How can I report a problem or give feedback?',
    a: 'Use the Feedback & Complaints section on this page. Fill in the form and submit — your input helps us improve the platform.',
  },
];

const FEEDBACK_TYPES = [
  'General Feedback', 'Feature Suggestion', 'User Experience',
  'AI Mentor Feedback', 'Resume Intelligence Feedback', 'Career Hub Feedback', 'Other',
];

const COMPLAINT_CATEGORIES = [
  'Technical Issue', 'Login / Account Issue', 'AI Mentor Issue',
  'Resume Intelligence Issue', 'Career Hub Issue', 'Coding Practice Issue',
  'Interview Lab Issue', 'Dashboard Issue', 'Other',
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';

// ─────────────────────────────────────────────────────────────────────────────
// Star Rating Component
// ─────────────────────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= (hovered || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} out of 5`}
        >
          <Star size={22} />
        </button>
      ))}
      {value > 0 && (
        <span className="star-label">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feedback Form Modal
// ─────────────────────────────────────────────────────────────────────────────
function FeedbackModal({ onClose, prefillName, prefillEmail }: {
  onClose: () => void;
  prefillName: string;
  prefillEmail: string;
}) {
  const [form, setForm] = useState({
    name: prefillName, email: prefillEmail,
    feedbackType: '', message: '', rating: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())             e.name         = 'Name is required.';
    if (!form.email.trim())            e.email        = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.feedbackType)            e.feedbackType = 'Please select a feedback type.';
    if (form.message.trim().length < 10) e.message    = 'Please enter at least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    setServerError('');
    try {
      const payload = { ...form, rating: form.rating || null };
      // Try backend; fall back to localStorage simulation if no backend
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Submission failed.');
        }
      } else {
        // Offline / no-backend: store in localStorage for demo
        const stored = JSON.parse(localStorage.getItem('cc_feedback') || '[]');
        stored.push({ ...payload, id: `fb_${Date.now()}`, createdAt: new Date().toISOString() });
        localStorage.setItem('cc_feedback', JSON.stringify(stored));
        await new Promise(r => setTimeout(r, 800)); // simulate network
      }
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setServerError(err.message || 'Unable to submit feedback. Please try again.');
    }
  };

  const set = (k: string, v: string | number) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon feedback-icon"><MessageSquare size={20} /></div>
            <div>
              <h3>Give Feedback</h3>
              <p>Help us improve Career Copilot AI</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="success-icon"><CheckCircle size={40} /></div>
            <h3>Thank you!</h3>
            <p>Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.</p>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name <span className="required">*</span></label>
                <input className={`form-input ${errors.name ? 'input-error' : ''}`} value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Your name" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input className={`form-input ${errors.email ? 'input-error' : ''}`} type="email"
                  value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Feedback Type <span className="required">*</span></label>
              <select className={`form-input ${errors.feedbackType ? 'input-error' : ''}`}
                value={form.feedbackType} onChange={e => set('feedbackType', e.target.value)}>
                <option value="">Select feedback type…</option>
                {FEEDBACK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.feedbackType && <span className="field-error">{errors.feedbackType}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Your Feedback <span className="required">*</span></label>
              <textarea className={`form-input ${errors.message ? 'input-error' : ''}`}
                rows={5} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="Tell us what you think — what's working well, what could be improved, or a feature you'd like to see…" />
              {errors.message && <span className="field-error">{errors.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Rate Your Experience <span className="optional">(optional)</span></label>
              <StarRating value={form.rating} onChange={v => set('rating', v)} />
            </div>

            {status === 'error' && (
              <div className="form-server-error">
                <AlertCircle size={15} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><span className="btn-spinner" /> Submitting…</>
                ) : (
                  <><Send size={14} /> Submit Feedback</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Complaint Form Modal
// ─────────────────────────────────────────────────────────────────────────────
function ComplaintModal({ onClose, prefillName, prefillEmail }: {
  onClose: () => void;
  prefillName: string;
  prefillEmail: string;
}) {
  const [form, setForm] = useState({
    name: prefillName, email: prefillEmail,
    category: '', description: '', priority: '', page: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())               e.name        = 'Name is required.';
    if (!form.email.trim())              e.email       = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.category)                  e.category    = 'Please select a category.';
    if (form.description.trim().length < 15) e.description = 'Please describe the issue (at least 15 characters).';
    if (!form.priority)                  e.priority    = 'Please select a priority level.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    setServerError('');
    try {
      if (API_BASE) {
        const res = await fetch(`${API_BASE}/api/complaints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Submission failed.');
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('cc_complaints') || '[]');
        stored.push({ ...form, id: `cp_${Date.now()}`, status: 'open', createdAt: new Date().toISOString() });
        localStorage.setItem('cc_complaints', JSON.stringify(stored));
        await new Promise(r => setTimeout(r, 800));
      }
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setServerError(err.message || 'Unable to submit complaint. Please try again.');
    }
  };

  const set = (k: string, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon complaint-icon"><Flag size={20} /></div>
            <div>
              <h3>Report a Complaint</h3>
              <p>Describe the issue you encountered</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="success-icon"><CheckCircle size={40} /></div>
            <h3>Complaint Submitted</h3>
            <p>Your complaint has been submitted successfully. We appreciate you bringing this to our attention.</p>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name <span className="required">*</span></label>
                <input className={`form-input ${errors.name ? 'input-error' : ''}`} value={form.name}
                  onChange={e => set('name', e.target.value)} placeholder="Your name" />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input className={`form-input ${errors.email ? 'input-error' : ''}`} type="email"
                  value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select className={`form-input ${errors.category ? 'input-error' : ''}`}
                  value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select a category…</option>
                  {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="field-error">{errors.category}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Priority <span className="required">*</span></label>
                <select className={`form-input ${errors.priority ? 'input-error' : ''}`}
                  value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="">Select priority…</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {errors.priority && <span className="field-error">{errors.priority}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <textarea className={`form-input ${errors.description ? 'input-error' : ''}`}
                rows={5} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe the problem you experienced — what happened, what you expected, and what actually occurred…" />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Page / Feature <span className="optional">(optional)</span></label>
              <input className="form-input" value={form.page} onChange={e => set('page', e.target.value)}
                placeholder="e.g. Resume Intelligence, AI Mentor, Interview Lab…" />
            </div>

            {status === 'error' && (
              <div className="form-server-error">
                <AlertCircle size={15} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <><span className="btn-spinner" /> Submitting…</>
                ) : (
                  <><Flag size={14} /> Submit Complaint</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Accordion Item
// ─────────────────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="faq-answer">{a}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section reveal hook (IntersectionObserver)
// ─────────────────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main About Page
// ─────────────────────────────────────────────────────────────────────────────
export default function About() {
  const { isAuthenticated, user, profile } = useApp();
  const navigate = useNavigate();
  const [showFeedback,  setShowFeedback]  = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);

  const prefillName  = profile?.name  || user?.name  || '';
  const prefillEmail = user?.email || '';

  // Close modals on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowFeedback(false); setShowComplaint(false); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = (showFeedback || showComplaint) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showFeedback, showComplaint]);

  const { ref: missionRef,  visible: missionVis  } = useReveal();
  const { ref: problemRef,  visible: problemVis  } = useReveal();
  const { ref: flowRef,     visible: flowVis     } = useReveal();
  const { ref: featuresRef, visible: featuresVis } = useReveal();
  const { ref: mentorRef,   visible: mentorVis   } = useReveal();
  const { ref: feedbackRef, visible: feedbackVis } = useReveal();
  const { ref: faqRef,      visible: faqVis      } = useReveal();

  const handleHubClick = () => navigate(isAuthenticated ? '/career-hub' : '/signup');
  const handleMentorClick = () => navigate(isAuthenticated ? '/ai-mentor' : '/signup');

  return (
    <div className="page-layout about-page">
      <Navbar />

      {/* ── 1. HERO ── */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container">
          <div className="about-hero-content">
            <div className="hero-badge">
              <Sparkles size={12} />
              <span>Career Intelligence Platform</span>
            </div>
            <h1 className="about-hero-title">
              About <span className="gradient-text">Career Copilot AI</span>
            </h1>
            <p className="about-hero-sub">
              Your AI-powered career companion for the journey from classroom to career.
            </p>
            <p className="about-hero-body">
              Career Copilot AI brings career guidance, resume intelligence, skill insights, learning roadmaps,
              project recommendations, coding practice, AI mentorship, and interview preparation into one
              student-focused platform.
            </p>
            <div className="about-hero-actions">
              <button className="btn btn-primary btn-lg" onClick={handleHubClick}>
                Explore Career Hub <ArrowRight size={16} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={handleMentorClick}>
                <BrainCircuit size={16} /> Talk to AI Mentor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MISSION ── */}
      <section className="about-section" ref={missionRef}>
        <div className={`container reveal ${missionVis ? 'visible' : ''}`}>
          <div className="mission-card">
            <div className="mission-icon"><Target size={28} /></div>
            <div className="section-label">Our Mission</div>
            <h2 className="section-heading">Why We Built This</h2>
            <p className="mission-body">
              Our mission is to help students make clearer and more informed career decisions by
              connecting their academic background, skills, goals, learning progress, projects, coding
              practice, resume, and interview preparation in one intelligent platform.
            </p>
            <div className="mission-highlight">
              <Lightbulb size={16} />
              <span>
                Instead of asking students to figure out everything on their own, Career Copilot AI
                helps them understand what to do next.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PROBLEM ── */}
      <section className="about-section bg-subtle" ref={problemRef}>
        <div className={`container reveal ${problemVis ? 'visible' : ''}`}>
          <div className="section-label">The Career Gap</div>
          <h2 className="section-heading">Challenges Students Face</h2>
          <p className="section-sub">Four common obstacles on the path from student to professional.</p>
          <div className="problem-grid">
            {PROBLEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="problem-card">
                <div className="problem-icon"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. APPROACH / FLOW ── */}
      <section className="about-section" ref={flowRef}>
        <div className={`container reveal ${flowVis ? 'visible' : ''}`}>
          <div className="section-label">Our Approach</div>
          <h2 className="section-heading">One Continuous Career Journey</h2>
          <p className="section-sub">
            Career Copilot AI connects these activities rather than treating them as separate tools.
          </p>
          <div className="flow-track">
            {FLOW_STEPS.map((step, i) => (
              <div key={step} className="flow-node-wrap">
                <div className="flow-node">
                  <div className="flow-node-num">{i + 1}</div>
                  <div className="flow-node-label">{step}</div>
                </div>
                {i < FLOW_STEPS.length - 1 && <div className="flow-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURES ── */}
      <section className="about-section bg-subtle" ref={featuresRef}>
        <div className={`container reveal ${featuresVis ? 'visible' : ''}`}>
          <div className="section-label">Core Features</div>
          <h2 className="section-heading">Everything in One Platform</h2>
          <p className="section-sub">Eight integrated modules — each connected to the others.</p>
          <div className="features-grid">
            {FEATURES.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="feature-card">
                <div className="feature-icon"><Icon size={20} /></div>
                <h4>{name}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. AI MENTOR SPOTLIGHT ── */}
      <section className="about-section mentor-spotlight-section" ref={mentorRef}>
        <div className={`container reveal ${mentorVis ? 'visible' : ''}`}>
          <div className="mentor-spotlight">
            <div className="mentor-spotlight-left">
              <div className="section-label">AI Career Mentor</div>
              <h2 className="section-heading">Your Personal Career Intelligence</h2>
              <p>
                The AI Mentor is Career Copilot's most important feature. Unlike a generic chatbot, it
                reads your actual Career Hub data before answering — giving you responses grounded in
                your real profile.
              </p>
              <ul className="mentor-capability-list">
                {[
                  'Reads your profile, resume, roadmap, coding, and interview data',
                  'Retrieves only the context relevant to your specific question',
                  'Answers questions about your skill gaps and next steps',
                  'Recommends projects based on your current roadmap stage',
                  'Answers general career and technology questions',
                  'Connects general knowledge to your career direction when useful',
                  'Tells you clearly when information is not yet available — never invents data',
                ].map(cap => (
                  <li key={cap}>
                    <CheckCircle size={14} />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary" onClick={handleMentorClick}>
                <BrainCircuit size={16} /> Try the AI Mentor
              </button>
            </div>
            <div className="mentor-spotlight-right">
              <div className="mentor-demo-card">
                <div className="demo-chat-header">
                  <div className="demo-avatar"><BrainCircuit size={18} /></div>
                  <div>
                    <div className="demo-name">Career Copilot AI</div>
                    <div className="demo-status"><span className="demo-dot" />AI Mentor Active</div>
                  </div>
                </div>
                <div className="demo-messages">
                  <div className="demo-msg user">What should I learn next?</div>
                  <div className="demo-msg ai">
                    <strong>Based on your Career Hub:</strong><br />
                    You're in progress on <em>Backend Development</em>. Complete this stage before starting something new.<br /><br />
                    <strong>Skills to finish:</strong> Node.js, Express, REST APIs<br />
                    <strong>Project:</strong> RESTful API for Blog Platform<br /><br />
                    Your resume also shows a gap in <em>Docker</em> — start that after this stage.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. WHY CAREER COPILOT ── */}
      <section className="about-section bg-subtle">
        <div className="container">
          <div className="section-label">Why Career Copilot AI</div>
          <h2 className="section-heading">What Makes It Different</h2>
          <div className="why-grid">
            {[
              { icon: Shield, title: 'No Fabricated Data', desc: 'The platform only shows information you have actually provided or generated. Empty states are shown honestly.' },
              { icon: BrainCircuit, title: 'Context-Aware AI', desc: 'The AI Mentor pulls only the relevant sections of your Career Hub data for each question — not everything at once.' },
              { icon: BookOpen, title: 'Personalized, Not Generic', desc: 'Roadmaps, project recommendations, and skill gaps are tailored to your target role, current skills, and progress.' },
              { icon: Target, title: 'Action-Oriented', desc: 'Every feature is designed to tell you what to do next — not just show you information.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="why-card">
                <div className="why-icon"><Icon size={22} /></div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FEEDBACK & COMPLAINTS ── */}
      <section className="about-section feedback-section" ref={feedbackRef}>
        <div className={`container reveal ${feedbackVis ? 'visible' : ''}`}>
          <div className="section-label">Your Voice</div>
          <h2 className="section-heading">Feedback &amp; Complaints</h2>
          <p className="section-sub">
            Your feedback helps us improve the platform. If you experienced a problem, found incorrect
            information, encountered a technical issue, or have an idea — let us know.
          </p>

          <div className="feedback-cards">
            {/* Feedback card */}
            <div className="feedback-option-card">
              <div className="feedback-card-icon feedback-icon-bg">
                <MessageSquare size={28} />
              </div>
              <h3>Give Feedback</h3>
              <p>
                Share suggestions, feature ideas, usability observations, or your general experience
                with Career Copilot AI.
              </p>
              <ul className="feedback-bullets">
                <li><CheckCircle size={12} />Feature suggestions</li>
                <li><CheckCircle size={12} />Usability feedback</li>
                <li><CheckCircle size={12} />AI Mentor feedback</li>
                <li><CheckCircle size={12} />General experience</li>
              </ul>
              <button className="btn btn-primary" onClick={() => setShowFeedback(true)}>
                <MessageSquare size={15} /> Give Feedback
              </button>
            </div>

            {/* Complaint card */}
            <div className="feedback-option-card complaint-card">
              <div className="feedback-card-icon complaint-icon-bg">
                <Flag size={28} />
              </div>
              <h3>Report a Complaint</h3>
              <p>
                Report bugs, technical problems, incorrect results, account issues, or any other
                problem you encountered while using the platform.
              </p>
              <ul className="feedback-bullets">
                <li><CheckCircle size={12} />Technical issues</li>
                <li><CheckCircle size={12} />Incorrect results</li>
                <li><CheckCircle size={12} />Account problems</li>
                <li><CheckCircle size={12} />Feature not working</li>
              </ul>
              <button className="btn btn-outline-error" onClick={() => setShowComplaint(true)}>
                <Flag size={15} /> Report a Complaint
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ ── */}
      <section className="about-section bg-subtle" ref={faqRef}>
        <div className={`container reveal ${faqVis ? 'visible' : ''}`}>
          <div className="section-label">FAQ</div>
          <h2 className="section-heading">Common Questions</h2>
          <div className="faq-list">
            {FAQ_ITEMS.map(item => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* ── Modals ── */}
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          prefillName={prefillName}
          prefillEmail={prefillEmail}
        />
      )}
      {showComplaint && (
        <ComplaintModal
          onClose={() => setShowComplaint(false)}
          prefillName={prefillName}
          prefillEmail={prefillEmail}
        />
      )}
    </div>
  );
}
