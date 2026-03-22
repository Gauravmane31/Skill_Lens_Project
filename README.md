# SkillLens — Full Setup Guide

## Architecture

```
skilllens/
├── src/            ← React frontend (Vite)
├── backend/        ← Node.js + Express API
│   ├── server.js   ← All auth endpoints
│   └── .env        ← Your secrets (create from .env.example)
└── README.md
```

---

## Step 1 — Create a Free Supabase Project

1. Go to **https://supabase.com** and sign up (free)
2. Click **New Project**, fill in a name and password
3. Wait ~2 minutes for provisioning
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Configure backend .env

```bash
cd backend
cp .env.example .env
# Edit .env and paste in your Supabase values
```

Your `backend/.env` should look like:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

## Step 3 — Enable Social OAuth Providers (optional)

### Google
1. Go to **https://console.cloud.google.com**
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret
5. In Supabase: **Authentication → Providers → Google** → enable + paste credentials

### GitHub
1. Go to **https://github.com/settings/applications/new**
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret
5. In Supabase: **Authentication → Providers → GitHub** → enable + paste credentials

### Facebook
1. Go to **https://developers.facebook.com** → Create App
2. Add "Facebook Login" product
3. Valid OAuth Redirect URI: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy App ID + Secret
5. In Supabase: **Authentication → Providers → Facebook** → enable + paste credentials

> **Tip:** Disable email confirmation for easier local testing:
> Supabase → Authentication → Settings → Disable "Enable email confirmations"

---

## Step 4 — Install & Run

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:4000
```

### Frontend
```bash
cd ..          # back to project root
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register with email + password |
| POST | `/api/auth/login` | Login with email + password |
| GET | `/api/auth/oauth/:provider` | Get OAuth redirect URL (google/github/facebook) |
| POST | `/api/auth/callback` | Exchange OAuth code for session |
| GET | `/api/auth/me` | Get current user from token |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate session |
| POST | `/api/auth/reset-password` | Send password reset email |
| GET | `/api/health` | Health check |

---

## How OAuth Works in the App

1. User clicks "Google" / "GitHub" / "Facebook"
2. Frontend calls `GET /api/auth/oauth/google` → gets a redirect URL from Supabase
3. Frontend opens that URL in a **popup window**
4. User authenticates with Google/GitHub/Facebook
5. Supabase redirects to `http://localhost:3000/auth/callback?code=xxx`
6. The callback page sends the `code` to the parent window via `postMessage`
7. Parent window calls `POST /api/auth/callback` with the code
8. Backend exchanges code → gets session → returns user + tokens
9. Tokens stored in `sessionStorage`, user logged in

---

## Production Deployment

1. Deploy backend to **Railway / Render / Fly.io**
2. Set env vars on the hosting platform
3. Update `FRONTEND_URL` in backend `.env` to your production frontend URL
4. Update OAuth redirect URLs in Google/GitHub/Facebook consoles
5. Build frontend: `npm run build` → deploy `dist/` to Netlify/Vercel
