import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  degree: string;
  branch: string;
  year: string;
  semester: string;
  targetCareer: string;
  targetRole: string;
  preferredDomain: string;
  programmingLanguages: string[];
  technicalSkills: string[];
  tools: string[];
  shortTermGoal: string;
  longTermGoal: string;
  currentStruggle: string;
  aspiration: string;
  improvementAreas: string;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface ScoreBreakdown {
  contentStructure: number;   // /20
  education: number;          // /15
  skills: number;             // /20
  projectsExperience: number; // /20
  contactDetails: number;     // /10
  certAchievements: number;   // /5
  clarity: number;            // /10
}

export interface DetectedSections {
  summary: boolean;
  education: boolean;
  skills: boolean;
  experience: boolean;
  projects: boolean;
  certifications: boolean;
  achievements: boolean;
}

export interface ResumeAnalysis {
  score: number | null;
  extractedSkills: string[];
  projects: string[];
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  analyzed: boolean;
  fileName?: string;
  scoreBreakdown?: ScoreBreakdown;
  detectedSections?: DetectedSections;
  education?: string[];
  experience?: string[];
  certifications?: string[];
}

export interface RoadmapStage {
  id: string;
  title: string;
  skills: string[];
  objectives: string[];
  project: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface CodingStats {
  attempted: number;
  solved: number;
  topicPerformance: Record<string, { attempted: number; solved: number }>;
}

export interface InterviewSession {
  id: string;
  role: string;
  date: string;
  totalScore: number | null;
  percentage: number | null;
  completed: boolean;
  questionsAnswered: number;
  strengths: string[];
  weaknesses: string[];
}

export interface AppState {
  user: { id: string; email: string; name: string } | null;
  profile: StudentProfile | null;
  resumeAnalysis: ResumeAnalysis;
  roadmapStages: RoadmapStage[];
  codingStats: CodingStats;
  interviewHistory: InterviewSession[];
  toasts: Toast[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  setProfile: (profile: StudentProfile) => void;
  setResumeAnalysis: (analysis: ResumeAnalysis) => void;
  updateRoadmapStage: (stageId: string, status: RoadmapStage['status']) => void;
  updateCodingStats: (topic: string, solved: boolean) => void;
  addInterviewSession: (session: InterviewSession) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  isAuthenticated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_RESUME: ResumeAnalysis = {
  score: null,
  extractedSkills: [],
  projects: [],
  strengths: [],
  missingSkills: [],
  suggestions: [],
  analyzed: false,
};

const DEFAULT_CODING: CodingStats = {
  attempted: 0,
  solved: 0,
  topicPerformance: {},
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppState['user']>(null);
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [resumeAnalysis, setResumeAnalysisState] = useState<ResumeAnalysis>(DEFAULT_RESUME);
  const [roadmapStages, setRoadmapStages] = useState<RoadmapStage[]>([]);
  const [codingStats, setCodingStats] = useState<CodingStats>(DEFAULT_CODING);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('cc_user');
      if (!savedUser) return;

      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const uid = parsedUser.id;

      // Prefer per-user keys; fall back to legacy global keys
      const p = (key: string) => localStorage.getItem(`${key}_${uid}`) || localStorage.getItem(key);

      const savedProfile   = p('cc_profile');
      const savedResume    = p('cc_resume');
      const savedRoadmap   = p('cc_roadmap');
      const savedCoding    = p('cc_coding');
      const savedInterview = p('cc_interview');

      if (savedProfile)   setProfileState(JSON.parse(savedProfile));
      if (savedResume)    setResumeAnalysisState(JSON.parse(savedResume));
      if (savedRoadmap)   setRoadmapStages(JSON.parse(savedRoadmap));
      if (savedCoding)    setCodingStats(JSON.parse(savedCoding));
      if (savedInterview) setInterviewHistory(JSON.parse(savedInterview));
    } catch {
      // silently handle corrupted storage
    }
  }, []);

