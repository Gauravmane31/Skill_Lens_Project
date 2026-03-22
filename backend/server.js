import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

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
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting — auth routes only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests. Please wait 15 minutes." },
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

  if (error) return res.status(400).json({ error: error.message });

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
    // Supabase returns "Invalid login credentials" for wrong email/password
    return res.status(401).json({ error: "Invalid email or password." });
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

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🧠 SkillLens Backend running on http://localhost:${PORT}`);
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
});
