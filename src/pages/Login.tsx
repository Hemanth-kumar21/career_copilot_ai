import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useApp, type StudentProfile } from '../context/AppContext';
import { generateRoadmap } from '../data/roadmaps';
import './Auth.css';

// ── Demo profile seed ─────────────────────────────────────────────────────────
const DEMO_EMAIL    = 'demo@careercopilotai.com';
const DEMO_PASSWORD = 'demo1234';
const DEMO_NAME     = 'Aryan Sharma (Demo)';

function seedDemoAccount() {
  // Register demo user if not already there
  const users = JSON.parse(localStorage.getItem('cc_users') || '[]');
  if (!users.find((u: any) => u.email === DEMO_EMAIL)) {
    const uid = 'demo_user_001';
    users.push({ id: uid, email: DEMO_EMAIL, name: DEMO_NAME });
    localStorage.setItem('cc_users', JSON.stringify(users));

    const profile: StudentProfile = {
      id: uid, name: DEMO_NAME, email: DEMO_EMAIL,
      degree: 'B.Tech', branch: 'Computer Science Engineering (CSE)',
      year: '3rd Year', semester: 'Semester 5',
      targetCareer: 'Web Development', targetRole: 'Full Stack Developer',
      preferredDomain: 'Fintech',
      programmingLanguages: ['JavaScript', 'Python', 'Java'],
      technicalSkills: ['HTML/CSS', 'React', 'Node.js', 'SQL'],
      tools: ['Git', 'VS Code', 'Postman'],
      shortTermGoal: 'Complete 3 full-stack projects and get an internship',
      longTermGoal: 'Join a product company as a Senior Full Stack Developer',
      currentStruggle: 'Building backend APIs and connecting database to frontend',
      aspiration: 'I want to build scalable web products that solve real problems',
      improvementAreas: 'System design, testing, and DevOps basics',
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`cc_profile_${uid}`, JSON.stringify(profile));

    const roadmap = generateRoadmap('fullstack');
    // Mark first 2 stages done for realistic demo
    roadmap[0].status = 'completed';
    roadmap[1].status = 'in_progress';
    localStorage.setItem(`cc_roadmap_${uid}`, JSON.stringify(roadmap));
    localStorage.setItem('cc_roadmap', JSON.stringify(roadmap));
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, addToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        addToast('success', 'Welcome back!');
        navigate('/dashboard');
      } else {
        setError('No account found with this email. Please sign up first.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    seedDemoAccount();
    await new Promise(r => setTimeout(r, 400));
    const success = await login(DEMO_EMAIL, DEMO_PASSWORD);
    setLoading(false);
    if (success) {
      addToast('success', 'Demo profile loaded! Explore all features freely.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <BrainCircuit size={24} />
            <span>Career Copilot <em>AI</em></span>
          </Link>
          <div className="auth-hero-text">
            <h2>Welcome back to your career journey.</h2>
            <p>Pick up right where you left off — your roadmap, progress, and AI mentor are waiting.</p>
          </div>
          <div className="auth-features">
            {['Personalized AI guidance', 'Track your progress', 'Interview practice', 'Resume analysis'].map(f => (
              <div key={f} className="auth-feature">
                <div className="auth-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Sign in</h1>
            <p>Access your Career Copilot account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input with-icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input with-icon with-icon-end"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="input-icon-end" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? (
                <><div className="btn-spinner" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>
          <button
            type="button"
            className="btn btn-demo auth-link-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles size={15} /> Try Demo Profile
          </button>
          <p className="demo-note">Instantly explore all features with a pre-built student profile</p>

          <div className="auth-divider"><span>New to Career Copilot?</span></div>
          <Link to="/signup" className="btn btn-ghost auth-link-btn">
            Create your account
          </Link>
        </div>
      </div>
    </div>
  );
}
