import { Link } from 'react-router-dom';
import { BrainCircuit, Home, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFound() {
  const { isAuthenticated } = useApp();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-light)',
      padding: '32px',
      textAlign: 'center',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(108,63,197,0.15) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        color: 'var(--accent)',
      }}>
        <BrainCircuit size={32} />
      </div>
      <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--border)', lineHeight: 1, marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.6, marginBottom: 32 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to={isAuthenticated ? '/dashboard' : '/'}
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        <Home size={16} />
        {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
