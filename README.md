# 🎓 SkillLens

AI-powered coding evaluation platform — solve real challenges, get proctored assessments, earn verifiable certificates, and get matched to jobs based on demonstrated skill.

## Project structure

```
SkillLens/
├── client/                     # Frontend — React + Vite
│   ├── public/                 # Static assets served as-is (logos, face-detection models)
│   ├── src/
│   │   ├── auth/                # Auth screens (login/signup gate)
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI atoms (Card, Badge, Avatar, GlobalStyle, ErrorBoundary...)
│   │   │   ├── layout/          # App-shell components (TopNav, PublicNav)
│   │   │   └── Proctoring.jsx   # Webcam/face-tracking proctoring widget
│   │   ├── constants/           # Static config/data (app constants, code boilerplate)
│   │   ├── hooks/               # Custom React hooks (useBreakpoint)
│   │   ├── pages/                # Route-level screens (Dashboard, Challenges, Session, Results, ...)
│   │   ├── services/            # External I/O — Supabase client, REST API calls, AI calls, network resilience
│   │   ├── utils/                # Pure helper logic (scoring, plagiarism checks, runtime config)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Backend — Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── services/             # Business logic (AI evaluation, job matching)
│   │   ├── utils/                # Code execution sandbox, plagiarism checks, test runner
│   │   └── server.js             # Entry point
│   └── package.json
│
├── database/
│   └── schema.sql                # Supabase/Postgres schema
│
├── docs/                          # Project documentation
│   ├── AI_INTEGRATION.md
│   ├── ENHANCED_PROCTORING_SYSTEM.md
│   ├── PROCTORING_PROGRESS_INTEGRATION.md
│   ├── PROGRESS_DATA_ANALYSIS.md
│   └── DETAILED_SETUP_GUIDE.md    # Original, more verbose setup notes
│
├── scripts/
│   └── start.sh                   # Convenience script to install deps + run client & server together
│
├── package.json                   # Root orchestration scripts (runs client + server together)
└── .gitignore
```

This groups the codebase the way most full-stack JS projects are laid out: a `client/` app and a `server/` app as independent, independently-deployable packages, each with their own `package.json`; framework-agnostic docs and DB schema live at the top level; and within the client, code is split by **role** (`pages` vs reusable `components`, `services` for I/O, `utils` for pure logic, `hooks` for React hooks) rather than everything sitting in one flat `components/` folder.

## Quick start

### Prerequisites
- Node.js 18+
- A Supabase project (URL + anon key + service role key)
- A Google Generative AI API key (for AI-assisted scoring/guidance features)

### 1. Install dependencies
```bash
npm run install:all
```
This installs dependencies for both `client/` and `server/`.

### 2. Configure environment variables
- `client/.env` — Vite-exposed vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_URL`)
- `server/.env` — server-only vars (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_AI_API_KEY`, `FRONTEND_URL`)

`.env.example` files are provided in both folders as a template.

> ⚠️ **Security note:** the `.env` files carried over from the original project contain live-looking Supabase and Google AI keys committed in plaintext (including a Supabase **service role** key, which bypasses row-level security). Treat those as compromised — rotate them in Supabase/Google AI Studio and never commit real secrets. `.gitignore` now excludes both `client/.env` and `server/.env` going forward.

### 3. Run in development
```bash
npm run dev
```
This runs the client (http://localhost:3000) and server (http://localhost:5000) concurrently. To run them individually:
```bash
npm run client:dev
npm run server:dev
```

Or use the helper script, which also installs missing dependencies first:
```bash
./scripts/start.sh
```

### 4. Build for production
```bash
npm run build
```
Outputs the static client bundle to `client/dist/`. Deploy `server/` separately as a long-running Node process.

## Further reading
See `docs/` for AI integration details, the proctoring system design, and progress-tracking data analysis. `docs/DETAILED_SETUP_GUIDE.md` is the original, more exhaustive setup/testing walkthrough — some paths and ports in it predate this restructure, so prefer the instructions above for day-to-day use.
