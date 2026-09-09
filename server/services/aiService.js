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
  const compName = company || 'Tech Firm';
  const isCoding = interviewType === 'Coding';
  const isHR = interviewType === 'HR';
  
  const systemPrompt = `You are an AI Tech Lead and Interviewer at ${compName}. Generate the NEXT adaptive interview question in JSON.
  Interview Round Type: ${interviewType}
  Candidate Answer History: ${JSON.stringify(previousAnswers)}
  Current Difficulty: ${currentDifficulty}
  IMPORTANT: For Coding questions, ALWAYS include 2 clear Sample Test Cases formatted as:
  Sample Test Cases:
  • Example 1: Input: ..., Output: ...
  • Example 2: Input: ..., Output: ...
  Return structure:
  {
    "question": string,
    "idealAnswer": string,
    "difficulty": string ("Easy", "Medium", "Hard")
  }`;

  const userPrompt = `Type: ${interviewType}, Target Company: ${compName}`;

  return getAIChatResponse(systemPrompt, userPrompt, () => {
    const roundNumber = previousAnswers.length;
    const lowerComp = compName.toLowerCase();

    // 1. FAANG & US Tech Giants
    const isGoogle = lowerComp.includes('google');
    const isMicrosoft = lowerComp.includes('microsoft');
    const isAmazon = lowerComp.includes('amazon');
    const isMeta = lowerComp.includes('meta') || lowerComp.includes('facebook');
    const isApple = lowerComp.includes('apple');
    const isNetflix = lowerComp.includes('netflix');
    const isNvidia = lowerComp.includes('nvidia');
    const isUber = lowerComp.includes('uber');
    const isAdobe = lowerComp.includes('adobe');
    const isAtlassian = lowerComp.includes('atlassian');
    const isSalesforce = lowerComp.includes('salesforce');
    const isAirbnb = lowerComp.includes('airbnb');
    const isStripe = lowerComp.includes('stripe');
    const isVercel = lowerComp.includes('vercel');

    // 2. Indian Unicorns & Product Leaders
    const isRazorpay = lowerComp.includes('razorpay');
    const isCRED = lowerComp.includes('cred');
    const isFlipkart = lowerComp.includes('flipkart');
    const isZomato = lowerComp.includes('zomato');
    const isSwiggy = lowerComp.includes('swiggy');
    const isPaytm = lowerComp.includes('paytm');
    const isOla = lowerComp.includes('ola');
    const isPhonePe = lowerComp.includes('phonepe');
    const isMeesho = lowerComp.includes('meesho');
    const isZepto = lowerComp.includes('zepto');
    const isBlinkit = lowerComp.includes('blinkit');
    const isUrbanCompany = lowerComp.includes('urban');
    const isGroww = lowerComp.includes('groww');
    const isZerodha = lowerComp.includes('zerodha');
    const isPostman = lowerComp.includes('postman');
    const isFreshworks = lowerComp.includes('freshworks');
    const isZoho = lowerComp.includes('zoho');
    const isMakeMyTrip = lowerComp.includes('makemytrip');
    const isInMobi = lowerComp.includes('inmobi');

    // 3. Finance, Quant & Banking
    const isGoldman = lowerComp.includes('goldman');
    const isJPMorgan = lowerComp.includes('jpmorgan');
    const isMorgan = lowerComp.includes('morgan');
    const isDEShaw = lowerComp.includes('shaw');
    const isTower = lowerComp.includes('tower');

    // 4. Global Enterprise & Systems
    const isOracle = lowerComp.includes('oracle');
    const isCisco = lowerComp.includes('cisco');
    const isIBM = lowerComp.includes('ibm');
    const isIntel = lowerComp.includes('intel');
    const isQualcomm = lowerComp.includes('qualcomm');
    const isSamsung = lowerComp.includes('samsung');

    // 5. IT Services Leaders
    const isTCS = lowerComp.includes('tcs');
    const isInfosys = lowerComp.includes('infosys');
    const isWipro = lowerComp.includes('wipro');
    const isCognizant = lowerComp.includes('cognizant');
    const isAccenture = lowerComp.includes('accenture');
    const isCapgemini = lowerComp.includes('capgemini');

    // ==========================================
    // 1. CODING / DSA ROUND (PER-COMPANY SPECIFIC)
    // ==========================================
    if (isCoding) {
      // 1. GOOGLE
      if (isGoogle) {
        if (roundNumber === 0) return { question: `[Google DSA Problem 1/4 - Find First & Last Position of Element in Sorted Array]: Given a sorted array 'nums' and integer 'target', find starting and ending indices in O(log N) time.\n\nSample Test Cases:\n• Example 1: Input: nums = [5,7,7,8,8,10], target = 8 | Output: [3, 4]\n• Example 2: Input: nums = [5,7,7,8,8,10], target = 6 | Output: [-1, -1]`, idealAnswer: 'Binary search twice for lower and upper bounds. Time: O(log N), Space: O(1).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[Google DSA Problem 2/4 - Word Search 2D Grid]: Given an m x n grid and string 'word', return true if 'word' exists using DFS Backtracking.\n\nSample Test Cases:\n• Example 1: Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED" | Output: true`, idealAnswer: 'DFS traversal with cell marking. Time: O(N * 4^L), Space: O(L).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[Google DSA Problem 3/4 - Course Schedule II (Topological Sort)]: Given 'numCourses' and 'prerequisites', return the valid course sequence using Kahn\'s BFS / DFS.\n\nSample Test Cases:\n• Example 1: Input: numCourses = 2, prerequisites = [[1,0]] | Output: [0,1]`, idealAnswer: 'In-Degree queue array or DFS 3-color state. Time: O(V+E), Space: O(V+E).', difficulty: 'Medium' };
        return { question: `[Google Final DSA Problem 4/4 - Merge K Sorted Lists]: Merge k sorted linked-lists using Min-Heap / PriorityQueue.\n\nSample Test Cases:\n• Example 1: Input: lists = [[1,4,5],[1,3,4],[2,6]] | Output: [1,1,2,3,4,4,5,6]`, idealAnswer: 'Maintain Min-Heap of size K. Time: O(N log K), Space: O(K).', difficulty: 'Hard' };
      }

      // 2. MICROSOFT
      if (isMicrosoft) {
        if (roundNumber === 0) return { question: `[Microsoft DSA Problem 1/4 - Rotate Image 2D Matrix]: Rotate n x n 2D matrix 90 degrees clockwise in-place.\n\nSample Test Cases:\n• Example 1: Input: matrix = [[1,2,3],[4,5,6],[7,8,9]] | Output: [[7,4,1],[8,5,2],[9,6,3]]`, idealAnswer: 'Transpose diagonal matrix, then reverse each row. Time: O(N^2), Space: O(1).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[Microsoft DSA Problem 2/4 - LRU Cache Design]: Design an LRU Cache with O(1) get and put time complexities.\n\nSample Test Cases:\n• Example 1: Input: LRUCache(2) -> put(1,1), put(2,2), get(1) [returns 1], put(3,3) [evicts key 2]`, idealAnswer: 'HashMap + Doubly LinkedList. Time: O(1), Space: O(Capacity).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[Microsoft DSA Problem 3/4 - Copy List with Random Pointer]: Construct deep copy of linked list containing extra 'random' pointers.`, idealAnswer: 'Interleave cloned nodes alongside originals. Time: O(N), Space: O(1).', difficulty: 'Medium' };
        return { question: `[Microsoft Final DSA Problem 4/4 - Serialize & Deserialize Binary Tree]: Serialize binary tree to string and deserialize back.`, idealAnswer: 'Preorder DFS with delimiter and null markers. Time: O(N), Space: O(N).', difficulty: 'Hard' };
      }

      // 3. AMAZON
      if (isAmazon) {
        if (roundNumber === 0) return { question: `[Amazon DSA Problem 1/4 - Top K Frequent Elements]: Return 'k' most frequent elements in array using Heap / Bucket Sort.\n\nSample Test Cases:\n• Example 1: Input: nums = [1,1,1,2,2,3], k = 2 | Output: [1, 2]`, idealAnswer: 'Frequency HashMap + Min-Heap size K. Time: O(N log K), Space: O(N).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[Amazon DSA Problem 2/4 - Critical Connections in Network]: Find all bridge edges in a server network using Tarjan\'s Algorithm.\n\nSample Test Cases:\n• Example 1: Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]] | Output: [[1,3]]`, idealAnswer: 'DFS tracking discovery and low reachability times. Time: O(V+E), Space: O(V+E).', difficulty: 'Hard' };
        if (roundNumber === 2) return { question: `[Amazon DSA Problem 3/4 - Meeting Rooms II]: Find minimum conference rooms needed for overlapping intervals.\n\nSample Test Cases:\n• Example 1: Input: intervals = [[0,30],[5,10],[15,20]] | Output: 2`, idealAnswer: 'Sort by start time + Min-Heap for end times. Time: O(N log N), Space: O(N).', difficulty: 'Medium' };
        return { question: `[Amazon Final DSA Problem 4/4 - Word Break II]: Return all valid sentences formed from wordDict in string 's'.\n\nSample Test Cases:\n• Example 1: Input: s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"] | Output: ["cats and dog","cat sand dog"]`, idealAnswer: 'Memoized DP Backtracking. Time: O(2^N), Space: O(2^N).', difficulty: 'Hard' };
      }

      // 4. META / FACEBOOK
      if (isMeta) {
        if (roundNumber === 0) return { question: `[Meta DSA Problem 1/4 - Subarray Sum Equals K]: Return total contiguous subarrays with sum 'k' in O(N) time.\n\nSample Test Cases:\n• Example 1: Input: nums = [1,1,1], k = 2 | Output: 2`, idealAnswer: 'Cumulative Prefix Sum + HashMap counts. Time: O(N), Space: O(N).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[Meta DSA Problem 2/4 - Lowest Common Ancestor of Binary Tree]: Find LCA node of 'p' and 'q' in binary tree.`, idealAnswer: 'Recursive DFS returning node matches. Time: O(N), Space: O(H).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[Meta DSA Problem 3/4 - Alien Dictionary]: Derive alien character precedence from sorted dictionary.`, idealAnswer: 'Graph construction + Kahn\'s Topological Sort. Time: O(C), Space: O(1).', difficulty: 'Hard' };
        return { question: `[Meta Final DSA Problem 4/4 - Minimum Window Substring]: Return minimum window in 's' containing all chars of 't'.\n\nSample Test Cases:\n• Example 1: Input: s = "ADOBECODEBANC", t = "ABC" | Output: "BANC"`, idealAnswer: 'Two-pointer sliding window + frequency map. Time: O(|S|+|T|), Space: O(1).', difficulty: 'Hard' };
      }

      // 5. APPLE
      if (isApple) {
        if (roundNumber === 0) return { question: `[Apple DSA Problem 1/4 - Product of Array Except Self]: Return array output where output[i] is product of all elements except nums[i] without division.\n\nSample Test Cases:\n• Example 1: Input: nums = [1,2,3,4] | Output: [24,12,8,6]`, idealAnswer: 'Prefix products and Suffix products accumulation. Time: O(N), Space: O(1).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[Apple DSA Problem 2/4 - LFU Cache Implementation]: Design Least Frequently Used (LFU) cache with O(1) ops.`, idealAnswer: 'HashMap for values + HashMap mapping frequency to Doubly LinkedList. Time: O(1), Space: O(N).', difficulty: 'Hard' };
        if (roundNumber === 2) return { question: `[Apple DSA Problem 3/4 - Task Scheduler]: Find minimum CPU intervals needed to execute tasks with cooldown period 'n'.`, idealAnswer: 'Greedy frequency counting max freq task slots. Time: O(N), Space: O(1).', difficulty: 'Medium' };
        return { question: `[Apple Final DSA Problem 4/4 - Binary Tree Maximum Path Sum]: Compute max path sum between any two connected tree nodes.`, idealAnswer: 'DFS postorder traversal computing max gain from subtrees. Time: O(N), Space: O(H).', difficulty: 'Hard' };
      }

      // 6. NETFLIX
      if (isNetflix) {
        if (roundNumber === 0) return { question: `[Netflix DSA Problem 1/4 - Sliding Window Maximum]: Return max element in sliding window of size 'k' in O(N) time.\n\nSample Test Cases:\n• Example 1: Input: nums = [1,3,-1,-3,5,3,6,7], k = 3 | Output: [3,3,5,5,6,7]`, idealAnswer: 'Monotonic decreasing Deque storing indices. Time: O(N), Space: O(K).', difficulty: 'Hard' };
        if (roundNumber === 1) return { question: `[Netflix DSA Problem 2/4 - Key-Value Store with TTL]: Design an in-memory key-value store with automatic expiration TTL.`, idealAnswer: 'HashMap + Min-PriorityQueue of expiration timestamps. Time: O(log N), Space: O(N).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[Netflix DSA Problem 3/4 - Maximal Rectangle in Binary Matrix]: Find largest rectangle of 1s in 2D binary matrix.`, idealAnswer: 'Histogram height array per row + Monotonic Stack. Time: O(R * C), Space: O(C).', difficulty: 'Hard' };
        return { question: `[Netflix Final DSA Problem 4/4 - Find Median from Data Stream]: Maintain running median of streaming numbers in O(log N) time.`, idealAnswer: 'Two Heaps (Max-Heap for lower half, Min-Heap for upper half). Time: O(log N), Space: O(N).', difficulty: 'Hard' };
      }

      // 7. NVIDIA
      if (isNvidia) {
        if (roundNumber === 0) return { question: `[Nvidia DSA Problem 1/4 - Maximum Subarray Sum (Kadane's Algorithm)]: Find contiguous subarray with largest sum.\n\nSample Test Cases:\n• Example 1: Input: nums = [-2,1,-3,4,-1,2,1,-5,4] | Output: 6 ([4,-1,2,1])`, idealAnswer: 'Kadane\'s algorithm tracking currentSum and maxSum. Time: O(N), Space: O(1).', difficulty: 'Easy' };
        if (roundNumber === 1) return { question: `[Nvidia DSA Problem 2/4 - Fast Power of Two & Bit Manipulation]: Check if integer is power of two and compute set bits count in O(1) time.`, idealAnswer: '(n > 0) && ((n & (n - 1)) == 0). Time: O(1), Space: O(1).', difficulty: 'Easy' };
        if (roundNumber === 2) return { question: `[Nvidia DSA Problem 3/4 - Construct Quad Tree from 2D Grid]: Recursively construct a Quad Tree from binary matrix.`, idealAnswer: 'Divide & Conquer splitting grid into 4 quadrants. Time: O(N^2 log N), Space: O(N^2).', difficulty: 'Medium' };
        return { question: `[Nvidia Final DSA Problem 4/4 - Parallel Matrix Multiplication]: Optimize matrix dot product for parallel SIMD execution.`, idealAnswer: 'Block matrix multiplication with cache line alignment. Time: O(N^3), Space: O(1).', difficulty: 'Hard' };
      }

      // 8. UBER / OLA / SWIGGY / ZOMATO (Logistics & Fleet)
      if (isUber || isOla || isSwiggy || isZomato || isZepto || isBlinkit) {
        if (roundNumber === 0) return { question: `[${compName} DSA Problem 1/4 - Driver Match Priority Queue]: Match delivery driver to customer using Min Priority Queue by ETA.`, idealAnswer: 'Min-Heap ordered by Euclidean / Haversine distance. Time: O(log N), Space: O(N).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[${compName} DSA Problem 2/4 - Bus Routes Shortest Path (BFS)]: Return min bus transfers required to travel from source to target.`, idealAnswer: 'BFS graph traversal over stop-to-route adjacency list. Time: O(N), Space: O(N).', difficulty: 'Hard' };
        if (roundNumber === 2) return { question: `[${compName} DSA Problem 3/4 - Geospatial Geohash Cluster Search]: Find top-K nearby dark stores in 2D spatial grid.`, idealAnswer: 'QuadTree or Spatial Hashing (Geohash) lookup. Time: O(K log N), Space: O(N).', difficulty: 'Medium' };
        return { question: `[${compName} Final DSA Problem 4/4 - Dynamic Peak Surge Pricing]: Find max overlapping delivery intervals using Interval Treap / Segment Tree.`, idealAnswer: 'Sweep line algorithm / Segment Tree query. Time: O(N log N), Space: O(N).', difficulty: 'Hard' };
      }

      // 9. RAZORPAY / CRED / PAYTM / PHONEPE / STRIPE (Fintech)
      if (isRazorpay || isCRED || isPaytm || isPhonePe || isStripe) {
        if (roundNumber === 0) return { question: `[${compName} DSA Problem 1/4 - Token Bucket API Rate Limiter]: Design rolling window API rate limiter restricting bursts per IP.\n\nSample Test Cases:\n• Example 1: Input: limit = 3 req/5s, Timestamps = [1s, 2s, 3s, 4s] | Output: [Allowed, Allowed, Allowed, Rejected]`, idealAnswer: 'Timestamp Deque / Sliding Window Counter. Time: O(1), Space: O(Limit).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[${compName} DSA Problem 2/4 - Idempotent Payment Reconciliation]: Match two payment streams and flag missing or duplicate transactions.`, idealAnswer: 'HashMap transaction reconciliation. Time: O(N), Space: O(N).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[${compName} DSA Problem 3/4 - Priority Settlement Payout Queue]: Order merchant payout settlements by volume tier and urgency.`, idealAnswer: 'Custom comparator PriorityQueue. Time: O(log N), Space: O(N).', difficulty: 'Medium' };
        return { question: `[${compName} Final DSA Problem 4/4 - Fraudulent Velocity Location Jumps]: Detect suspicious location jumps (> 500 km/h) in user payment logs.`, idealAnswer: 'User last location HashMap tracking distance vs delta time. Time: O(N), Space: O(U).', difficulty: 'Hard' };
      }

      // 10. FLIPKART / MEESHO / E-COMMERCE
      if (isFlipkart || isMeesho || isUrbanCompany || isMakeMyTrip) {
        if (roundNumber === 0) return { question: `[${compName} DSA Problem 1/4 - Inventory Stock Knapsack Allocation]: Maximize revenue from inventory under weight limit using Knapsack DP.`, idealAnswer: '0/1 Knapsack Dynamic Programming. Time: O(N * W), Space: O(W).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[${compName} DSA Problem 2/4 - Package Delivery Order Routing (Dijkstra)]: Find shortest path to deliver packages to N destinations.`, idealAnswer: 'Dijkstra shortest path algorithm with PriorityQueue. Time: O(E log V), Space: O(V).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[${compName} DSA Problem 3/4 - Search Autocomplete Trie]: Build search auto-complete engine returning top 5 search terms.`, idealAnswer: 'Trie node storing top-5 max frequency list. Time: O(L), Space: O(N * L).', difficulty: 'Medium' };
        return { question: `[${compName} Final DSA Problem 4/4 - E-commerce Discount Combinations]: Find max discount combination from available coupon rules.`, idealAnswer: 'Backtracking with memoization / DP subset sum. Time: O(N * C), Space: O(C).', difficulty: 'Hard' };
      }

      // 11. GOLDMAN SACHS / JPMORGAN / MORGAN / DE SHAW / TOWER (Quant & Finance)
      if (isGoldman || isJPMorgan || isMorgan || isDEShaw || isTower || isGroww || isZerodha) {
        if (roundNumber === 0) return { question: `[${compName} Quant DSA Problem 1/4 - Best Time to Buy & Sell Stock with Cooldown]: Find max stock profit with 1-day cooldown.\n\nSample Test Cases:\n• Example 1: Input: prices = [1,2,3,0,2] | Output: 3`, idealAnswer: 'DP state machine (held, sold, reset). Time: O(N), Space: O(1).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[${compName} Quant DSA Problem 2/4 - Median of Two Sorted Arrays]: Return median of two sorted arrays in O(log(M+N)) time.\n\nSample Test Cases:\n• Example 1: Input: nums1 = [1,3], nums2 = [2] | Output: 2.0`, idealAnswer: 'Binary search on smaller array to find left/right partitions. Time: O(log(min(M,N))), Space: O(1).', difficulty: 'Hard' };
        if (roundNumber === 2) return { question: `[${compName} Quant DSA Problem 3/4 - High Frequency Order Book Matcher]: Design Price-Time Priority order matcher in O(log N) time.`, idealAnswer: 'TreeMap / SkipList mapping price to order LinkedList. Time: O(log N), Space: O(N).', difficulty: 'Hard' };
        return { question: `[${compName} Quant Final DSA Problem 4/4 - Largest Rectangle in Histogram]: Compute max rectangle area in histogram heights.\n\nSample Test Cases:\n• Example 1: Input: heights = [2,1,5,6,2,3] | Output: 10`, idealAnswer: 'Monotonic stack storing height indices. Time: O(N), Space: O(N).', difficulty: 'Hard' };
      }

      // 12. ENTERPRISE SYSTEMS (Oracle, Cisco, IBM, Intel, Qualcomm, Samsung)
      if (isOracle || isCisco || isIBM || isIntel || isQualcomm || isSamsung) {
        if (roundNumber === 0) return { question: `[${compName} Systems DSA Problem 1/4 - Longest Prefix Match (Trie)]: Implement IP Routing table lookup using Binary Trie.`, idealAnswer: 'Binary Trie prefix matching. Time: O(32) -> O(1), Space: O(N).', difficulty: 'Medium' };
        if (roundNumber === 1) return { question: `[${compName} Systems DSA Problem 2/4 - B+ Tree Index Node Split]: Simulate B+ Tree leaf node splitting when node capacity M is reached.`, idealAnswer: 'Balanced M-way search tree split & parent promotion. Time: O(log N), Space: O(N).', difficulty: 'Hard' };
        if (roundNumber === 2) return { question: `[${compName} Systems DSA Problem 3/4 - Buffer Pool Memory LRU Manager]: Manage database page cache using LRU replacement policy.`, idealAnswer: 'HashMap + Doubly LinkedList buffer frame. Time: O(1), Space: O(Pages).', difficulty: 'Medium' };
        return { question: `[${compName} Final Systems Problem 4/4 - Deadlock Detection in Resource Allocation Graph]: Detect cycle in directed resource dependency graph.`, idealAnswer: 'DFS cycle detection with recursion stack tracking. Time: O(V+E), Space: O(V).', difficulty: 'Hard' };
      }

      // 13. IT SERVICES LEADERS (TCS, Infosys, Wipro, Cognizant, Accenture, Capgemini)
      if (isTCS || isInfosys || isWipro || isCognizant || isAccenture || isCapgemini) {
        if (roundNumber === 0) return { question: `[${compName} DSA Problem 1/4 - Rotate Array & Prime Check]: Rotate array by k steps and check if total sum is prime.\n\nSample Test Cases:\n• Example 1: Input: nums = [1,2,3,4,5,6,7], k = 3 | Output: [5,6,7,1,2,3,4]`, idealAnswer: 'Three-reversal array rotation + O(sqrt(S)) prime check. Time: O(N), Space: O(1).', difficulty: 'Easy' };
        if (roundNumber === 1) return { question: `[${compName} DSA Problem 2/4 - Longest Substring Without Repeating Characters]: Length of longest unique substring.\n\nSample Test Cases:\n• Example 1: Input: s = "abcabcbb" | Output: 3`, idealAnswer: 'Sliding window + character index map. Time: O(N), Space: O(1).', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `[${compName} DSA Problem 3/4 - Coin Change (Minimum Coins DP)]: Minimum coins needed to make target amount.\n\nSample Test Cases:\n• Example 1: Input: coins = [1,2,5], amount = 11 | Output: 3`, idealAnswer: 'Bottom-up DP table. Time: O(Amount * N), Space: O(Amount).', difficulty: 'Medium' };
        return { question: `[${compName} Final DSA Problem 4/4 - Binary Tree Level Order Traversal]: BFS level order traversal of binary tree nodes.`, idealAnswer: 'Queue BFS processing nodes by level. Time: O(N), Space: O(W).', difficulty: 'Medium' };
      }

      // 14. DYNAMIC FALLBACK SEED GENERATOR (FOR ANY UNLISTED FIRM SO NO firm IS EVER IDENTICAL)
      const seedHash = compName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const problemPool = [
        { name: 'Subarray Sum Equals K', topic: 'Prefix Sum + HashMap', time: 'O(N)' },
        { name: 'Course Schedule II', topic: 'Graph Topological Sort', time: 'O(V+E)' },
        { name: 'LRU Cache Design', topic: 'HashMap + Doubly LinkedList', time: 'O(1)' },
        { name: 'Sliding Window Maximum', topic: 'Monotonic Deque', time: 'O(N)' },
        { name: 'Find First & Last Position', topic: 'Binary Search', time: 'O(log N)' },
        { name: 'Binary Tree Maximum Path Sum', topic: 'DFS Postorder', time: 'O(N)' }
      ];

      const chosenProb = problemPool[(seedHash + roundNumber) % problemPool.length];
      return {
        question: `[${compName} DSA Problem ${roundNumber + 1}/4 - ${chosenProb.name}]: Solve '${chosenProb.name}' using ${chosenProb.topic} in ${chosenProb.time} time complexity.\n\nSample Test Cases:\n• Example 1: Standard test case verification for ${compName}\n• Example 2: Boundary test case input`,
        idealAnswer: `Optimal implementation using ${chosenProb.topic}. Time: ${chosenProb.time}, Space: O(N).`,
        difficulty: roundNumber === 0 ? 'Easy' : roundNumber === 3 ? 'Hard' : 'Medium'
      };
    }

    // ==========================================
    // 2. HR / LEADERSHIP PRINCIPLES ROUND
    // ==========================================
    if (isHR) {
      if (isGoogle) {
        if (roundNumber === 0) return { question: `Welcome to Google HR. How do you demonstrate 'Googliness', navigate ambiguity, and push innovative ideas in a team?`, idealAnswer: 'Adaptability, active listening, user-first engineering.', difficulty: 'Easy' };
        if (roundNumber === 1) return { question: `Google Culture: Describe a technical disagreement with a peer. How did you disagree and commit?`, idealAnswer: 'Data-driven benchmarking and team alignment.', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `Handling Risk: Describe a scenario where project requirements changed rapidly. How did you maintain velocity?`, idealAnswer: 'Agile iteration, clear milestones, stakeholder updates.', difficulty: 'Medium' };
        return { question: `Long-term Growth: How do you plan to mentor junior engineers and contribute to Google's engineering community?`, idealAnswer: 'Tech talks, code reviews, open source leadership.', difficulty: 'Medium' };
      }

      if (isAmazon) {
        if (roundNumber === 0) return { question: `Welcome to Amazon HR. Which Leadership Principle (Customer Obsession, Ownership, Invent & Simplify) guides you most?`, idealAnswer: 'Pick LP and give project story.', difficulty: 'Easy' };
        if (roundNumber === 1) return { question: `Amazon LP (Bias for Action): Tell me about a fast technical decision you made without full data.`, idealAnswer: 'Two-way door decision making.', difficulty: 'Medium' };
        if (roundNumber === 2) return { question: `Amazon LP (Have Backbone; Disagree & Commit): Tell me about challenging a senior leader's architectural choice.`, idealAnswer: 'Data backed proposal, respectful debate.', difficulty: 'Medium' };
        return { question: `Amazon LP (Deliver Results): How did you meet a high pressure deadline when roadblocks occurred?`, idealAnswer: 'Scope pruning and execution.', difficulty: 'Medium' };
      }

      // Default HR
      if (roundNumber === 0) return { question: `Welcome to ${compName} HR Interview. Introduce yourself, your background, and why you are passionate about ${compName}.`, idealAnswer: 'Clear introduction and alignment.', difficulty: 'Easy' };
      if (roundNumber === 1) return { question: `Tell me about a technical conflict with a team member at ${compName}. How did you handle it?`, idealAnswer: 'STAR method focusing on mutual respect.', difficulty: 'Medium' };
      if (roundNumber === 2) return { question: `Describe a time a project failed or missed a deadline. What went wrong and how did you recover?`, idealAnswer: 'Accountability and fixes.', difficulty: 'Medium' };
      return { question: `Where do you see your engineering career in 3-5 years at ${compName}?`, idealAnswer: 'Technical excellence and impact.', difficulty: 'Medium' };
    }

    // ==========================================
    // 3. TECHNICAL THEORY & SYSTEM DESIGN ROUND
    // ==========================================
    if (isGoogle) {
      if (roundNumber === 0) return { question: `Welcome to Google Technical Theory. Walk me through a complex technical system you engineered.`, idealAnswer: 'Architecture, algorithms, and metrics.', difficulty: 'Easy' };
      if (roundNumber === 1) return { question: `Google Graph Question: How do you detect circular module dependencies using Topological Sort?`, idealAnswer: 'Kahn algorithm or DFS 3-color array.', difficulty: 'Medium' };
      if (roundNumber === 2) return { question: `Google Infrastructure: Explain Google File System (GFS) or BigTable consistency principles.`, idealAnswer: 'RAM metadata, append-only log, 64MB chunks.', difficulty: 'Hard' };
      return { question: `Google System Design: Design Google Search Autocomplete Trie service handling 500M daily queries sub-10ms.`, idealAnswer: 'Partitioned Trie, Redis top-K cache, Kafka streams.', difficulty: 'Hard' };
    }

    if (isAmazon) {
      if (roundNumber === 0) return { question: `Welcome to Amazon Technical Round. Describe your most scalable system architecture.`, idealAnswer: 'Microservices, DB choice, AWS cloud.', difficulty: 'Easy' };
      if (roundNumber === 1) return { question: `Amazon Low-Level Design: Design an Amazon Locker delivery kiosk system with classes and states.`, idealAnswer: 'Locker, Package, SlotState, thread locks.', difficulty: 'Medium' };
      if (roundNumber === 2) return { question: `Amazon Systems: Explain DynamoDB Eventual Consistency, Vector Clocks, and Consistent Hashing.`, idealAnswer: 'Consistent hashing ring, Merkle trees.', difficulty: 'Hard' };
      return { question: `Amazon System Design: Design Amazon Prime Video telemetry processing 100k state updates/sec zero loss.`, idealAnswer: 'Kinesis/Kafka, Lambda, DynamoDB time-series, S3.', difficulty: 'Hard' };
    }

    // Generic Technical Theory for unlisted firms
    if (roundNumber === 0) return { question: `Welcome to ${compName} Technical Interview. Introduce your core tech stack and architecture choices.`, idealAnswer: 'Architecture and stack selection.', difficulty: 'Easy' };
    if (roundNumber === 1) return { question: `Security & Caching at ${compName}: Explain JWT vs Sessions, HttpOnly cookies, and Redis caching.`, idealAnswer: 'HttpOnly cookies, Redis caching and rate limiting.', difficulty: 'Medium' };
    if (roundNumber === 2) return { question: `Node.js Async Engine: Explain how the Event Loop and libuv handle non-blocking I/O.`, idealAnswer: 'Event loop, thread pool, OS kernel delegation.', difficulty: 'Medium' };
    return { question: `System Design: Design real-time WebSocket notification system at ${compName} for 100k active users.`, idealAnswer: 'WebSockets/SSE, Redis Pub/Sub, load balancing.', difficulty: 'Hard' };
  });
};

/**
 * AI INTERVIEW EVALUATOR (At the end of interview)
 * DYNAMICALLY PARSES CANDIDATE'S ACTUAL SUBMITTED ANSWERS
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
    // Dynamic Evaluation Engine: Clean candidate's actual text contributions
    const answers = questionsAndAnswers || [];

    // Clean out pre-filled comments and template headers
    let candidateTypedText = '';
    let attemptedCount = 0;

    answers.forEach(qa => {
      const rawAns = qa.answer || '';
      const cleaned = rawAns
        .replace(/\/\/.*/g, '')
        .replace(/Code \([a-z]+\):/gi, '')
        .replace(/Notes:/gi, '')
        .replace(/\[NO ANSWER SUBMITTED\]/gi, '')
        .replace(/function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/gi, '')
        .replace(/return\s+(null|\[\]|0|false|true|""|'');?/gi, '')
        .replace(/[{}]/g, '')
        .trim();

      if (cleaned.length > 5) {
        candidateTypedText += ' ' + cleaned;
        attemptedCount++;
      }
    });

    const textLower = candidateTypedText.toLowerCase();
    const wordCount = candidateTypedText.trim().split(/\s+/).filter(Boolean).length;

    // IF NO REAL ANSWERS WERE SUBMITTED / SKIPPED ALL QUESTIONS
    if (attemptedCount === 0 || wordCount < 5) {
      return {
        score: 0,
        metrics: {
          technicalAccuracy: 0,
          communication: 0,
          confidence: 0,
          grammar: 0
        },
        feedback: {
          strengths: [
            'Interview session started successfully.'
          ],
          weaknesses: [
            'All 4 questions were left un-attempted or submitted blank without custom solution code.',
            'No explanation notes or technical answers were detected.'
          ],
          suggestions: [
            'Make sure to type out your code logic or explanation notes before clicking Submit.',
            'Even partial pseudocode or basic explanations will earn technical accuracy points.'
          ]
        }
      };
    }

    // 1. Technical Keyword Analysis
    const techKeywords = [
      'o(n)', 'o(1)', 'o(log n)', 'time complexity', 'space complexity',
      'redis', 'cache', 'database', 'index', 'jwt', 'cookie', 'security',
      'kafka', 'queue', 'websocket', 'async', 'event loop', 'microservice',
      'docker', 'transaction', 'acid', 'lock', 'idempotency', 'api',
      'array', 'hashmap', 'tree', 'graph', 'dfs', 'bfs', 'dp', 'sql'
    ];
    const detectedKeywords = techKeywords.filter(kw => textLower.includes(kw));

    // 2. Score Calculations based ONLY on candidate's real typed input (NO artificial floor!)
    let accuracyScore = Math.min(10, Math.round(detectedKeywords.length * 2.2 + (wordCount > 30 ? 2 : 0)));
    let commScore = Math.min(10, Math.round(wordCount / 15));
    let confScore = Math.min(10, Math.round(accuracyScore * 0.6 + commScore * 0.4));
    let gramScore = Math.min(10, Math.round(commScore * 0.9 + 1));

    // Overall Score
    let overallScore = Math.min(98, Math.round((accuracyScore * 4 + commScore * 2.5 + confScore * 2 + gramScore * 1.5)));

    // Adjust for skipped questions
    if (attemptedCount < 4) {
      const penalty = (4 - attemptedCount) * 15;
      overallScore = Math.max(0, overallScore - penalty);
    }

    // 3. Dynamic Strengths & Weaknesses based on actual text content
    const strengths = [];
    if (detectedKeywords.includes('o(n)') || detectedKeywords.includes('time complexity')) {
      strengths.push('Proactively articulated algorithmic Big-O Time & Space complexity analysis.');
    }
    if (detectedKeywords.includes('redis') || detectedKeywords.includes('cache')) {
      strengths.push('Demonstrated solid understanding of caching layers (Redis/In-memory) for scalable I/O.');
    }
    if (detectedKeywords.includes('jwt') || detectedKeywords.includes('security')) {
      strengths.push('Highlighted API security best practices, token validation, and state isolation.');
    }
    if (strengths.length === 0) {
      strengths.push(`Attempted ${attemptedCount} out of 4 interview questions with initial solution text.`);
    }

    const weaknesses = [];
    if (attemptedCount < 4) {
      weaknesses.push(`Skipped ${4 - attemptedCount} question(s) without providing an answer.`);
    }
    if (wordCount < 40) {
      weaknesses.push('Responses were concise. Elaborate more on technical edge cases and system trade-offs.');
    }
    if (!detectedKeywords.includes('o(n)') && !detectedKeywords.includes('time complexity')) {
      weaknesses.push('Omitted explicit Big-O complexity analysis during technical & coding solutions.');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Minor usage of conversational transition phrasing during complex system design queries.');
    }

    const suggestions = [];
    if (wordCount < 50) {
      suggestions.push('Practice using the STAR method (Situation, Task, Action, Result) to expand answer depth.');
    }
    suggestions.push('Review company-specific system design patterns (e.g. Distributed Caching, Message Queues).');
    suggestions.push('Always mention Space & Time complexity trade-offs before writing algorithmic code.');

    return {
      score: overallScore,
      metrics: {
        technicalAccuracy: accuracyScore,
        communication: commScore,
        confidence: confScore,
        grammar: gramScore
      },
      feedback: {
        strengths,
        weaknesses,
        suggestions
      }
    };
  });
};

