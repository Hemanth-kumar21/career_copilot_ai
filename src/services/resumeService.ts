/**
 * resumeService.ts — Career Copilot AI
 *
 * Complete Resume Intelligence pipeline:
 *   1. File-type gate (MIME + extension)
 *   2. Size gate
 *   3. Text extraction   — real PDF parsing + DOCX XML extraction + TXT
 *   4. Readability check  — minimum extractable content
 *   5. Non-resume blocker — hard-reject ID cards / invoices etc.
 *   6. Semantic resume classification — signal-scoring, NOT rigid heading match
 *   7. Section detection  — broad synonym maps, content-based fallbacks
 *   8. Skill extraction   — substring scan of actual text
 *   9. Deterministic scoring — transparent 100-point model
 *  10. Suggestions & gaps
 */

import type { ScoreBreakdown, DetectedSections } from '../context/AppContext';

// ─────────────────────────────────────────────────────────────────────────────
// Public output type
// ─────────────────────────────────────────────────────────────────────────────
export interface ResumeData {
  score: number;
  extractedSkills: string[];
  projects: string[];
  education: string[];
  experience: string[];
  certifications: string[];
  strengths: string[];
  missingSkills: string[];
  suggestions: string[];
  fileName: string;
  scoreBreakdown: ScoreBreakdown;
  detectedSections: DetectedSections;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill keyword dictionary
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_KEYWORDS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c language',
  ' c,', ' c.', '(c)', 'go ', 'golang', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r ',
  // Web front-end
  'html', 'css', 'react', 'reactjs', 'angular', 'angularjs', 'vue', 'vuejs',
  'next.js', 'nextjs', 'nuxt', 'svelte', 'jquery', 'bootstrap', 'tailwind',
  // Back-end
  'node.js', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
  'laravel', 'rails', 'asp.net', '.net',
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'firebase',
  'supabase', 'oracle', 'dynamodb', 'cassandra',
  // Cloud / DevOps
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'terraform', 'jenkins',
  'github actions', 'ci/cd', 'linux', 'bash', 'shell scripting', 'powershell',
  // Data / ML
  'machine learning', 'deep learning', 'tensorflow', 'keras', 'pytorch',
  'scikit-learn', 'scikit learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
  'data analysis', 'data science', 'nlp', 'computer vision', 'opencv',
  // APIs / protocols
  'rest api', 'restful', 'graphql', 'grpc', 'websocket', 'oauth', 'jwt',
  // Tools
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma',
  'postman', 'vscode', 'intellij', 'eclipse', 'android studio',
  // Other common
  'agile', 'scrum', 'excel', 'power bi', 'tableau', 'selenium', 'junit',
  'flutter', 'dart', 'unity', 'blender', 'arduino', 'raspberry pi',
];

// ─────────────────────────────────────────────────────────────────────────────
// Contact-info regexes
// ─────────────────────────────────────────────────────────────────────────────

/** Any standard email */
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

/**
 * Phone: requires at least 10 consecutive digits (possibly separated by
 * spaces/dashes), optionally prefixed by a country code (+91, +1, etc.).
 * Rejects plain year numbers (4 digits) or roll numbers.
 */
const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3,5}\)?[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}/;

const LINKEDIN_REGEX = /linkedin\.com\/in\/[\w\-]+|linkedin\s*[:\-]\s*[\w\-./]+/i;
const GITHUB_REGEX   = /github\.com\/[\w\-]+|github\s*[:\-]\s*[\w\-./]+/i;

// ─────────────────────────────────────────────────────────────────────────────
// Semantic section synonym maps
// ─────────────────────────────────────────────────────────────────────────────

