import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BrainCircuit, Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const isAuth = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  if (!isAuthenticated && !isAuth) {
    // Public nav
    return (
      <nav className="navbar navbar-public">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <BrainCircuit size={24} />
            <span>Career Copilot <em>AI</em></span>
          </Link>
          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
          </div>
          <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar navbar-app">
      <div className="container navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <BrainCircuit size={22} />
          <span>Career Copilot <em>AI</em></span>
        </Link>

        <div className={`navbar-app-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/career-hub" className={`nav-link ${location.pathname.startsWith('/career-hub') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Career Hub
          </Link>
          <Link to="/ai-mentor" className={`nav-link ${location.pathname === '/ai-mentor' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            AI Mentor
          </Link>
          <Link to="/interview" className={`nav-link ${location.pathname === '/interview' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Interview Lab
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-menu" onClick={() => setDropOpen(!dropOpen)}>
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={14} />
            {dropOpen && (
              <div className="user-dropdown">
                <Link to="/dashboard" className="dropdown-item" onClick={() => setDropOpen(false)}>
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