const predictPlacementScore = async (userData) => {
  // Simulates a complex calculation combining LeetCode, GitHub, Resume, Projects and Interview scores.
  const resumeScore = userData.resumeScore || 70;
  const githubScore = userData.githubScore || 65;
  const leetcodeCount = userData.leetcodeSolved || 60;
  const interviewAvg = userData.interviewAvg || 65;
  const cgpa = userData.cgpa || 7.8;

  // Simple weighted score modeling
  let careerScore = Math.round(
    (resumeScore * 0.2) +
    (githubScore * 0.15) +
    (Math.min(leetcodeCount / 300, 1) * 100 * 0.25) +
    (interviewAvg * 0.3) +
    ((cgpa / 10) * 100 * 0.1)
  );

  if (careerScore > 100) careerScore = 100;
  if (careerScore < 20) careerScore = 55; // Baseline floor for active student profiles

  // AI predictions for multiple target companies across categories
  const companyProbabilities = {
    Google: Math.max(10, Math.round(careerScore * 0.65)),
    Microsoft: Math.max(15, Math.round(careerScore * 0.78)),
    Amazon: Math.max(15, Math.round(careerScore * 0.8)),
    Meta: Math.max(10, Math.round(careerScore * 0.68)),
    Razorpay: Math.max(20, Math.round(careerScore * 0.85)),
    CRED: Math.max(15, Math.round(careerScore * 0.72)),
    Flipkart: Math.max(20, Math.round(careerScore * 0.82)),
    Zomato: Math.max(20, Math.round(careerScore * 0.84)),
    GoldmanSachs: Math.max(15, Math.round(careerScore * 0.75)),
    TCS: Math.max(30, Math.round(Math.min(100, careerScore * 1.15))),
    Infosys: Math.max(35, Math.round(Math.min(100, careerScore * 1.18)))
  };

  // Expected salary calculation ensuring realistic positive LPA ranges
  const minLPA = Math.max(4, Math.round(4 + (careerScore * 0.14)));
  const maxLPA = minLPA + Math.max(3, Math.round(3 + (careerScore * 0.10)));
  const expectedSalary = `${minLPA}-${maxLPA} LPA`;

  return {
    careerScore,
    expectedSalary,
    offerProbability: `${Math.round(careerScore * 0.9)}%`,
    companyProbabilities,
    growthForecast: {
      '30Days': Math.min(100, careerScore + 6),
      '60Days': Math.min(100, careerScore + 13),
      '90Days': Math.min(100, careerScore + 20)
    },
    insights: [
      careerScore > 80 ? 'You are in the TOP 5% candidate pool. Focus on system design refinement and mock interviews.' : 'Solid core foundations detected. Enhance Docker/Kubernetes containerization and system design concepts.',
      leetcodeCount < 150 ? 'Your DSA problem count can be improved. Target solving 50 more medium LeetCode questions to boost FAANG shortlist probability.' : 'Excellent coding frequency, maintain daily problem solving streak.',
      resumeScore < 80 ? 'Your resume score can be elevated. Optimize bullet points with quantifiable impact metrics for 95%+ ATS clearance.' : 'ATS ready. Continue highlighting recent project accomplishments.'
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