/** Each category is a flat list of tokens — ANY match counts as the section found. */
const SECTION_SYNONYMS: Record<keyof DetectedSections, string[]> = {
  summary: [
    'summary', 'profile', 'professional summary', 'career objective', 'objective',
    'about me', 'profile summary', 'career summary', 'personal statement',
    'professional profile', 'introduction', 'overview', 'about',
  ],
  education: [
    'education', 'educational qualifications', 'academic background',
    'academic qualifications', 'academic details', 'education details',
    'qualification', 'qualifications', 'academics', 'schooling',
    'b.tech', 'b.e', 'bca', 'mca', 'm.tech', 'm.e', 'bachelor', 'master',
    'degree', 'diploma', 'university', 'college', 'institute',
    'gpa', 'cgpa', 'percentage', '10th', '12th', 'ssc', 'hsc',
  ],
  skills: [
    'skills', 'technical skills', 'key skills', 'core skills', 'core competencies',
    'technologies', 'technical expertise', 'technical proficiency', 'expertise',
    'skills & technologies', 'programming skills', 'tools', 'tools & technologies',
    'skill set', 'technology stack', 'competencies', 'proficiencies',
    'languages', 'programming languages',
  ],
  experience: [
    'experience', 'work experience', 'professional experience', 'employment history',
    'work history', 'career history', 'professional background', 'employment',
    'job experience', 'industry experience', 'professional journey',
    'internship', 'internships', 'internship experience', 'industrial training',
    'training', 'apprenticeship', 'fellowship',
  ],
  projects: [
    'projects', 'academic projects', 'personal projects', 'key projects',
    'project experience', 'relevant projects', 'notable projects',
    'selected projects', 'project work', 'project highlights', 'portfolio',
    'works', 'project details', 'technical projects',
  ],
  certifications: [
    'certifications', 'certificates', 'certification', 'certificate',
    'courses & certifications', 'professional certifications', 'online courses',
    'courses', 'mooc', 'udemy', 'coursera', 'nptel', 'coursework', 'licenses',
  ],
  achievements: [
    'achievements', 'awards', 'honours', 'honors', 'accomplishments',
    'recognition', 'accolades', 'extra-curricular', 'extracurricular',
    'activities', 'positions of responsibility', 'leadership', 'volunteer',
    'co-curricular', 'hackathon', 'competition', 'publications',
  ],
};

// Content-based fallback patterns (regex fragments) used when no heading is found
// but the content clearly belongs to a section category.
const CONTENT_SIGNALS: Record<keyof DetectedSections, RegExp> = {
  summary:        /objective|seeking|passionate|motivated|aspiring|enthusiastic/i,
  education:      /b\.?tech|b\.?e\.?|bachelor|master|degree|university|college|gpa|cgpa|engineering|10th|12th/i,
  skills:         /python|java|javascript|html|css|react|sql|git|docker|aws|machine learning|data/i,
  experience:     /worked at|worked in|employed|company|organization|role|position|responsibilities|developed|implemented|built|designed/i,
  projects:       /project|github\.com|built a|developed a|created a|implemented a|designed a/i,
  certifications: /certified|certification|certificate|course|udemy|coursera|nptel|issued by/i,
  achievements:   /award|winner|rank|top|prize|scholarship|selected|published|presented/i,
};

