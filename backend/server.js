import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "http";
import { Server } from "socket.io";
import { LANGUAGES, SUPPORTED_LANGUAGES, executeCode } from "./utils/codeExecution.js";
import { checkPlagiarism } from "./utils/plagiarism.js";
import { buildCandidateSignals, calculateJobMatch } from "./services/jobMatchingService.js";
import { 
  analyzeCodeWithAI, 
  getJobSuggestionsWithAI, 
  analyzeSkillGapsWithAI, 
  getCareerGuidanceWithAI,
  analyzeResumeWithAI 
} from "./services/aiService.js";

// ── Validate env ──────────────────────────────────────────────────────────────
const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing env vars:", missing.join(", "));
  console.error("   Copy backend/.env.example → backend/.env and fill it in.");
  process.exit(1);
}

// ── Supabase clients ──────────────────────────────────────────────────────────
// anon client — used for sign-in/sign-up (respects RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// service-role client — used for admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  ...FRONTEND_URL.split(",").map((origin) => origin.trim()),
]
  .filter(Boolean)
  .filter((origin, index, arr) => arr.indexOf(origin) === index);

const SOCKET_ALLOWED_ORIGINS = FRONTEND_URL
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
};

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// ── Socket.IO (optional real-time output streaming) ──────────────────────────
export const io = new Server(server, {
  cors: {
    origin: SOCKET_ALLOWED_ORIGINS.length ? SOCKET_ALLOWED_ORIGINS : ALLOWED_ORIGINS,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client left:", socket.id));
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
// Resume file payloads are sent as base64 JSON; raise limit beyond Express default (100kb).
app.use(express.json({ limit: "12mb" }));
app.set("trust proxy", 1);

// Rate limiting — auth routes only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests. Please wait 15 minutes." },
});

// Optional limiter for profile write operations
const profileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many profile updates. Please try again in a minute." },
});

// Rate limiting for code execution — 30 runs / 60s per IP
const codeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many requests — slow down!" },
  standardHeaders: true,
  legacyHeaders: false,
});

const recruiterLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: { error: "Too many recruiter requests. Please retry later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const jobPostLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: { error: "Too many job postings. Please wait a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Helper ────────────────────────────────────────────────────────────────────
function userPayload(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
    avatar: (user.user_metadata?.full_name || user.email)
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    avatarUrl: user.user_metadata?.avatar_url || null,
    provider: user.app_metadata?.provider || "email",
    points: 0,
  };
}

async function requireUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided." });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Invalid or expired token." });

    req.user = data.user;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized." });
  }
}

async function requireRecruiter(req, res, next) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!profile || !["recruiter", "admin"].includes(profile.role)) {
      return res.status(403).json({ error: "Recruiter access required." });
    }

    req.profile = profile;
    return next();
  } catch {
    return res.status(403).json({ error: "Recruiter access required." });
  }
}

function formatTimeAgo(isoDate) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function fetchChallengeDomainMap() {
  const { data, error } = await supabaseAdmin
    .from("challenges")
    .select("id, domain");

  if (error) throw error;
  return new Map((data || []).map((item) => [Number(item.id), item.domain || "General"]));
}

async function listCandidateSignals() {
  const challengeDomainMap = await fetchChallengeDomainMap();

  const [profilesRes, submissionsRes, resumesRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, name, email, points, role")
      .neq("role", "recruiter"),
    supabaseAdmin
      .from("submissions")
      .select("user_id, challenge_id, code_score, integrity_score, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("resume_profiles")
      .select("user_id, profile")
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (submissionsRes.error) throw submissionsRes.error;
  if (resumesRes.error) throw resumesRes.error;

  const submissionsByUser = new Map();
  (submissionsRes.data || []).forEach((item) => {
    const list = submissionsByUser.get(item.user_id) || [];
    list.push(item);
    submissionsByUser.set(item.user_id, list);
  });

  const resumeByUser = new Map((resumesRes.data || []).map((item) => [item.user_id, item]));

  return (profilesRes.data || []).map((profile) =>
    buildCandidateSignals({
      profile,
      resumeProfile: resumeByUser.get(profile.id),
      submissions: submissionsByUser.get(profile.id) || [],
      challengeDomainMap,
    })
  );
}

async function createNotificationsForJob(job, threshold = 70) {
  const candidates = await listCandidateSignals();
  const notifications = [];
  const matchRows = [];

  candidates.forEach((candidate) => {
    const match = calculateJobMatch(job, candidate);
    if (match.matchScore < threshold || match.readinessScore < Number(job.min_skill_score || 0)) return;

    notifications.push({
      user_id: candidate.userId,
      job_id: job.id,
      message: `New match: ${job.title} at ${job.company} (${match.matchScore}% match)`,
      seen: false,
    });

    matchRows.push({
      user_id: candidate.userId,
      job_id: job.id,
      match_score: match.matchScore,
      match_reasons: match.matchReasons,
      missing_skills: match.missingSkills,
    });
  });

  if (matchRows.length) {
    const { error: matchError } = await supabaseAdmin
      .from("job_matches")
      .upsert(matchRows, { onConflict: "user_id,job_id" });
    if (matchError) throw matchError;
  }

  if (notifications.length) {
    const { error: notifError } = await supabaseAdmin
      .from("notifications")
      .insert(notifications);
    if (notifError) throw notifError;
  }

  return { matchedUsers: matchRows.length };
}

function parseStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 30);
}

function validateJobPayload(payload = {}) {
  const title = String(payload.title || "").trim();
  const company = String(payload.company || "").trim();
  const description = String(payload.description || "").trim();
  const domain = String(payload.domain || "").trim();
  const requiredSkills = parseStringArray(payload.requiredSkills);
  const minSkillScore = Math.max(0, Math.min(100, Number(payload.minSkillScore) || 0));
  const notificationThreshold = Math.max(0, Math.min(100, Number(payload.notificationThreshold) || 0));

  if (!title || title.length > 140) {
    return { error: "title is required and must be <= 140 chars." };
  }
  if (!company || company.length > 140) {
    return { error: "company is required and must be <= 140 chars." };
  }
  if (!description || description.length > 5000) {
    return { error: "description is required and must be <= 5000 chars." };
  }
  if (!domain || domain.length > 120) {
    return { error: "domain is required and must be <= 120 chars." };
  }

  return {
    value: {
      title,
      company,
      description,
      requiredSkills,
      domain,
      minSkillScore,
      notificationThreshold,
    },
  };
}

