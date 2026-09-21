import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, ChevronRight, ChevronLeft, Check, Plus, X, User } from 'lucide-react';
import { useApp, type StudentProfile } from '../context/AppContext';
import { DEGREES, BRANCHES, YEARS, SEMESTERS, ROLES, DOMAINS } from '../data/roles';
import { generateRoadmap } from '../data/roadmaps';
import './Onboarding.css';

const TOTAL_STEPS = 5;

interface StepProps {
  data: Partial<StudentProfile>;
  onChange: (field: string, value: any) => void;
}

function StepAcademic({ data, onChange }: StepProps) {
  return (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Your Name</label>
        <div className="input-wrapper">
          <User size={16} className="input-icon" />
          <input
            type="text"
            className="form-input with-icon"
            placeholder="Full name"
            value={data.name || ''}
            onChange={e => onChange('name', e.target.value)}
            autoComplete="name"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Degree Program</label>
        <select className="form-input" value={data.degree || ''} onChange={e => onChange('degree', e.target.value)}>
          <option value="">Select your degree</option>
          {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Branch / Specialization</label>
        <select className="form-input" value={data.branch || ''} onChange={e => onChange('branch', e.target.value)}>
          <option value="">Select your branch</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="ob-row">
        <div className="form-group">
          <label className="form-label">Current Year</label>
          <select className="form-input" value={data.year || ''} onChange={e => onChange('year', e.target.value)}>
            <option value="">Select year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Semester</label>
          <select className="form-input" value={data.semester || ''} onChange={e => onChange('semester', e.target.value)}>
            <option value="">Select semester</option>
            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepCareerGoals({ data, onChange }: StepProps) {
  return (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Target Career Domain</label>
        <select className="form-input" value={data.targetCareer || ''} onChange={e => onChange('targetCareer', e.target.value)}>
          <option value="">Select a domain</option>
          {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Target Job Role</label>
        <select className="form-input" value={data.targetRole || ''} onChange={e => { onChange('targetRole', e.target.value); }}>
          <option value="">Select a role</option>
          {ROLES.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Preferred Domain / Industry</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Fintech, Healthcare, EdTech, Gaming"
          value={data.preferredDomain || ''}
          onChange={e => onChange('preferredDomain', e.target.value)}
        />
      </div>
    </div>
  );
}

function SkillTagSelector({ label, skills, value, onChange }: {
  label: string;
  skills: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [custom, setCustom] = useState('');

  const toggle = (skill: string) => {
    onChange(value.includes(skill) ? value.filter(s => s !== skill) : [...value, skill]);
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustom('');
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="skill-tags">
        {skills.map(s => (
          <button
            key={s}
            type="button"
            className={`skill-tag ${value.includes(s) ? 'selected' : ''}`}
            onClick={() => toggle(s)}
          >
            {value.includes(s) && <Check size={12} />}
            {s}
          </button>
        ))}
      </div>
      {value.filter(v => !skills.includes(v)).map(v => (
        <span key={v} className="custom-tag">
          {v}
          <button type="button" onClick={() => onChange(value.filter(s => s !== v))}><X size={10} /></button>
        </span>
      ))}
      <div className="custom-add">
        <input
          type="text"
          className="form-input"
          placeholder={`Add custom ${label.toLowerCase()}...`}
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={addCustom}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function StepCurrentSkills({ data, onChange }: StepProps) {
  const LANGS = ['Python', 'Java', 'JavaScript', 'C', 'C++', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Kotlin', 'Swift'];
  const TECH_SKILLS = ['HTML/CSS', 'React', 'Node.js', 'Django', 'SQL', 'MongoDB', 'Machine Learning', 'Data Analysis', 'Linux', 'REST APIs'];
  const TOOLS = ['Git', 'VS Code', 'Docker', 'Figma', 'Postman', 'AWS', 'Firebase', 'Android Studio', 'Jupyter'];

  return (
    <div className="step-form">
      <p className="step-hint">Select skills you're comfortable with. Be honest — this helps us give accurate recommendations.</p>
      <SkillTagSelector
        label="Programming Languages"
        skills={LANGS}
        value={data.programmingLanguages || []}
        onChange={v => onChange('programmingLanguages', v)}
      />
      <SkillTagSelector
        label="Technical Skills"
        skills={TECH_SKILLS}
        value={data.technicalSkills || []}
        onChange={v => onChange('technicalSkills', v)}
      />
      <SkillTagSelector
        label="Tools & Platforms"
        skills={TOOLS}
        value={data.tools || []}
        onChange={v => onChange('tools', v)}
      />
    </div>
  );
}

function StepGoals({ data, onChange }: StepProps) {
  return (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Short-Term Goal (3–6 months)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Get an internship, complete 3 projects, learn React"
          value={data.shortTermGoal || ''}
          onChange={e => onChange('shortTermGoal', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Long-Term Goal (1–3 years)</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Join a product company as a full stack developer"
          value={data.longTermGoal || ''}
          onChange={e => onChange('longTermGoal', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="form-label">What are you currently struggling with?</label>
        <textarea
          className="form-input"
          placeholder="e.g., Understanding data structures, building full projects, finding internships"
          value={data.currentStruggle || ''}
          onChange={e => onChange('currentStruggle', e.target.value)}
          rows={3}
        />
      </div>
      <div className="form-group">
        <label className="form-label">What do you want to become?</label>
        <textarea
          className="form-input"
          placeholder="Describe your dream career in your own words..."
          value={data.aspiration || ''}
          onChange={e => onChange('aspiration', e.target.value)}
          rows={3}
        />
      </div>
      <div className="form-group">
        <label className="form-label">What do you think you need to improve?</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Problem-solving skills, communication, practical experience"
          value={data.improvementAreas || ''}
          onChange={e => onChange('improvementAreas', e.target.value)}
        />
      </div>
    </div>
  );
}

function StepGenerating({ name: _name }: { name: string }) {
  return (
    <div className="generating-state">
      <div className="generating-icon">
        <BrainCircuit size={32} />
      </div>
      <h3>Generating your AI Career Profile</h3>
      <p>Analyzing your background, skills, and goals to create your personalized roadmap...</p>
      <div className="generating-steps">
        {['Analyzing academic background', 'Identifying skill gaps', 'Building learning roadmap', 'Personalizing recommendations'].map((step, i) => (
          <div key={step} className="gen-step" style={{ animationDelay: `${i * 0.5}s` }}>
            <div className="gen-step-dot" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STEP_TITLES = [
  { title: 'Academic Background', sub: 'Tell us about your education' },
  { title: 'Career Goals', sub: 'Where do you want to go?' },
  { title: 'Current Skills', sub: 'What do you already know?' },
  { title: 'Goals & Reflection', sub: 'Share your thoughts and aspirations' },
  { title: 'AI Profile Generation', sub: 'Creating your personalized career plan' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<Partial<StudentProfile>>({
    programmingLanguages: [],
    technicalSkills: [],
    tools: [],
  });
  const { user, setProfile, addToast } = useApp();
  const navigate = useNavigate();

  const updateField = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const canNext = () => {
    if (step === 1) return !!(data.name?.trim() && data.degree && data.branch && data.year && data.semester);
    if (step === 2) return !!(data.targetCareer && data.targetRole);
    if (step === 3) return true; // skills are optional
    if (step === 4) return !!(data.shortTermGoal && data.longTermGoal);
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setGenerating(true);
    setStep(5);

    // Find roleId for roadmap
    const matchedRole = ROLES.find(r => r.title.toLowerCase() === data.targetRole?.toLowerCase());
    const roleId = matchedRole?.id || 'fullstack';

    const profile: StudentProfile = {
      id: user?.id || `profile_${Date.now()}`,
      name: data.name?.trim() || user?.name || '',
      email: user?.email || '',
      degree: data.degree || '',
      branch: data.branch || '',
      year: data.year || '',
      semester: data.semester || '',
      targetCareer: data.targetCareer || '',
      targetRole: data.targetRole || '',
      preferredDomain: data.preferredDomain || '',
      programmingLanguages: data.programmingLanguages || [],
      technicalSkills: data.technicalSkills || [],
      tools: data.tools || [],
      shortTermGoal: data.shortTermGoal || '',
      longTermGoal: data.longTermGoal || '',
      currentStruggle: data.currentStruggle || '',
      aspiration: data.aspiration || '',
      improvementAreas: data.improvementAreas || '',
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
    };

    // Simulate AI generation time
    await new Promise(r => setTimeout(r, 2500));

    setProfile(profile);

    // Generate roadmap and persist per-user
    const roadmapStages = generateRoadmap(roleId);
    const uid = user?.id || profile.id;
    localStorage.setItem(`cc_roadmap_${uid}`, JSON.stringify(roadmapStages));
    // Also set global key for immediate use (AppContext reloads on login)
    localStorage.setItem('cc_roadmap', JSON.stringify(roadmapStages));

    setGenerating(false);
    addToast('success', 'Career profile created! Welcome to Career Copilot AI.');
    navigate('/career-profile');
  };

  const currentStepInfo = STEP_TITLES[step - 1];

  return (
    <div className="onboarding-page">
      <div className="ob-sidebar">
        <div className="ob-brand">
          <BrainCircuit size={20} />
          <span>Career Copilot AI</span>
        </div>
        <div className="ob-steps">
          {STEP_TITLES.slice(0, 4).map((s, i) => (
            <div key={i} className={`ob-step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="ob-step-num">
                {step > i + 1 ? <Check size={14} /> : i + 1}
              </div>
              <div className="ob-step-info">
                <div className="ob-step-title">{s.title}</div>
                <div className="ob-step-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-main">
        <div className="ob-card">
          <div className="ob-progress">
            <div className="ob-progress-bar">
              <div className="ob-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>
            <span className="ob-progress-text">{step} / {TOTAL_STEPS}</span>
          </div>

          <div className="ob-step-header">
            <h2>{currentStepInfo.title}</h2>
            <p>{currentStepInfo.sub}</p>
          </div>

          <div className="ob-step-content">
            {step === 1 && <StepAcademic data={data} onChange={updateField} />}
            {step === 2 && <StepCareerGoals data={data} onChange={updateField} />}
            {step === 3 && <StepCurrentSkills data={data} onChange={updateField} />}
            {step === 4 && <StepGoals data={data} onChange={updateField} />}
            {step === 5 && generating && <StepGenerating name={user?.name || ''} />}
          </div>

          {step < 5 && (
            <div className="ob-actions">
              {step > 1 && (
                <button className="btn btn-ghost" onClick={handleBack}>
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < 4 ? (
                <button className="btn btn-primary" onClick={handleNext} disabled={!canNext()}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleComplete} disabled={!canNext()}>
                  Generate My Career Profile <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
