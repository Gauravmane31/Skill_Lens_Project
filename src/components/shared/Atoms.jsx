
import React from "react";
import { C } from "../../data/constants/constants.js";
import { scoreColor } from "../../data/scoring.js";
import useBreakpoint from "./useBreakpoint.js";

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
  <div className={className} style={{ background: C.white, borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,.05)", ...style }}>{children}</div>
);
const SectionHeader = ({ title, sub, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
    <div>
      <h2 style={{ fontWeight: 900, fontSize: 16, margin: "0 0 2px", color: C.text }}>{title}</h2>
      {sub && <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
    {action}
  </div>
);
const inputSt = { width: "100%", padding: "11px 13px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box", background: C.bg, fontFamily: "inherit", marginBottom: 10, color: C.text };
const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "6px 14px", borderRadius: 99, border: `1.5px solid ${active ? C.indigo : C.border}`, background: active ? C.indigo : C.white, color: active ? "#fff" : C.textMid, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s" }}>{label}</button>
);
const PageHero = ({ tag, title, sub, extras }) => {
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 60%, #312e81 100%)`, padding: isMobile ? "26px 18px 22px" : "34px 28px 28px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: C.indigo, borderRadius: "50%", opacity: .09 }} />
      <div style={{ position: "absolute", bottom: -20, left: "55%", width: 100, height: 100, background: "#818cf8", borderRadius: "50%", opacity: .07 }} />
      <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto" }}>
        {tag && <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.2)", border: "1px solid rgba(99,102,241,.35)", borderRadius: 99, padding: "5px 14px", marginBottom: 12 }}><span style={{ width: 6, height: 6, background: "#818cf8", borderRadius: "50%", display: "inline-block" }} /><span style={{ fontSize: 11, fontWeight: 600, color: "#c7d2fe", letterSpacing: .3 }}>{tag}</span></div>}
        <h1 className="sl-fadeup" style={{ fontWeight: 900, fontSize: isMobile ? 20 : 28, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.5px" }}>{title}</h1>
        <p className="sl-fadeup-2" style={{ color: "#64748b", fontSize: 13, margin: extras ? "0 0 16px" : 0 }}>{sub}</p>
        {extras}
      </div>
    </div>
  );
};


export { Avatar, Badge, ProgressBar, CircleScore, Card, SectionHeader, inputSt, Pill, PageHero };
