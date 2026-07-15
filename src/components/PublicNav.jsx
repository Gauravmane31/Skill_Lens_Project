import React, { useState } from "react";
import { C } from "../data/constants/constants.js";

// ── Public Nav ────────────────────────────────────────────────────────────────
function PublicNav({ onLogin, onSignup, onLogoClick }) {
  const [open, setOpen] = useState(false);
  const navItems = [
    { label: "Features", id: "features" },
    { label: "Challenges", id: "challenges" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Job Board", id: "job-board" },
  ];

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  return (
    <>
      <nav
        style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          height: 60,
          flexShrink: 0,
          zIndex: 100,
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginRight: 14,
              flexShrink: 0,
              cursor: onLogoClick ? "pointer" : "default",
            }}
            onClick={onLogoClick}
          >
            <img
              src="MainLogo-removebg-preview.png"
              alt="logo"
              style={{ width: 90, height: 50, objectFit: "contain" }}
            />
          </div>
          <div className="sl-nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  padding: "6px 13px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "transparent",
                  color: C.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div className="sl-nav-links" style={{ flex: "none", gap: 8 }}>
            <button
              onClick={onLogin}
              style={{
                padding: "6px 13px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: "transparent",
                color: C.muted,
              }}
            >
              Log In
            </button>
            <button
              onClick={onSignup}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: C.text,
                color: "#fff",
              }}
            >
              Get Started →
            </button>
          </div>
          <button
            className="sl-hamburger"
            onClick={() => setOpen((o) => !o)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.white,
              cursor: "pointer",
              fontSize: 16,
              marginLeft: 6,
              flexShrink: 0,
            }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>
      <div className={`sl-mob-menu${open ? " open" : ""}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            style={{
              padding: "11px 14px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "left",
              background: "transparent",
              color: C.text,
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => {
            setOpen(false);
            onLogin();
          }}
          style={{
            padding: "11px 14px",
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            textAlign: "left",
            background: "transparent",
            color: C.muted,
          }}
        >
          Log In
        </button>
        <button
          onClick={() => {
            setOpen(false);
            onSignup();
          }}
          style={{
            padding: "11px 14px",
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            textAlign: "left",
            background: C.indigo,
            color: "#fff",
            margin: "4px 0",
          }}
        >
          Get Started →
        </button>
      </div>
    </>
  );
}

export default PublicNav;
