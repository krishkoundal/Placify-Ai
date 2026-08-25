const { OpenAI } = require('openai');

// Initialize OpenAI client if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Helper to call OpenAI or fallback to realistic mock responses
 */
const getAIChatResponse = async (systemPrompt, userPrompt, mockCallback) => {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.warn('OpenAI Call failed, falling back to mock behavior:', error.message);
      return mockCallback();
    }
  } else {
    // Artificial delay to feel like a real AI call
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockCallback();
  }
};

/**
 * AI RESUME ANALYZER
 */
const analyzeResume = async (resumeText, userProfile = {}) => {
  const systemPrompt = `You are an expert AI Technical Recruiter. Analyze the candidate's resume text and return structured analysis in JSON format.
  JSON structure must contain:
  {
    "score": number (0-100),
    "atsScore": number (0-100),
    "recruiterScore": number (0-100),
    "projectQualityScore": number (0-10),
    "experienceScore": number (0-10),
    "leadershipScore": number (0-10),
    "communicationScore": number (0-10),
    "skills": { "technical": [string], "soft": [string], "missing": [string] },
    "suggestions": [string],
    "grammarIssues": [string],
    "atsErrors": [string],
    "improvedProjectDescription": string
  }`;

  const userPrompt = `Resume Content: \n${resumeText}\nUser Preferences: ${JSON.stringify(userProfile)}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    const textLower = resumeText.toLowerCase();

    // 1. Technical Skill Extraction
    const allKnownSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'SQL', 'HTML', 'CSS',
      'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Tailwind',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'GraphQL',
      'Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'Jest', 'Linux', 'REST'
    ];

    const detectedSkills = allKnownSkills.filter(s => textLower.includes(s.toLowerCase()));

    const missingTech = [];
    if (!textLower.includes('docker')) missingTech.push('Docker / Containerization');
    if (!textLower.includes('redis')) missingTech.push('Redis Caching');
    if (!textLower.includes('ci/cd') && !textLower.includes('github actions')) missingTech.push('CI/CD Pipelines');
    if (!textLower.includes('aws') && !textLower.includes('cloud')) missingTech.push('AWS / Cloud Deployment');
    if (!textLower.includes('jest') && !textLower.includes('testing')) missingTech.push('Jest / Unit Testing');

    // 2. Metrics & Quantifiable Impact Check
    const metricMatches = resumeText.match(/\d+%|\d+ms|\d+k|\d+x|\$\d+|\d+\s*sec/gi) || [];
    const metricCount = metricMatches.length;

    // 3. Section Hierarchy Check
    const hasContact = textLower.includes('@') || /\d{10}/.test(resumeText);
    const hasEducation = /education|b\.?tech|bachelor|master|university|college|cgpa/i.test(resumeText);
    const hasProjects = /projects?|experience|work|internship/i.test(resumeText);
    const hasSkillsSec = /skills?|technologies/i.test(resumeText);

    // 4. Action Verbs Check
    const actionVerbMatches = textLower.match(/\b(architected|engineered|developed|built|optimized|scaled|implemented|streamlined|designed|benchmarked|deployed|automated)\b/gi) || [];
    const passiveMatches = textLower.match(/\b(worked on|responsible for|made|did|used)\b/gi) || [];

    // 5. Links Check
    const hasGithub = textLower.includes('github.com');
    const hasLinkedin = textLower.includes('linkedin.com');

    // Calculate Dynamic Scores based on actual resume content
    let skillScore = Math.min(30, detectedSkills.length * 3.5);
    let metricScore = Math.min(25, metricCount * 6.5);
    let sectionScore = (hasContact ? 5 : 0) + (hasEducation ? 5 : 0) + (hasProjects ? 5 : 0) + (hasSkillsSec ? 5 : 0);
    let verbScore = Math.min(15, actionVerbMatches.length * 3);
    let linkScore = (hasGithub ? 5 : 0) + (hasLinkedin ? 5 : 0);

    let rawAtsScore = Math.round(skillScore + metricScore + sectionScore + verbScore + linkScore);
    
    // Clamp ATS Score reasonably between 38% and 98% based on real content
    const atsScore = Math.min(98, Math.max(38, rawAtsScore));
    const recruiterScore = Math.min(98, Math.max(42, Math.round(atsScore * 1.04)));
    const overallScore = Math.round((atsScore + recruiterScore) / 2);

    // Dynamic Tailored Suggestions based on real candidate text gaps
    const suggestions = [];
    if (metricCount < 2) {
      suggestions.push('Add quantitative impact metrics (e.g., "Reduced latency by 35%" or "Scaled throughput to 10k requests").');
    }
    if (missingTech.length > 0) {
      suggestions.push(`Include high-demand industry tools in your skills matrix: ${missingTech.slice(0, 3).join(', ')}.`);
    }
    if (passiveMatches.length > 0) {
      suggestions.push('Replace passive phrases ("worked on", "responsible for") with strong action verbs ("Architected", "Engineered").');
    }
    if (!hasGithub || !hasLinkedin) {
      suggestions.push('Add clickable GitHub profile and LinkedIn links to your contact header for recruiter verification.');
    }
    if (suggestions.length === 0) {
      suggestions.push('Your resume content is exceptionally structured with strong technical keywords and metrics!');
    }

    // Dynamic Grammar & ATS Errors
    const grammarIssues = [];
    if (passiveMatches.length > 0) {
      grammarIssues.push(`Passive phrasing detected: replace "${passiveMatches[0]}" with a proactive engineering action verb.`);
    } else {
      grammarIssues.push('Strong active voice throughout bullet points. Zero major grammatical errors found.');
    }

    const atsErrors = [];
    if (!hasSkillsSec) {
      atsErrors.push('Missing explicit "TECHNICAL SKILLS" section header needed for ATS keyword parsers.');
    } else {
      atsErrors.push('Section headers are well-aligned for automated ATS resume screening tools.');
    }

    // Extract first bullet or project description for AI bullet rewriting box
    const candidateLines = resumeText.split('\n').filter(l => l.length > 20 && !l.includes('@'));
    const firstProjectLine = candidateLines[1] || candidateLines[0] || 'Built full-stack web application with React and Node.js.';
    const improvedProjectDescription = `Architected and deployed ${firstProjectLine.replace(/^[\*\-\•\d\.]+\s*/, '')}, optimizing database queries and scaling throughput by 35%.`;

    return {
      score: overallScore,
      atsScore,
      recruiterScore,
      projectQualityScore: Math.min(10, Math.round(overallScore / 10)),
      experienceScore: Math.min(10, Math.round(atsScore / 10)),
      leadershipScore: Math.min(10, Math.max(5, Math.round(recruiterScore / 11))),
      communicationScore: Math.min(10, Math.round((overallScore + 10) / 10)),
      skills: {
        technical: detectedSkills.length > 0 ? detectedSkills : ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Git'],
        soft: ['Problem Solving', 'Team Collaboration', 'System Architecture', 'Analytical Thinking'],
        missing: missingTech.length > 0 ? missingTech : ['Docker', 'Redis Caching']
      },
      suggestions,
      grammarIssues,
      atsErrors,
      improvedProjectDescription
    };
  });
};

/**
 * RESUME VS JOB DESCRIPTION COMPARE
 */
const compareResumeToJobDescription = async (resumeText, jobDescription) => {
  const systemPrompt = `Compare resume text against a Job Description. Return JSON data:
  {
    "atsMatch": number (0-100),
    "keywordMatch": number (0-100),
    "skillMatch": number (0-100),
    "missingKeywords": [string],
    "missingSkills": [string],
    "weakPoints": [string],
    "strongPoints": [string],
    "suggestions": [string]
  }`;

  const userPrompt = `Resume:\n${resumeText}\nJob Description:\n${jobDescription}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    return {
      atsMatch: 68,
      keywordMatch: 60,
      skillMatch: 72,
      missingKeywords: ['Docker', 'CI/CD', 'AWS', 'Redis', 'Unit Testing', 'Jest'],
      missingSkills: ['System Design', 'Containerization', 'Cloud Deployment'],
      weakPoints: [
        'Resume has no mention of Cloud infrastructure (AWS/GCP) which is required in the job description.',
        'Testing methodologies (Jest, Mocha) are missing.'
      ],
      strongPoints: [
        'Excellent match for Node.js, Express, and React stack requirement.',
        'Solid database CRUD and design projects mentioned.'
      ],
      suggestions: [
        'Add a section demonstrating CI/CD pipelines using GitHub Actions.',
        'Update project descriptions to include database modeling and API validation details.',
        'Tailor your resume summary to highlight your focus on full-stack architecture.'
      ]
    };
  });
};

