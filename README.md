# 🎯 SkillLens

### AI-Powered Coding Assessment & Career Intelligence Platform

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-SkillLens-3A2FC9?style=for-the-badge)](https://skill-lens-xi-murex.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Gauravmane31/Skill_Lens_Project)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

> **SkillLens** is a full-stack AI-powered coding assessment and career intelligence platform that evaluates developers through real coding challenges, monitors assessment integrity, analyzes resumes and skills using AI, recommends career opportunities, and provides recruiter-oriented assessment tools.

---

## 🌐 Live Demo

### 🚀 [Visit SkillLens](https://skill-lens-xi-murex.vercel.app/)

**Frontend:** Vercel  
**Backend:** Render  
**Database & Authentication:** Supabase  
**AI:** Google Gemini

---

# 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Platform Workflow](#-platform-workflow)
- [Candidate Features](#-candidate-features)
- [Recruiter Features](#-recruiter-features)
- [AI Features](#-ai-features)
- [Assessment Integrity](#-assessment-integrity)
- [Coding Assessment Engine](#-coding-assessment-engine)
- [Supported Languages](#-supported-languages)
- [Job Board & Matching](#-job-board--matching)
- [Company Assessments](#-company-assessments)
- [Leaderboard & Certificates](#-leaderboard--certificates)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database](#-database)
- [API Overview](#-api-overview)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Production Deployment](#-production-deployment)
- [Security Notes](#-security-notes)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

# 🚀 Overview

SkillLens is designed to bridge the gap between **traditional coding assessments, resumes, and real-world technical skills**.

Instead of relying only on resumes or self-reported skills, SkillLens allows candidates to demonstrate their abilities through:

- Real coding challenges
- Automated test-case evaluation
- AI-powered code analysis
- Resume analysis
- Skill-gap detection
- Career guidance
- Job recommendations
- Company-specific assessments
- Assessment integrity monitoring
- Progress tracking
- Leaderboards
- Certificates

The platform combines these signals into a centralized candidate profile that can be useful for both **developers and recruiters**.

---

# ❗ Problem Statement

Traditional hiring and assessment systems have several challenges:

- Resumes may not accurately represent practical programming ability.
- Coding assessments often provide limited actionable feedback.
- Candidates may not know which technical skills they need to improve.
- Recruiters have difficulty evaluating candidates beyond resumes.
- Assessment integrity can be difficult to maintain.
- Job recommendations may not reflect demonstrated technical ability.
- Candidates often receive little guidance after completing an assessment.

SkillLens addresses these problems by combining **coding evaluation, AI analysis, career intelligence, assessment integrity, and recruiter tools** into one platform.

---

# 💡 Solution

SkillLens creates an end-to-end technical evaluation and career workflow:

```text
                    ┌──────────────────┐
                    │     Candidate    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Coding Challenges│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Code Execution   │
                    │ + Test Cases     │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌─────────────────┐       ┌─────────────────┐
       │ AI Code Review  │       │ Integrity Check │
       └────────┬────────┘       └────────┬────────┘
                │                         │
                └────────────┬────────────┘
                             ▼
                    ┌──────────────────┐
                    │ Candidate Profile│
                    │ & Skill Signals  │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
       ┌───────────┐   ┌────────────┐   ┌────────────┐
       │ Resume AI │   │ Skill Gaps │   │ Job Match  │
       └───────────┘   └────────────┘   └────────────┘
             │               │                │
             └───────────────┼────────────────┘
                             ▼
                    ┌──────────────────┐
                    │ Career Guidance  │
                    └──────────────────┘
```

---

# ✨ Key Features

## 👨‍💻 Candidate Platform

- Secure authentication
- Candidate dashboard
- Coding challenges
- Multi-language code execution
- Automated test-case evaluation
- Challenge-based scoring
- Submission history
- Progress tracking
- Leaderboard
- Certificates
- Resume upload and analysis
- AI-powered career guidance
- AI skill-gap analysis
- AI job recommendations
- Company-specific coding assessments
- Notifications

---

## 🏢 Recruiter Platform

Recruiters can use SkillLens to:

- Manage candidate profiles
- View candidate performance
- Create company assessments
- Add assessment questions
- Assign assessments
- Track assignments
- View assessment leaderboards
- Evaluate demonstrated technical skills

---

# 🤖 AI Features

SkillLens integrates Google Gemini to provide several AI-powered capabilities.

## 1. 🧠 AI Code Analysis

Submitted code can be analyzed to provide feedback related to:

- Code quality
- Logic
- Complexity
- Potential improvements
- Technical observations

```http
POST /api/ai/analyze-code
```

---

## 2. 💼 AI Job Suggestions

SkillLens can analyze candidate information and technical signals to generate relevant job recommendations.

```http
POST /api/ai/job-suggestions
```

---

## 3. 📊 Skill Gap Analysis

The platform evaluates candidate skills against their career direction and identifies areas that may require improvement.

```http
POST /api/ai/skill-gaps
```

---

## 4. 🧭 AI Career Guidance

The career guidance system uses candidate information and performance signals to provide personalized recommendations.

```http
POST /api/ai/career-guidance
```

Possible guidance areas include:

- Career readiness
- Skill gaps
- Performance trajectory
- Recommended next steps
- Learning resources

---

## 5. 📄 AI Resume Analysis

Candidates can upload resumes for AI-assisted analysis.

The system can provide feedback related to:

- Resume quality
- Skills
- Experience
- ATS-oriented improvements
- Career alignment

```http
POST /api/ai/analyze-resume
```

---

# 🛡️ Assessment Integrity

SkillLens includes assessment-integrity mechanisms designed to monitor suspicious activity during technical assessments.

## 👁️ Face Detection

The platform uses webcam-based face detection during assessments.

It can monitor:

- Face presence
- Multiple faces
- Face visibility

Frontend technologies include:

```text
face-api.js
react-webcam
```

---

## 🔄 Tab Switching Detection

The system monitors browser visibility changes during assessments.

Repeated tab switching can be recorded as an integrity event.

---

## 📋 Copy-Paste Detection

The assessment environment monitors copy/paste activity to help identify suspicious behavior.

---

## 🔍 Plagiarism Detection

Submitted code can be analyzed for similarity using the platform's plagiarism-detection utilities.

---

## 📊 Proctoring Logs

Assessment integrity events are associated with candidate assessment activity and persisted through the backend.

---

# 💻 Coding Assessment Engine

SkillLens provides an in-browser coding environment using the Monaco Editor ecosystem.

Typical workflow:

```text
Select Challenge
      ↓
Select Language
      ↓
Write Code
      ↓
Run Code
      ↓
Execute Test Cases
      ↓
View Results
      ↓
Submit
      ↓
Score + Analysis
```

The backend contains dedicated components for:

- Code execution
- Test running
- Challenge scoring
- Submission processing
- Plagiarism analysis
- Assessment integrity

---

# 🌐 Supported Languages

The project is designed around multi-language coding assessment and includes support/configuration for languages such as:

- C
- C++
- Java
- JavaScript
- Python
- Go
- Rust

Actual availability depends on the configured execution environment and deployed runtime.

---

# 💼 Job Board & Matching

SkillLens includes a job discovery and recommendation system.

Candidates can:

- Browse jobs
- View job details
- View required skills
- View location and compensation information
- Receive personalized recommendations

Representative APIs:

```http
GET /api/jobs
GET /api/jobs/:id
GET /api/jobs/recommendations/me
```

AI-based matching can use candidate profile and skill information to recommend relevant opportunities.

---

# 🏢 Company Assessments

SkillLens supports company-specific coding assessments.

## Recruiter Workflow

```text
Create Assessment
       ↓
Add Questions
       ↓
Assign Candidates
       ↓
Candidates Attempt Assessment
       ↓
Evaluate Submissions
       ↓
View Results / Leaderboard
```

### Recruiter APIs

```http
POST   /api/recruiter/tests
GET    /api/recruiter/tests
GET    /api/recruiter/tests/:id/leaderboard
PUT    /api/recruiter/tests/:id
DELETE /api/recruiter/tests/:id

POST   /api/recruiter/tests/:id/assignments
GET    /api/recruiter/tests/:id/assignments
```

### Candidate APIs

```http
GET /api/company-tests/me
GET /api/company-tests/:id/my-progress
```

---

# 🏆 Leaderboard

SkillLens includes a leaderboard system for tracking candidate performance.

Leaderboard information can include:

- Rank
- Points
- Problems solved
- Streak
- Achievement information

```http
GET /api/leaderboard
```

---

# 📜 Certificates

Candidates can access certificates associated with their assessment achievements and platform performance.

The application contains a dedicated certificate experience for presenting earned credentials.

---

# 🔔 Notifications

The platform includes a notification system for communicating important updates to users.

Representative endpoints:

```http
GET  /api/notifications
POST /api/notifications/read
```

---

# 🏗️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend tooling |
| JavaScript | Application logic |
| Monaco Editor | Online coding editor |
| React Webcam | Webcam access |
| face-api.js | Face detection |
| Axios | HTTP requests |
| Supabase JS | Authentication/database integration |
| PDF.js | PDF processing |
| Mammoth | Document processing |
| React Hot Toast | UI notifications |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API |
| Socket.IO | Real-time communication |
| Supabase | PostgreSQL/auth integration |
| Google Gemini | AI services |
| BullMQ | Queue infrastructure |
| ioredis | Redis integration |
| Express Rate Limit | API rate limiting |
| CORS | Cross-origin request handling |

## Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Supabase | Database platform and authentication |

## Development & Deployment

| Technology | Purpose |
|---|---|
| Git | Version control |
| GitHub | Source code hosting |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Postman | API testing |
| Linux | Development environment |

---

# 🏛️ Architecture

```text
                         ┌─────────────────────┐
                         │       Browser       │
                         │                     │
                         │ React + Vite        │
                         │ Monaco Editor       │
                         │ Webcam / Proctoring │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS / REST
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │                     │
                         │ REST APIs           │
                         │ Authentication      │
                         │ Code Execution      │
                         │ Job Matching        │
                         │ Proctoring          │
                         │ AI Integration      │
                         └───────┬─────┬───────┘
                                 │     │
                 ┌───────────────┘     └────────────────┐
                 ▼                                      ▼
        ┌──────────────────┐                    ┌───────────────┐
        │     Supabase     │                    │ Google Gemini │
        │                  │                    │               │
        │ PostgreSQL       │                    │ AI Analysis   │
        │ Authentication  │                    │ Recommendations│
        │ Application Data │                    │ Career Guide  │
        └──────────────────┘                    └───────────────┘
```

---

# 📁 Project Structure

```text
Skill_Lens/
│
├── client/
│   ├── public/
│   │   └── static assets & ML models
│   │
│   ├── src/
│   │   ├── auth/
│   │   │   ├── AuthGate.jsx
│   │   │   └── ResetPasswordScreen.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── Proctoring.jsx
│   │   │
│   │   ├── constants/
│   │   │   ├── constants.js
│   │   │   ├── companyLogos.js
│   │   │   └── boilerplate.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useBreakpoint.js
│   │   │
│   │   ├── pages/
│   │   │   ├── CareerGuidancePage.jsx
│   │   │   ├── CertificatePage.jsx
│   │   │   ├── ChallengesPage.jsx
│   │   │   ├── CompanyTestsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── JobBoardPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProgressPage.jsx
│   │   │   ├── RecruiterDashboardPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   └── SessionPage.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── aiApi.js
│   │   │   ├── api.js
│   │   │   ├── networkResilience.js
│   │   │   └── supabase.js
│   │   │
│   │   ├── utils/
│   │   │   ├── plagiarism.js
│   │   │   ├── runtimeConfig.js
│   │   │   └── scoring.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   └── jobMatchingService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── codeExecution.js
│   │   │   ├── plagiarism.js
│   │   │   └── testRunner.js
│   │   │
│   │   └── server.js
│   │
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── docs/
│   ├── AI_INTEGRATION.md
│   ├── DETAILED_SETUP_GUIDE.md
│   ├── ENHANCED_PROCTORING_SYSTEM.md
│   ├── PROCTORING_PROGRESS_INTEGRATION.md
│   └── PROGRESS_DATA_ANALYSIS.md
│
├── scripts/
│   └── start.sh
│
├── package.json
└── .gitignore
```

---

# 🗄️ Database

SkillLens uses **PostgreSQL through Supabase**.

The schema contains major data domains for:

- User profiles
- Coding challenges
- Submissions
- Resume information
- Jobs
- Job matching
- Notifications
- Company tests
- Company test questions
- Company test assignments
- Proctoring logs

Conceptually:

```text
profiles
   │
   ├── submissions
   │       └── challenges
   │
   ├── resume_profiles
   │
   ├── job_matches
   │       └── jobs
   │
   ├── notifications
   │
   ├── company_test_assignments
   │       └── company_tests
   │               └── company_test_questions
   │
   └── proctoring_logs
```

The database schema is available in:

```text
database/schema.sql
```

---

# 🔌 API Overview

## Health

```http
GET /api/health
```

## Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/oauth/:provider
POST /api/auth/callback
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/reset-password
```

## Coding

```http
GET  /api/languages
POST /api/run
```

## Leaderboard

```http
GET /api/leaderboard
```

## Resume

```http
GET /api/profile/resume
PUT /api/profile/resume
```

## Profile

```http
PUT /api/profile/role
```

## Jobs

```http
POST /api/jobs
GET  /api/jobs
GET  /api/jobs/:id
GET  /api/jobs/recommendations/me
```

## Recruiter

```http
GET    /api/recruiter/candidates
POST   /api/recruiter/tests
GET    /api/recruiter/tests
GET    /api/recruiter/tests/:id/leaderboard
PUT    /api/recruiter/tests/:id
DELETE /api/recruiter/tests/:id
POST   /api/recruiter/tests/:id/assignments
GET    /api/recruiter/tests/:id/assignments
```

## Company Tests

```http
GET /api/company-tests/me
GET /api/company-tests/:id/my-progress
```

## AI

```http
POST /api/ai/analyze-code
POST /api/ai/job-suggestions
POST /api/ai/skill-gaps
POST /api/ai/career-guidance
POST /api/ai/analyze-resume
```

## Notifications

```http
GET  /api/notifications
POST /api/notifications/read
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

- Node.js 18+
- npm
- Git
- PostgreSQL/Supabase project
- Google Gemini API key

Optional development tools:

- Redis
- Postman
- VS Code

---

# 📥 Installation

Clone the repository:

```bash
git clone https://github.com/Gauravmane31/Skill_Lens_Project.git
```

Navigate into the project:

```bash
cd Skill_Lens_Project
```

Install root dependencies if required:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

# 🔐 Environment Variables

## Frontend

Create:

```text
client/.env
```

Example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:5000
```

For production:

```env
VITE_BACKEND_URL=https://skill-lens-project.onrender.com
```

---

## Backend

Create:

```text
server/.env
```

Example:

```env
PORT=5000

SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GOOGLE_AI_API_KEY=your_google_gemini_api_key

FRONTEND_URL=http://localhost:3000
```

For production:

```env
FRONTEND_URL=https://skill-lens-xi-murex.vercel.app
```

### ⚠️ Never commit `.env` files.

Add them to `.gitignore`:

```gitignore
.env
.env.local
.env.production
```

---

# 🗃️ Database Setup

Create a Supabase project and configure PostgreSQL.

Then execute:

```text
database/schema.sql
```

inside the Supabase SQL editor.

After the schema is created:

1. Configure Supabase Authentication.
2. Configure the required redirect URLs.
3. Add your frontend URL.
4. Add the required environment variables to the backend and frontend.

For local development, your authentication redirect can include:

```text
http://localhost:3000
```

For production:

```text
https://skill-lens-xi-murex.vercel.app
```

---

# ▶️ Running Locally

## Start Backend

From:

```bash
cd server
```

run:

```bash
npm start
```

The backend will normally run on:

```text
http://localhost:5000
```

---

## Start Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The Vite development server will normally be available at:

```text
http://localhost:3000
```

---

# 🚀 Production Deployment

SkillLens uses a split deployment architecture.

```text
Frontend
   ↓
Vercel

Backend
   ↓
Render

Database + Auth
   ↓
Supabase

AI
   ↓
Google Gemini
```

## Frontend — Vercel

Configure:

```text
Root Directory: client
```

Build command:

```bash
npm install && npm run build
```

Output directory:

```text
dist
```

Environment variables:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_BACKEND_URL=https://skill-lens-project.onrender.com
```

---

## Backend — Render

Configure:

```text
Root Directory: server
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables:

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_AI_API_KEY=...
FRONTEND_URL=https://skill-lens-xi-murex.vercel.app
```

Render automatically provides the production `PORT`, so the backend should use:

```js
process.env.PORT || 5000
```

---

# 🔗 Production URLs

### Frontend

```text
https://skill-lens-xi-murex.vercel.app/
```

### Backend

```text
https://skill-lens-project.onrender.com
```

### Backend Health Check

```text
https://skill-lens-project.onrender.com/api/health
```

---

# 🔒 Security Notes

SkillLens processes authentication information, resumes, code submissions, and assessment activity. Production deployments should therefore follow secure practices.

### Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_AI_API_KEY
```

to the React frontend.

These keys must remain server-side.

### Frontend may contain:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_BACKEND_URL
```

`VITE_*` values are bundled into the frontend and should not contain private credentials.

---

# ⚠️ Code Execution Security

The project includes code execution functionality.

For a production system, arbitrary user-submitted code should **not** be executed directly inside the main web server without isolation.

A production-grade implementation should use:

- Container isolation
- CPU limits
- Memory limits
- Execution timeouts
- Filesystem restrictions
- Network restrictions
- Non-root execution
- Process limits
- Sandboxed execution workers

A dedicated execution service or isolated worker architecture is recommended before exposing unrestricted code execution to a large public audience.

---

# 📈 Future Improvements

Potential future improvements include:

- Dedicated sandboxed code-execution workers
- Docker-based language runtimes
- More advanced plagiarism detection
- Improved AI evaluation models
- Recruiter analytics dashboard
- Candidate comparison tools
- Advanced job recommendation algorithms
- Skill graphs
- Learning-path generation
- Real-time assessment analytics
- Advanced proctoring
- Redis-backed distributed queues
- Horizontal backend scaling
- Automated email notifications
- More company assessment templates
- Mobile application
- Public candidate skill profiles

---

# 🧪 Testing

Recommended testing areas include:

### Frontend

- Authentication
- Dashboard navigation
- Coding editor
- Resume upload
- Job board
- Company tests
- Proctoring
- Responsive UI

### Backend

- Authentication APIs
- Coding execution
- Test-case evaluation
- AI endpoints
- Job APIs
- Recruiter APIs
- Company-test APIs
- Notification APIs

### Integration

Verify:

```text
Frontend
   ↓
Backend
   ↓
Supabase
```

and:

```text
Backend
   ↓
Gemini API
```

---

# 🤝 Contributing

Contributions are welcome.

## 1. Fork the repository

```bash
git clone https://github.com/Gauravmane31/Skill_Lens_Project.git
```

## 2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

## 3. Make your changes

Follow the existing project structure and coding conventions.

## 4. Commit

```bash
git add .
git commit -m "feat: add your feature"
```

## 5. Push

```bash
git push origin feature/your-feature
```

## 6. Open a Pull Request

Explain:

- What was changed
- Why it was changed
- How it was tested
- Any known limitations

---

# 👨‍💻 Project

**SkillLens**

AI-Powered Coding Assessment & Career Intelligence Platform

Built using:

```text
React
Node.js
Express
Supabase
PostgreSQL
Google Gemini
Socket.IO
Vite
```

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

### 🔗 Links

- 🚀 [Live Demo](https://skill-lens-xi-murex.vercel.app/)
- 💻 [GitHub Repository](https://github.com/Gauravmane31/Skill_Lens_Project)

---

# 📄 License

This project currently does not specify a separate open-source license.

If you intend to allow public reuse, modification, and distribution, add an appropriate license such as MIT and include the corresponding `LICENSE` file in the repository.
