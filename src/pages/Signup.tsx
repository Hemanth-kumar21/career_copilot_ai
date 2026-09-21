import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, addToast } = useApp();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const success = await signup(email.trim(), password, name.trim());
      if (success) {
        addToast('success', 'Account created! Let\'s set up your profile.');
        navigate('/onboarding');
      } else {
        setError('An account with this email already exists. Please login.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
            <h2>Start your AI-powered career journey today.</h2>
            <p>Get a personalized roadmap, skill analysis, and AI mentor — all based on your unique profile.</p>
          </div>
          <div className="auth-promise">
            <div className="promise-item">
              <span className="promise-num">01</span>
              <span>Complete your student profile</span>
            </div>
            <div className="promise-item">
              <span className="promise-num">02</span>
              <span>Get AI-generated career analysis</span>
            </div>
            <div className="promise-item">
              <span className="promise-num">03</span>
              <span>Follow your personalized roadmap</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Join Career Copilot AI — it's free</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-input with-icon"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="input-icon-end" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? (
                <><div className="btn-spinner" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>

            <p className="auth-terms">
              By creating an account you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-ghost auth-link-btn">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
