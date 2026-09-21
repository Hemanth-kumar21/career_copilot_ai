import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BrainCircuit size={20} />
              <span>Career Copilot <em>AI</em></span>
            </div>
            <p>Bridge the Gap Between Academia and Industry with AI.</p>
            <div className="footer-social">
              <a href="#" className="social-link">GH</a>
              <a href="#" className="social-link">TW</a>
              <a href="#" className="social-link">LI</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/career-hub">Career Hub</Link>
            <Link to="/ai-mentor">AI Mentor</Link>
            <Link to="/interview">Interview Lab</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Learning Roadmaps</a>
            <a href="#">Project Ideas</a>
            <a href="#">Interview Prep</a>
            <a href="#">Resume Guide</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Career Copilot AI. Built for IBM Regional Hackathon.</p>
          <p className="footer-tag">Powered by AI • Designed for Students</p>
        </div>
      </div>
    </footer>
  );
}