function validateRecruiterTestPayload(payload = {}) {
  const company = String(payload.company || "").trim();
  const roleTitle = String(payload.roleTitle || "").trim();
  const description = String(payload.description || "").trim();
  const challengeIds = Array.isArray(payload.challengeIds)
    ? payload.challengeIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0)
    : [];

  const uniqueChallengeIds = [...new Set(challengeIds)].slice(0, 20);

  if (!company || company.length > 140) {
    return { error: "company is required and must be <= 140 chars." };
  }
  if (!roleTitle || roleTitle.length > 140) {
    return { error: "roleTitle is required and must be <= 140 chars." };
  }
  if (description.length > 5000) {
    return { error: "description must be <= 5000 chars." };
  }
  if (uniqueChallengeIds.length < 2) {
    return { error: "A test must include at least 2 questions." };
  }

  return {
    value: {
      company,
      roleTitle,
      description,
      challengeIds: uniqueChallengeIds,
    },
  };
}

function validateRecruiterTestUpdatePayload(payload = {}) {
  const hasCompany = Object.prototype.hasOwnProperty.call(payload, "company");
  const hasRoleTitle = Object.prototype.hasOwnProperty.call(payload, "roleTitle");
  const hasDescription = Object.prototype.hasOwnProperty.call(payload, "description");
  const hasIsActive = Object.prototype.hasOwnProperty.call(payload, "isActive");
  const hasChallengeIds = Array.isArray(payload.challengeIds);

  const value = {};
  if (hasCompany) {
    const company = String(payload.company || "").trim();
    if (!company || company.length > 140) return { error: "company must be <= 140 chars." };
    value.company = company;
  }
  if (hasRoleTitle) {
    const roleTitle = String(payload.roleTitle || "").trim();
    if (!roleTitle || roleTitle.length > 140) return { error: "roleTitle must be <= 140 chars." };
    value.roleTitle = roleTitle;
  }
  if (hasDescription) {
    const description = String(payload.description || "").trim();
    if (description.length > 5000) return { error: "description must be <= 5000 chars." };
    value.description = description;
  }
  if (hasIsActive) {
    value.isActive = Boolean(payload.isActive);
  }
  if (hasChallengeIds) {
    const challengeIds = [...new Set(payload.challengeIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0))].slice(0, 20);
    if (challengeIds.length < 2) return { error: "Updated test must include at least 2 questions." };
    value.challengeIds = challengeIds;
  }

  if (!Object.keys(value).length) {
    return { error: "No valid fields provided for update." };
  }

  return { value };
}

const escapeCsv = (value) => {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const toCsv = (rows = []) => {
  if (!rows.length) return "rank,name,email,finalScore,avgCode,avgIntegrity,completionRate,attemptedQuestions,totalQuestions\n";
  const header = "rank,name,email,finalScore,avgCode,avgIntegrity,completionRate,attemptedQuestions,totalQuestions";
  const body = rows.map((row, index) => [
    index + 1,
    escapeCsv(row.name),
    escapeCsv(row.email),
    row.finalScore,
    row.avgCode,
    row.avgIntegrity,
    row.completionRate,
    row.attemptedQuestions,
    row.totalQuestions,
  ].join(",")).join("\n");
  return `${header}\n${body}\n`;
};

async function ensureOwnedRecruiterTest(testId, recruiterId) {
  const { data: test, error } = await supabaseAdmin
    .from("company_tests")
    .select("id, company, role_title, description, created_by, is_active")
    .eq("id", testId)
    .maybeSingle();

  if (error) throw error;
  if (!test) return { notFound: true };
  if (test.created_by !== recruiterId) return { forbidden: true };
  return { test };
}

async function computeUserTestProgress({ userId, challengeIds = [] }) {
  if (!challengeIds.length) {
    return {
      attemptedQuestions: 0,
      totalQuestions: 0,
      completionRate: 0,
      avgCode: 0,
      avgIntegrity: 0,
      finalScore: 0,
      questions: [],
    };
  }

  const { data: rows, error } = await supabaseAdmin
    .from("submissions")
    .select("challenge_id, code_score, integrity_score, created_at")
    .eq("user_id", userId)
    .in("challenge_id", challengeIds)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const bestByChallenge = new Map();
  (rows || []).forEach((row) => {
    const challengeId = Number(row.challenge_id);
    const current = bestByChallenge.get(challengeId);
    if (!current || Number(row.code_score || 0) > Number(current.code_score || 0)) {
      bestByChallenge.set(challengeId, row);
    }
  });

  const attemptedQuestions = bestByChallenge.size;
  const totalQuestions = challengeIds.length;
  const completionRate = Math.round((attemptedQuestions / Math.max(1, totalQuestions)) * 100);
  const values = [...bestByChallenge.values()];
  const avgCode = values.length
    ? Math.round(values.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / values.length)
    : 0;
  const avgIntegrity = values.length
    ? Math.round(values.reduce((sum, item) => sum + Number(item.integrity_score || 0), 0) / values.length)
    : 0;
  const finalScore = Math.round(avgCode * 0.7 + avgIntegrity * 0.2 + completionRate * 0.1);

  return {
    attemptedQuestions,
    totalQuestions,
    completionRate,
    avgCode,
    avgIntegrity,
    finalScore,
    questions: challengeIds.map((challengeId) => ({
      challengeId,
      attempted: bestByChallenge.has(Number(challengeId)),
      bestCodeScore: bestByChallenge.get(Number(challengeId))?.code_score ?? null,
      bestIntegrityScore: bestByChallenge.get(Number(challengeId))?.integrity_score ?? null,
      lastAttemptAt: bestByChallenge.get(Number(challengeId))?.created_at ?? null,
    })),
  };
}

function aggregateTestLeaderboard({ profiles = [], submissions = [], challengeIds = [] }) {
  const challengeSet = new Set(challengeIds.map((id) => Number(id)));
  const profileById = new Map((profiles || []).map((p) => [p.id, p]));

  const bestByUserAndChallenge = new Map();
  (submissions || []).forEach((row) => {
    const challengeId = Number(row.challenge_id);
    if (!challengeSet.has(challengeId)) return;

    const key = `${row.user_id}:${challengeId}`;
    const current = bestByUserAndChallenge.get(key);
    const score = Number(row.code_score || 0);
    if (!current || score > Number(current.code_score || 0)) {
      bestByUserAndChallenge.set(key, row);
    }
  });

  const groupedByUser = new Map();
  bestByUserAndChallenge.forEach((row) => {
    const list = groupedByUser.get(row.user_id) || [];
    list.push(row);
    groupedByUser.set(row.user_id, list);
  });

  const totalQuestions = challengeSet.size;
  const rows = [];

  groupedByUser.forEach((attempts, userId) => {
    const profile = profileById.get(userId);
    if (!profile) return;

    const attemptedQuestions = attempts.length;
    const avgCode = Math.round(
      attempts.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / Math.max(1, attemptedQuestions)
    );
    const avgIntegrity = Math.round(
      attempts.reduce((sum, item) => sum + Number(item.integrity_score || 0), 0) / Math.max(1, attemptedQuestions)
    );
    const completionRate = Math.round((attemptedQuestions / Math.max(1, totalQuestions)) * 100);
    const finalScore = Math.round(avgCode * 0.7 + avgIntegrity * 0.2 + completionRate * 0.1);

    rows.push({
      userId,
      name: profile.name || profile.email || "Candidate",
      email: profile.email || "",
      attemptedQuestions,
      totalQuestions,
      completionRate,
      avgCode,
      avgIntegrity,
      finalScore,
      points: Number(profile.points || 0),
    });
  });

  return rows.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    if (b.avgCode !== a.avgCode) return b.avgCode - a.avgCode;
    return b.points - a.points;
  });
}

