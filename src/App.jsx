
import React, { useState, useEffect, lazy, Suspense } from "react";
import toast, { Toaster } from "react-hot-toast";
import GlobalStyle from "./components/shared/GlobalStyle.jsx";
import { NOTIFS_INIT } from "./data/constants/constants.js";
import { supabase } from "./utils/supabase.js";
import { syncUserProfile, fetchNotifications, markNotificationsRead as markNotificationsReadApi } from "./utils/api.js";

import PublicNav from "./components/PublicNav.jsx";
import LandingPage from "./components/LandingPage.jsx";
import AuthGate from "./auth/AuthGate.jsx";
import TopNav from "./components/TopNav.jsx";

const DashboardPage = lazy(() => import("./components/DashboardPage.jsx"));
const ChallengesPage = lazy(() => import("./components/ChallengesPage.jsx"));
const SessionPage = lazy(() => import("./components/SessionPage.jsx"));
const ResultsPage = lazy(() => import("./components/ResultsPage.jsx"));
const ProgressPage = lazy(() => import("./components/ProgressPage.jsx"));
const CertificatePage = lazy(() => import("./components/CertificatePage.jsx"));
const LeaderboardPage = lazy(() => import("./components/LeaderboardPage.jsx"));
const JobBoardPage = lazy(() => import("./components/JobBoardPage.jsx"));
const ResumePage = lazy(() => import("./components/ResumePage.jsx"));
const CareerGuidancePage = lazy(() => import("./components/CareerGuidancePage.jsx"));
const RecruiterDashboardPage = lazy(() => import("./components/RecruiterDashboardPage.jsx"));
const NotificationsPage = lazy(() => import("./components/NotificationsPage.jsx"));

const pageFallback = (
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#475569", fontWeight: 600 }}>
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
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [notifications, setNotifications] = useState(NOTIFS_INIT);

  const handleLogin=u=>{setUser(u);setScreen("app");setPage("dashboard");};
  const handleLogoutLocal=()=>{setUser(null);setScreen("landing");setPage("dashboard");setResults([]);setSelectedChallenge(null);};
  const handleLogout=async ()=> { await supabase.auth.signOut(); handleLogoutLocal(); };
  const handleSubmit=result=>{setResults(r=>[...r,result]);setPage("results");};
  const markNotifsRead=()=>setNotifications(n=>n.map(x=>({...x,read:true})));

  const refreshNotifications = async () => {
    try {
      const notifs = await fetchNotifications();
      if (notifs && notifs.length) setNotifications(notifs);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSupabaseUser(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
        sUser.user_metadata?.avatar_url || fallbackAvatar
      );
    } catch (e) {
      console.error("Failed to sync user profile:", e);
    }

    setUser(prev => ({
      id: sUser.id,
      name: name,
      email: sUser.email,
      avatar: sUser.user_metadata?.avatar_url || fallbackAvatar,
      points: syncedProfile?.points ?? prev?.points ?? 0,
      streak: syncedProfile?.streak ?? prev?.streak ?? 0,
      role: syncedProfile?.role || prev?.role || "student",
      provider: sUser.app_metadata.provider || "email"
    }));
    await refreshNotifications();
    setScreen("app");
  };

  const renderPage=()=>{
    switch(page){
      case "dashboard":   return <DashboardPage results={results} user={user} setPage={setPage} setSelectedChallenge={setSelectedChallenge}/>;
      case "challenges":  return <ChallengesPage setPage={setPage} setSelectedChallenge={setSelectedChallenge} results={results}/>;
      case "session":     return <SessionPage challenge={selectedChallenge} onSubmit={handleSubmit} setPage={setPage}/>;
      case "results":     return <ResultsPage results={results} setPage={setPage}/>;
      case "progress":    return <ProgressPage user={user} results={results} setPage={setPage}/>;
      case "certificate": return <CertificatePage results={results} user={user}/>;
      case "leaderboard": return <LeaderboardPage user={user} results={results}/>;
      case "jobs":        return <JobBoardPage results={results}/>;
      case "guidance":    return <CareerGuidancePage user={user}/>;
      case "profile":     return <ResumePage user={user} results={results}/>;
      case "recruiter":   return <RecruiterDashboardPage user={user} setPage={setPage}/>;
      case "notifications": return <NotificationsPage notifications={notifications} markNotifsRead={markNotifsRead}/>;
      default:            return <DashboardPage results={results} user={user} setPage={setPage} setSelectedChallenge={setSelectedChallenge}/>;
    }
  };

  const renderScreen = () => {
    if (screen === "landing") {
      return (
        <>
          <PublicNav onLogin={() => { setAuthMode("login"); setScreen("auth"); }} onSignup={() => { setAuthMode("signup"); setScreen("auth"); }} />
          <LandingPage onGetStarted={() => { setAuthMode("signup"); setScreen("auth"); }} onLogin={() => { setAuthMode("login"); setScreen("auth"); }} />
        </>
      );
    }

    if (screen === "auth") {
      return (
        <>
          <PublicNav onLogin={() => setAuthMode("login")} onSignup={() => setAuthMode("signup")} onLogoClick={() => setScreen("landing")} />
          <AuthGate onLogin={handleLogin} onBack={() => setScreen("landing")} mode={authMode} />
        </>
      );
    }

    if (screen === "app") {
      return (
        <>
          <TopNav page={page} setPage={setPage} user={user} onLogout={handleLogout} notifications={notifications} markNotifsRead={markNotifsRead} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <Suspense fallback={pageFallback}>
              {renderPage()}
            </Suspense>
          </div>
        </>
      );
    }

    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#f8fafc", color: "#334155" }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Unexpected app state</div>
        <button
          onClick={() => setScreen("landing")}
          style={{ padding: "10px 14px", border: "none", borderRadius: 8, background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}
        >
          Go to home
        </button>
      </div>
    );
  };

  return (
    <>
      <GlobalStyle />
      <Toaster position="top-right" toastOptions={{ style: { background: "#13161f", color: "#e2e8f0" } }} />
      <div style={{ height: "100dvh", display: "flex", flexDirection: "column", fontFamily: "'DM Sans',system-ui,sans-serif", overflow: "hidden" }}>
        {renderScreen()}
      </div>
    </>
  );
}

