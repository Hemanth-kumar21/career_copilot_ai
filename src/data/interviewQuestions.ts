export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'conceptual' | 'behavioral' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  roleIds: string[];
  referenceAnswer: string;
  keyPoints: string[];
  followUp?: string;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Full Stack
  {
    id: 'iq1',
    question: 'Explain the difference between synchronous and asynchronous JavaScript. When would you use Promises vs async/await?',
    category: 'conceptual',
    difficulty: 'medium',
    roleIds: ['fullstack', 'frontend', 'backend'],
    referenceAnswer: 'Synchronous JS executes line by line, blocking execution. Asynchronous JS allows non-blocking operations. Promises provide a chainable way to handle async operations with .then()/.catch(). async/await is syntactic sugar over Promises that makes async code look synchronous, improving readability. Use async/await for sequential async operations and Promise.all() for parallel operations.',
    keyPoints: ['Blocking vs non-blocking', 'Promise chain vs async/await', 'Error handling with try/catch', 'Promise.all for parallel operations'],
  },
  {
    id: 'iq2',
    question: 'What is the difference between REST and GraphQL? When would you choose one over the other?',
    category: 'conceptual',
    difficulty: 'medium',
    roleIds: ['fullstack', 'backend'],
    referenceAnswer: 'REST uses fixed endpoints returning predefined data structures. GraphQL uses a single endpoint where clients specify exact data needs. Choose REST for simple CRUD APIs, public APIs, or caching needs. Choose GraphQL for complex data requirements, mobile apps (bandwidth), or when frontend teams need flexibility. GraphQL solves over-fetching and under-fetching problems.',
    keyPoints: ['Over/under fetching', 'Schema definition', 'Caching differences', 'When to use each'],
  },
  {
    id: 'iq3',
    question: 'Explain how JWT authentication works and its security considerations.',
    category: 'technical',
    difficulty: 'medium',
    roleIds: ['fullstack', 'backend'],
    referenceAnswer: 'JWT (JSON Web Token) consists of header, payload, and signature. Server creates token after login, client stores it and sends in Authorization header. Server verifies signature without database lookup. Security considerations: use HTTPS, short expiry + refresh tokens, store securely (HttpOnly cookies vs localStorage), include only necessary claims, never store sensitive data in payload (it\'s base64 not encrypted).',
    keyPoints: ['Structure: header.payload.signature', 'Stateless authentication', 'Security risks: XSS, CSRF', 'Refresh token pattern'],
  },
  {
    id: 'iq4',
    question: 'What is CORS and how do you configure it properly on a Node.js backend?',
    category: 'technical',
    difficulty: 'easy',
    roleIds: ['fullstack', 'backend'],
    referenceAnswer: 'CORS (Cross-Origin Resource Sharing) is a browser security mechanism restricting HTTP requests to a different origin. Configure with specific allowed origins (not *), methods, and headers. In Express: use cors() middleware with options. For credentials, set credentials:true and specify exact origin. Preflight requests (OPTIONS) should be handled automatically.',
    keyPoints: ['Same-origin policy', 'Preflight requests', 'Specific origins vs wildcard', 'Credentials handling'],
  },
  // AI/ML
  {
    id: 'iq5',
    question: 'Explain overfitting and underfitting in machine learning. How do you detect and prevent them?',
    category: 'conceptual',
    difficulty: 'medium',
    roleIds: ['aiml', 'datascience'],
    referenceAnswer: 'Overfitting: model learns training data too well, performs poorly on unseen data (high variance). Underfitting: model too simple to capture patterns (high bias). Detect: compare train vs validation performance. Prevent overfitting: regularization (L1/L2), dropout, more data, cross-validation, early stopping, simpler model. Prevent underfitting: more complex model, more features, longer training.',
    keyPoints: ['Bias-variance tradeoff', 'Train vs validation metrics', 'Regularization techniques', 'Cross-validation'],
  },
  {
    id: 'iq6',
    question: 'What is the difference between supervised, unsupervised, and reinforcement learning?',
    category: 'conceptual',
    difficulty: 'easy',
    roleIds: ['aiml', 'datascience'],
    referenceAnswer: 'Supervised learning: model learns from labeled data (input-output pairs). Examples: classification, regression. Unsupervised learning: model finds patterns in unlabeled data. Examples: clustering, dimensionality reduction. Reinforcement learning: agent learns through rewards/penalties by interacting with environment. Use cases: games, robotics, recommendation systems.',
    keyPoints: ['Labeled vs unlabeled data', 'Examples of each type', 'When to use each', 'Common algorithms'],
  },
  {
    id: 'iq7',
    question: 'Explain the gradient descent algorithm and its variants (batch, mini-batch, stochastic).',
    category: 'technical',
    difficulty: 'hard',
    roleIds: ['aiml'],
    referenceAnswer: 'Gradient descent minimizes loss by iteratively moving in the direction of steepest descent (negative gradient). Batch GD: uses entire dataset per update (stable but slow). Stochastic GD: one sample per update (fast but noisy). Mini-batch: compromise, uses small batches (most common in practice). Variants: Adam, RMSprop, AdaGrad adapt learning rates. Learning rate selection is critical.',
    keyPoints: ['Loss minimization', 'Learning rate', 'Batch vs stochastic tradeoffs', 'Adaptive optimizers'],
  },
  {
    id: 'iq8',
    question: 'What is a transformer architecture and why did it revolutionize NLP?',
    category: 'conceptual',
    difficulty: 'hard',
    roleIds: ['aiml'],
    referenceAnswer: 'Transformers use self-attention mechanism allowing each token to attend to all other tokens simultaneously, capturing long-range dependencies better than RNNs. Key components: multi-head attention, positional encoding, feed-forward layers, layer normalization. Advantages: parallelizable training, better context understanding, scalable. Led to BERT, GPT, T5 and modern LLMs.',
    keyPoints: ['Self-attention mechanism', 'Positional encoding', 'Parallelization advantage', 'Relation to RNN/LSTM'],
  },
  // General CS
  {
    id: 'iq9',
    question: 'Explain the time and space complexity of merge sort. Why is it preferred over bubble sort?',
    category: 'technical',
    difficulty: 'easy',
    roleIds: ['fullstack', 'backend', 'aiml', 'datascience'],
    referenceAnswer: 'Merge sort: O(n log n) time in all cases, O(n) space. Divide array into halves recursively, then merge sorted halves. Bubble sort: O(n²) average and worst case. Merge sort is preferred for large datasets because it\'s consistently O(n log n) and stable. Bubble sort only useful for nearly-sorted small arrays.',
    keyPoints: ['O(n log n) time complexity', 'Divide and conquer', 'Stable sort', 'Comparison with O(n²) sorts'],
  },
  {
    id: 'iq10',
    question: 'What are SOLID principles? Give a brief example of each.',
    category: 'conceptual',
    difficulty: 'medium',
    roleIds: ['fullstack', 'backend'],
    referenceAnswer: 'S - Single Responsibility: one class, one reason to change. O - Open/Closed: open for extension, closed for modification. L - Liskov Substitution: subtypes must be substitutable for base types. I - Interface Segregation: many specific interfaces over one general. D - Dependency Inversion: depend on abstractions, not concrete implementations. Following SOLID leads to maintainable, testable code.',
    keyPoints: ['Each principle explained', 'Why they matter', 'Practical application', 'Violation examples'],
  },
  // Frontend
  {
    id: 'iq11',
    question: 'Explain the virtual DOM and how React uses it to improve performance.',
    category: 'conceptual',
    difficulty: 'medium',
    roleIds: ['frontend', 'fullstack'],
    referenceAnswer: 'The virtual DOM is an in-memory representation of the real DOM. React compares the new virtual DOM with the previous version (reconciliation/diffing). Only the parts that changed are re-rendered in the real DOM (patching). This avoids costly full DOM re-renders. React\'s Fiber architecture further improves scheduling by breaking rendering into units of work.',
    keyPoints: ['Virtual DOM concept', 'Reconciliation/diffing', 'Selective real DOM updates', 'Performance benefit over direct DOM manipulation'],
  },
  {
    id: 'iq12',
    question: 'What is CSS specificity and how does the cascade work?',
    category: 'technical',
    difficulty: 'easy',
    roleIds: ['frontend'],
    referenceAnswer: 'Specificity determines which CSS rule applies when multiple rules match. Order: inline > ID > class/attribute/pseudo-class > element. Calculated as (a,b,c,d) where a=inline, b=IDs, c=classes, d=elements. The cascade combines specificity, importance (!important), and source order. Understanding specificity prevents unexpected style overrides.',
    keyPoints: ['Specificity calculation', 'Cascade order', 'Inline vs external', '!important usage'],
  },
  // DevOps
  {
    id: 'iq13',
    question: 'What is the difference between Docker containers and virtual machines?',
    category: 'conceptual',
    difficulty: 'medium',
    roleIds: ['devops', 'backend', 'fullstack'],
    referenceAnswer: 'VMs virtualise hardware with a full OS stack (heavy, GBs, slower boot). Containers share the host OS kernel, isolating only the application and its dependencies (lightweight, MBs, seconds to start). Docker uses Linux namespaces and cgroups for isolation. Containers are more portable and resource-efficient; VMs offer stronger isolation and full OS-level control.',
    keyPoints: ['OS sharing vs hypervisor', 'Resource efficiency', 'Startup time', 'Isolation level'],
  },
  {
    id: 'iq14',
    question: 'Explain CI/CD and describe the stages of a typical pipeline.',
    category: 'technical',
    difficulty: 'medium',
    roleIds: ['devops', 'backend'],
    referenceAnswer: 'CI (Continuous Integration) means developers merge code frequently with automated testing. CD (Continuous Delivery/Deployment) extends this to automatically release to staging or production. Typical pipeline: source commit → build → unit tests → integration tests → static analysis → security scan → staging deploy → smoke tests → production deploy. Benefits: faster feedback, fewer integration issues, safer deployments.',
    keyPoints: ['CI vs CD distinction', 'Automated testing', 'Pipeline stages', 'Deployment strategies (blue-green, canary)'],
  },
  // Android
  {
    id: 'iq15',
    question: 'Explain the Android Activity lifecycle and its key callback methods.',
    category: 'technical',
    difficulty: 'medium',
    roleIds: ['android'],
    referenceAnswer: 'Activity lifecycle: onCreate (initialise) → onStart (visible) → onResume (interactive) → onPause (partially visible) → onStop (not visible) → onDestroy (destroyed). onRestart when returning from stopped. Important: save state in onSaveInstanceState, release resources in onPause/onStop to avoid leaks. Understanding lifecycle is critical for preventing memory leaks and UI bugs.',
    keyPoints: ['Lifecycle states', 'Key callbacks', 'State saving', 'Memory management'],
  },
  // Data Science
  {
    id: 'iq16',
    question: 'What is the difference between correlation and causation? Why does it matter in data analysis?',
    category: 'conceptual',
    difficulty: 'easy',
    roleIds: ['datascience', 'aiml'],
    referenceAnswer: 'Correlation measures statistical relationship between variables (Pearson r: -1 to 1). Causation means one variable directly causes another. Correlation ≠ causation — a third (confounding) variable may explain both. Establishing causation requires controlled experiments or causal inference methods. Mistaking correlation for causation leads to wrong business decisions and flawed models.',
    keyPoints: ['Definition of each', 'Confounding variables', 'Controlled experiments', 'Real-world example'],
  },
  // Cybersecurity
  {
    id: 'iq17',
    question: 'What is SQL injection and how do you prevent it?',
    category: 'technical',
    difficulty: 'medium',
    roleIds: ['cybersecurity', 'backend', 'fullstack'],
    referenceAnswer: 'SQL injection occurs when untrusted user input is directly concatenated into SQL queries, allowing attackers to manipulate the query (e.g., bypass login, dump data). Prevention: parameterised queries / prepared statements (most effective), stored procedures, input validation, least-privilege database accounts, ORM usage, WAF. Never use string concatenation for SQL queries.',
    keyPoints: ['Attack mechanism', 'Prepared statements', 'Input validation', 'Least privilege principle'],
  },
];

export function getInterviewQuestions(roleId: string, count: number = 5): InterviewQuestion[] {
  const roleQuestions = INTERVIEW_QUESTIONS.filter(q => q.roleIds.includes(roleId));
  if (roleQuestions.length === 0) return INTERVIEW_QUESTIONS.slice(0, count);

  // Mix difficulties
  const easy = roleQuestions.filter(q => q.difficulty === 'easy');
  const medium = roleQuestions.filter(q => q.difficulty === 'medium');
  const hard = roleQuestions.filter(q => q.difficulty === 'hard');

  const result: InterviewQuestion[] = [];
  if (easy.length) result.push(easy[Math.floor(Math.random() * easy.length)]);
  if (medium.length) result.push(medium[Math.floor(Math.random() * medium.length)]);
  if (medium.length > 1) result.push(medium.filter(q => !result.includes(q))[0] || medium[0]);
  if (hard.length) result.push(hard[Math.floor(Math.random() * hard.length)]);
  if (medium.length > 2) result.push(medium.filter(q => !result.includes(q))[0] || medium[0]);

  // Deduplicate
  const unique = result.filter((q, i, arr) => arr.findIndex(x => x.id === q.id) === i);
  return unique.slice(0, count);
}