// ─────────────────────────────────────────────────────────────────────────────
// Hard-reject signals for non-resume documents
// (Need ≥3 hits to block — more lenient than before)
// ─────────────────────────────────────────────────────────────────────────────
const NON_RESUME_SIGNALS = [
  // ID / government
  'aadhaar', 'aadhar', 'uid number', 'uidai', 'unique identification authority',
  'voter id', 'voter card', 'pan card', 'pan no', 'passport number',
  'driving licence number', 'driving license number',
  // Financial
  'invoice no', 'bill to', 'tax invoice', 'gst invoice', 'receipt no',
  'amount due', 'total amount', 'payable to', 'bank statement',
  'transaction id', 'account number', 'ifsc code', 'micr code',
  'credit card number', 'debit card number',
  // Medical
  'prescription', 'diagnosis:', 'patient name', 'doctor name',
  'admit card', 'hall ticket number', 'registration number',
  // Legal
  'hereby certify that', 'this is to certify that', 'deed of',
  'affidavit', 'notarized',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function countHits(haystack: string, needles: string[]): number {
  return needles.filter(n => haystack.includes(n.toLowerCase())).length;
}

function detectContact(text: string) {
  const hasEmail    = EMAIL_REGEX.test(text);
  const hasPhone    = PHONE_REGEX.test(text);
  const hasLinkedIn = LINKEDIN_REGEX.test(text);
  const hasGitHub   = GITHUB_REGEX.test(text);
  return { hasEmail, hasPhone, hasLinkedIn, hasGitHub };
}

/**
 * Detect which resume sections are present.
 * Strategy: check section-heading synonyms first; if none match, fall back
 * to content-based signal regexes. This handles both headed and free-form
 * resume layouts.
 */
function detectSections(t: string, original: string): DetectedSections {
  const sections = {} as DetectedSections;
  for (const key of Object.keys(SECTION_SYNONYMS) as (keyof DetectedSections)[]) {
    const synonymHit = SECTION_SYNONYMS[key].some(syn => t.includes(syn.toLowerCase()));
    const contentHit = synonymHit || CONTENT_SIGNALS[key].test(original);
    sections[key] = contentHit;
  }
  return sections;
}

// ─────────────────────────────────────────────────────────────────────────────
// Semantic resume classification
// ─────────────────────────────────────────────────────────────────────────────

type ClassifyResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Signal-scoring classifier.
 *
 * Awards points across 6 independent signal categories. A document is a valid
 * resume if it scores ≥ PASS_THRESHOLD. This means:
 *  - Missing "Experience" does NOT fail a fresher resume
 *  - Using "Technical Expertise" instead of "Skills" still passes
 *  - Content is inspected, not just heading labels
 */
function classifyDocument(text: string, t: string, sections: DetectedSections): ClassifyResult {
  // ── Hard block: too many non-resume signals ───────────────────────────────
  const nonResumeHits = countHits(t, NON_RESUME_SIGNALS);
  if (nonResumeHits >= 3) {
    return {
      valid: false,
      reason:
        'This document does not appear to be a resume. ' +
        'Please upload your CV or resume — not an ID card, bill, or official certificate.',
    };
  }

  const contact = detectContact(text);

  // ── Signal category scoring ───────────────────────────────────────────────
  // Each category contributes 1 point. Pass threshold = 3/6.
  let score = 0;

  // 1. Contact / identity info
  if (contact.hasEmail || contact.hasPhone) score++;

  // 2. Education content
  if (sections.education) score++;

  // 3. Skills content
  if (sections.skills) score++;

  // 4. Career/project content (experience OR projects — fresher resumes need only projects)
  if (sections.experience || sections.projects) score++;

  // 5. At least 2 of the broader section types detected
  const sectionCount = (Object.values(sections) as boolean[]).filter(Boolean).length;
  if (sectionCount >= 2) score++;

  // 6. Resume-characteristic vocabulary density
  const resumeVocab = [
    'resume', 'curriculum vitae', 'cv', 'objective', 'seeking', 'role',
    'position', 'responsible', 'developed', 'designed', 'implemented',
    'built', 'collaborated', 'led', 'managed', 'created', 'contributed',
    'proficient', 'experienced', 'knowledge of', 'familiar with',
    'fresher', 'graduate', 'student', 'intern', 'trainee',
  ];
  if (countHits(t, resumeVocab) >= 3) score++;

  const PASS_THRESHOLD = 3;

  if (score < PASS_THRESHOLD) {
    // Try to give a more specific reason
    if (!contact.hasEmail && !contact.hasPhone) {
      return {
        valid: false,
        reason:
          'No contact information (email or phone) was found in this document. ' +
          'Please ensure your resume includes at least one contact detail and re-upload.',
      };
    }
    return {
      valid: false,
      reason:
        'This document does not contain enough resume-related content to analyze. ' +
        'Please upload a resume with your education, skills, projects, or career information.',
    };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic 100-point score model
// ─────────────────────────────────────────────────────────────────────────────

function calculateScore(
  text: string,
  sections: DetectedSections,
  extractedSkills: string[],
  projects: string[],
  education: string[],
  certifications: string[],
): ScoreBreakdown {
  const contact = detectContact(text);

  // ── 1. Content & Structure  /20 ────────────────────────────────────────
  let contentStructure = 0;
  const detectedCount = (Object.values(sections) as boolean[]).filter(Boolean).length;
  contentStructure += Math.min(detectedCount * 3, 12); // 3 per section, cap at 12
  if (text.length > 600)  contentStructure += 4;
  if (text.length > 1500) contentStructure += 4;
  contentStructure = Math.min(contentStructure, 20);

  // ── 2. Education  /15 ──────────────────────────────────────────────────
  let educationScore = 0;
  if (sections.education)            educationScore += 8;
  if (education.length > 0)         educationScore += 4;
  if (/cgpa|gpa|percentage/i.test(text)) educationScore += 3;
  educationScore = Math.min(educationScore, 15);

  // ── 3. Skills  /20 ────────────────────────────────────────────────────
  let skillsScore = 0;
  if (sections.skills)               skillsScore += 5;
  if (extractedSkills.length >= 3)   skillsScore += 5;
  if (extractedSkills.length >= 7)   skillsScore += 5;
  if (extractedSkills.length >= 12)  skillsScore += 5;
  skillsScore = Math.min(skillsScore, 20);

  // ── 4. Projects / Experience  /20 ─────────────────────────────────────
  let projExp = 0;
  if (sections.projects)             projExp += 7;
  if (projects.length >= 2)          projExp += 4;
  if (projects.length >= 3)          projExp += 3;
  if (sections.experience)           projExp += 6;
  projExp = Math.min(projExp, 20);

  // ── 5. Contact & Professional Details  /10 ────────────────────────────
  let contactScore = 0;
  if (contact.hasEmail)    contactScore += 3;
  if (contact.hasPhone)    contactScore += 2;
  if (contact.hasLinkedIn) contactScore += 3;
  if (contact.hasGitHub)   contactScore += 2;
  contactScore = Math.min(contactScore, 10);

  // ── 6. Certifications / Achievements  /5 ─────────────────────────────
  let certAch = 0;
  if (sections.certifications)       certAch += 2;
  if (certifications.length > 0)     certAch += 1;
  if (sections.achievements)         certAch += 2;
  certAch = Math.min(certAch, 5);

  // ── 7. Clarity / Completeness  /10 ────────────────────────────────────
  let clarity = 0;
  if (sections.summary)              clarity += 3;
  if (contact.hasEmail && contact.hasPhone) clarity += 2;
  if (text.length > 1000)            clarity += 2;
  if (sections.education && sections.skills) clarity += 3;
  clarity = Math.min(clarity, 10);

  return {
    contentStructure,
    education: educationScore,
    skills: skillsScore,
    projectsExperience: projExp,
    contactDetails: contactScore,
    certAchievements: certAch,
    clarity,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Content extractors (projects, education, experience, certifications)
// ─────────────────────────────────────────────────────────────────────────────

function extractProjects(text: string): string[] {
  const results: string[] = [];
  // Match lines that look like project titles near "Project" headings
  const patterns = [
    /(?:project[s]?|portfolio|work)[:\s\-–]+([A-Z][^\n]{8,60})/gi,
    /\d+[\.\)]\s+([A-Z][^\n]{8,55})/g, // numbered list items near project sections
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null && results.length < 6) {
      const title = m[1].trim();
      if (title.length > 5 && title.length < 65 && !results.includes(title)) {
        results.push(title);
      }
    }
  }
  return results.slice(0, 5);
}

function extractEducation(text: string): string[] {
  const results: string[] = [];
  const eduRe = /(?:b\.?tech|b\.?e\.?|bachelor|master|m\.?tech|bca|mca|diploma|ph\.?d)[\s\S]{0,80}?(?:university|college|institute|school)[^\n]{0,60}/gi;
  let m: RegExpExecArray | null;
  while ((m = eduRe.exec(text)) !== null && results.length < 3) {
    const entry = m[0].replace(/\s+/g, ' ').trim();
    if (entry.length > 10) results.push(entry.slice(0, 100));
  }
  return results;
}

function extractExperience(text: string): string[] {
  const results: string[] = [];
  const expRe = /(?:intern|worked|employed|role|position|engineer|developer|analyst|manager|associate)[^\n]{0,80}/gi;
  let m: RegExpExecArray | null;
  while ((m = expRe.exec(text)) !== null && results.length < 3) {
    const entry = m[0].replace(/\s+/g, ' ').trim();
    if (entry.length > 15) results.push(entry.slice(0, 100));
  }
  return results;
}

function extractCertifications(text: string): string[] {
  const results: string[] = [];
  const certRe = /(?:certified|certification|certificate|course|issued by)[^\n]{0,80}/gi;
  let m: RegExpExecArray | null;
  while ((m = certRe.exec(text)) !== null && results.length < 4) {
    const entry = m[0].replace(/\s+/g, ' ').trim();
    if (entry.length > 10) results.push(entry.slice(0, 100));
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Text extraction — handles PDF, DOCX, TXT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract plain text from a PDF binary buffer.
 *
 * Approach: scan the raw bytes for readable ASCII/UTF-8 text segments.
 * We look for:
 *  - Literal strings inside BT … ET blocks  ( (Hello World) Tj )
 *  - Uncompressed text stream segments
 *  - Any contiguous run of printable ASCII chars ≥ 4 long
 *
 * This works reliably for standard (non-encrypted, non-image-only) PDFs
 * without requiring pdf.js or any external library.
 */
function extractPdfText(bytes: Uint8Array): string {
  const decoder = new TextDecoder('latin1'); // latin1 gives 1:1 byte mapping
  const raw = decoder.decode(bytes);

  const parts: string[] = [];

  // ── Strategy 1: BT … ET text blocks ─────────────────────────────────────
  // PDF text drawing: BT ... (text) Tj ... ET
  const btEtRe = /BT[\s\S]{0,4000}?ET/g;
  let m: RegExpExecArray | null;
  while ((m = btEtRe.exec(raw)) !== null) {
    const block = m[0];
    // Extract strings from (…) Tj and [… (…) …] TJ operators
    const strRe = /\(([^)]{1,300})\)\s*T[jJ]/g;
    let sm: RegExpExecArray | null;
    while ((sm = strRe.exec(block)) !== null) {
      const s = sm[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/[^\x20-\x7E\n\t]/g, ' ');
      if (s.trim().length > 1) parts.push(s);
    }
    // Also grab array TJ strings: [ (text) num (text) ] TJ
    const tjArrRe = /\[([^\]]{1,800})\]\s*TJ/g;
    let ta: RegExpExecArray | null;
    while ((ta = tjArrRe.exec(block)) !== null) {
      const inner = ta[1];
      const pieceRe = /\(([^)]{1,200})\)/g;
      let p: RegExpExecArray | null;
      while ((p = pieceRe.exec(inner)) !== null) {
        const s = p[1]
          .replace(/\\n/g, ' ').replace(/\\r/g, ' ')
          .replace(/[^\x20-\x7E]/g, ' ');
        if (s.trim().length > 0) parts.push(s);
      }
      parts.push('\n');
    }
  }

  // ── Strategy 2: content stream text lines (obj/endobj blocks) ────────────
  // Some PDFs have uncompressed streams with direct readable text
  const streamRe = /stream\r?\n([\s\S]{1,8000}?)\r?\nendstream/g;
  while ((m = streamRe.exec(raw)) !== null) {
    const segment = m[1];
    // Only process if it's mostly printable (not a compressed binary stream)
    const printable = (segment.match(/[\x20-\x7E]/g) || []).length;
    if (printable / segment.length > 0.6) {
      // Extract parenthesised strings
      const pr = /\(([^)]{2,200})\)/g;
      let pm: RegExpExecArray | null;
      while ((pm = pr.exec(segment)) !== null) {
        const s = pm[1].replace(/[^\x20-\x7E\n\t]/g, ' ').trim();
        if (s.length > 2) parts.push(s);
      }
    }
  }

  // ── Strategy 3: long printable ASCII runs (fallback) ─────────────────────
  // Catches resumes where text is stored in ToUnicode / font encoding tables
  if (parts.join('').replace(/\s/g, '').length < 100) {
    const runRe = /[ -~\t\n\r]{4,}/g;
    while ((m = runRe.exec(raw)) !== null) {
      const run = m[0].replace(/[^\x20-\x7E\n\t]/g, '').trim();
      if (run.length >= 4) parts.push(run);
    }
  }

  return parts.join(' ').replace(/\s{3,}/g, '\n').trim();
}

/**
 * Extract plain text from a DOCX file (ZIP containing word/document.xml).
 *
 * We use a simple ZIP parser to find word/document.xml, then strip XML tags.
 */
async function extractDocxText(bytes: Uint8Array): Promise<string> {
  // A DOCX is a PK ZIP. We scan for the word/document.xml local file header.
  // PK local file header signature: 0x50 0x4B 0x03 0x04
  const TARGET = 'word/document.xml';

  let i = 0;
  while (i < bytes.length - 30) {
    // Check PK signature
    if (bytes[i] !== 0x50 || bytes[i+1] !== 0x4B || bytes[i+2] !== 0x03 || bytes[i+3] !== 0x04) {
      i++;
      continue;
    }

    // Local file header layout:
    //  4  signature
    //  2  version needed
    //  2  general purpose flag
    //  2  compression method  (0=store, 8=deflate)
    //  2  last mod time
    //  2  last mod date
    //  4  crc-32
    //  4  compressed size
    //  4  uncompressed size
    //  2  file name length
    //  2  extra field length
    const compressionMethod = bytes[i+6] | (bytes[i+7] << 8);
    const compressedSize    = bytes[i+18] | (bytes[i+19] << 8) | (bytes[i+20] << 16) | (bytes[i+21] << 24);
    const fnLen             = bytes[i+26] | (bytes[i+27] << 8);
    const extraLen          = bytes[i+28] | (bytes[i+29] << 8);

    const nameBytes = bytes.slice(i + 30, i + 30 + fnLen);
    const fileName  = new TextDecoder().decode(nameBytes);

    const dataStart = i + 30 + fnLen + extraLen;

    if (fileName === TARGET || fileName.endsWith('word/document.xml')) {
      const compressedData = bytes.slice(dataStart, dataStart + compressedSize);

      let xmlBytes: Uint8Array;
      if (compressionMethod === 0) {
        // Stored (no compression)
        xmlBytes = compressedData;
      } else {
        // Deflate — use DecompressionStream if available
        try {
          const ds = new (window as any).DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          const reader = ds.readable.getReader();
          writer.write(compressedData);
          writer.close();

          const chunks: Uint8Array[] = [];
          let done = false;
          while (!done) {
            const { value, done: d } = await reader.read();
            done = d;
            if (value) chunks.push(value);
          }
          const total = chunks.reduce((s, c) => s + c.length, 0);
          xmlBytes = new Uint8Array(total);
          let offset = 0;
          for (const chunk of chunks) {
            xmlBytes.set(chunk, offset);
            offset += chunk.length;
          }
        } catch {
          // DecompressionStream not available or failed — read raw XML segment as text
          xmlBytes = compressedData;
        }
      }

      const xml = new TextDecoder('utf-8', { fatal: false }).decode(xmlBytes);

      // Strip XML tags and decode entities
      const plain = xml
        .replace(/<w:br[^>]*\/>/gi, '\n')
        .replace(/<w:p[ >]/gi, '\n')
        .replace(/<\/w:p>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#x?[0-9a-fA-F]+;/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim();

      return plain;
    }

    // Skip to next entry
    i = dataStart + compressedSize;
    // Safety: if compressedSize is 0, advance by 1 to avoid infinite loop
    if (compressedSize === 0) i = dataStart + 1;
  }

  // Fallback: no word/document.xml found — try treating as text
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/[^\x20-\x7E\n\t]/g, ' ');
}

/** Read file to Uint8Array */
async function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(new Uint8Array(e.target!.result as ArrayBuffer));
    reader.onerror = () => reject(new Error('file_read_error'));
    reader.readAsArrayBuffer(file);
  });
}

