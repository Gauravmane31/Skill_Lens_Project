
import React, { useState } from "react";
import { C } from "../data/constants.js";
import { Avatar } from "./shared/Atoms.jsx";

// ── TopNav ────────────────────────────────────────────────────────────────────
function TopNav({ page, setPage, user, onLogout, notifications, markNotifsRead }) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "challenges", label: "Challenges", icon: "⌨️" },
    { id: "companyTests", label: "My Tests", icon: "🧪" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "jobs", label: "Job Board", icon: "💼" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "guidance", label: "Guidance", icon: "🧠" },
    { id: "results", label: "Analytics", icon: "📊" },
    { id: "certificate", label: "Certs", icon: "📜" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];
  if (["recruiter", "admin"].includes(String(user?.role || "").toLowerCase())) {
    navItems.splice(5, 0, { id: "recruiter", label: "Recruiter", icon: "🧑‍💼" });
  }
  const go = id => { setPage(id); setOpen(false); setNotifOpen(false); };
  return (
    <>
      <nav style={{ background: C.dark, borderBottom: "1px solid rgba(255,255,255,.08)", height: 62, flexShrink: 0, zIndex: 50, position: "relative" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: "100%", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 12, flexShrink: 0, cursor: "pointer" }} onClick={() => go("dashboard")}>
            <img src="Main-Dark-logo.png" alt="logo" style={{ width: 90, height: 50, objectFit: "contain" }} />
          </div>
          <div className="sl-nav-links">
            {navItems.map(n => (
              <button key={n.id} onClick={() => go(n.id)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: page === n.id ? "rgba(99,102,241,.3)" : "transparent", color: page === n.id ? "#c7d2fe" : "#94a3b8", transition: "all .15s", whiteSpace: "nowrap" }}>{n.label}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {/* Notif bell */}
          <div style={{ position: "relative", marginRight: 6 }}>
            <button onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markNotifsRead(); }} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(255,255,255,.12)", background: notifOpen ? "rgba(99,102,241,.25)" : "rgba(255,255,255,.06)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              🔔
              {unread > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 14, height: 14, background: C.red, borderRadius: "50%", fontSize: 8, color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", top: 44, right: 0, width: 300, background: "#1e293b", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.1)", zIndex: 999, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#e2e8f0" }}>Notifications</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{unread} unread</span>
                </div>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start", background: n.read ? "transparent" : "rgba(99,102,241,.1)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                      <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: "#cbd5e1", margin: "0 0 2px", lineHeight: 1.5 }}>{n.msg}</p>
                        <span style={{ fontSize: 10, color: "#64748b" }}>{n.time}</span>
                      </div>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8", flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, flexShrink: 0, cursor: "pointer", transition: "background .15s" }} onClick={() => go("profile")}>
            <Avatar initials={user?.avatar || "U"} size={28} />
            <div className="sl-user-name" style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", color: "#e2e8f0" }}>{user?.name?.split(" ")[0]}</div>
              <div style={{ fontSize: 10, color: "#a5b4fc", fontWeight: 600 }}>{(user?.points || 0).toLocaleString()} pts</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ marginLeft: 6, padding: "5px 11px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#64748b", flexShrink: 0, transition: "all .15s" }} className="sl-nav-links">Sign Out</button>
          <button className="sl-hamburger" onClick={() => setOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", cursor: "pointer", fontSize: 16, marginLeft: 4, flexShrink: 0, color: "#e2e8f0" }}>{open ? "✕" : "☰"}</button>
        </div>
      </nav>
      <div className={`sl-mob-menu${open ? " open" : ""}`} style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        {navItems.map(n => <button key={n.id} onClick={() => go(n.id)} style={{ padding: "11px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left", background: page === n.id ? "rgba(99,102,241,.3)" : "transparent", color: page === n.id ? "#c7d2fe" : "#cbd5e1" }}>{n.icon} {n.label}</button>)}
        <button onClick={() => { setOpen(false); onLogout(); }} style={{ padding: "11px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left", background: "transparent", color: "#f87171" }}>🚪 Sign Out</button>
      </div>
    </>
  );
}


export default TopNav;