  // Persist to localStorage
  useEffect(() => { if (user) localStorage.setItem('cc_user', JSON.stringify(user)); else localStorage.removeItem('cc_user'); }, [user]);
  useEffect(() => { if (profile) localStorage.setItem('cc_profile', JSON.stringify(profile)); else localStorage.removeItem('cc_profile'); }, [profile]);
  useEffect(() => { localStorage.setItem('cc_resume', JSON.stringify(resumeAnalysis)); }, [resumeAnalysis]);
  useEffect(() => { localStorage.setItem('cc_roadmap', JSON.stringify(roadmapStages)); }, [roadmapStages]);
  useEffect(() => { localStorage.setItem('cc_coding', JSON.stringify(codingStats)); }, [codingStats]);
  useEffect(() => { localStorage.setItem('cc_interview', JSON.stringify(interviewHistory)); }, [interviewHistory]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    const savedUsers = JSON.parse(localStorage.getItem('cc_users') || '[]');
    const found = savedUsers.find((u: any) => u.email === email);
    if (found) {
      const uid = found.id;
      setUser({ id: uid, email: found.email, name: found.name });

      // Restore all per-user state from localStorage
      try {
        const savedProfile  = localStorage.getItem(`cc_profile_${uid}`);
        const savedResume   = localStorage.getItem(`cc_resume_${uid}`);
        const savedRoadmap  = localStorage.getItem(`cc_roadmap_${uid}`);
        const savedCoding   = localStorage.getItem(`cc_coding_${uid}`);
        const savedInterview = localStorage.getItem(`cc_interview_${uid}`);

        if (savedProfile)   setProfileState(JSON.parse(savedProfile));
        if (savedResume)    setResumeAnalysisState(JSON.parse(savedResume));
        if (savedRoadmap)   setRoadmapStages(JSON.parse(savedRoadmap));
        if (savedCoding)    setCodingStats(JSON.parse(savedCoding));
        if (savedInterview) setInterviewHistory(JSON.parse(savedInterview));
      } catch { /* ignore corrupted keys */ }

      return true;
    }
    return false;
  };

  const signup = async (email: string, _password: string, name: string): Promise<boolean> => {
    const savedUsers = JSON.parse(localStorage.getItem('cc_users') || '[]');
    if (savedUsers.find((u: any) => u.email === email)) return false;
    const newUser = { id: `user_${Date.now()}`, email, name };
    savedUsers.push(newUser);
    localStorage.setItem('cc_users', JSON.stringify(savedUsers));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setProfileState(null);
    setResumeAnalysisState(DEFAULT_RESUME);
    setRoadmapStages([]);
    setCodingStats(DEFAULT_CODING);
    setInterviewHistory([]);
    localStorage.removeItem('cc_user');
  };

  const setProfile = (p: StudentProfile) => {
    setProfileState(p);
    if (user) localStorage.setItem(`cc_profile_${user.id}`, JSON.stringify(p));
  };

  const setResumeAnalysis = (a: ResumeAnalysis) => {
    setResumeAnalysisState(a);
    if (user) localStorage.setItem(`cc_resume_${user.id}`, JSON.stringify(a));
  };

  const updateRoadmapStage = (stageId: string, status: RoadmapStage['status']) => {
    setRoadmapStages(prev => {
      const next = prev.map(s => s.id === stageId ? { ...s, status } : s);
      if (user) localStorage.setItem(`cc_roadmap_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const updateCodingStats = (topic: string, solved: boolean) => {
    setCodingStats(prev => {
      const topicData = prev.topicPerformance[topic] || { attempted: 0, solved: 0 };
      const next = {
        attempted: prev.attempted + 1,
        solved: solved ? prev.solved + 1 : prev.solved,
        topicPerformance: {
          ...prev.topicPerformance,
          [topic]: {
            attempted: topicData.attempted + 1,
            solved: solved ? topicData.solved + 1 : topicData.solved,
          },
        },
      };
      if (user) localStorage.setItem(`cc_coding_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const addInterviewSession = (session: InterviewSession) => {
    setInterviewHistory(prev => {
      const next = [session, ...prev];
      if (user) localStorage.setItem(`cc_interview_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      profile,
      resumeAnalysis,
      roadmapStages,
      codingStats,
      interviewHistory,
      toasts,
      login,
      signup,
      logout,
      setProfile,
      setResumeAnalysis,
      updateRoadmapStage,
      updateCodingStats,
      addInterviewSession,
      addToast,
      removeToast,
      isAuthenticated: !!user,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