// ── PLAGIARISM DETECTION UTILITIES ───────────────────────────────────────────
// [Moved to utils/plagiarism.js - exported as checkPlagiarism]

// ── JUDGE0 CODE EXECUTION UTILITIES ──────────────────────────────────────────
// [Moved to utils/codeExecution.js - exported as executeCode, LANGUAGES, SUPPORTED_LANGUAGES]

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── GET SUPPORTED LANGUAGES ──────────────────────────────────────────────────
// GET /api/languages
app.get("/api/languages", (_req, res) => {
  res.json({ languages: LANGUAGES });
});

// ── CODE EXECUTION — Judge0 ─────────────────────────────────────────────────
// POST /api/run
// Body: { language, code, stdin?, challengeData? }
app.post("/api/run", codeLimiter, asyncRoute(async (req, res) => {
  const { language, code, stdin = "", challengeData } = req.body;

  if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({
      error: `Unsupported language. Choose from: ${SUPPORTED_LANGUAGES.join(", ")}`,
    });
  }
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code field is required" });
  }
  if (code.length > 50_000) {
    return res.status(400).json({ error: "Code too large (max 50,000 chars)" });
  }

  const result = await executeCode(language, code, stdin, challengeData);
  return res.json(result);
}));

// ── SIGN UP (email + password) ────────────────────────────────────────────────
// POST /api/auth/signup
// Body: { name, email, password }
app.post("/api/auth/signup", authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) {
    const message = String(error.message || "Authentication failed.");

    if (/email rate limit exceeded/i.test(message)) {
      return res.status(429).json({
        error: "Email send limit reached. Please wait a few minutes, then try again or log in if your account already exists.",
        code: "EMAIL_RATE_LIMIT_EXCEEDED",
      });
    }

    if (/user already registered/i.test(message)) {
      return res.status(409).json({
        error: "This email is already registered. Please log in instead.",
        code: "USER_ALREADY_REGISTERED",
      });
    }

    return res.status(400).json({ error: message });
  }

  // Supabase sends a confirmation email by default.
  // If email confirmation is disabled in your Supabase project,
  // data.user will already be confirmed and data.session will be set.
  if (!data.session) {
    return res.json({
      requiresConfirmation: true,
      message: "Check your email to confirm your account, then log in.",
    });
  }

  return res.json({
    user: userPayload(data.user),
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
});

// ── LOG IN (email + password) ─────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
app.post("/api/auth/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = String(error.message || "Authentication failed.");

    if (/email not confirmed/i.test(message)) {
      return res.status(403).json({
        error: "Email is not verified yet. Please verify your email first, then log in.",
        code: "EMAIL_NOT_CONFIRMED",
      });
    }

    if (/invalid login credentials/i.test(message)) {
      return res.status(401).json({
        error: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      });
    }

    if (/too many requests|rate limit/i.test(message)) {
      return res.status(429).json({
        error: "Too many login attempts. Please wait a few minutes and try again.",
        code: "AUTH_RATE_LIMITED",
      });
    }

    return res.status(400).json({ error: message });
  }

  return res.json({
    user: userPayload(data.user),
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
});

// ── OAUTH — get redirect URL ──────────────────────────────────────────────────
// GET /api/auth/oauth/:provider
// provider: google | github | facebook
// Returns { url } — frontend opens this URL in a popup or redirect
app.get("/api/auth/oauth/:provider", authLimiter, async (req, res) => {
  const { provider } = req.params;
  const allowed = ["google", "github", "facebook"];

  if (!allowed.includes(provider)) {
    return res.status(400).json({ error: `Provider must be one of: ${allowed.join(", ")}` });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${FRONTEND_URL}/auth/callback`,
      queryParams:
        provider === "google"
          ? { access_type: "offline", prompt: "consent" }
          : undefined,
    },
  });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ url: data.url });
});

// ── OAUTH CALLBACK — exchange code for session ────────────────────────────────
// POST /api/auth/callback
// Body: { code }  — the ?code= param Supabase puts in the callback URL
app.post("/api/auth/callback", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "code is required." });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return res.status(400).json({ error: error.message });

  return res.json({
    user: userPayload(data.user),
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
});

// ── GET CURRENT USER (verify token) ──────────────────────────────────────────
// GET /api/auth/me
// Header: Authorization: Bearer <accessToken>
app.get("/api/auth/me", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided." });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: "Invalid or expired token." });

  return res.json({ user: userPayload(data.user) });
});

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// Body: { refreshToken }
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "refreshToken is required." });

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error) return res.status(401).json({ error: error.message });

  return res.json({
    user: userPayload(data.user),
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  });
});

// ── LOG OUT ───────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Header: Authorization: Bearer <accessToken>
app.post("/api/auth/logout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    // Use admin client to sign out specific user token
    await supabaseAdmin.auth.admin.signOut(token);
  }
  return res.json({ message: "Logged out successfully." });
});

// ── PASSWORD RESET ────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Body: { email }
app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${FRONTEND_URL}/auth/reset`,
  });
  if (error) return res.status(400).json({ error: error.message });

  // Always respond success (don't reveal if email exists)
  return res.json({ message: "If that email exists, a reset link has been sent." });
});

