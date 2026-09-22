import { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Send, Mic, MicOff, Volume2, VolumeX,
  RotateCcw, Sparkles, User, Code2, FileText,
  Briefcase, TrendingUp, Map, CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { sendChatMessage, type AIMessage } from '../services/aiService';
import { buildSidebarSnapshot, type CareerHubSnapshot } from '../services/mentorContext';
import './AIMentor.css';

const SUGGESTIONS = [
  'What should I learn next?',
  'Which project should I build?',
  'What skills am I missing?',
  'How can I improve my resume?',
  'How did I perform in my last interview?',
  'Give me a 30-day action plan.',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIMentor() {
  const {
    profile,
    resumeAnalysis,
    roadmapStages,
    codingStats,
    interviewHistory,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Build the full Career Hub snapshot for context injection
  const hub: CareerHubSnapshot = {
    profile,
    resumeAnalysis,
    roadmapStages,
    codingStats,
    interviewHistory,
  };

  const sidebar = buildSidebarSnapshot(hub);

  useEffect(() => {
    setVoiceSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setTtsSupported('speechSynthesis' in window);

    // Welcome message — personalised but not verbose
    let welcomeText: string;
    if (!profile) {
      welcomeText = "Hello! I'm your Career Copilot AI Mentor. Complete your onboarding profile to unlock personalized career guidance. What would you like to explore?";
    } else {
      const inProgress = roadmapStages.find(s => s.status === 'in_progress');
      const completedCount = roadmapStages.filter(s => s.status === 'completed').length;

      if (inProgress) {
        welcomeText = `Hello ${profile.name}! You're currently working on **${inProgress.title}**. Ask me anything about your next steps, skill gaps, projects, or interview prep.`;
      } else if (completedCount > 0) {
        welcomeText = `Hello ${profile.name}! You've completed ${completedCount} roadmap stage${completedCount > 1 ? 's' : ''} toward **${profile.targetRole}**. What would you like to work on next?`;
      } else {
        welcomeText = `Hello ${profile.name}! I'm your Career Copilot AI Mentor, guiding your path to **${profile.targetRole}**. Ask me about what to learn, which projects to build, or how to prepare for interviews.`;
      }
    }

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history: AIMessage[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: text.trim() });

      // Pass full Career Hub snapshot — the service retrieves only what's relevant
      const response = await sendChatMessage(history, profile || null, hub);

      setMessages(prev => [...prev, {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => { setListening(false); sendMessage(e.results[0][0].transcript); };
    recognition.onerror = () => setListening(false);
    recognition.onend   = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const speakText = (text: string) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#+\s/g, '').replace(/•/g, '');
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 0.95;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const clearChat = () => {
    stopSpeaking();
    const welcomeText = profile ? `Hello ${profile.name}! How can I help you today?` : 'Hello! How can I help with your career journey?';
    setMessages([{ id: 'welcome', role: 'assistant', content: welcomeText, timestamp: new Date() }]);
  };

  const formatMessage = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

  // ── Sidebar stat helpers ─────────────────────────────────────────────────
  const roadmapPct = sidebar.roadmapProgress
    ? Math.round((sidebar.roadmapProgress.completed / sidebar.roadmapProgress.total) * 100)
    : null;

  const codingAccuracy = sidebar.codingProgress
    ? Math.round((sidebar.codingProgress.solved / sidebar.codingProgress.attempted) * 100)
    : null;

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content mentor-page">
        <div className="mentor-layout">

          {/* ── Sidebar ── */}
          <div className="mentor-sidebar">
            <div className="mentor-profile-card">
              <div className="mentor-ai-icon">
                <BrainCircuit size={24} />
              </div>
              <div>
                <div className="mentor-ai-name">Career Copilot</div>
                <div className="ai-status">
                  <div className="status-dot" />
                  <span>AI Mentor Active</span>
                </div>
              </div>
            </div>

            {/* Career Context snapshot */}
            {profile && (
              <div className="mentor-context-card">
                <div className="mentor-context-label">Career Context</div>
                <div className="mentor-context-item">
                  <span>Target Role</span>
                  <strong>{profile.targetRole}</strong>
                </div>
                <div className="mentor-context-item">
                  <span>Domain</span>
                  <strong>{profile.targetCareer}</strong>
                </div>
                <div className="mentor-context-item">
                  <span>Branch</span>
                  <strong>{profile.branch.split('(')[0].trim()}</strong>
                </div>
                <div className="mentor-context-item">
                  <span>Skills</span>
                  <strong>{sidebar.skillCount > 0 ? `${sidebar.skillCount} identified` : 'Not assessed'}</strong>
                </div>
              </div>
            )}

            {/* Live progress snapshot */}
            {profile && (
              <div className="mentor-progress-card">
                <div className="mentor-context-label">Live Progress</div>

                <div className="mentor-stat-row">
                  <FileText size={12} />
                  <span>Resume</span>
                  <strong className={sidebar.resumeScore !== null ? (sidebar.resumeScore >= 70 ? 'stat-good' : 'stat-warn') : 'stat-muted'}>
                    {sidebar.resumeScore !== null ? `${sidebar.resumeScore}/100` : 'Not analyzed'}
                  </strong>
                </div>

                <div className="mentor-stat-row">
                  <Map size={12} />
                  <span>Roadmap</span>
                  <strong className={roadmapPct !== null ? (roadmapPct >= 50 ? 'stat-good' : 'stat-warn') : 'stat-muted'}>
                    {roadmapPct !== null ? `${roadmapPct}% done` : 'Not started'}
                  </strong>
                </div>

                <div className="mentor-stat-row">
                  <Code2 size={12} />
                  <span>Coding</span>
                  <strong className={codingAccuracy !== null ? (codingAccuracy >= 60 ? 'stat-good' : 'stat-warn') : 'stat-muted'}>
                    {sidebar.codingProgress ? `${sidebar.codingProgress.solved}/${sidebar.codingProgress.attempted} solved` : 'Not started'}
                  </strong>
                </div>

                <div className="mentor-stat-row">
                  <Briefcase size={12} />
                  <span>Interview</span>
                  <strong className={sidebar.lastInterviewScore !== null ? (sidebar.lastInterviewScore >= 60 ? 'stat-good' : 'stat-warn') : 'stat-muted'}>
                    {sidebar.lastInterviewScore !== null ? `${sidebar.lastInterviewScore}%` : 'Not attempted'}
                  </strong>
                </div>
              </div>
            )}

            {/* Quick questions */}
            <div className="mentor-suggestions-label">Quick Questions</div>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                className="suggestion-btn"
                onClick={() => sendMessage(s)}
                disabled={loading}
              >
                <Sparkles size={12} />
                {s}
              </button>
            ))}

            {/* What the AI knows indicator */}
            <div className="mentor-context-info">
              <div className="mentor-context-info-title">Context available</div>
              <div className="mentor-context-badges">
                <span className={`ctx-badge ${profile ? 'active' : ''}`}><User size={10} /> Profile</span>
                <span className={`ctx-badge ${resumeAnalysis.analyzed ? 'active' : ''}`}><FileText size={10} /> Resume</span>
                <span className={`ctx-badge ${roadmapStages.length > 0 ? 'active' : ''}`}><Map size={10} /> Roadmap</span>
                <span className={`ctx-badge ${codingStats.attempted > 0 ? 'active' : ''}`}><Code2 size={10} /> Coding</span>
                <span className={`ctx-badge ${interviewHistory.length > 0 ? 'active' : ''}`}><Briefcase size={10} /> Interviews</span>
              </div>
            </div>

            <div className="mentor-actions">
              <button className="btn btn-ghost btn-sm" onClick={clearChat}>
                <RotateCcw size={14} /> Clear Chat
              </button>
            </div>
          </div>

          {/* ── Chat area ── */}
          <div className="mentor-chat">
            <div className="chat-header">
              <div className="chat-header-info">
                <h2>AI Career Mentor</h2>
                <p>Personalized career intelligence — asks only for context it needs.</p>
              </div>
              <div className="chat-header-right">
                {/* Context awareness indicator */}
                <div className="context-aware-badge">
                  <CheckCircle size={12} />
                  <span>Context-aware</span>
                </div>
                {ttsSupported && speaking && (
                  <button className="btn btn-ghost btn-sm" onClick={stopSpeaking}>
                    <VolumeX size={14} /> Stop
                  </button>
                )}
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'assistant'
                      ? <BrainCircuit size={16} />
                      : <User size={16} />}
                  </div>
                  <div className="message-bubble">
                    <div
                      className="message-content"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <div className="message-meta">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.role === 'assistant' && ttsSupported && (
                        <button className="speak-btn" onClick={() => speakText(msg.content)} title="Read aloud">
                          <Volume2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="message-avatar"><BrainCircuit size={16} /></div>
                  <div className="message-bubble typing">
                    <div className="typing-inner">
                      <div className="ai-dots">
                        <div className="ai-dot" />
                        <div className="ai-dot" />
                        <div className="ai-dot" />
                      </div>
                      <span className="typing-label">Analyzing your Career Hub data...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              {listening && (
                <div className="listening-indicator">
                  <div className="listen-dot" />
                  Listening... speak now
                </div>
              )}
              <div className="chat-input-row">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask about your career, skills, roadmap, projects, or interviews..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                  disabled={loading || listening}
                />
                {voiceSupported && (
                  <button
                    className={`btn voice-btn ${listening ? 'active' : ''}`}
                    onClick={listening ? stopListening : startListening}
                    title={listening ? 'Stop listening' : 'Voice input'}
                  >
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                )}
                <button
                  className="btn btn-primary send-btn"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="input-hint">
                <TrendingUp size={11} />
                <span>Try: "What should I learn next?" · "Why is my resume score low?" · "What is Python?"</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
