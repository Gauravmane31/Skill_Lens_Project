
import React, { useState } from "react";
import { C } from "../../constants/constants.js";
import { Avatar } from "../common/Atoms.jsx";

// ── TopNav ────────────────────────────────────────────────────────────────────
function TopNav({ page, setPage, user, onLogout, notifications, markNotifsRead }) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const isRecruiter = ["recruiter", "admin"].includes(String(user?.role || "").toLowerCase());

  const navItems = isRecruiter
    ? [
        { id: "recruiter", label: "Recruiter Console", icon: "🏢" },
        { id: "leaderboard", label: "Platform Leaderboard", icon: "🏆" },
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: "🏠" },
        { id: "challenges", label: "Challenges", icon: "⌨️" },
        { id: "companyTests", label: "Company Tests", icon: "🧪" },
        { id: "progress", label: "Progress", icon: "📈" },
        { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
        { id: "jobs", label: "Job Board", icon: "💼" },
        { id: "guidance", label: "Guidance", icon: "🧠" },
        { id: "certificate", label: "Certs", icon: "📜" },
      ];
  const go = id => { setPage(id); setOpen(false); setNotifOpen(false); };
  return (
    <>
      <nav style={{ background: C.dark, borderBottom: "1px solid rgba(255,255,255,.08)", height: 80, flexShrink: 0, zIndex: 50, position: "relative" }}>
        <div style={{ maxWidth: 1350, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: "100%", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginRight: 12, flexShrink: 0, cursor: "pointer" }} onClick={() => go("dashboard")}>
            <img src="Main-Dark-logo.png" alt="logo" style={{ width: 120, height: 50, objectFit: "contain" }} />
          </div>
          <div className="sl-nav-links">
            {navItems.map(n => (
              <button key={n.id} onClick={() => go(n.id)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, background: page === n.id ? "rgba(58,47,201,.28)" : "transparent", color: page === n.id ? "#C9C2F5" : "#8A8E99", transition: "all .15s", whiteSpace: "nowrap" }}>{n.label}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {/* Notif bell */}
          <div style={{ position: "relative", marginRight: 6 }}>
            <button onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markNotifsRead(); }} style={{ width: 40, height: 40, borderRadius: 9, border: "1px solid rgba(255,255,255,.12)", background: notifOpen ? "rgba(58,47,201,.22)" : "rgba(255,255,255,.06)", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              🔔
              {unread > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 14, height: 14, background: C.red, borderRadius: "50%", fontSize: 8, color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", top: 44, right: 0, width: 300, background: "#12141C", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.1)", zIndex: 999, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#E4E4E1" }}>Notifications</span>
                  <span style={{ fontSize: 11, color: "#6B6F7B" }}>{unread} unread</span>
                </div>
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {notifications.length === 0 && (
                    <div style={{ padding: "18px 16px", fontSize: 12, color: "#6B6F7B", textAlign: "center" }}>No notifications yet.</div>
                  )}
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start", background: n.read ? "transparent" : "rgba(58,47,201,.08)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                      <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: "#D2D2CE", margin: "0 0 2px", lineHeight: 1.5 }}>{n.msg}</p>
                        <span style={{ fontSize: 10, color: "#6B6F7B" }}>{n.time}</span>
                      </div>
                      {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7A70E0", flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  ))}
                </div>
                <button onClick={() => go("notifications")} style={{ width: "100%", padding: "11px", background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,.08)", color: "#A79CEE", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  View all notifications →
                </button>
              </div>
            )}
          </div>
          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, flexShrink: 0, cursor: isRecruiter ? "default" : "pointer", transition: "background .15s" }} onClick={() => { if (!isRecruiter) go("resume"); }}>
            <Avatar initials={user?.avatar || "U"} size={28} />
            <div className="sl-user-name" style={{ lineHeight: 1.2 }}>
              <div style={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", color: "#E4E4E1" }}>{user?.name?.split(" ")[0]}</div>
              <div style={{ fontSize: 10, color: "#A79CEE", fontWeight: 600 }}>{isRecruiter ? "Recruiter" : `${(user?.points || 0).toLocaleString()} pts`}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ marginLeft: 6, padding: "11px 11px", borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#6B6F7B", flexShrink: 0, transition: "all .15s" }} className="sl-nav-links">Sign Out</button>
          <button className="sl-hamburger" onClick={() => setOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", cursor: "pointer", fontSize: 16, marginLeft: 4, flexShrink: 0, color: "#E4E4E1" }}>{open ? "✕" : "☰"}</button>
        </div>
      </nav>
      <div className={`sl-mob-menu${open ? " open" : ""}`} style={{ background: "#12141C", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        {navItems.map(n => <button key={n.id} onClick={() => go(n.id)} style={{ padding: "11px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left", background: page === n.id ? "rgba(58,47,201,.28)" : "transparent", color: page === n.id ? "#C9C2F5" : "#D2D2CE" }}>{n.icon} {n.label}</button>)}
        <button onClick={() => { setOpen(false); onLogout(); }} style={{ padding: "11px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left", background: "transparent", color: "#E2726B" }}>🚪 Sign Out</button>
      </div>
    </>
  );
}


export default TopNav;