// ── Resume Profile persistence ───────────────────────────────────────────────
// GET /api/profile/resume
app.get("/api/profile/resume", requireUser, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("resume_profiles")
    .select("profile, resume_text, resume_file_name, resume_file_data, resume_file_mime, resume_file_size, updated_at")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return res.status(500).json({
        error: "resume_profiles table not found.",
        setupRequired: true,
        hint: "Run supabase/schema.sql in Supabase SQL Editor to create resume_profiles.",
      });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    profile: data?.profile || null,
    resumeText: data?.resume_text || "",
    resumeFileName: data?.resume_file_name || "",
    resumeFileData: data?.resume_file_data || "",
    resumeFileMime: data?.resume_file_mime || "",
    resumeFileSize: Number(data?.resume_file_size || 0),
    updatedAt: data?.updated_at || null,
  });
});

// PUT /api/profile/resume
// Body: { profile: object, resumeText?: string, resumeFileName?: string }
app.put("/api/profile/resume", requireUser, profileLimiter, async (req, res) => {
  const {
    profile,
    resumeText = "",
    resumeFileName = "",
    resumeFileData = "",
    resumeFileMime = "",
    resumeFileSize = 0,
  } = req.body || {};
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return res.status(400).json({ error: "profile object is required." });
  }

  const payload = {
    user_id: req.user.id,
    profile,
    resume_text: String(resumeText || "").slice(0, 200000),
    resume_file_name: String(resumeFileName || "").slice(0, 300),
    // Base64 payload capped to keep row size bounded while supporting common resume sizes.
    resume_file_data: String(resumeFileData || "").slice(0, 8000000),
    resume_file_mime: String(resumeFileMime || "").slice(0, 120),
    resume_file_size: Number.isFinite(Number(resumeFileSize)) ? Math.max(0, Number(resumeFileSize)) : 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("resume_profiles").upsert(payload, { onConflict: "user_id" });

  if (error) {
    if (error.code === "42P01") {
      return res.status(500).json({
        error: "resume_profiles table not found.",
        setupRequired: true,
        hint: "Run supabase/schema.sql in Supabase SQL Editor to create resume_profiles.",
      });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: "Profile saved successfully." });
});