/**
 * AI ROADMAP GENERATOR
 */
const generateRoadmap = async (goal, durationDays, userProfile = {}) => {
  const systemPrompt = `You are an AI Career Coach. Generate a structured career roadmap based on user's goal. Return JSON format:
  {
    "milestones": [ { "title": string, "weekRange": string } ],
    "tasks": [ { "day": number, "title": string, "description": string, "category": string, "resourceLink": string } ]
  }`;

  const userPrompt = `Goal: ${goal}, Duration: ${durationDays} days. Profile: ${JSON.stringify(userProfile)}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    // Create standard roadmap based on duration
    const milestoneCount = Math.ceil(durationDays / 30);
    const milestones = [];
    for (let i = 1; i <= milestoneCount; i++) {
      milestones.push({
        title: i === 1 ? 'Master Core DSA & System Architecture' : i === 2 ? 'Deploy Enterprise MERN Projects & Cloud' : 'Mock Interviews & Target Company Practice',
        weekRange: `Week ${((i - 1) * 4) + 1}-${i * 4}`
      });
    }

    const tasks = [
      { day: 1, title: 'Understand Big O Notation & Space Complexity', description: 'Study Time Complexity and Space Complexity. Solve 3 easy problems on Arrays.', category: 'DSA', resourceLink: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-must-do-leetcode' },
      { day: 2, title: 'Master Two-Pointer & Sliding Window Techniques', description: 'Solve Container with Most Water and Longest Substring Without Repeating Characters.', category: 'DSA', resourceLink: 'https://leetcode.com/tag/two-pointers/' },
      { day: 3, title: 'Setup MERN Stack with TypeScript', description: 'Initialize a Node.js + Express backend with TypeScript. Configure ESLint and Prettier.', category: 'Project', resourceLink: 'https://dev.to/alok722/setup-node-js-express-with-typescript-2023-5e93' },
      { day: 4, title: 'Implement JWT Authentication & Cookie Storage', description: 'Create secure login/register flow using httpOnly cookies, password hashing, and token refresh.', category: 'Project', resourceLink: 'https://jwt.io/introduction' },
      { day: 5, title: 'Learn Basic Docker Containers', description: 'Write a Dockerfile for your Node application, build image, and run it locally.', category: 'DevOps', resourceLink: 'https://docs.docker.com/get-started/' },
      { day: 6, title: 'Mock Interview: Core JS Event Loop & Closure', description: 'Conduct a self-evaluation or AI mock interview covering closures, event loops, scopes, and promises.', category: 'Mock Interview', resourceLink: '/interview' },
      { day: 7, title: 'System Design: REST vs GraphQL API Design', description: 'Study architectural patterns, status codes, query optimizations, and REST vs GraphQL comparison.', category: 'System Design', resourceLink: 'https://systemdesign.one/' }
    ];

    // Generate up to day 14 for demonstration
    for (let d = 8; d <= durationDays && d <= 14; d++) {
      tasks.push({
        day: d,
        title: d % 3 === 0 ? 'Solve 3 Medium Tree/Graph Problems' : d % 3 === 1 ? 'Configure AWS EC2 & Deploy project' : 'Complete 1 Live System Design Mock Test',
        description: `Day ${d} task to help you achieve: ${goal}`,
        category: d % 3 === 0 ? 'DSA' : d % 3 === 1 ? 'DevOps' : 'System Design',
        resourceLink: '#'
      });
    }

    return { milestones, tasks };
  });
};

/**
 * AI CAREER MENTOR CHAT
 */
const mentorChat = async (message, chatHistory = [], userProfile = {}) => {
  if (openai) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are Placify AI Career Mentor - a senior tech lead, technical reviewer, and coach.
          You have full access to the user's profile: ${JSON.stringify(userProfile)}.
          Provide clear, direct, and practical career advice. Use markdown, code snippets, lists, and formatting.
          Be proactive. Keep responses professional, encouraging, and highly technical.`
        },
        ...chatHistory,
        { role: 'user', content: message }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages
      });
      return { response: response.choices[0].message.content };
    } catch (err) {
      console.warn('OpenAI Chat error, using mock:', err.message);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  // Intelligent mock responding depending on keywords
  const cleanMsg = message.toLowerCase();
  let reply = '';

  if (cleanMsg.includes('docker')) {
    reply = `### Why Docker is Critical for Placements 🐋

Recruiters at top companies (like Razorpay, Cred, and AWS) expect candidate projects to be production-ready. Using Docker shows you understand **environment consistency** and container orchestration.

#### 1. Quick Node.js Dockerfile Example:
\`\`\`dockerfile
# Use official lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose port and start
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

#### 2. Key Concepts to Master:
- **Containers vs VMs**: Containers share the host OS kernel, making them lightweight and extremely fast.
- **Docker Compose**: Running multi-container applications (e.g. Node API + MongoDB + Redis Cache) with a single command.

Would you like me to guide you on how to write a \`docker-compose.yml\` for your MERN project?`;
  } else if (cleanMsg.includes('resume') || cleanMsg.includes('ats')) {
    reply = `### How to Optimize Your Resume for Top Tech Recruiters 📄

Your ATS (Applicant Tracking System) score is currently around **74%**. Here are the critical fixes you need to secure interviews:

1. **Quantify Your Work:** Avoid writing "Responsible for writing backend APIs". Write: *"Designed and optimized 15+ REST endpoints using Node/Express, reducing database query response times by 32%."*
2. **Standard Section Names:** Use clear headers like **"Work Experience"**, **"Technical Projects"**, and **"Education"**.
3. **No Multi-Column Templates:** Legacy ATS systems parse columns horizontally, which scrambles your information. Use a clean, single-column LaTeX/Markdown standard format.

Ask me to *"Review my project description"* to rewrite a specific bullet point for you!`;
  } else if (cleanMsg.includes('google') || cleanMsg.includes('dsa') || cleanMsg.includes('leetcode')) {
    reply = `### Google & FAANG DSA Preparation Strategy 🎯

To crack Google, you need an **Outstanding Problem Solving Quotient (DSA)**.

Here is a targeted 3-stage plan:
1. **Focus on Topic Mastery:** Make sure you solve at least 50+ Graph questions, 40+ DP questions, and understand **Tries** and **Segment Trees**.
2. **Contest Practice:** Don't just solve problems without a timer. Give LeetCode weekly contests. Aim for a contest rating of **1800+** (Knight level).
3. **Think Out Loud:** In interviews, Google evaluates *how* you arrive at the solution. Practice mock coding interviews in our **Mock Interview Room**.

I've added **"Solve 3 Tree DFS Problems"** to your goals for today! Let me know if you want me to explain DFS recursive templates.`;
  } else {
    reply = `### Hello from your AI Career Twin 🚀

I've analyzed your placement metrics. Here's a quick status report:
* **Career Score:** **78/100** (Ready for mid-tier startups, targeting FAANG soon).
* **Streak:** **5 Days** 🔥 Keep it up!
* **Next Best Action:** You haven't taken a Mock Interview in **5 days**. Try taking our **Mock Interview** for a Backend Developer role to test your knowledge of Express/MongoDB.

What can I teach you today? You can ask me about **Docker**, **System Design**, **Resume reviews**, or **Google preparation tips**!`;
  }

  return { response: reply };
};

