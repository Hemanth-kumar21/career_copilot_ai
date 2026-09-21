import { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Send, Mic, MicOff, Volume2, VolumeX,
  RotateCcw, Sparkles, User
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { sendChatMessage, type AIMessage } from '../services/aiService';
import './AIMentor.css';

const SUGGESTIONS = [
  'What should I learn next?',
  'Which projects should I build?',
  'How do I prepare for interviews?',
  'What skills am I missing?',
  'How can I improve my resume?',
  'What is my career readiness level?',
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIMentor() {
  const { profile } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setTtsSupported('speechSynthesis' in window);

    // Welcome message
    const welcomeText = profile
      ? `Hello ${profile.name}! I'm your Career Copilot AI Mentor. I know you're working toward becoming a ${profile.targetRole}. How can I help you today?`
      : "Hello! I'm your Career Copilot AI Mentor — your personalized guide from learning to career readiness. What would you like to explore today?";

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
    }]);
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

      const response = await sendChatMessage(history, profile || null);

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
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

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      // Auto-send the voice message directly
      sendMessage(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speakText = (text: string) => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();

    // Clean text for speech (remove markdown)
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#+\s/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const clearChat = () => {
    stopSpeaking();
    const welcomeText = profile
      ? `Hello ${profile.name}! How can I help you today?`
      : "Hello! How can I help you with your career journey today?";
    setMessages([{ id: 'welcome', role: 'assistant', content: welcomeText, timestamp: new Date() }]);
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="page-content mentor-page">
        <div className="mentor-layout">
          {/* Sidebar */}
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

            {profile && (
              <div className="mentor-context-card">
                <div className="mentor-context-label">Your Profile</div>
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
              </div>
            )}

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

            <div className="mentor-actions">
              <button className="btn btn-ghost btn-sm" onClick={clearChat}>
                <RotateCcw size={14} /> Clear Chat
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div className="mentor-chat">
            <div className="chat-header">
              <div className="chat-header-info">
                <h2>AI Career Mentor</h2>
                <p>Your personalized guide from learning to career readiness.</p>
              </div>
              {ttsSupported && speaking && (
                <button className="btn btn-ghost btn-sm" onClick={stopSpeaking}>
                  <VolumeX size={14} /> Stop Speaking
                </button>
              )}
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'assistant' ? <BrainCircuit size={16} /> : <User size={16} />}
                  </div>
                  <div className="message-bubble">
                    <div
                      className="message-content"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <div className="message-meta">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.role === 'assistant' && ttsSupported && (
                        <button
                          className="speak-btn"
                          onClick={() => speakText(msg.content)}
                          title="Read aloud"
                        >
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
                    <div className="ai-dots">
                      <div className="ai-dot" />
                      <div className="ai-dot" />
                      <div className="ai-dot" />
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
                  placeholder="Ask me anything about your career, skills, or next steps..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                  disabled={loading || listening}
                />
                {voiceSupported && (
                  <button
                    className={`btn voice-btn ${listening ? 'active' : ''}`}
                    onClick={listening ? stopListening : startListening}
                    title={listening ? 'Stop listening' : 'Start voice input'}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
