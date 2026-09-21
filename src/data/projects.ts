export interface Project {
  id: string;
  title: string;
  problemStatement: string;
  whyItFits: string;
  technologies: string[];
  skillsGained: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedOutcome: string;
  domains: string[];
  roleIds: string[];
}

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Personal Portfolio Website',
    problemStatement: 'Showcase your skills, projects, and contact information to potential employers.',
    whyItFits: 'Every developer needs a portfolio. This builds core HTML/CSS/JS skills and gives you something to share with recruiters.',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'GitHub Pages'],
    skillsGained: ['HTML', 'CSS', 'Responsive Design', 'Deployment'],
    difficulty: 'beginner',
    expectedOutcome: 'A live, hosted portfolio website',
    domains: ['Web Development'],
    roleIds: ['fullstack', 'frontend'],
  },
  {
    id: 'p2',
    title: 'Task Management App',
    problemStatement: 'Build a web app to create, organize, and track personal tasks with deadlines.',
    whyItFits: 'Teaches React state management, local storage, and UI design while solving a real problem.',
    technologies: ['React', 'CSS Modules', 'localStorage'],
    skillsGained: ['React', 'State Management', 'UI Design', 'JavaScript'],
    difficulty: 'intermediate',
    expectedOutcome: 'A fully functional React app with CRUD operations',
    domains: ['Web Development'],
    roleIds: ['fullstack', 'frontend'],
  },
  {
    id: 'p3',
    title: 'RESTful Blog API',
    problemStatement: 'Design and build a complete REST API for a blogging platform with authentication.',
    whyItFits: 'Teaches backend fundamentals: routing, authentication, database design, and API documentation.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Swagger'],
    skillsGained: ['Node.js', 'REST APIs', 'MongoDB', 'Authentication', 'Swagger'],
    difficulty: 'intermediate',
    expectedOutcome: 'A documented REST API deployable to cloud platforms',
    domains: ['Web Development'],
    roleIds: ['fullstack', 'backend'],
  },
  {
    id: 'p4',
    title: 'Movie Recommendation System',
    problemStatement: 'Build an ML system that recommends movies based on user preferences and watch history.',
    whyItFits: 'Introduces collaborative filtering, content-based filtering, and practical ML deployment.',
    technologies: ['Python', 'Pandas', 'Scikit-learn', 'Flask', 'React'],
    skillsGained: ['Machine Learning', 'Python', 'Data Analysis', 'API Integration'],
    difficulty: 'intermediate',
    expectedOutcome: 'Working recommendation engine with a web interface',
    domains: ['Artificial Intelligence', 'Data Science'],
    roleIds: ['aiml', 'datascience'],
  },
  {
    id: 'p5',
    title: 'Sentiment Analysis Dashboard',
    problemStatement: 'Analyze Twitter/social media text to detect sentiment trends on any topic.',
    whyItFits: 'Combines NLP, data visualization, and API integration — core skills for AI/ML engineers.',
    technologies: ['Python', 'Transformers', 'Plotly', 'FastAPI', 'Hugging Face'],
    skillsGained: ['NLP', 'Transformers', 'Data Visualization', 'API Design'],
    difficulty: 'advanced',
    expectedOutcome: 'Real-time sentiment tracking dashboard',
    domains: ['Artificial Intelligence'],
    roleIds: ['aiml'],
  },
  {
    id: 'p6',
    title: 'Student Result Management System',
    problemStatement: 'Web application for managing student academic records, grades, and reports.',
    whyItFits: 'Perfect for CSE/IT students — covers full-stack development, database design, and role-based access.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Express'],
    skillsGained: ['Full Stack', 'Database Design', 'Role-based Auth'],
    difficulty: 'intermediate',
    expectedOutcome: 'Multi-role web application with admin, teacher, and student views',
    domains: ['Web Development'],
    roleIds: ['fullstack', 'backend'],
  },
  {
    id: 'p7',
    title: 'Real-Time Chat Application',
    problemStatement: 'Build a real-time messaging app with rooms, typing indicators, and message history.',
    whyItFits: 'Teaches WebSockets, real-time communication, and scalable backend architecture.',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    skillsGained: ['WebSockets', 'Real-time Systems', 'React', 'Node.js'],
    difficulty: 'advanced',
    expectedOutcome: 'Deployed real-time chat application',
    domains: ['Web Development'],
    roleIds: ['fullstack', 'backend'],
  },
  {
    id: 'p8',
    title: 'House Price Prediction Model',
    problemStatement: 'Predict housing prices based on location, size, and features using ML regression.',
    whyItFits: 'Classic ML project covering data cleaning, feature engineering, regression models, and evaluation.',
    technologies: ['Python', 'Pandas', 'Scikit-learn', 'Matplotlib', 'Streamlit'],
    skillsGained: ['Regression', 'Feature Engineering', 'Model Evaluation', 'Data Visualization'],
    difficulty: 'beginner',
    expectedOutcome: 'Deployed Streamlit application with prediction interface',
    domains: ['Data Science', 'Artificial Intelligence'],
    roleIds: ['datascience', 'aiml'],
  },
  {
    id: 'p9',
    title: 'CI/CD Pipeline Automation',
    problemStatement: 'Set up a complete automated pipeline with testing, building, and deployment stages.',
    whyItFits: 'Core DevOps skill: automates software delivery, reduces errors, and teaches modern deployment practices.',
    technologies: ['GitHub Actions', 'Docker', 'AWS EC2', 'Nginx'],
    skillsGained: ['CI/CD', 'Docker', 'Cloud Deployment', 'Automation'],
    difficulty: 'advanced',
    expectedOutcome: 'Working CI/CD pipeline that auto-deploys on push',
    domains: ['Infrastructure'],
    roleIds: ['devops'],
  },
  {
    id: 'p10',
    title: 'Android Expense Tracker',
    problemStatement: 'Mobile app to track daily expenses, categorize spending, and visualize monthly budget.',
    whyItFits: 'Full Android development lifecycle: UI design, local database, charts, and user experience.',
    technologies: ['Kotlin', 'Android SDK', 'Room DB', 'MPAndroidChart'],
    skillsGained: ['Kotlin', 'Android Development', 'Room Database', 'UI Design'],
    difficulty: 'intermediate',
    expectedOutcome: 'Published Android app on Play Store',
    domains: ['Mobile Development'],
    roleIds: ['android'],
  },
];

export function getRecommendedProjects(roleId: string, existingSkills: string[], maxCount = 4): Project[] {
  const roleProjects = PROJECTS.filter(p => p.roleIds.includes(roleId));
  if (roleProjects.length === 0) return PROJECTS.slice(0, maxCount);

  // Prioritize projects where student has some relevant skills
  const scored = roleProjects.map(p => {
    const overlap = p.technologies.filter(t =>
      existingSkills.some(s => s.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(s.toLowerCase()))
    ).length;
    return { ...p, score: overlap };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, maxCount);
}
