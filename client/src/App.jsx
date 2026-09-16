import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import toast, { Toaster } from "react-hot-toast";
import GlobalStyle from "./components/common/GlobalStyle.jsx";
import { NOTIFS_INIT } from "./constants/constants.js";
import { supabase } from "./services/supabase.js";
import {
  syncUserProfile,
  fetchNotifications,
  markNotificationsRead as markNotificationsReadApi,
  loadUserResultHistory,
} from "./services/api.js";

import PublicNav from "./components/layout/PublicNav.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import AuthGate from "./auth/AuthGate.jsx";
import ResetPasswordScreen from "./auth/ResetPasswordScreen.jsx";
import TopNav from "./components/layout/TopNav.jsx";

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage.jsx"));
const SessionPage = lazy(() => import("./pages/SessionPage.jsx"));
const ResultsPage = lazy(() => import("./pages/ResultsPage.jsx"));
const ProgressPage = lazy(() => import("./pages/ProgressPage.jsx"));
const CertificatePage = lazy(() => import("./pages/CertificatePage.jsx"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage.jsx"));
const JobBoardPage = lazy(() => import("./pages/JobBoardPage.jsx"));
const ResumePage = lazy(() => import("./pages/ResumePage.jsx"));
const CareerGuidancePage = lazy(
  () => import("./pages/CareerGuidancePage.jsx"),
);
const RecruiterDashboardPage = lazy(
  () => import("./pages/RecruiterDashboardPage.jsx"),
);
const NotificationsPage = lazy(
  () => import("./pages/NotificationsPage.jsx"),
);
const CompanyTestsPage = lazy(
  () => import("./pages/CompanyTestsPage.jsx"),
);

const pageFallback = (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#F6F6F4",
      color: "#4A4E5A",
      fontWeight: 600,
    }}
  >
    Loading page...
  </div>
);

