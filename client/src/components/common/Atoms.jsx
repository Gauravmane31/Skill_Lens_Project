
import React from "react";
import { C } from "../../constants/constants.js";
import { scoreColor } from "../../utils/scoring.js";
import useBreakpoint from "../../hooks/useBreakpoint.js";

// ── Shared Atoms ──────────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 34, bg = C.indigo }) => {
  const isUrl = typeof initials === 'string' && initials.startsWith('http');
  if (isUrl) {
    return <img src={initials} alt="avatar" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${bg}` }} />;
  }
  return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.33, color: "#fff", flexShrink: 0 }}>{initials}</div>;
};
const Badge = ({ label, color = C.indigo, bg }) => (
  <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 99, fontWeight: 700, fontSize: 11, background: bg || color + "18", color, whiteSpace: "nowrap" }}>{label}</span>
);
const ProgressBar = ({ value, color = C.indigo, height = 6 }) => (
  <div style={{ background: C.border, borderRadius: 99, height, overflow: "hidden", minWidth: 0 }}>
    <div style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s ease" }} />
  </div>
);
const CircleScore = ({ value, size = 80, label, color }) => {
  const r = (size - 10) / 2, circ = 2 * Math.PI * r, c = color || scoreColor(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c + "22"} strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={7}
          strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .7s ease" }} />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={C.text} fontSize={Math.round(size * .17)} fontWeight={800}>{value}</text>
      </svg>
      {label && <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</span>}
    </div>
  );
};
const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{ background: C.white, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, ...style }}>{children}</div>
);
const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
    <div>
      <h2 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 2px", color: C.text }}>{title}</h2>
      {sub && <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
    {action}
  </div>
);
const inputSt = { width: "100%", padding: "11px 13px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: C.bg, fontFamily: "inherit", marginBottom: 10, color: C.text };
const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "6px 14px", borderRadius: 99, border: `1.5px solid ${active ? C.indigo : C.border}`, background: active ? C.indigo : C.white, color: active ? "#fff" : C.textMid, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s" }}>{label}</button>
);
const LensCorners = ({ size = 34, color = "rgba(255,255,255,.35)", thickness = 1.5, style = {} }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
    <span style={{ position: "absolute", top: 0, left: 0, width: size * 0.4, height: size * 0.4, borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
    <span style={{ position: "absolute", top: 0, right: 0, width: size * 0.4, height: size * 0.4, borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
    <span style={{ position: "absolute", bottom: 0, left: 0, width: size * 0.4, height: size * 0.4, borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}` }} />
    <span style={{ position: "absolute", bottom: 0, right: 0, width: size * 0.4, height: size * 0.4, borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}` }} />
  </div>
);
const PageHero = ({ tag, title, sub, extras }) => {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ background: C.dark, padding: isMobile ? "24px 18px 22px" : "50px 28px 50px 26px", position: "relative", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {tag && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ width: 6, height: 6, background: C.teal, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} /><span style={{ fontSize: 12, fontWeight: 500, color: "#8A8E99", fontFamily: C.fontMono, letterSpacing: 0 }}>{tag}</span></div>}
          <h1 className="sl-fadeup" style={{ fontWeight: 700, fontSize: isMobile ? 21 : 30, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{title}</h1>
          <p className="sl-fadeup-2" style={{ color: "#A6A9B4", fontSize: 13.5, margin: extras ? "0 0 16px" : 0, maxWidth: 560 }}>{sub}</p>
          {extras}
        </div>
        {!isMobile && <LensCorners size={40} style={{ marginTop: 4 }} />}
      </div>
    </div>
  );
};


export { Avatar, Badge, ProgressBar, CircleScore, Card, SectionHeader, inputSt, Pill, PageHero, LensCorners };