// PUT /api/profile/role
// Body: { role: 'student' | 'recruiter' }
app.put("/api/profile/role", requireUser, asyncRoute(async (req, res) => {
  const role = String(req.body?.role || "student").toLowerCase();
  const allowed = ["student", "recruiter"];
  if (!allowed.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${allowed.join(", ")}` });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", req.user.id)
    .select("id, role")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ role: data?.role || role });
}));

// GET /api/notifications
app.get("/api/notifications", requireUser, asyncRoute(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id, message, seen, created_at, job_id")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) return res.status(500).json({ error: error.message });

  const notifications = (data || []).map((item) => ({
    id: item.id,
    type: "job",
    icon: "💼",
    msg: item.message,
    time: formatTimeAgo(item.created_at),
    read: Boolean(item.seen),
    createdAt: item.created_at,
    jobId: item.job_id,
  }));

  return res.json({ notifications });
}));

// POST /api/notifications/read
// Body: { ids?: string[] }
app.post("/api/notifications/read", requireUser, asyncRoute(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];

  let query = supabaseAdmin
    .from("notifications")
    .update({ seen: true })
    .eq("user_id", req.user.id);

  if (ids.length) query = query.in("id", ids);

  const { error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: "Notifications updated." });
}));

// POST /api/jobs
app.post("/api/jobs", jobPostLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const validation = validateJobPayload(req.body || {});
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const {
    title,
    company,
    description,
    requiredSkills,
    domain,
    minSkillScore,
    notificationThreshold,
  } = validation.value;

  const insertPayload = {
    title: String(title).trim(),
    company: String(company).trim(),
    description: String(description).trim(),
    required_skills: requiredSkills,
    domain: String(domain).trim(),
    min_skill_score: minSkillScore,
    created_by: req.user.id,
    updated_at: new Date().toISOString(),
  };

  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .insert(insertPayload)
    .select("*")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  const notifyResult = await createNotificationsForJob(job, notificationThreshold);
  return res.json({ job, matchedUsers: notifyResult.matchedUsers });
}));

// GET /api/jobs
app.get("/api/jobs", requireUser, asyncRoute(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("id, title, company, description, required_skills, domain, min_skill_score, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ jobs: data || [] });
}));

// GET /api/jobs/:id
app.get("/api/jobs/:id", requireUser, asyncRoute(async (req, res) => {
  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!job) return res.status(404).json({ error: "Job not found." });

  return res.json({ job });
}));

// GET /api/jobs/recommendations/me
app.get("/api/jobs/recommendations/me", requireUser, asyncRoute(async (req, res) => {
  const [jobsRes, profileRes, submissionsRes, resumeRes] = await Promise.all([
    supabaseAdmin
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("profiles")
      .select("id, name, email, points, role")
      .eq("id", req.user.id)
      .maybeSingle(),
    supabaseAdmin
      .from("submissions")
      .select("user_id, challenge_id, code_score, integrity_score, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("resume_profiles")
      .select("user_id, profile")
      .eq("user_id", req.user.id)
      .maybeSingle(),
  ]);

  if (jobsRes.error) return res.status(500).json({ error: jobsRes.error.message });
  if (profileRes.error) return res.status(500).json({ error: profileRes.error.message });
  if (submissionsRes.error) return res.status(500).json({ error: submissionsRes.error.message });
  if (resumeRes.error) return res.status(500).json({ error: resumeRes.error.message });

  const challengeDomainMap = await fetchChallengeDomainMap();

  const candidate = buildCandidateSignals({
    profile: profileRes.data || req.user,
    resumeProfile: resumeRes.data,
    submissions: submissionsRes.data || [],
    challengeDomainMap,
  });

  const recommendations = (jobsRes.data || [])
    .map((job) => {
      const match = calculateJobMatch(job, candidate);
      return {
        job,
        ...match,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return res.json({ recommendations });
}));

// GET /api/recruiter/candidates
// Query: domain, minSkillScore, minReadiness
app.get("/api/recruiter/candidates", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const candidates = await listCandidateSignals();
  const domain = String(req.query.domain || "").trim();
  const minSkillScore = Math.max(0, Math.min(100, Number(req.query.minSkillScore || 0)));
  const minReadiness = Math.max(0, Math.min(100, Number(req.query.minReadiness || 0)));

  const filtered = candidates
    .filter((candidate) => !domain || candidate.topDomains.includes(domain))
    .filter((candidate) => candidate.avgCode >= minSkillScore)
    .filter((candidate) => candidate.readinessScore >= minReadiness)
    .sort((a, b) => {
      if (b.readinessScore !== a.readinessScore) return b.readinessScore - a.readinessScore;
      if (b.avgCode !== a.avgCode) return b.avgCode - a.avgCode;
      return b.points - a.points;
    })
    .slice(0, 100);

  return res.json({ candidates: filtered });
}));

// POST /api/recruiter/tests
// Body: { company, roleTitle, description?, challengeIds: number[] }
app.post("/api/recruiter/tests", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const validation = validateRecruiterTestPayload(req.body || {});
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const { company, roleTitle, description, challengeIds } = validation.value;

  const { data: existingChallenges, error: challengesError } = await supabaseAdmin
    .from("challenges")
    .select("id")
    .in("id", challengeIds);
  if (challengesError) return res.status(500).json({ error: challengesError.message });

  const existingSet = new Set((existingChallenges || []).map((c) => Number(c.id)));
  const missing = challengeIds.filter((id) => !existingSet.has(Number(id)));
  if (missing.length) {
    return res.status(400).json({ error: `Invalid challengeIds: ${missing.join(", ")}` });
  }

  const { data: createdTest, error: testError } = await supabaseAdmin
    .from("company_tests")
    .insert({
      company,
      role_title: roleTitle,
      description,
      created_by: req.user.id,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .maybeSingle();

  if (testError) {
    if (testError.code === "42P01") {
      return res.status(500).json({
        error: "company_tests table not found.",
        setupRequired: true,
        hint: "Run supabase/schema.sql in Supabase SQL Editor to create recruiter test tables.",
      });
    }
    return res.status(500).json({ error: testError.message });
  }

  const questionRows = challengeIds.map((challengeId, index) => ({
    test_id: createdTest.id,
    challenge_id: challengeId,
    question_order: index + 1,
    weight: 1,
  }));

  const { error: questionError } = await supabaseAdmin
    .from("company_test_questions")
    .insert(questionRows);
  if (questionError) return res.status(500).json({ error: questionError.message });

  return res.json({ test: createdTest, questionCount: questionRows.length });
}));

// GET /api/recruiter/tests
app.get("/api/recruiter/tests", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const mineOnly = String(req.query.mine || "1") !== "0";

  let query = supabaseAdmin
    .from("company_tests")
    .select("id, company, role_title, description, is_active, created_by, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (mineOnly) {
    query = query.eq("created_by", req.user.id);
  }

  const { data: tests, error: testsError } = await query;
  if (testsError) {
    if (testsError.code === "42P01") {
      return res.status(500).json({
        error: "company_tests table not found.",
        setupRequired: true,
        hint: "Run supabase/schema.sql in Supabase SQL Editor to create recruiter test tables.",
      });
    }
    return res.status(500).json({ error: testsError.message });
  }

  const testIds = (tests || []).map((t) => t.id);
  if (!testIds.length) {
    return res.json({ tests: [] });
  }

  const { data: testQuestions, error: questionsError } = await supabaseAdmin
    .from("company_test_questions")
    .select("test_id, challenge_id, question_order")
    .in("test_id", testIds)
    .order("question_order", { ascending: true });
  if (questionsError) return res.status(500).json({ error: questionsError.message });

  const { data: challenges, error: challengeError } = await supabaseAdmin
    .from("challenges")
    .select("id, title, difficulty, domain");
  if (challengeError) return res.status(500).json({ error: challengeError.message });

  const challengeById = new Map((challenges || []).map((item) => [Number(item.id), item]));
  const questionsByTest = new Map();

  (testQuestions || []).forEach((row) => {
    const list = questionsByTest.get(row.test_id) || [];
    const challenge = challengeById.get(Number(row.challenge_id));
    if (challenge) {
      list.push({
        challengeId: Number(row.challenge_id),
        title: challenge.title,
        difficulty: challenge.difficulty,
        domain: challenge.domain,
        order: row.question_order,
      });
    }
    questionsByTest.set(row.test_id, list);
  });

  const result = (tests || []).map((test) => ({
    ...test,
    roleTitle: test.role_title,
    questions: questionsByTest.get(test.id) || [],
  }));

  return res.json({ tests: result });
}));

// GET /api/recruiter/tests/:id/leaderboard
app.get("/api/recruiter/tests/:id/leaderboard", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const testId = req.params.id;

  const { data: test, error: testError } = await supabaseAdmin
    .from("company_tests")
    .select("id, company, role_title, description, created_by")
    .eq("id", testId)
    .maybeSingle();

  if (testError) return res.status(500).json({ error: testError.message });
  if (!test) return res.status(404).json({ error: "Test not found." });
  if (test.created_by !== req.user.id) {
    return res.status(403).json({ error: "You can only view leaderboard for your own tests." });
  }

  const { data: testQuestions, error: questionsError } = await supabaseAdmin
    .from("company_test_questions")
    .select("challenge_id")
    .eq("test_id", testId);
  if (questionsError) return res.status(500).json({ error: questionsError.message });

  const challengeIds = (testQuestions || []).map((q) => Number(q.challenge_id));
  if (!challengeIds.length) {
    return res.json({
      test: { ...test, roleTitle: test.role_title },
      leaderboard: [],
    });
  }

  const { data: assignments, error: assignmentError } = await supabaseAdmin
    .from("company_test_assignments")
    .select("user_id")
    .eq("test_id", testId);
  if (assignmentError && assignmentError.code !== "42P01") {
    return res.status(500).json({ error: assignmentError.message });
  }

  const assignedUserIds = new Set((assignments || []).map((a) => a.user_id));
  const hasAssignments = assignedUserIds.size > 0;

  const [submissionsRes, profilesRes] = await Promise.all([
    supabaseAdmin
      .from("submissions")
      .select("user_id, challenge_id, code_score, integrity_score, created_at")
      .in("challenge_id", challengeIds),
    supabaseAdmin
      .from("profiles")
      .select("id, name, email, points")
      .neq("role", "recruiter"),
  ]);

  if (submissionsRes.error) return res.status(500).json({ error: submissionsRes.error.message });
  if (profilesRes.error) return res.status(500).json({ error: profilesRes.error.message });

  const filteredProfiles = hasAssignments
    ? (profilesRes.data || []).filter((p) => assignedUserIds.has(p.id))
    : (profilesRes.data || []);
  const filteredSubmissions = hasAssignments
    ? (submissionsRes.data || []).filter((s) => assignedUserIds.has(s.user_id))
    : (submissionsRes.data || []);

  const leaderboard = aggregateTestLeaderboard({
    profiles: filteredProfiles,
    submissions: filteredSubmissions,
    challengeIds,
  }).slice(0, 100);

  if (String(req.query.format || "").toLowerCase() === "csv") {
    const csv = toCsv(leaderboard);
    const fileName = `${test.company}-${test.role_title}-leaderboard.csv`.replace(/\s+/g, "_");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  }

  return res.json({
    test: {
      ...test,
      roleTitle: test.role_title,
      challengeIds,
    },
    leaderboard,
  });
}));

// PUT /api/recruiter/tests/:id
app.put("/api/recruiter/tests/:id", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const testId = req.params.id;
  const validation = validateRecruiterTestUpdatePayload(req.body || {});
  if (validation.error) return res.status(400).json({ error: validation.error });

  const ownership = await ensureOwnedRecruiterTest(testId, req.user.id);
  if (ownership.notFound) return res.status(404).json({ error: "Test not found." });
  if (ownership.forbidden) return res.status(403).json({ error: "You can only update your own tests." });

  const { company, roleTitle, description, isActive, challengeIds } = validation.value;
  const updatePayload = {
    ...(company ? { company } : {}),
    ...(roleTitle ? { role_title: roleTitle } : {}),
    ...(typeof description === "string" ? { description } : {}),
    ...(typeof isActive === "boolean" ? { is_active: isActive } : {}),
    updated_at: new Date().toISOString(),
  };

  if (challengeIds) {
    const { data: existingChallenges, error: challengesError } = await supabaseAdmin
      .from("challenges")
      .select("id")
      .in("id", challengeIds);
    if (challengesError) return res.status(500).json({ error: challengesError.message });

    const existingSet = new Set((existingChallenges || []).map((c) => Number(c.id)));
    const missing = challengeIds.filter((id) => !existingSet.has(Number(id)));
    if (missing.length) return res.status(400).json({ error: `Invalid challengeIds: ${missing.join(", ")}` });
  }

  const { data: updatedTest, error: updateError } = await supabaseAdmin
    .from("company_tests")
    .update(updatePayload)
    .eq("id", testId)
    .select("*")
    .maybeSingle();
  if (updateError) return res.status(500).json({ error: updateError.message });

  if (challengeIds) {
    const { error: deleteErr } = await supabaseAdmin
      .from("company_test_questions")
      .delete()
      .eq("test_id", testId);
    if (deleteErr) return res.status(500).json({ error: deleteErr.message });

    const rows = challengeIds.map((challengeId, idx) => ({
      test_id: testId,
      challenge_id: challengeId,
      question_order: idx + 1,
      weight: 1,
    }));
    const { error: insertErr } = await supabaseAdmin
      .from("company_test_questions")
      .insert(rows);
    if (insertErr) return res.status(500).json({ error: insertErr.message });
  }

  return res.json({ test: updatedTest, updated: true });
}));

// DELETE /api/recruiter/tests/:id
app.delete("/api/recruiter/tests/:id", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const testId = req.params.id;
  const ownership = await ensureOwnedRecruiterTest(testId, req.user.id);
  if (ownership.notFound) return res.status(404).json({ error: "Test not found." });
  if (ownership.forbidden) return res.status(403).json({ error: "You can only delete your own tests." });

  const { error } = await supabaseAdmin
    .from("company_tests")
    .delete()
    .eq("id", testId);
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: "Test deleted successfully." });
}));

// POST /api/recruiter/tests/:id/assignments
// Body: { userIds: string[] }
app.post("/api/recruiter/tests/:id/assignments", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const testId = req.params.id;
  const userIds = Array.isArray(req.body?.userIds)
    ? [...new Set(req.body.userIds.map((id) => String(id || "").trim()).filter(Boolean))].slice(0, 500)
    : [];

  if (!userIds.length) return res.status(400).json({ error: "userIds is required." });

  const ownership = await ensureOwnedRecruiterTest(testId, req.user.id);
  if (ownership.notFound) return res.status(404).json({ error: "Test not found." });
  if (ownership.forbidden) return res.status(403).json({ error: "You can only assign your own tests." });

  const { data: validProfiles, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .in("id", userIds)
    .neq("role", "recruiter");
  if (profileErr) return res.status(500).json({ error: profileErr.message });

  const validIds = new Set((validProfiles || []).map((p) => p.id));
  const rows = userIds
    .filter((id) => validIds.has(id))
    .map((id) => ({
      test_id: testId,
      user_id: id,
      assigned_by: req.user.id,
      status: "assigned",
      updated_at: new Date().toISOString(),
    }));

  if (!rows.length) return res.status(400).json({ error: "No eligible student candidates found in userIds." });

  const { error: assignmentErr } = await supabaseAdmin
    .from("company_test_assignments")
    .upsert(rows, { onConflict: "test_id,user_id" });
  if (assignmentErr) return res.status(500).json({ error: assignmentErr.message });

  return res.json({ assigned: rows.length });
}));

// GET /api/recruiter/tests/:id/assignments
app.get("/api/recruiter/tests/:id/assignments", recruiterLimiter, requireUser, requireRecruiter, asyncRoute(async (req, res) => {
  const testId = req.params.id;
  const ownership = await ensureOwnedRecruiterTest(testId, req.user.id);
  if (ownership.notFound) return res.status(404).json({ error: "Test not found." });
  if (ownership.forbidden) return res.status(403).json({ error: "You can only view assignments for your own tests." });

  const { data, error } = await supabaseAdmin
    .from("company_test_assignments")
    .select("id, user_id, status, assigned_at, updated_at")
    .eq("test_id", testId)
    .order("assigned_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const userIds = (data || []).map((r) => r.user_id);
  const { data: profiles, error: profileErr } = userIds.length
    ? await supabaseAdmin.from("profiles").select("id, name, email").in("id", userIds)
    : { data: [], error: null };
  if (profileErr) return res.status(500).json({ error: profileErr.message });

  const profileById = new Map((profiles || []).map((p) => [p.id, p]));
  const assignments = (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    assignedAt: row.assigned_at,
    updatedAt: row.updated_at,
    name: profileById.get(row.user_id)?.name || "Candidate",
    email: profileById.get(row.user_id)?.email || "",
  }));

  return res.json({ assignments });
}));

// GET /api/company-tests/me
app.get("/api/company-tests/me", requireUser, asyncRoute(async (req, res) => {
  const { data: assignedRows, error: assignedError } = await supabaseAdmin
    .from("company_test_assignments")
    .select("id, test_id, status, assigned_at")
    .eq("user_id", req.user.id)
    .order("assigned_at", { ascending: false });

  if (assignedError) {
    if (assignedError.code === "42P01") {
      return res.json({ tests: [] });
    }
    return res.status(500).json({ error: assignedError.message });
  }

  const testIds = (assignedRows || []).map((r) => r.test_id);
  if (!testIds.length) return res.json({ tests: [] });

  const [testsRes, questionsRes, challengeRes] = await Promise.all([
    supabaseAdmin
      .from("company_tests")
      .select("id, company, role_title, description, is_active, created_at")
      .in("id", testIds),
    supabaseAdmin
      .from("company_test_questions")
      .select("test_id, challenge_id, question_order")
      .in("test_id", testIds)
      .order("question_order", { ascending: true }),
    supabaseAdmin
      .from("challenges")
      .select("id, title, difficulty, domain"),
  ]);

  if (testsRes.error) return res.status(500).json({ error: testsRes.error.message });
  if (questionsRes.error) return res.status(500).json({ error: questionsRes.error.message });
  if (challengeRes.error) return res.status(500).json({ error: challengeRes.error.message });

  const challengeById = new Map((challengeRes.data || []).map((row) => [Number(row.id), row]));
  const questionsByTest = new Map();
  (questionsRes.data || []).forEach((q) => {
    const list = questionsByTest.get(q.test_id) || [];
    const meta = challengeById.get(Number(q.challenge_id));
    if (meta) list.push({ ...meta, challengeId: Number(q.challenge_id), order: q.question_order });
    questionsByTest.set(q.test_id, list);
  });

  const tests = [];
  for (const assignment of (assignedRows || [])) {
    const test = (testsRes.data || []).find((item) => item.id === assignment.test_id);
    if (!test) continue;
    const questions = questionsByTest.get(test.id) || [];
    const challengeIds = questions.map((q) => Number(q.challengeId));
    const progress = await computeUserTestProgress({ userId: req.user.id, challengeIds });

    tests.push({
      id: test.id,
      company: test.company,
      roleTitle: test.role_title,
      description: test.description,
      isActive: Boolean(test.is_active),
      assignedAt: assignment.assigned_at,
      status: assignment.status,
      questionCount: questions.length,
      progress,
      questions,
    });
  }

  return res.json({ tests });
}));

// GET /api/company-tests/:id/my-progress
app.get("/api/company-tests/:id/my-progress", requireUser, asyncRoute(async (req, res) => {
  const testId = req.params.id;
  const { data: assignment, error: assignError } = await supabaseAdmin
    .from("company_test_assignments")
    .select("id, status")
    .eq("test_id", testId)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (assignError) return res.status(500).json({ error: assignError.message });
  if (!assignment) return res.status(403).json({ error: "You are not assigned to this test." });

  const [testRes, questionsRes, challengeRes] = await Promise.all([
    supabaseAdmin
      .from("company_tests")
      .select("id, company, role_title, description, is_active")
      .eq("id", testId)
      .maybeSingle(),
    supabaseAdmin
      .from("company_test_questions")
      .select("challenge_id, question_order")
      .eq("test_id", testId)
      .order("question_order", { ascending: true }),
    supabaseAdmin
      .from("challenges")
      .select("id, title, difficulty, domain"),
  ]);

  if (testRes.error) return res.status(500).json({ error: testRes.error.message });
  if (!testRes.data) return res.status(404).json({ error: "Test not found." });
  if (questionsRes.error) return res.status(500).json({ error: questionsRes.error.message });
  if (challengeRes.error) return res.status(500).json({ error: challengeRes.error.message });

  const challengeById = new Map((challengeRes.data || []).map((row) => [Number(row.id), row]));
  const questions = (questionsRes.data || []).map((q) => ({
    challengeId: Number(q.challenge_id),
    order: q.question_order,
    ...(challengeById.get(Number(q.challenge_id)) || {}),
  }));

  const challengeIds = questions.map((q) => Number(q.challengeId));
  const progress = await computeUserTestProgress({ userId: req.user.id, challengeIds });

  if (progress.completionRate >= 100 && assignment.status !== "completed") {
    await supabaseAdmin
      .from("company_test_assignments")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", assignment.id);
  } else if (progress.attemptedQuestions > 0 && assignment.status === "assigned") {
    await supabaseAdmin
      .from("company_test_assignments")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", assignment.id);
  }

  return res.json({
    test: {
      id: testRes.data.id,
      company: testRes.data.company,
      roleTitle: testRes.data.role_title,
      description: testRes.data.description,
      isActive: Boolean(testRes.data.is_active),
      status: assignment.status,
      questions,
    },
    progress,
  });
}));

// ── AI ENDPOINTS ─────────────────────────────────────────────────────────────

// POST /api/ai/analyze-code
app.post("/api/ai/analyze-code", requireUser, asyncRoute(async (req, res) => {
  const { code, language, challengeTitle } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  const result = await analyzeCodeWithAI(code, language, challengeTitle || '');
  
  if (result.success) {
    return res.json(result.data);
  } else {
    // Return fallback response if AI fails
    return res.json(result.fallback);
  }
}));

// POST /api/ai/job-suggestions
app.post("/api/ai/job-suggestions", requireUser, asyncRoute(async (req, res) => {
  const { userProfile, submissions } = req.body;
  
  const result = await getJobSuggestionsWithAI(userProfile || {}, submissions || []);
  
  if (result.success) {
    return res.json(result.data);
  } else {
    return res.json(result.fallback);
  }
}));

// POST /api/ai/skill-gaps
app.post("/api/ai/skill-gaps", requireUser, asyncRoute(async (req, res) => {
  const { userProfile, targetRole, submissions } = req.body;
  
  if (!targetRole) {
    return res.status(400).json({ error: "Target role is required." });
  }

  const result = await analyzeSkillGapsWithAI(userProfile || {}, targetRole, submissions || []);
  
  if (result.success) {
    return res.json(result.data);
  } else {
    return res.json(result.fallback);
  }
}));

// POST /api/ai/career-guidance
app.post("/api/ai/career-guidance", requireUser, asyncRoute(async (req, res) => {
  const { userProfile, submissions } = req.body;
  
  const result = await getCareerGuidanceWithAI(userProfile || {}, submissions || []);
  
  if (result.success) {
    return res.json(result.data);
  } else {
    return res.json(result.fallback);
  }
}));

// POST /api/ai/analyze-resume
app.post("/api/ai/analyze-resume", requireUser, asyncRoute(async (req, res) => {
  const { resumeText, targetRole } = req.body;
  
  if (!resumeText) {
    return res.status(400).json({ error: "resumeText is required" });
  }
  
  const result = await analyzeResumeWithAI(resumeText, targetRole);
  return res.json(result);
}));

// ── PROCTORING ENDPOINTS ─────────────────────────────────────────────────────

// POST /api/proctoring
// Body: { type: "NO_FACE" | "MULTIPLE_FACES" | "ABANDONED" | "TAB_SWITCH" | "COPY_PASTE" | "LARGE_PASTE_DETECTED" | "EXCESSIVE_COPY_PASTE" | "PLAGIARISM_DETECTED" | "EXCESSIVE_TAB_SWITCHING", details: object, timestamp: string }
app.post("/api/proctoring", requireUser, asyncRoute(async (req, res) => {
  const { type, details, timestamp } = req.body;
  
  if (!type || !timestamp) {
    return res.status(400).json({ error: "type and timestamp are required" });
  }
  
  // Log proctoring violation to database
  try {
    const { error } = await supabaseAdmin
      .from("proctoring_logs")
      .insert({
        user_id: req.user.id,
        violation_type: type,
        violation_details: details || {},
        timestamp: timestamp,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.warn("Failed to log proctoring violation:", error);
    }
  } catch (e) {
    console.warn("Proctoring logging error:", e);
  }
  
  return res.json({ success: true, logged: true, violationType: type });
}));

// GET /api/proctoring/logs/:userId
app.get("/api/proctoring/logs/:userId", requireUser, asyncRoute(async (req, res) => {
  const { userId } = req.params;
  
  // Users can only view their own logs unless they're recruiters
  if (req.user.id !== userId && req.user.role !== 'recruiter') {
    return res.status(403).json({ error: "Access denied" });
  }
  
  const { data, error } = await supabaseAdmin
    .from("proctoring_logs")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(100);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  return res.json(data);
}));

app.use((error, _req, res, _next) => {
  const statusCode = error?.statusCode || 500;
  const message = statusCode >= 500 ? "Internal server error." : error.message;
  if (statusCode >= 500) {
    console.error("Unhandled error:", error);
  }
  return res.status(statusCode).json({ error: message });
});

// ── Start server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🧠 SkillLens Unified Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  console.log("   Auth endpoints:");
  console.log("   POST /api/auth/signup");
  console.log("   POST /api/auth/login");
  console.log("   GET  /api/auth/oauth/:provider  (google|github|facebook)");
  console.log("   POST /api/auth/callback");
  console.log("   GET  /api/auth/me");
  console.log("   POST /api/auth/refresh");
  console.log("   POST /api/auth/logout");
  console.log("   POST /api/auth/reset-password\n");
  console.log("   Resume profile endpoints:");
  console.log("   GET  /api/profile/resume");
  console.log("   PUT  /api/profile/resume\n");
  console.log("   PUT  /api/profile/role\n");
  console.log("   Notification endpoints:");
  console.log("   GET  /api/notifications");
  console.log("   POST /api/notifications/read\n");
  console.log("   Job endpoints:");
  console.log("   POST /api/jobs");
  console.log("   GET  /api/jobs");
  console.log("   GET  /api/jobs/:id");
  console.log("   GET  /api/jobs/recommendations/me");
  console.log("   GET  /api/recruiter/candidates\n");
  console.log("   Recruiter test endpoints:");
  console.log("   POST /api/recruiter/tests");
  console.log("   GET  /api/recruiter/tests");
  console.log("   GET  /api/recruiter/tests/:id/leaderboard\n");
  console.log("   PUT  /api/recruiter/tests/:id");
  console.log("   DELETE /api/recruiter/tests/:id");
  console.log("   POST /api/recruiter/tests/:id/assignments");
  console.log("   GET  /api/recruiter/tests/:id/assignments\n");
  console.log("   Student company tests endpoints:");
  console.log("   GET  /api/company-tests/me");
  console.log("   GET  /api/company-tests/:id/my-progress\n");
  console.log("   Code execution endpoints:");
  console.log("   GET  /api/languages");
  console.log("   POST /api/run\n");
});
