import type { RoadmapStage } from '../context/AppContext';

export interface RoadmapTemplate {
  roleId: string;
  stages: Omit<RoadmapStage, 'status'>[];
}

export const ROADMAP_TEMPLATES: RoadmapTemplate[] = [
  {
    roleId: 'fullstack',
    stages: [
      {
        id: 'fs_1', title: 'Web Foundations',
        skills: ['HTML5', 'CSS3', 'Responsive Design', 'Git Basics'],
        objectives: ['Build semantic HTML pages', 'Style with modern CSS', 'Use Flexbox & Grid', 'Version control basics'],
        project: 'Personal Portfolio Website',
      },
      {
        id: 'fs_2', title: 'JavaScript Core',
        skills: ['ES6+', 'DOM Manipulation', 'Async/Await', 'Fetch API'],
        objectives: ['Understand JS fundamentals', 'Work with APIs', 'Handle async operations', 'Manipulate the DOM'],
        project: 'Weather App with API Integration',
      },
      {
        id: 'fs_3', title: 'Frontend Framework',
        skills: ['React.js', 'Components', 'Hooks', 'State Management'],
        objectives: ['Build React components', 'Manage application state', 'Handle routing', 'Build reusable UI'],
        project: 'Task Management App (React)',
      },
      {
        id: 'fs_4', title: 'Backend Development',
        skills: ['Node.js', 'Express.js', 'REST APIs', 'Middleware'],
        objectives: ['Build REST APIs', 'Handle authentication', 'Middleware patterns', 'Error handling'],
        project: 'RESTful API for Blog Platform',
      },
      {
        id: 'fs_5', title: 'Database Integration',
        skills: ['SQL', 'MongoDB', 'ORM/ODM', 'Data Modeling'],
        objectives: ['Design database schemas', 'CRUD operations', 'Relationships', 'Query optimization'],
        project: 'Database-backed Full Stack App',
      },
      {
        id: 'fs_6', title: 'Authentication & Security',
        skills: ['JWT', 'bcrypt', 'OAuth', 'HTTPS', 'Input Validation'],
        objectives: ['Implement login/signup', 'JWT authentication', 'Secure routes', 'Password hashing'],
        project: 'Secure Auth System',
      },
      {
        id: 'fs_7', title: 'Full-Stack Project',
        skills: ['React + Node', 'Deployment', 'Environment Variables', 'CI/CD Basics'],
        objectives: ['Build complete app', 'Deploy frontend and backend', 'Handle production concerns', 'Testing basics'],
        project: 'E-Commerce or Social Platform',
      },
      {
        id: 'fs_8', title: 'Interview Preparation',
        skills: ['DSA', 'System Design', 'Behavioral Questions', 'Problem Solving'],
        objectives: ['Solve 50+ DSA problems', 'System design basics', 'Mock interviews', 'Build portfolio'],
        project: 'Final Portfolio + GitHub Profile',
      },
    ],
  },
  {
    roleId: 'aiml',
    stages: [
      {
        id: 'ai_1', title: 'Python for AI',
        skills: ['Python', 'NumPy', 'Pandas', 'Matplotlib'],
        objectives: ['Python programming', 'Data manipulation', 'Visualization', 'Jupyter notebooks'],
        project: 'Exploratory Data Analysis Project',
      },
      {
        id: 'ai_2', title: 'Mathematics for ML',
        skills: ['Linear Algebra', 'Statistics', 'Probability', 'Calculus Basics'],
        objectives: ['Vectors and matrices', 'Probability distributions', 'Statistical inference', 'Gradient basics'],
        project: 'Statistical Analysis Report',
      },
      {
        id: 'ai_3', title: 'Machine Learning Core',
        skills: ['Scikit-learn', 'Regression', 'Classification', 'Clustering'],
        objectives: ['Supervised learning', 'Model evaluation', 'Feature engineering', 'Cross-validation'],
        project: 'Prediction Model (House Prices / Disease)',
      },
      {
        id: 'ai_4', title: 'Deep Learning',
        skills: ['Neural Networks', 'TensorFlow/PyTorch', 'CNNs', 'Backpropagation'],
        objectives: ['Build neural networks', 'Train and evaluate models', 'Handle overfitting', 'Hyperparameter tuning'],
        project: 'Image Classification with CNN',
      },
      {
        id: 'ai_5', title: 'NLP & Advanced AI',
        skills: ['NLP Basics', 'Transformers', 'Hugging Face', 'Text Classification'],
        objectives: ['Text preprocessing', 'Sentiment analysis', 'Fine-tuning models', 'LLM basics'],
        project: 'Sentiment Analysis / Chatbot',
      },
      {
        id: 'ai_6', title: 'MLOps & Deployment',
        skills: ['Model Deployment', 'Flask/FastAPI', 'Docker', 'Monitoring'],
        objectives: ['Serve ML models', 'Build APIs', 'Containerize models', 'Monitor performance'],
        project: 'Deployed ML Application',
      },
    ],
  },
  {
    roleId: 'datascience',
    stages: [
      {
        id: 'ds_1', title: 'Python & Data Basics',
        skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
        objectives: ['Data loading and cleaning', 'Exploratory analysis', 'Visualization', 'Statistical summaries'],
        project: 'Dataset EDA Report',
      },
      {
        id: 'ds_2', title: 'SQL & Databases',
        skills: ['SQL', 'Joins', 'Aggregations', 'Window Functions'],
        objectives: ['Query databases', 'Aggregate data', 'Join multiple tables', 'Optimize queries'],
        project: 'Business Intelligence SQL Project',
      },
      {
        id: 'ds_3', title: 'Statistics & Probability',
        skills: ['Hypothesis Testing', 'A/B Testing', 'Regression Analysis', 'Distributions'],
        objectives: ['Statistical testing', 'Correlation analysis', 'Predictive modeling', 'Uncertainty quantification'],
        project: 'A/B Test Analysis',
      },
      {
        id: 'ds_4', title: 'Machine Learning',
        skills: ['Scikit-learn', 'Feature Engineering', 'Model Selection', 'Evaluation Metrics'],
        objectives: ['Build ML pipelines', 'Feature selection', 'Model comparison', 'Prevent overfitting'],
        project: 'End-to-End ML Pipeline',
      },
      {
        id: 'ds_5', title: 'Data Visualization & BI',
        skills: ['Tableau', 'Power BI', 'Plotly', 'Dashboards'],
        objectives: ['Build dashboards', 'Storytelling with data', 'Interactive charts', 'Business reporting'],
        project: 'Business Dashboard',
      },
    ],
  },
];

export function generateRoadmap(roleId: string): RoadmapStage[] {
  const template = ROADMAP_TEMPLATES.find(t => t.roleId === roleId);
  if (!template) {
    // Generic roadmap
    return [
      {
        id: 'gen_1', title: 'Foundation Skills',
        skills: ['Core Programming', 'Problem Solving', 'Version Control'],
        objectives: ['Learn fundamentals', 'Practice algorithms', 'Use Git'],
        project: 'Basic Projects',
        status: 'not_started',
      },
    ];
  }
  return template.stages.map(s => ({ ...s, status: 'not_started' as const }));
}