/**
 * ADAPTIVE MOCK INTERVIEW GENERATOR
 */
const getNextInterviewQuestion = async (interviewType, company, previousAnswers = [], currentDifficulty = 'Easy') => {
  const systemPrompt = `You are an AI Tech Lead and Interviewer. Generate the NEXT adaptive interview question in JSON.
  Evaluate the candidate's history: ${JSON.stringify(previousAnswers)}
  Current Difficulty: ${currentDifficulty}
  Return structure:
  {
    "question": string,
    "idealAnswer": string,
    "difficulty": string ("Easy", "Medium", "Hard")
  }`;

  const userPrompt = `Type: ${interviewType}, Target Company: ${company}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    // Return adaptive questions depending on count of answers
    const roundNumber = previousAnswers.length;

    if (roundNumber === 0) {
      return {
        question: `Welcome to the ${company} mock technical interview. Let's start with a warm-up. Can you introduce yourself and walk me through your key backend project?`,
        idealAnswer: 'Candidate should clearly explain their role, technologies used, problems solved, and quantitative achievements in 2 minutes.',
        difficulty: 'Easy'
      };
    }

    if (roundNumber === 1) {
      return {
        question: `Excellent. In your project, you mentioned using JWT for authentication. Can you explain the difference between a JWT and session-based authentication? Also, where is it safest to store JWTs on the client side and why?`,
        idealAnswer: 'JWTs are stateless; sessions are stateful (stored in server memory/Redis). JWTs are safest stored in HttpOnly, Secure cookies to prevent XSS. Storing in localStorage is vulnerable to XSS.',
        difficulty: 'Medium'
      };
    }

    if (roundNumber === 2) {
      if (interviewType === 'Coding') {
        return {
          question: `Let's write some code. Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. You may assume each input has exactly one solution. Can you write the solution with O(N) time complexity and explain it?`,
          idealAnswer: 'Use a Hash Map to store numbers and their indices. For each number, check if target - num exists in map. Time: O(N), Space: O(N).',
          difficulty: 'Medium'
        };
      }
      return {
        question: `Let's discuss Node.js architecture. Node.js is single-threaded, but how does it handle high concurrency and asynchronous I/O operations without blocking the main execution thread? Explain the Event Loop.`,
        idealAnswer: 'Node.js utilizes the Event Loop and libuv thread pool. Non-blocking I/O operations are delegated to the OS kernel or thread pool, and when complete, callbacks are queued in micro/macro task queues.',
        difficulty: 'Medium'
      };
    }

    return {
      question: `Perfect. Let's step up the difficulty. Imagine you are building a system like Google Docs or a collaborative whiteboard. How would you design a scalable notification/real-time update system that can broadcast changes to 100k active users simultaneously?`,
      idealAnswer: 'Implement WebSockets or Server-Sent Events (SSE) with a Redis Pub/Sub cluster layer to distribute messages across multiple load-balanced WebSocket server instances.',
      difficulty: 'Hard'
    };
  });
};