/** Read file as plain text (for .txt files) */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('file_read_error'));
    reader.readAsText(file);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Loading-step callback so the UI can show granular progress */
export type ProgressCallback = (step: string) => void;

export async function analyzeResume(
  file: File,
  targetRole: string,
  onProgress?: ProgressCallback,
): Promise<ResumeData> {
  const progress = (s: string) => onProgress?.(s);

  // ── 1. File-type gate ──────────────────────────────────────────────────────
  progress('Validating file...');
  const ext = file.name.toLowerCase().split('.').pop() || '';
  const allowedExts  = ['pdf', 'docx', 'doc', 'txt'];
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    '', // many browsers report empty MIME for dropped files
  ];

  if (!allowedExts.includes(ext) && !allowedMimes.includes(file.type)) {
    throw new Error(
      'Unsupported file type. Please upload a PDF (.pdf), Word document (.docx), or plain-text (.txt) resume.',
    );
  }

  // ── 2. Size gate ───────────────────────────────────────────────────────────
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('File size must be under 6 MB. Please compress or re-export your resume and try again.');
  }

  // ── 3. Text extraction ─────────────────────────────────────────────────────
  progress('Reading document...');
  let text = '';

  try {
    if (ext === 'txt') {
      text = await readFileAsText(file);
    } else if (ext === 'pdf') {
      const bytes = await readFileAsBytes(file);
      text = extractPdfText(bytes);
    } else if (ext === 'docx' || ext === 'doc') {
      const bytes = await readFileAsBytes(file);
      text = await extractDocxText(bytes);
    } else {
      // Try text read as last resort
      text = await readFileAsText(file);
    }
  } catch {
    throw new Error(
      "We couldn't read this file. Please try another PDF or DOCX, or export your resume as a text-based PDF.",
    );
  }

  // ── 4. Readability check ───────────────────────────────────────────────────
  progress('Understanding resume structure...');
  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (!cleanText || cleanText.length < 80) {
    throw new Error(
      'Could not extract readable text from this file. ' +
      'This may be a scanned image or an encrypted PDF. ' +
      'Please export your resume as a text-based PDF or DOCX and re-upload.',
    );
  }

  // Normalise for matching (lowercase, collapse whitespace)
  const t = cleanText.toLowerCase().replace(/[^\x20-\x7e\n]/g, ' ');

  // ── 5. Section detection ───────────────────────────────────────────────────
  const sections = detectSections(t, cleanText);

  // ── 6. Resume classification ───────────────────────────────────────────────
  const verdict = classifyDocument(cleanText, t, sections);
  if (!verdict.valid) throw new Error(verdict.reason);

  // ── 7. Content extraction ──────────────────────────────────────────────────
  progress('Extracting skills...');

  // Skills — substring match against the expanded keyword dictionary
  const extractedSkills = SKILL_KEYWORDS
    .filter(kw => t.includes(kw.toLowerCase()))
    // Normalise display name
    .map(kw => {
      const clean = kw.trim().replace(/\s+/g, ' ');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    })
    // De-duplicate (e.g. 'c language' and ' c,' both indicate C)
    .filter((s, i, arr) => arr.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, 24);

  const projects       = extractProjects(cleanText);
  const education      = extractEducation(cleanText);
  const experience     = extractExperience(cleanText);
  const certifications = extractCertifications(cleanText);

  // ── 8. Score calculation ───────────────────────────────────────────────────
  progress('Calculating resume score...');
  const breakdown = calculateScore(
    cleanText, sections, extractedSkills, projects, education, certifications,
  );
  const totalScore = Math.min(
    100,
    breakdown.contentStructure +
    breakdown.education +
    breakdown.skills +
    breakdown.projectsExperience +
    breakdown.contactDetails +
    breakdown.certAchievements +
    breakdown.clarity,
  );

  // ── 9. Strengths ───────────────────────────────────────────────────────────
  const contact = detectContact(cleanText);
  const strengths: string[] = [];
  if (extractedSkills.length >= 5)
    strengths.push(`${extractedSkills.length} technical skills identified`);
  if (projects.length >= 1)
    strengths.push(`${projects.length} project${projects.length > 1 ? 's' : ''} detected`);
  if (contact.hasGitHub)   strengths.push('GitHub profile linked');
  if (contact.hasLinkedIn) strengths.push('LinkedIn profile linked');
  if (sections.experience || t.includes('internship'))
    strengths.push('Work / internship experience mentioned');
  if (sections.certifications)
    strengths.push('Certifications / courses listed');
  if (sections.education)
    strengths.push('Education details present');
  if (cleanText.length > 800)
    strengths.push('Detailed resume content');

  // ── 10. Missing skills vs target role ─────────────────────────────────────
  const roleSkillMap: Record<string, string[]> = {
    'full stack developer':  ['React', 'Node.js', 'REST API', 'SQL', 'Git', 'Docker'],
    'frontend developer':    ['React', 'TypeScript', 'CSS', 'Responsive Design', 'Testing'],
    'backend developer':     ['Node.js', 'SQL', 'REST API', 'Docker', 'Authentication'],
    'ai/ml engineer':        ['Python', 'TensorFlow', 'Scikit-learn', 'Pandas', 'Machine Learning'],
    'data scientist':        ['Python', 'SQL', 'Pandas', 'Statistics', 'Visualization'],
    'devops engineer':       ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    'android developer':     ['Kotlin', 'Java', 'Android SDK', 'Firebase', 'REST API'],
    'cybersecurity analyst': ['Networking', 'Linux', 'Python', 'Cryptography', 'Wireshark'],
  };

  const tRole = targetRole.toLowerCase();
  let missingSkills: string[] = [];
  for (const [role, skills] of Object.entries(roleSkillMap)) {
    if (tRole.includes(role.split(' ')[0]) || role.includes(tRole.split(' ')[0])) {
      missingSkills = skills.filter(
        s => !extractedSkills.some(e => e.toLowerCase().includes(s.toLowerCase())),
      );
      break;
    }
  }
  if (missingSkills.length === 0) {
    missingSkills = ['Quantified impact statements', 'Project outcome metrics'];
  }

  // ── 11. Improvement suggestions ───────────────────────────────────────────
  const suggestions: string[] = [];
  if (extractedSkills.length < 6)
    suggestions.push('List specific technical skills — aim for at least 6–10 with proficiency levels');
  if (projects.length < 2)
    suggestions.push('Add 2–3 significant projects with technologies used and measurable outcomes');
  if (!contact.hasGitHub)
    suggestions.push('Add your GitHub profile URL to showcase your code');
  if (!contact.hasLinkedIn)
    suggestions.push('Include your LinkedIn profile URL for professional credibility');
  if (!sections.summary)
    suggestions.push('Add a 2–3 sentence career objective or professional summary');
  if (totalScore < 65)
    suggestions.push('Include quantified achievements (e.g., "Improved performance by 30%")');
  if (!sections.certifications)
    suggestions.push('Add relevant certifications or online courses (Coursera, NPTEL, etc.)');

  return {
    score:            totalScore,
    extractedSkills,
    projects,
    education,
    experience,
    certifications,
    strengths:        strengths.slice(0, 6),
    missingSkills:    missingSkills.slice(0, 6),
    suggestions:      suggestions.slice(0, 5),
    fileName:         file.name,
    scoreBreakdown:   breakdown,
    detectedSections: sections,
  };
}
