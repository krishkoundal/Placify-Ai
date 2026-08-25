# Placify AI 🎓
> Know Your Skills. Predict Your Future. Get Hired.

Placify AI is an AI-powered **Career Operating System** designed to guide candidates through modern recruitment standards. Instead of acting as isolated dashboards, Placify AI synchronizes ATS Resume analytics, GitHub contributions tracking, LeetCode performance details, career timeline roadmaps, and adaptive AI mock technical/coding interviews into a unified intelligence workspace.

---

## 🚀 Tech Stack

### Frontend
- **Framework & Language:** React 19, TypeScript
- **Build Tool:** Vite
- **Styling & UI:** Tailwind CSS, Lucide React Icons
- **State Management & Querying:** Axios with context state lifecycle hooks
- **Visual Analytics:** Recharts
- **Interactive Compiler:** Monaco Editor
- **Animations:** Framer Motion

### Backend
- **Framework:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose ODM
- **Security:** JWT (JSON Web Tokens), password hashing (BcryptJS), CORS policies
- **File Parsing:** Multer storage middleware
- **AI Integrations:** OpenAI API (Dual-Mode: Real GPT / Realistic Local Simulation fallback)

---

## 📦 Directory Structure

```
placify AI/
├── client/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── index.css
│       ├── App.tsx
│       ├── components/  (Sidebar, Header, UI widgets)
│       ├── layouts/     (DashboardLayout route guards)
│       ├── pages/       (LandingPage, Dashboard, Profile, InterviewRoom, ResumeAnalyzer, etc.)
│       └── services/    (api.ts centralized Axios configurations)
└── server/
    ├── package.json
    ├── server.js
    ├── .env
    ├── config/          (db.js MongoDB database config)
    ├── models/          (User, Profile, Interview, Roadmap, Performance schemas)
    ├── controllers/     (authController, interviewController, resumeController, etc.)
    ├── routes/          (authRoutes, interviewRoutes, resumeRoutes, etc.)
    ├── middlewares/     (auth.js route protection check)
    └── services/        (aiService dual core, githubService, leetcodeService)
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placify-ai
JWT_SECRET=supersecretjwtkeyforplacifyai123
OPENAI_API_KEY=your_openai_api_key_here  # Leave empty to run in local simulation fallback mode
```

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Initialize MongoDB
Start a local MongoDB daemon or prepare a MongoDB Atlas connection string.

### 2. Configure Backend Server
```bash
cd server
npm install
npm start
```
The server will boot on port `5000`.

### 3. Configure Frontend Client
```bash
cd ../client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 📡 API Reference Documentation

### Authentication
- `POST /api/auth/register`: Initialize candidate user profile.
- `POST /api/auth/login`: Authenticate and start streak tracking.
- `GET /api/auth/me`: Fetch authenticated user profile settings.

### Candidate Profiles
- `GET /api/profile`: Retrieve technical achievements, target firms, and resume metrics.
- `PUT /api/profile`: Modify developer profile metadata.

### AI Resume Analytics
- `POST /api/resume/analyze`: Parse resume text or PDF, audit ATS compliance, and rewrite project bullets.
- `POST /api/resume/match-job`: Evaluate ATS compatibility score against a specific Job Description.

### GitHub & LeetCode Connectors
- `POST /api/github/connect`: Fetch repository count, languages, and contribution timeline.
- `POST /api/leetcode/connect`: Scrape solved difficulty levels and global rankings.

### Adaptive Mock Interviews
- `POST /api/interview/start`: Boot a mock interview room session.
- `POST /api/interview/answer`: Submit adaptive candidate response (updates questions difficulty).
- `POST /api/interview/end`: Compile full transcripts and reward learning XP.

### Career Roadmap Planner
- `POST /api/roadmap/generate`: Structure daily prep targets and weeks range milestones.
- `PUT /api/roadmap/update`: Toggle checklist items completion.

### Placement Score Predictions
- `GET /api/analytics/dashboard`: Aggregate commit timeline, DSA growth charts, and streaks.
- `POST /api/placement/predict`: Predict company crack probabilities and expected salaries.

---

## ⚖️ License
Licensed under the [MIT License](LICENSE).