// ── Root App ──────────────────────────────────────────────────────────────────
export default function SkillLens() {
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [results, setResults] = useState([]);
  const historyLoadedForRef = useRef(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFS_INIT);

  const handleLogin = (u) => {
    setUser(u);
    setScreen("app");
    // Don't hardcode page here — the Supabase auth listener also fires on this
    // same login (setSession → SIGNED_IN) and calls handleSupabaseUser, which
    // knows the real role and redirects recruiters correctly. Setting it here
    // too would race and could briefly show/lock in the wrong page for recruiters.
  };
  const handleLogoutLocal = () => {
    setUser(null);
    setScreen("landing");
    setPage("dashboard");
    setResults([]);
    historyLoadedForRef.current = null;
    setSelectedChallenge(null);
    setNotifications(NOTIFS_INIT);
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleLogoutLocal();
  };
  const handleSubmit = (result) => {
    setResults((r) => [...r, result]);
    setPage("results");
  };
  const markNotifsRead = () =>
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const refreshNotifications = async () => {
    try {
      const notifs = await fetchNotifications();
      setNotifications(Array.isArray(notifs) ? notifs : NOTIFS_INIT);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSupabaseUser(session.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setScreen("resetPassword");
        return;
      }
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        handleSupabaseUser(session.user);
      }
      if (event === "SIGNED_OUT") handleLogoutLocal();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSupabaseUser = async (sUser) => {
    let name = sUser.user_metadata?.full_name || sUser.email;
    let fallbackAvatar = name ? name[0].toUpperCase() : "U";
    let syncedProfile = null;

    // Sync profile data in Supabase public schema.
    try {
      syncedProfile = await syncUserProfile(
        sUser.id,
        sUser.email,
        sUser.user_metadata?.full_name || sUser.email,
        sUser.user_metadata?.avatar_url || fallbackAvatar,
      );
    } catch (e) {
      console.error("Failed to sync user profile:", e);
    }

    const resolvedRole = syncedProfile?.role || user?.role || "student";
    setUser((prev) => ({
      id: sUser.id,
      name: name,
      email: sUser.email,
      avatar: sUser.user_metadata?.avatar_url || fallbackAvatar,
      points: syncedProfile?.points ?? prev?.points ?? 0,
      streak: syncedProfile?.streak ?? prev?.streak ?? 0,
      role: resolvedRole,
      provider: sUser.app_metadata.provider || "email",
    }));

    if (["recruiter", "admin"].includes(String(resolvedRole).toLowerCase())) {
      setPage("recruiter");
    }

    // Load full submission history (once per user id) so past results/certificates
    // survive refresh & re-login instead of only existing for the current session.
    // Recruiters don't submit challenges, so there's nothing to load for them.
    if (historyLoadedForRef.current !== sUser.id && !["recruiter", "admin"].includes(String(resolvedRole).toLowerCase())) {
      historyLoadedForRef.current = sUser.id;
      try {
        const history = await loadUserResultHistory(sUser.id);
        setResults(history);
      } catch (e) {
        console.error("Failed to load submission history:", e);
      }
    }

    await refreshNotifications();
    setScreen("app");
  };

  const renderPage = () => {
    const isRecruiterUser = ["recruiter", "admin"].includes(String(user?.role || "").toLowerCase());
    const studentOnlyPages = new Set(["dashboard", "challenges", "companyTests", "progress", "jobs", "guidance", "certificate", "resume", "results", "session"]);
    if (isRecruiterUser && studentOnlyPages.has(page)) {
      return <RecruiterDashboardPage user={user} setPage={setPage} />;
    }
    if (!isRecruiterUser && page === "recruiter") {
      return (
        <DashboardPage
          results={results}
          user={user}
          setPage={setPage}
          setSelectedChallenge={setSelectedChallenge}
        />
      );
    }
    switch (page) {
      case "dashboard":
        return (
          <DashboardPage
            results={results}
            user={user}
            setPage={setPage}
            setSelectedChallenge={setSelectedChallenge}
          />
        );
      case "challenges":
        return (
          <ChallengesPage
            setPage={setPage}
            setSelectedChallenge={setSelectedChallenge}
            results={results}
          />
        );
      case "session":
        return (
          <SessionPage
            challenge={selectedChallenge}
            onSubmit={handleSubmit}
            setPage={setPage}
          />
        );
      case "results":
        return <ResultsPage results={results} setPage={setPage} />;
      case "progress":
        return <ProgressPage user={user} results={results} setPage={setPage} />;
      case "certificate":
        return <CertificatePage results={results} user={user} />;
      case "leaderboard":
        return <LeaderboardPage user={user} results={results} />;
      case "jobs":
        return <JobBoardPage results={results} setPage={setPage} />;
      case "guidance":
        return <CareerGuidancePage user={user} />;
      case "resume":
        return <ResumePage user={user} results={results} />;
      case "companyTests":
        return <CompanyTestsPage setPage={setPage} setSelectedChallenge={setSelectedChallenge} />;
      case "recruiter":
        return <RecruiterDashboardPage user={user} setPage={setPage} />;
      case "notifications":
        return (
          <NotificationsPage
            notifications={notifications}
            markNotifsRead={markNotifsRead}
          />
        );
      default:
        return (
          <DashboardPage
            results={results}
            user={user}
            setPage={setPage}
            setSelectedChallenge={setSelectedChallenge}
          />
        );
    }
  };

  const renderScreen = () => {
    if (screen === "landing") {
      return (
        <>
          <PublicNav
            onLogin={() => {
              setAuthMode("login");
              setScreen("auth");
            }}
            onSignup={() => {
              setAuthMode("signup");
              setScreen("auth");
            }}
          />
          <LandingPage
            onGetStarted={() => {
              setAuthMode("signup");
              setScreen("auth");
            }}
            onLogin={() => {
              setAuthMode("login");
              setScreen("auth");
            }}
          />
        </>
      );
    }

    if (screen === "auth") {
      return (
        <>
          <PublicNav
            onLogin={() => setAuthMode("login")}
            onSignup={() => setAuthMode("signup")}
            onLogoClick={() => setScreen("landing")}
          />
          <AuthGate
            onLogin={handleLogin}
            onBack={() => setScreen("landing")}
            mode={authMode}
          />
        </>
      );
    }

    if (screen === "resetPassword") {
      return (
        <ResetPasswordScreen
          onDone={() => {
            // The recovery session is already a valid logged-in session at this
            // point — hand off to the normal post-login flow instead of forcing
            // the user to log in again with the password they just set.
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) handleSupabaseUser(session.user);
              else setScreen("auth");
            });
          }}
        />
      );
    }

    if (screen === "app") {
      return (
        <>
          <TopNav
            page={page}
            setPage={setPage}
            user={user}
            onLogout={handleLogout}
            notifications={notifications}
            markNotifsRead={markNotifsRead}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <Suspense fallback={pageFallback}>{renderPage()}</Suspense>
          </div>
        </>
      );
    }

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          background: "#F6F6F4",
          color: "#3A3D46",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 18 }}>
          Unexpected app state
        </div>
        <button
          onClick={() => setScreen("landing")}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: 8,
            background: "#3A2FC9",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Go to home
        </button>
      </div>
    );
  };

  return (
    <>
      <GlobalStyle />
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#14161F", color: "#E4E4E1" } }}
      />
      <div
        style={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Space Grotesk',system-ui,sans-serif",
          overflow: "hidden",
        }}
      >
        {renderScreen()}
      </div>
    </>
  );
}
