# Placify AI 🎓 
> **AI-Powered Career Operating System & Placement Readiness Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-emerald)](https://www.mongodb.com/)
[![Code Editor](https://img.shields.io/badge/Editor-Monaco%20Editor-007ACC)](https://microsoft.github.io/monaco-editor/)

Placify AI is an end-to-end, state-of-the-art **Career Operating System & Placement Intelligence Platform** designed to supercharge candidates through modern tech recruitment pipelines. Instead of static dashboards, Placify AI synchronizes ATS resume analytics, GitHub commit activity, LeetCode performance details, interactive multi-language code execution environments, company-targeted AI mock interviews, and predictive placement analytics into one unified platform.

---

## 🌟 Key Features & Core Capabilities

### 🎯 1. Company-Targeted Adaptive AI Mock Interviews
- **50+ Target Tech Giants & Unicorns**: Specialized interview tracks tailored to specific company patterns:
  - **MAANG & Big Tech**: Google, Microsoft, Amazon, Meta, Apple, Netflix
  - **Quant & High-Frequency Trading**: D. E. Shaw, Tower Research, Goldman Sachs, Morgan Stanley
  - **Fintech & Tech Unicorns**: Razorpay, CRED, Flipkart, Zomato, Swiggy, Uber, Stripe, Paytm, PhonePe
  - **IT Services & Global Tech**: TCS, Infosys, Wipro, Accenture, Cognizant, Capgemini
- **Company-Specific Question Bank**: Real interview questions focusing on Data Structures & Algorithms, System Design, Low-Level Design (LLD), Core CS Fundamentals (OS, DBMS, Networks), and Behavioral HR rounds.
- **Adaptive AI Interviewer**: Dual-mode engine (OpenAI GPT-4 / Intelligent Local Fallback) that adjusts question difficulty based on candidate response quality.
- **Sample Test Cases & Explanations**: Every coding question provides sample input/output test cases along with step-by-step logic explanations.
- **17+ Language Monaco Code Editor**: Full-featured browser IDE powered by VS Code's Monaco Editor with automatic boilerplate code stubs for:
  `C++`, `Python 3`, `Java`, `JavaScript`, `TypeScript`, `Go`, `Rust`, `C#`, `Kotlin`, `Swift`, `Ruby`, `PHP`, `SQL`, `Scala`, `Dart`, `Bash / Shell`, `HTML / CSS`.

---

### 📊 2. What-If Success Simulator & Placement Predictor
- **Recruiter Shortlist Probability**: Mathematical predictive model calculating candidate shortlist rates across top firms.
- **Expected LPA Salary Forecast**: Dynamic salary range projections based on candidate progress.
- **Interactive Success Simulator**: Move sliders for **Target DSA Solved**, **ATS Score Target**, and **Deployed Full-Stack Projects** to see instant, live recalculations of your career score and salary bracket.
- **Target Firm Crack Breakdown**: Visual probability percentages for companies like Google, Microsoft, Amazon, Razorpay, Goldman Sachs, etc.

---

### 📄 3. ATS Resume Intelligence & Job Description Matcher
- **Instant Resume Audit**: Upload resume PDFs or raw text to get a comprehensive ATS compatibility score (0-100%).
- **Impact Bullet Rewriter**: AI rewrites resume bullet points using the STAR format (Situation, Task, Action, Result) with strong action verbs and quantified impact.
- **Job Description Matcher**: Compare your resume directly against specific target Job Descriptions (JDs) to discover missing technical keywords and hard skills gaps.

---

### 🐙 4. GitHub & LeetCode Analytics Connectors
- **GitHub Commit Tracker**: Sync public GitHub repositories to analyze commit streaks, contribution frequency, and primary coding languages.
- **LeetCode Progress Scraper**: Track Easy, Medium, and Hard problem counts, acceptance rates, and competitive programming global rankings.
- **Unified Growth Heatmap**: Visualize daily preparation streaks and maintain consistency badges.

---

### 🗺️ 5. AI-Generated Personalized Career Roadmaps
- **Customized Learning Plans**: Input your goal role (e.g., *Backend Engineer*, *Full-Stack Developer*, *SDE-1*) and timeline to get a weekly breakdown.
- **Interactive Task Checklists**: Daily actionable milestones covering DSA topics, System Design patterns, and Project building goals.

---

## 🛠️ Tech Stack & Architecture

### **Frontend Client**
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (Lightning fast HMR)
- **Styling**: Vanilla CSS3, Tailwind CSS (Glassmorphism & Sleek Dark Mode UI)
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Data Visualization**: Recharts & Custom SVG progress gauges

### **Backend Server**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies / Local Storage & Bcrypt password hashing
- **Dual-Mode AI Engine**: OpenAI GPT-4 API integration with built-in intelligent fallback for offline / keyless execution.
- **File Uploads**: Multer middleware

---

## 📁 Directory Structure

```
placify AI/
├── client/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── components/        # Reusable UI widgets, Navbar, Sidebar
│       ├── context/           # AuthContext & State providers
│       ├── layouts/           # DashboardLayout & Protected Routes
│       ├── pages/             # LandingPage, Dashboard, PlacementPredictor, InterviewRoom, ResumeAnalyzer, Profile, Roadmap
│       ├── services/          # Centralized Axios API instances
│       └── utils/             # Helper formats, Monaco language stubs
└── server/
    ├── server.js
    ├── package.json
    ├── .env
    ├── config/                # MongoDB Database Connection
    ├── controllers/           # Auth, Interview, Resume, GitHub, LeetCode controllers
    ├── middlewares/           # JWT Protection & Auth middlewares
    ├── models/                # User, Profile, Interview, Roadmap Mongoose Schemas
    ├── routes/                # Express API Route Handlers
    └── services/              # Dual AI Engine, GitHub & LeetCode API Services
```

---

## ⚙️ Quick Start & Installation

### Prerequisites
- Node.js (`v18.0.0` or higher)
- npm (`v9.0.0` or higher)
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone Repository
```bash
git clone https://github.com/krishkoundal/Placify-Ai.git
cd Placify-Ai
```

### 2. Backend Setup
Navigate to `server` folder and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placify-ai
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional: Leave blank to use built-in offline AI mode
```

Start backend development server:
```bash
npm run dev
```
*(Server will start on `http://localhost:5000`)*

### 3. Frontend Setup
Open a new terminal, navigate to `client` folder and install dependencies:
```bash
cd client
npm install
```

Start Vite frontend development server:
```bash
npm run dev
```
*(Client app will open on `http://localhost:5173`)*

---

## 📡 Key API Endpoints Reference

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Create candidate account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| **Auth** | `GET` | `/api/auth/me` | Fetch active user credentials & streak |
| **Interview** | `POST` | `/api/interview/start` | Initialize company-targeted mock interview |
| **Interview** | `POST` | `/api/interview/answer` | Process answer & get adaptive follow-up |
| **Interview** | `POST` | `/api/interview/end` | Complete interview & generate transcript feedback |
| **Predictor** | `POST` | `/api/placement/predict` | Calculate career score, company crack rates & LPA |
| **Resume** | `POST` | `/api/resume/analyze` | Run ATS audit, keyword check & bullet rewriter |
| **Integrations**| `POST` | `/api/github/connect` | Fetch commit count, repos & language distribution |
| **Integrations**| `POST` | `/api/leetcode/connect`| Fetch solved difficulty counts & global rank |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/krishkoundal/Placify-Ai/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