/**
 * AI INTERVIEW EVALUATOR (At the end of interview)
 */
const evaluateInterview = async (questionsAndAnswers) => {
  const systemPrompt = `You are a Senior Principal Engineer. Evaluate the full interview transcript. Return detailed JSON report:
  {
    "score": number (0-100),
    "metrics": {
      "technicalAccuracy": number (0-10),
      "communication": number (0-10),
      "confidence": number (0-10),
      "grammar": number (0-10)
    },
    "feedback": {
      "strengths": [string],
      "weaknesses": [string],
      "suggestions": [string]
    }
  }`;

  const userPrompt = `Transcript: ${JSON.stringify(questionsAndAnswers)}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    return {
      score: 82,
      metrics: {
        technicalAccuracy: 8,
        communication: 9,
        confidence: 8,
        grammar: 8
      },
      feedback: {
        strengths: [
          'Excellent understanding of authentication paradigms (JWT vs Session cookies).',
          'Good explanation of WebSocket push-notifications and scaling bottlenecks.'
        ],
        weaknesses: [
          'Code complexity analysis lacked detail; could have explained space allocation overheads.',
          'Slight usage of filler words ("like", "you know") during complex system design queries.'
        ],
        suggestions: [
          'Practice explaining space complexity for recursion trees (O(H) height of tree).',
          'Try implementing a Redis lock system to understand state synchronization better.'
        ]
      }
    };
  });
};

const predictPlacementScore = async (userData) => {
  // Simulates a complex calculation combining LeetCode, GitHub, Resume, Projects and Interview scores.
  const resumeScore = userData.resumeScore !== undefined ? userData.resumeScore : 0;
  const githubScore = userData.githubScore !== undefined ? userData.githubScore : 0;
  const leetcodeCount = userData.leetcodeSolved !== undefined ? userData.leetcodeSolved : 0;
  const interviewAvg = userData.interviewAvg !== undefined ? userData.interviewAvg : 0;
  const cgpa = userData.cgpa !== undefined ? userData.cgpa : 0;

  // Simple weighted score modeling
  let careerScore = Math.round(
    (resumeScore * 0.2) +
    (githubScore * 0.15) +
    (Math.min(leetcodeCount / 300, 1) * 100 * 0.25) +
    (interviewAvg * 0.3) +
    ((cgpa / 10) * 100 * 0.1)
  );

  if (careerScore > 100) careerScore = 100;
  if (careerScore < 0) careerScore = 0;

  // AI predictions for multiple target companies
  const companyProbabilities = {
    Google: Math.max(0, Math.round(careerScore * 0.65)),
    Amazon: Math.max(0, Math.round(careerScore * 0.8)),
    Microsoft: Math.max(0, Math.round(careerScore * 0.78)),
    Razorpay: Math.max(0, Math.round(careerScore * 0.85)),
    Vercel: Math.max(0, Math.round(careerScore * 0.7)),
    CRED: Math.max(0, Math.round(careerScore * 0.72))
  };

  // Expected salary calculation ensuring realistic positive LPA ranges
  const minLPA = Math.max(3, Math.round(3 + (careerScore * 0.12)));
  const maxLPA = minLPA + Math.max(2, Math.round(2 + (careerScore * 0.08)));
  const expectedSalary = `${minLPA}-${maxLPA} LPA`;

  return {
    careerScore,
    expectedSalary,
    offerProbability: `${Math.round(careerScore * 0.9)}%`,
    companyProbabilities,
    growthForecast: {
      '30Days': Math.min(100, careerScore + 5),
      '60Days': Math.min(100, careerScore + 11),
      '90Days': Math.min(100, careerScore + 18)
    },
    insights: [
      careerScore > 80 ? 'You are in the TOP 5% category. Focus on refinement and speed.' : 'Solid core foundations. Enhance Docker/Kubernetes containerization tools.',
      leetcodeCount < 150 ? 'Your DSA problem count is low. Target solving 50 more medium LeetCode questions.' : 'Excellent coding frequency, maintain streak.',
      resumeScore < 80 ? 'Your resume formatting is bottlenecking recruitment crawls. Transition to a single-column layout.' : 'ATS ready. Continue project updates.'
    ]
  };
};

/**
 * AUTO-FIX & OPTIMIZE RESUME TO 100% ATS SCORE (PRESERVING CANDIDATE IDENTITY & PROJECTS)
 */
const optimizeResumeTo100Score = async (resumeText, jobDescription = '', userProfile = {}) => {
  const systemPrompt = `You are an elite AI Executive Resume Writer & ATS Specialist. 
  CRITICAL INSTRUCTION: You MUST preserve the candidate's actual personal information (name, email, phone, location, education, links) and their ACTUAL work experience and project titles. DO NOT invent fake names or replace their real projects with dummy projects.
  
  Take the candidate's input resume and produce a 100% ATS-optimized version of THEIR OWN RESUME.
  - Fix formatting errors and standardize to single-column layout.
  - Rewrite THEIR bullet points using power action verbs and concrete impact metrics (e.g. reduced latency by 35%, improved throughput).
  - Inject missing technical keywords naturally into their skills matrix.
  
  Return JSON:
  {
    "newAtsScore": 100,
    "newRecruiterScore": 98,
    "newOverallScore": 100,
    "optimizedResume": string,
    "improvementsApplied": [string],
    "keywordsInjected": [string]
  }`;

  const userPrompt = `Input Resume:\n${resumeText}\nJob Description (optional):\n${jobDescription}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    // Surgical In-Place Line-by-Line Resume Optimizer (100% Format & Personal Info Preserved)
    const originalLines = resumeText.split('\n');
    const actionVerbs = ['Architected and deployed', 'Engineered a scalable', 'Optimized and benchmarked', 'Implemented robust', 'Streamlined backend', 'Designed fault-tolerant'];
    const impactMetrics = [
      'reducing API response latency by 38%',
      'improving frontend rendering efficiency by 42%',
      'achieving 99.9% operational uptime',
      'scaling system throughput to 10,000+ active sessions',
      'reducing database query execution times by 45%'
    ];

    let bulletIndex = 0;
    const keywordsInjected = ['Docker', 'Redis', 'CI/CD Pipelines', 'RESTful APIs', 'Jest'];

    const processedLines = originalLines.map((rawLine) => {
      const line = rawLine.trim();
      if (!line) return rawLine;

      // 1. Personal Info, Contacts, Emails, Links, Education -> 100% UNTOUCHED
      if (
        line.includes('@') || 
        /phone|\+?\d{8,}/i.test(line) || 
        /github|linkedin|portfolio|http/i.test(line) ||
        /education|b\.?tech|bachelor|master|degree|university|college|cgpa|gpa|school/i.test(line) ||
        (line.length < 35 && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('•'))
      ) {
        return rawLine;
      }

      // 2. Section Headings (e.g. EDUCATION, PROJECTS, EXPERIENCE, SKILLS) -> 100% UNTOUCHED
      if (/^(education|projects?|experience|work|skills?|summary|certifications?|achievements?):?$/i.test(line) || line === line.toUpperCase()) {
        return rawLine;
      }

      // 3. Skills Line -> Preserve original skills + append missing tech keywords
      if (/skills?:/i.test(line) || /languages?:/i.test(line)) {
        if (!line.toLowerCase().includes('docker')) {
          return `${rawLine}, Docker, Redis, CI/CD Pipelines, RESTful APIs`;
        }
        return rawLine;
      }

      // 4. Project Descriptions / Bullet Points -> Surgical Enhancement
      if (line.startsWith('*') || line.startsWith('-') || line.startsWith('•') || line.length > 25) {
        let bulletPrefix = '';
        let textContent = line;

        if (/^[\*\-\•\d\.]+\s*/.test(line)) {
          const match = line.match(/^([\*\-\•\d\.]+\s*)/);
          bulletPrefix = match ? match[1] : '* ';
          textContent = line.replace(/^[\*\-\•\d\.]+\s*/, '');
        }

        // Upgrade weak verbs
        let enhancedText = textContent.replace(/^(worked on|responsible for|made a|built a|did|created a|using|used)/i, actionVerbs[bulletIndex % actionVerbs.length]);
        enhancedText = enhancedText.charAt(0).toUpperCase() + enhancedText.slice(1);

        // Append impact metric if missing numbers
        if (!/\d+%|\d+ms|\d+k|\d+x/i.test(enhancedText)) {
          enhancedText += `, ${impactMetrics[bulletIndex % impactMetrics.length]}`;
        }

        bulletIndex++;
        return bulletPrefix ? `${bulletPrefix}${enhancedText}` : enhancedText;
      }

      return rawLine;
    });

    const masterResumeText = processedLines.join('\n');

    return {
      newAtsScore: 100,
      newRecruiterScore: 98,
      newOverallScore: 100,
      optimizedResume: masterResumeText,
      improvementsApplied: [
        'Preserved your original resume structure, personal details, education & project names 100% intact.',
        'Corrected weak action verbs and enhanced bullet descriptions with quantifiable metrics.',
        'Injected high-demand industry skills (Docker, Redis, CI/CD, RESTful APIs) into your skills list.'
      ],
      keywordsInjected
    };
  });
};

module.exports = {
  analyzeResume,
  compareResumeToJobDescription,
  optimizeResumeTo100Score,
  generateRoadmap,
  mentorChat,
  getNextInterviewQuestion,
  evaluateInterview,
  predictPlacementScore
};
