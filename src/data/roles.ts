export interface Role {
  id: string;
  title: string;
  domain: string;
  coreSkills: string[];
  advancedSkills: string[];
  tools: string[];
}

export const ROLES: Role[] = [
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    domain: 'Web Development',
    coreSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL'],
    advancedSkills: ['TypeScript', 'REST APIs', 'GraphQL', 'Docker', 'Redis', 'System Design'],
    tools: ['Git', 'VS Code', 'Postman', 'MongoDB', 'PostgreSQL'],
  },
  {
    id: 'frontend',
    title: 'Frontend Developer',
    domain: 'Web Development',
    coreSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design'],
    advancedSkills: ['TypeScript', 'Vue.js', 'Performance Optimization', 'Accessibility', 'Testing'],
    tools: ['Git', 'Figma', 'Webpack', 'Tailwind CSS'],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    domain: 'Web Development',
    coreSkills: ['Node.js', 'Python', 'REST APIs', 'SQL', 'Authentication'],
    advancedSkills: ['Microservices', 'Message Queues', 'Caching', 'System Design', 'CI/CD'],
    tools: ['Git', 'Docker', 'PostgreSQL', 'Redis', 'AWS'],
  },
  {
    id: 'aiml',
    title: 'AI/ML Engineer',
    domain: 'Artificial Intelligence',
    coreSkills: ['Python', 'Statistics', 'Linear Algebra', 'Machine Learning', 'Data Preprocessing'],
    advancedSkills: ['Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'Model Deployment'],
    tools: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Jupyter', 'Hugging Face'],
  },
  {
    id: 'datascience',
    title: 'Data Scientist',
    domain: 'Data Science',
    coreSkills: ['Python', 'Statistics', 'Data Analysis', 'SQL', 'Data Visualization'],
    advancedSkills: ['Machine Learning', 'Feature Engineering', 'A/B Testing', 'BI Tools', 'Big Data'],
    tools: ['Pandas', 'NumPy', 'Matplotlib', 'Tableau', 'Power BI'],
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    domain: 'Infrastructure',
    coreSkills: ['Linux', 'Scripting', 'Git', 'CI/CD', 'Containerization'],
    advancedSkills: ['Kubernetes', 'Terraform', 'Cloud Platforms', 'Monitoring', 'Security'],
    tools: ['Docker', 'Jenkins', 'GitHub Actions', 'AWS/GCP/Azure', 'Prometheus'],
  },
  {
    id: 'android',
    title: 'Android Developer',
    domain: 'Mobile Development',
    coreSkills: ['Java', 'Kotlin', 'Android SDK', 'UI Design', 'REST APIs'],
    advancedSkills: ['Jetpack Compose', 'MVVM', 'Firebase', 'Testing', 'Publishing'],
    tools: ['Android Studio', 'Git', 'Firebase', 'Retrofit', 'Room DB'],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst',
    domain: 'Security',
    coreSkills: ['Networking', 'Linux', 'Security Fundamentals', 'Python', 'Cryptography'],
    advancedSkills: ['Penetration Testing', 'Incident Response', 'SIEM', 'Threat Analysis', 'Compliance'],
    tools: ['Wireshark', 'Kali Linux', 'Nmap', 'Metasploit', 'Splunk'],
  },
];

export const DOMAINS = [
  'Web Development', 'Artificial Intelligence', 'Data Science', 'Mobile Development',
  'Infrastructure', 'Security', 'Embedded Systems', 'Robotics', 'Cloud Computing',
];

export const BRANCHES = [
  'Computer Science Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Data Science',
  'Cyber Security',
  'Other',
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
export const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
export const DEGREES = ['B.Tech', 'B.E.', 'B.Sc.', 'BCA', 'M.Tech', 'M.E.', 'MCA', 'Other'];

export const COMMON_SKILLS = [
  'Python', 'Java', 'JavaScript', 'C', 'C++', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby',
  'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring Boot',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Machine Learning', 'Deep Learning', 'Data Analysis', 'Computer Vision', 'NLP',
  'Git', 'Docker', 'Linux', 'AWS', 'Firebase', 'REST APIs',
];
