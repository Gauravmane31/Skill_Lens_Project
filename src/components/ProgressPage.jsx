import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, CHALLENGES } from "../data/constants/constants.js";
import { scoreColor, integrityLabel } from "../data/scoring.js";
import { fetchProgressInsights } from "../utils/api.js";
import { supabase } from "../utils/supabase.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, SectionHeader, CircleScore, ProgressBar, Badge, Pill } from "./shared/Atoms.jsx";

const CHALLENGE_MAP = new Map(CHALLENGES.map(c => [c.id, c]));

const LANG_LABELS = { javascript: "JavaScript", python: "Python", java: "Java", cpp: "C++", c: "C", go: "Go", rust: "Rust" };
const fmtDate = d => { const dt = new Date(d); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
const fmtTime = s => `${Math.floor(s / 60)}m ${s % 60}s`;

// ── SVG Line Chart ──────────────────────────────────────────────────────────
function TrendChart({ data, isMobile }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length < 2) {
    return (
      <div style={{ padding: 40, textAlign: "center", background: C.bg, borderRadius: 12 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📈</div>
        <div style={{ fontSize: 13, color: C.muted }}>Complete at least 2 challenges to see your score trend.</div>
      </div>
    );
  }

  const W = isMobile ? 340 : 680, H = 220;
  const pad = { top: 20, right: 30, bottom: 35, left: 40 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * cw,
    code: pad.top + ch - (d.code_score / 100) * ch,
    integrity: pad.top + ch - (d.integrity_score / 100) * ch,
    ...d,
  }));

  const codePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.code}`).join(" ");
  const intPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.integrity}`).join(" ");

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div style={{ position: "relative", overflowX: isMobile ? "auto" : "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* Grid */}
        {gridLines.map(v => {
          const y = pad.top + ch - (v / 100) * ch;
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke={C.border} strokeWidth={0.7} strokeDasharray="4,4" />
              <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize={9} fill={C.muted}>{v}</text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {pts.filter((_, i) => data.length <= 10 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize={9} fill={C.muted}>{fmtDate(p.created_at)}</text>
        ))}

        {/* Lines */}
        <path d={codePath} fill="none" stroke={C.indigo} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <path d={intPath} fill="none" stroke={C.green} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* Gradient area under code line */}
        <defs>
          <linearGradient id="codeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.indigo} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.indigo} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${codePath} L${pts[pts.length - 1].x},${pad.top + ch} L${pts[0].x},${pad.top + ch} Z`} fill="url(#codeGrad)" />

        {/* Data points */}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
            <circle cx={p.x} cy={p.code} r={hovered === i ? 5 : 3.5} fill={C.indigo} stroke="#fff" strokeWidth={1.5} />
            <circle cx={p.x} cy={p.integrity} r={hovered === i ? 5 : 3.5} fill={C.green} stroke="#fff" strokeWidth={1.5} />
            {/* Invisible hit area */}
            <rect x={p.x - 15} y={pad.top} width={30} height={ch} fill="transparent" />
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered !== null && pts[hovered] && (
        <div style={{
          position: "absolute",
          left: Math.min(pts[hovered].x - 60, W - 150),
          top: Math.min(pts[hovered].code - 80, 10),
          background: C.dark,
          color: "#e2e8f0",
          padding: "8px 12px",
          borderRadius: 10,
          fontSize: 11,
          border: "1px solid rgba(255,255,255,.12)",
          boxShadow: "0 4px 20px rgba(0,0,0,.3)",
          pointerEvents: "none",
          zIndex: 10,
          minWidth: 130,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{pts[hovered].challenge_title || "Challenge"}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <span><span style={{ color: C.indigo, fontWeight: 800 }}>●</span> Code: {pts[hovered].code_score}</span>
            <span><span style={{ color: C.green, fontWeight: 800 }}>●</span> Integrity: {pts[hovered].integrity_score}</span>
          </div>
          <div style={{ color: C.muted, marginTop: 3, fontSize: 10 }}>{fmtDate(pts[hovered].created_at)}</div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 3, background: C.indigo, borderRadius: 2, display: "inline-block" }} /> Code Score
        </span>
        <span style={{ fontSize: 11, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 3, background: C.green, borderRadius: 2, display: "inline-block" }} /> Integrity
        </span>
      </div>
    </div>
  );
}

// ── Progress Page ────────────────────────────────────────────────────────────
function ProgressPage({ user, results, setPage }) {
  const { isMobile } = useBreakpoint();
  const [submissions, setSubmissions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timelineLimit, setTimelineLimit] = useState(20);

  // Fetch data on mount
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const load = async () => {
      try {
        // Fetch all submissions from Supabase
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (!cancelled && data) setSubmissions(data);

        // Fetch insights
        try {
          const ins = await fetchProgressInsights();
          if (!cancelled) setInsights(ins);
        } catch { /* optional */ }
      } catch (e) {
        console.error("Failed to load progress data:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Derived data ────────────────────────────────────────────────────────
  const chronological = submissions; // ascending
  const reversed = [...submissions].reverse(); // newest first

  // Overall deltas
  const first3 = chronological.slice(0, 3);
  const last3 = chronological.slice(-3);
  const avgOf = (arr, key) => arr.length ? Math.round(arr.reduce((s, x) => s + Number(x[key] || 0), 0) / arr.length) : 0;

  const firstCodeAvg = avgOf(first3, "code_score");
  const lastCodeAvg = avgOf(last3, "code_score");
  const firstIntAvg = avgOf(first3, "integrity_score");
  const lastIntAvg = avgOf(last3, "integrity_score");

  const codeDelta = lastCodeAvg - firstCodeAvg;
  const intDelta = lastIntAvg - firstIntAvg;

  const daysSinceFirst = chronological.length > 0
    ? Math.max(1, Math.ceil((Date.now() - new Date(chronological[0].created_at).getTime()) / 86400000))
    : 0;

  // Domain breakdown
  const domainMap = new Map();
  chronological.forEach(sub => {
    const ch = CHALLENGE_MAP.get(Number(sub.challenge_id));
    const domain = ch?.category || "General";
    if (!domainMap.has(domain)) domainMap.set(domain, []);
    domainMap.get(domain).push(sub);
  });

  const domains = Array.from(domainMap.entries())
    .map(([name, subs]) => {
      const first = Number(subs[0].code_score || 0);
      const latest = Number(subs[subs.length - 1].code_score || 0);
      const best = Math.max(...subs.map(s => Number(s.code_score || 0)));
      return { name, count: subs.length, first, latest, best, delta: latest - first };
    })
    .sort((a, b) => b.delta - a.delta);

  // Technology/tag improvement trends
  // Group submissions by their challenge tags (e.g. "Hash Map", "Array", "DP", "Two Pointers")
  const tagMap = new Map();
  chronological.forEach(sub => {
    const ch = CHALLENGE_MAP.get(Number(sub.challenge_id));
    const tags = ch?.tags || [];
    tags.forEach(tag => {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag).push(sub);
    });
  });

  const techTrends = Array.from(tagMap.entries())
    .filter(([, subs]) => subs.length >= 2)
    .map(([tag, subs]) => {
      const half = Math.ceil(subs.length / 2);
      const firstHalf = subs.slice(0, half);
      const secondHalf = subs.slice(half);
      const firstAvg = Math.round(firstHalf.reduce((s, x) => s + Number(x.code_score || 0), 0) / firstHalf.length);
      const secondAvg = Math.round(secondHalf.reduce((s, x) => s + Number(x.code_score || 0), 0) / secondHalf.length);
      const delta = secondAvg - firstAvg;
      const best = Math.max(...subs.map(s => Number(s.code_score || 0)));
      return { tag, count: subs.length, firstAvg, secondAvg, delta, best };
    })
    .sort((a, b) => b.delta - a.delta);

  const improving = techTrends.filter(t => t.delta > 0);
  const declining = techTrends.filter(t => t.delta < 0);
  const stable = techTrends.filter(t => t.delta === 0);

  // Language breakdown
  const langMap = new Map();
  chronological.forEach(sub => {
    const lang = sub.lang || "javascript";
    if (!langMap.has(lang)) langMap.set(lang, []);
    langMap.get(lang).push(sub);
  });

  const languages = Array.from(langMap.entries()).map(([lang, subs]) => ({
    lang,
    label: LANG_LABELS[lang] || lang,
    count: subs.length,
    avg: Math.round(subs.reduce((s, x) => s + Number(x.code_score || 0), 0) / subs.length),
    best: Math.max(...subs.map(s => Number(s.code_score || 0))),
  }));

  // Before/After metrics
  const metricsOf = (arr) => {
    if (!arr.length) return { code: 0, integrity: 0, time: 0, faceV: 0, paste: 0 };
    const n = arr.length;
    return {
      code: avgOf(arr, "code_score"),
      integrity: avgOf(arr, "integrity_score"),
      time: Math.round(arr.reduce((s, x) => s + Number(x.time_taken || 0), 0) / n),
      faceV: +(arr.reduce((s, x) => s + Number(x.metrics?.faceViolations || 0), 0) / n).toFixed(1),
      paste: +(arr.reduce((s, x) => s + Number(x.metrics?.pasteEvents || 0), 0) / n).toFixed(1),
    };
  };

  const beforeMetrics = metricsOf(first3);
  const afterMetrics = metricsOf(last3);

  // Timeline — personal bests
  const bestPerChallenge = new Map();
  chronological.forEach(sub => {
    const cid = sub.challenge_id;
    const score = Number(sub.code_score || 0);
    if (!bestPerChallenge.has(cid) || score > bestPerChallenge.get(cid)) {
      bestPerChallenge.set(cid, score);
    }
  });

  // Previous attempt per challenge for delta
  const prevAttempt = new Map();
  const timelineData = reversed.slice(0, timelineLimit).map(sub => {
    const cid = sub.challenge_id;
    const score = Number(sub.code_score || 0);
    const isPB = score === bestPerChallenge.get(cid) && score > 0;
    const ch = CHALLENGE_MAP.get(Number(cid));

    // Find previous attempt delta
    const allForChallenge = chronological.filter(s => s.challenge_id === cid);
    const idx = allForChallenge.findIndex(s => s.created_at === sub.created_at);
    const prevScore = idx > 0 ? Number(allForChallenge[idx - 1].code_score || 0) : null;
    const delta = prevScore !== null ? score - prevScore : null;

    return { ...sub, isPB, ch, delta };
  });

  // ── Loading & Empty States ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, gap: 12, flexDirection: "column" }}>
        <div style={{ fontSize: 40, animation: "pulse 1.5s infinite" }}>📊</div>
        <div style={{ color: C.muted, fontSize: 14, fontWeight: 600 }}>Loading your progress data...</div>
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, background: C.bg, padding: 24 }}>
        <div style={{ fontSize: 56 }}>📈</div>
        <h3 style={{ fontWeight: 800, color: C.text }}>No progress data yet</h3>
        <p style={{ color: C.muted, textAlign: "center", maxWidth: 340 }}>Complete your first challenge to start tracking your improvement journey.</p>
        <button onClick={() => setPage("challenges")} style={{ padding: "10px 24px", background: C.indigo, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Start a Challenge →</button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  const DeltaBadge = ({ val, suffix = "" }) => (
    <span style={{
      fontSize: 11, fontWeight: 800,
      color: val > 0 ? C.green : val < 0 ? C.red : C.amber,
      background: val > 0 ? C.green + "15" : val < 0 ? C.red + "15" : C.amber + "15",
      padding: "2px 7px", borderRadius: 6,
    }}>
      {val > 0 ? "↑" : val < 0 ? "↓" : "→"}{Math.abs(val)}{suffix}
    </span>
  );

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <PageHero
        tag="📈 Progress"
        title="Your Improvement Journey"
        sub={`${submissions.length} sessions · ${daysSinceFirst} days active`}
        extras={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "TOTAL SESSIONS", val: submissions.length, color: "#ccc" },
              { label: "DAYS ACTIVE", val: daysSinceFirst, color: "#ccc" },
              { label: "BEST CODE SCORE", val: Math.max(...submissions.map(s => Number(s.code_score || 0))), color: C.green },
              { label: "LANGUAGES USED", val: languages.length, color: C.indigoMid },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "8px 13px", backdropFilter: "blur(4px)" }}>
                <div style={{ fontSize: 9, color: "#666", marginBottom: 2, textTransform: "uppercase", letterSpacing: .5 }}>{s.label}</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        }
      />

      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>

        {/* ── 1. Progress Summary Cards ─────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            { icon: "📊", label: "Code Score Δ", before: firstCodeAvg, after: lastCodeAvg, delta: codeDelta },
            { icon: "🛡", label: "Integrity Δ", before: firstIntAvg, after: lastIntAvg, delta: intDelta },
            { icon: "🚀", label: "Momentum", val: insights?.momentumScore ?? "—", desc: "Recent vs. past trend" },
            { icon: "🎯", label: "Consistency", val: insights?.consistencyScore ?? "—", desc: "Score stability" },
          ].map((c, i) => (
            <Card key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
              {c.delta !== undefined ? (
                <>
                  <div style={{ fontWeight: 900, fontSize: 22, color: c.delta >= 0 ? C.green : C.red }}>
                    {c.after}
                  </div>
                  <div style={{ marginTop: 4 }}><DeltaBadge val={c.delta} /></div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>from {c.before}</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 900, fontSize: 22, color: C.indigo }}>{c.val}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{c.desc}</div>
                </>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginTop: 6 }}>{c.label}</div>
            </Card>
          ))}
        </div>

        {/* ── 2. Score Trend Chart ─────────────────────────── */}
        <Card style={{ marginBottom: 18 }}>
          <SectionHeader title="Score Trend Over Time" sub="Code score and integrity across all sessions" />
          <TrendChart data={chronological} isMobile={isMobile} />
        </Card>

        {/* ── 2b. Technologies Getting Better At ────────────── */}
        <Card style={{ marginBottom: 18 }}>
          <SectionHeader title="🚀 Technologies You're Getting Better At" sub="Skill improvement tracked by topic tags" />
          {techTrends.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 12 }}>
              Complete more challenges with overlapping topics to see technology trends.
            </div>
          ) : (
            <>
              {/* Improving */}
              {improving.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 14 }}>📈</span> Improving
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 8 }}>
                    {improving.map(t => (
                      <div key={t.tag} style={{
                        background: `${C.green}08`, border: `1.5px solid ${C.green}30`,
                        borderRadius: 12, padding: "12px 14px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{t.tag}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 800, color: C.green,
                            background: C.green + "18", padding: "2px 7px", borderRadius: 6,
                          }}>↑{t.delta}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
                          <div style={{ flex: 1 }}>
                            <ProgressBar value={t.secondAvg} color={C.green} height={5} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.green, width: 28, textAlign: "right" }}>{t.secondAvg}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted }}>
                          <span>{t.count} sessions</span>
                          <span>was {t.firstAvg} → now {t.secondAvg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stable */}
              {stable.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.amber, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 14 }}>➡️</span> Steady
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {stable.map(t => (
                      <div key={t.tag} style={{
                        background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "6px 12px",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: C.textMid }}>{t.tag}</span>
                        <span style={{ fontSize: 10, color: C.muted }}>avg {t.secondAvg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declining */}
              {declining.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 14 }}>📉</span> Needs Practice
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 8 }}>
                    {declining.map(t => (
                      <div key={t.tag} style={{
                        background: `${C.red}06`, border: `1.5px solid ${C.red}25`,
                        borderRadius: 12, padding: "12px 14px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{t.tag}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 800, color: C.red,
                            background: C.red + "18", padding: "2px 7px", borderRadius: 6,
                          }}>↓{Math.abs(t.delta)}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 4 }}>
                          <div style={{ flex: 1 }}>
                            <ProgressBar value={t.secondAvg} color={C.red} height={5} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.red, width: 28, textAlign: "right" }}>{t.secondAvg}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted }}>
                          <span>{t.count} sessions</span>
                          <span>was {t.firstAvg} → now {t.secondAvg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <div className="sl-grid-2" style={{ marginBottom: 18 }}>
          {/* ── 3. Domain-wise Improvement ─────────────────── */}
          <Card>
            <SectionHeader title="🏷 Domain Improvement" sub="First attempt → Latest attempt" />
            {domains.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 12 }}>No domain data yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {domains.map(d => (
                  <div key={d.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{d.name}</span>
                        <span style={{ fontSize: 10, color: C.muted, marginLeft: 6 }}>{d.count} attempt{d.count > 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: C.muted }}>Best: {d.best}</span>
                        {d.count >= 2 && <DeltaBadge val={d.delta} />}
                      </div>
                    </div>
                    {d.count >= 2 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, color: C.muted, width: 36 }}>First</span>
                          <div style={{ flex: 1 }}><ProgressBar value={d.first} color={C.muted} height={5} /></div>
                          <span style={{ fontSize: 10, fontWeight: 700, width: 24, textAlign: "right", color: C.muted }}>{d.first}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 9, color: C.indigo, width: 36, fontWeight: 700 }}>Latest</span>
                          <div style={{ flex: 1 }}><ProgressBar value={d.latest} color={C.indigo} height={5} /></div>
                          <span style={{ fontSize: 10, fontWeight: 700, width: 24, textAlign: "right", color: C.indigo }}>{d.latest}</span>
                        </div>
                      </div>
                    ) : (
                      <ProgressBar value={d.first} color={C.indigo} height={5} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 4. Before vs After ─────────────────────────── */}
          <Card>
            <SectionHeader title="⚡ Before vs After" sub="First 3 sessions → Last 3 sessions" />
            {submissions.length < 3 ? (
              <div style={{ padding: 20, textAlign: "center", color: C.muted, fontSize: 12 }}>Need at least 3 sessions to compare.</div>
            ) : (
              <div>
                <div style={{ display: "flex", marginBottom: 10 }}>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>First 3 Sessions</div>
                  <div style={{ width: 50 }} />
                  <div style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, color: C.indigo, textTransform: "uppercase" }}>Last 3 Sessions</div>
                </div>
                {[
                  { label: "Avg Code Score", b: beforeMetrics.code, a: afterMetrics.code },
                  { label: "Avg Integrity", b: beforeMetrics.integrity, a: afterMetrics.integrity },
                  { label: "Avg Time", b: fmtTime(beforeMetrics.time), a: fmtTime(afterMetrics.time), raw: true },
                  { label: "Avg Face Violations", b: beforeMetrics.faceV, a: afterMetrics.faceV, invert: true },
                  { label: "Avg Paste Events", b: beforeMetrics.paste, a: afterMetrics.paste, invert: true },
                ].map((m, i) => {
                  const delta = m.raw ? null : m.a - m.b;
                  const improved = m.invert ? delta <= 0 : delta >= 0;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", padding: "8px 10px",
                      background: i % 2 === 0 ? C.bg : "transparent", borderRadius: 8, marginBottom: 2
                    }}>
                      <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 16, color: C.muted }}>{m.b}</div>
                      <div style={{ width: 80, textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.textMid, marginBottom: 2 }}>{m.label}</div>
                        {delta !== null && <DeltaBadge val={m.invert ? -delta : delta} />}
                      </div>
                      <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 16, color: improved !== false ? C.indigo : C.red }}>{m.a}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── 5. Language Breakdown ─────────────────────────── */}
        <Card style={{ marginBottom: 18 }}>
          <SectionHeader title="💻 Language Breakdown" sub="Performance by programming language" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 10 }}>
            {languages.map(l => (
              <div key={l.lang} style={{
                background: C.bg, borderRadius: 12, padding: "14px 16px",
                border: `1.5px solid ${C.border}`, textAlign: "center",
              }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 8 }}>{l.label}</div>
                <CircleScore value={l.avg} size={60} label="Avg Score" />
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: C.indigo }}>{l.count}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>Sessions</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: C.green }}>{l.best}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>Best</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 6. Improvement Timeline ──────────────────────── */}
        <Card style={{ marginBottom: 18 }}>
          <SectionHeader title="🕐 Improvement Timeline" sub="Chronological session history" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {timelineData.map((sub, i) => {
              const ch = sub.ch;
              return (
                <div key={sub.created_at + i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", background: C.bg, borderRadius: 10,
                  border: `1px solid ${sub.isPB ? C.green + "40" : C.border}`,
                  position: "relative",
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    width: 32, height: 32, background: C.indigoLight,
                    borderRadius: 8, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 16, flexShrink: 0,
                    border: `1px solid ${C.indigo}22`,
                  }}>
                    {ch?.icon || "⌨️"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sub.challenge_title || ch?.title || "Challenge"}
                      </span>
                      {sub.isPB && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: C.green,
                          background: C.green + "15", padding: "1px 6px",
                          borderRadius: 4,
                        }}>🏆 PB</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                      <span>{fmtDate(sub.created_at)}</span>
                      <Badge label={LANG_LABELS[sub.lang] || sub.lang} color={C.indigo} />
                      <span>{fmtTime(Number(sub.time_taken || 0))}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {sub.delta !== null && <DeltaBadge val={sub.delta} />}
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: scoreColor(Number(sub.code_score)) }}>{sub.code_score}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>score</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {reversed.length > timelineLimit && (
            <button
              onClick={() => setTimelineLimit(l => l + 20)}
              style={{
                marginTop: 12, width: "100%", padding: "10px",
                background: C.indigoLight, color: C.indigo, border: "none",
                borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              Show more ({reversed.length - timelineLimit} remaining)
            </button>
          )}
        </Card>

        {/* ── CTA ──────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`,
          borderRadius: 16, padding: isMobile ? "20px 16px" : "24px 22px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12, border: "1px solid rgba(255,255,255,.08)",
        }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 15, color: "#fff", margin: "0 0 3px" }}>Keep improving! 🔥</h3>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Practice more challenges to see your scores climb.</p>
          </div>
          <button onClick={() => setPage("challenges")} className="sl-btn-hover"
            style={{ padding: "10px 20px", background: C.indigo, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Start a Challenge →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
