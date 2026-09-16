import React from "react";
import { C, CHALLENGES } from "../constants/constants.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { Avatar, Badge, ProgressBar, LensCorners } from "../components/common/Atoms.jsx";

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onGetStarted, onLogin }) {
  const { isMobile, isTablet } = useBreakpoint();
  const cols3 = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";

  const features = [
    {
      icon: "⌨️",
      title: "12 Real Challenges",
      pastel: C.pastelYellow,
      desc: "Arrays, DP, graphs, design patterns — LeetCode-style problems with full descriptions.",
    },
    {
      icon: "🔍",
      title: "Integrity Detection",
      pastel: C.pastelPurple,
      desc: "Every keystroke and paste tracked. AI flags suspicious patterns and issues an Integrity Score.",
    },
    {
      icon: "📊",
      title: "AI-Powered Analysis",
      pastel: C.pastelBlue,
      desc: "Instant strengths, improvements, and skill gap analysis after every submission.",
    },
    {
      icon: "💼",
      title: "Live Job Board",
      pastel: C.pastelGreen,
      desc: "12+ real roles from Stripe, Google, Razorpay matched to your actual performance.",
    },
    {
      icon: "📜",
      title: "Proof-of-Work Certs",
      pastel: C.pastelYellow,
      desc: "Earn a verifiable certificate per challenge — shareable on LinkedIn instantly.",
    },
    {
      icon: "🏆",
      title: "Global Leaderboard",
      pastel: C.pastelPurple,
      desc: "Compete with developers worldwide. Climb the weekly and all-time rankings.",
    },
  ];
  const steps = [
    {
      n: "01",
      title: "Pick a Challenge",
      pastel: C.pastelBlue,
      accent: "#2F6FE0",
      desc: "Browse 12 challenges by category and difficulty with full problem statements.",
    },
    {
      n: "02",
      title: "Solve in Live Editor",
      pastel: C.pastelPurple,
      accent: C.indigo,
      desc: "Write in JS, Python, or Java. Real-time metrics track your authentic effort.",
    },
    {
      n: "03",
      title: "Get Results + Jobs",
      pastel: C.pastelGreen,
      accent: C.green,
      desc: "AI analysis, job matches, leaderboard rank, and a certificate — instantly.",
    },
  ];
  const jobRoles = [
    {
      role: "Backend Developer",
      prob: 78,
      icon: "⚙️",
      pastel: C.pastelPurple,
      accent: C.indigo,
      score: "80+",
      desc: "Servers, APIs & databases",
    },
    {
      role: "Full-Stack Engineer",
      prob: 71,
      icon: "🌐",
      pastel: C.pastelBlue,
      accent: "#2F6FE0",
      score: "80+",
      desc: "End-to-end web products",
    },
    {
      role: "Junior Developer",
      prob: 72,
      icon: "🚀",
      pastel: C.pastelGreen,
      accent: C.green,
      score: "65+",
      desc: "Entry-level, fast growth track",
    },
    {
      role: "Frontend Developer",
      prob: 61,
      icon: "🎨",
      pastel: C.pastelYellow,
      accent: C.amber,
      score: "65+",
      desc: "UIs and user experience",
    },
    {
      role: "QA Automation Engineer",
      prob: 55,
      icon: "🔍",
      pastel: C.pastelPurple,
      accent: C.indigo,
      score: "65+",
      desc: "Quality & test automation",
    },
    {
      role: "Software Engineer II",
      prob: 65,
      icon: "💻",
      pastel: C.pastelBlue,
      accent: "#2F6FE0",
      score: "80+",
      desc: "Mid-level feature ownership",
    },
  ];

  return (
    <div style={{ background: C.bg, overflowY: "auto", flex: 1 }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: C.dark,
          padding: isMobile ? "48px 20px 40px" : "72px 24px 64px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
            gap: isMobile ? 40 : 56,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: C.teal,
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#8A8E99",
                  fontFamily: C.fontMono,
                }}
              >
                For developers, not for interviewers
              </span>
            </div>
            <h1
              style={{
                fontSize: isMobile ? 32 : 48,
                fontWeight: 700,
                lineHeight: 1.08,
                margin: "0 0 20px",
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Don't tell them
              <br />
              you can code.
              <br />
              <span style={{ color: "#A79CEE" }}>Show them.</span>
            </h1>
            <p
              style={{
                fontSize: isMobile ? 15 : 16.5,
                color: "#A6A9B4",
                maxWidth: 460,
                margin: "0 0 32px",
                lineHeight: 1.65,
                fontWeight: 400,
              }}
            >
              Solve real hiring-round challenges, get scored on correctness and
              integrity by AI, and walk away with a certificate and job
              matches you actually earned.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              <button
                onClick={onGetStarted}
                className="sl-btn-hover"
                style={{
                  padding: "14px 30px",
                  background: "#fff",
                  color: C.dark,
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Start free assessment →
              </button>
              <button
                onClick={onLogin}
                style={{
                  padding: "14px 26px",
                  background: "transparent",
                  color: "#E4E4E1",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Log In
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "#6B6F7B" }}>
              No credit card required · free for your first 2 challenges
            </p>
          </div>

          {!isMobile && (
            <div style={{ position: "relative", padding: 20 }}>
              <LensCorners
                size={28}
                color="rgba(255,255,255,.5)"
                style={{ position: "absolute", top: 0, left: 0 }}
              />
              <LensCorners
                size={28}
                color="rgba(255,255,255,.5)"
                style={{ position: "absolute", top: 0, right: 0 }}
              />
              <LensCorners
                size={28}
                color="rgba(255,255,255,.5)"
                style={{ position: "absolute", bottom: 0, left: 0 }}
              />
              <LensCorners
                size={28}
                color="rgba(255,255,255,.5)"
                style={{ position: "absolute", bottom: 0, right: 0 }}
              />
              <div
                style={{
                  background: "#1B1E2C",
                  borderRadius: 10,
                  padding: "20px 22px 18px",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: C.fontMono,
                    fontSize: 11.5,
                    color: "#6B6F7B",
                    marginBottom: 16,
                  }}
                >
                  <span>reverse_linked_list.py</span>
                  <span>Meta Backend Round</span>
                </div>
                <pre
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: 12.5,
                    lineHeight: 1.7,
                    color: "#E7E7EA",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
{`def reverse_list(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev = head
        head = nxt
    return prev
# running 14 hidden test cases...`}
                </pre>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: "1px solid #2A2C36",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11.5, color: "#8A8E99" }}>
                      Readiness score
                    </div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: 21,
                        fontWeight: 500,
                        color: "#4EDBA5",
                      }}
                    >
                      87<span style={{ fontSize: 13, color: "#6A6E7C" }}> / 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11.5, color: "#8A8E99" }}>
                      Integrity
                    </div>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: 21,
                        fontWeight: 500,
                        color: "#7FCBEA",
                      }}
                    >
                      Clean
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "#2A2C36",
                    borderRadius: 2,
                    marginTop: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "87%",
                      height: "100%",
                      background: "#4EDBA5",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <section
        style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 20 : 48,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: C.muted,
              fontFamily: C.fontMono,
            }}
          >
            Developers hired at
          </span>
          {[
            "Google",
            "Stripe",
            "Razorpay",
            "Flipkart",
            "Freshworks",
            "Atlassian",
          ].map((c) => (
            <span
              key={c}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.textMid,
                opacity: 0.75,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section
        style={{
          padding: isMobile ? "8px 20px 28px" : "8px 24px 40px",
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              v: "12",
              l: "Practice challenges across 8 categories",
            },
            {
              v: "15",
              l: "Developers on the global leaderboard",
            },
            {
              v: "12+",
              l: "Live job openings matched to your score",
            },
            {
              v: "100%",
              l: "Verified certificates, shareable on LinkedIn",
            },
          ].map((s, i) => (
            <div
              key={s.l}
              style={{
                flex: isMobile ? "1 1 45%" : 1,
                padding: isMobile ? "0 16px 20px 0" : "0 28px",
                borderLeft: i === 0 ? "none" : `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  fontFamily: C.fontMono,
                  fontWeight: 500,
                  fontSize: isMobile ? 26 : 32,
                  color: C.text,
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {s.v}
              </div>
              <div style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: isMobile ? "0 20px 40px" : "0 24px 56px",
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        <div style={{ maxWidth: 480, marginBottom: 32 }}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: isMobile ? 22 : 30,
              color: C.text,
              margin: "0 0 10px",
              letterSpacing: "-0.015em",
            }}
          >
            Everything you need to prove your worth
          </h2>
          <p
            style={{
              color: C.textMid,
              fontSize: 15,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Not another dashboard of vanity badges — every metric here is
            something a recruiter would actually ask about.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
            gridAutoRows: "min-content",
            gap: 16,
          }}
        >
          <div
            className="sl-card-hover"
            style={{
              gridRow: isMobile ? "auto" : "span 2",
              background: C.white,
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              padding: isMobile ? "24px" : "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: isMobile ? "auto" : 380,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: C.fontMono,
                  fontSize: 12,
                  color: C.teal,
                  marginBottom: 16,
                }}
              >
                AI career mentor
              </div>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: 21,
                  margin: "0 0 12px",
                  color: C.text,
                  letterSpacing: "-0.01em",
                }}
              >
                Know exactly what's missing before a recruiter tells you
              </h3>
              <p
                style={{
                  fontSize: 14.5,
                  color: C.textMid,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Every session updates a live readiness score against a
                specific role — junior backend, frontend, SDE — with the
                exact missing skills named, not a vague "keep practicing."
              </p>
            </div>
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 13, color: C.muted }}>
                  Overall readiness — junior backend
                </span>
                <span
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: 15,
                    color: C.text,
                  }}
                >
                  65%
                </span>
              </div>
            </div>
          </div>

          {features.slice(1, 3).map((f) => (
            <div
              key={f.title}
              className="sl-card-hover"
              style={{
                background: C.white,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                padding: "22px 24px",
              }}
            >
              <div
                style={{
                  fontFamily: C.fontMono,
                  fontSize: 11.5,
                  color: C.teal,
                  marginBottom: 12,
                }}
              >
                {f.title}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: C.textMid,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap: 16,
            marginTop: 16,
          }}
        >
          {features.slice(3, 6).map((f) => (
            <div
              key={f.title}
              className="sl-card-hover"
              style={{
                background: C.white,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  fontFamily: C.fontMono,
                  fontSize: 11.5,
                  color: C.teal,
                  marginBottom: 10,
                }}
              >
                {f.title}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: C.textMid,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          background: C.dark,
          padding: isMobile ? "44px 20px" : "72px 24px",
          borderTop: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ maxWidth: 480, marginBottom: 40 }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 22 : 28,
                color: "#fff",
                margin: "0 0 10px",
                letterSpacing: "-0.015em",
              }}
            >
              From first keystroke to job offer
            </h2>
            <p style={{ color: "#A6A9B4", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
              One evaluation loop, not three disconnected tools.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
              gap: isMobile ? 32 : 0,
            }}
          >
            {steps.map((s, i) => (
              <div
                key={s.n}
                style={{
                  padding: isMobile ? 0 : i === steps.length - 1 ? "0 0 0 28px" : "0 28px 0 0",
                  borderRight: !isMobile && i !== steps.length - 1 ? "1px solid rgba(255,255,255,.12)" : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: 13,
                    color: "#A79CEE",
                    marginBottom: 18,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    margin: "0 0 10px",
                    color: "#fff",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#A6A9B4",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CHALLENGES PREVIEW ────────────────────────────────── */}
      <section
        id="challenges"
        style={{
          padding: isMobile ? "36px 20px" : "60px 24px",
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: C.indigoLight,
                borderRadius: 99,
                padding: "4px 14px",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: C.indigo }}>
                Coding Challenges
              </span>
            </div>
            <h2
              style={{
                fontWeight: 600,
                fontSize: isMobile ? 20 : 28,
                color: C.text,
                margin: "0 0 6px",
                letterSpacing: "-0.5px",
              }}
            >
              Practice with Real Interview Problems
            </h2>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
              First 2 challenges are free. Sign up to unlock all 12.
            </p>
          </div>
          <button
            onClick={onGetStarted}
            style={{
              padding: "10px 20px",
              background: C.indigo,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Unlock All 12 →
          </button>
        </div>
        <div className="sl-grid-2">
          {CHALLENGES.slice(0, 6).map((ch, idx) => {
            const locked = idx >= 2;
            return (
              <div
                key={ch.id}
                className="sl-card-hover"
                style={{
                  background: C.white,
                  borderRadius: 14,
                  padding: isMobile ? 14 : 20,
                  position: "relative",
                  border: `1px solid ${locked ? "#E4E4E1" : C.indigo + "26"}`,
                  opacity: locked ? 0.8 : 1,
                }}
              >
                {locked && (
                  <div style={{ position: "absolute", top: 14, right: 14 }}>
                    <Badge label="🔒 Sign up" color={C.indigo} />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: locked ? C.border : ch.pastel,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 19,
                      flexShrink: 0,
                    }}
                  >
                    {locked ? "🔒" : ch.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        margin: "0 0 4px",
                        color: locked ? C.muted : C.text,
                      }}
                    >
                      {ch.title}
                    </h3>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Badge
                        label={ch.category}
                        color={locked ? C.muted : ch.accent}
                      />
                      <Badge
                        label={ch.difficulty}
                        color={
                          ch.difficulty === "Easy"
                            ? C.green
                            : ch.difficulty === "Medium"
                              ? C.amber
                              : C.red
                        }
                      />
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  {ch.description.split("\n")[0]}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: locked ? C.muted : ch.accent,
                      }}
                    >
                      +{ch.xp} XP
                    </span>
                    <span>⏱ {ch.timeLimit} min</span>
                  </div>
                  <button
                    onClick={onGetStarted}
                    style={{
                      padding: "6px 14px",
                      background: locked ? C.bg : C.indigo,
                      color: locked ? C.indigo : "#fff",
                      border: `1px solid ${locked ? C.border : C.indigo}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {locked ? "Sign up →" : "Try Free →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CAREER MATCHING ───────────────────────────────────── */}
      <section
        id="job-board"
        style={{
          background: C.indigoLight,
          padding: isMobile ? "36px 20px" : "60px 24px",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: C.indigo + "18",
                  borderRadius: 99,
                  padding: "4px 14px",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: C.indigo }}
                >
                  Career Pathways
                </span>
              </div>
              <h2
                style={{
                  fontWeight: 600,
                  fontSize: isMobile ? 20 : 28,
                  color: C.text,
                  margin: "0 0 6px",
                  letterSpacing: "-0.5px",
                }}
              >
                Jobs You Can Land with SkillLens
              </h2>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
                Performance-based matching — not just keywords on a résumé.
              </p>
            </div>
            <button
              onClick={onGetStarted}
              style={{
                padding: "10px 22px",
                background: C.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Get Matched →
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols3,
              gap: 14,
              marginBottom: 20,
            }}
          >
            {jobRoles.map((j) => (
              <div
                key={j.role}
                className="sl-card-hover"
                style={{
                  background: C.white,
                  borderRadius: 14,
                  padding: "20px 18px",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      background: j.pastel,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {j.icon}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 22,
                        color: C.indigo,
                        lineHeight: 1,
                      }}
                    >
                      {j.prob}%
                    </div>
                    <div
                      style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}
                    >
                      match rate
                    </div>
                  </div>
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    margin: "0 0 4px",
                    color: C.text,
                  }}
                >
                  {j.role}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: C.muted,
                    margin: "0 0 12px",
                    lineHeight: 1.5,
                  }}
                >
                  {j.desc}
                </p>
                <ProgressBar value={j.prob} color={C.indigo} height={4} />
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: C.indigo,
                    fontWeight: 600,
                  }}
                >
                  Score {j.score}+ to qualify
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR COMPANIES ─────────────────────────────────────── */}
      <section
        id="for-companies"
        style={{
          padding: isMobile ? "44px 20px" : "72px 24px",
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? 32 : 56,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: C.fontMono,
                fontSize: 12.5,
                color: C.teal,
                marginBottom: 14,
              }}
            >
              For companies &amp; recruiters
            </div>
            <h2
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 22 : 28,
                color: C.text,
                margin: "0 0 14px",
                letterSpacing: "-0.015em",
              }}
            >
              Build your own hiring test. Judge candidates on real signal, not a resume.
            </h2>
            <p
              style={{
                color: C.textMid,
                fontSize: 15,
                lineHeight: 1.65,
                margin: "0 0 24px",
              }}
            >
              Bundle your own coding and aptitude questions into a
              company-branded assessment, assign it to candidates, and watch
              a live, ranked leaderboard fill in — scored the same way every
              candidate on the platform is scored, so nobody's grading on a
              curve.
            </p>
            <button
              onClick={onGetStarted}
              className="sl-btn-hover"
              style={{
                padding: "13px 26px",
                background: C.dark,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14.5,
                cursor: "pointer",
              }}
            >
              Create a company account →
            </button>
          </div>
          <div
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: isMobile ? "22px" : "26px",
              background: C.white,
            }}
          >
            {[
              {
                n: "01",
                t: "Create your test",
                d: "Bundle 2 or more questions from our bank — or your own — into one branded assessment.",
              },
              {
                n: "02",
                t: "Assign it to candidates",
                d: "Send it out and let candidates solve it under the same proctoring and integrity checks as everyone else.",
              },
              {
                n: "03",
                t: "Review a ranked leaderboard",
                d: "See every candidate ordered by score, integrity, and completion — no manual resume screening.",
              },
            ].map((s, i, arr) => (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  gap: 16,
                  paddingBottom: i === arr.length - 1 ? 0 : 20,
                  marginBottom: i === arr.length - 1 ? 0 : 20,
                  borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: 13,
                    color: C.muted,
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: C.text, marginBottom: 4 }}>
                    {s.t}
                  </div>
                  <div style={{ fontSize: 13.5, color: C.textMid, lineHeight: 1.6 }}>
                    {s.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: isMobile ? "0 20px 48px" : "0 24px 72px",
          maxWidth: 860,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${C.dark} 0%, #1B1E2C 100%)`,
            borderRadius: 16,
            padding: isMobile ? "36px 24px" : "56px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <LensCorners size={26} color="rgba(255,255,255,.3)" style={{ position: "absolute", top: 20, right: 20 }} />
          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: isMobile ? 22 : 32,
                color: "#fff",
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Your next interview starts with a solved problem, not a resume line.
            </h2>
            <p
              style={{
                color: "#A6A9B4",
                fontSize: 15,
                margin: "0 0 28px",
                lineHeight: 1.6,
              }}
            >
              Free forever for your first 2 challenges. Instant results, no
              recruiter in the loop.
            </p>
            <button
              onClick={onGetStarted}
              className="sl-btn-hover"
              style={{
                padding: "14px 36px",
                background: "#fff",
                color: C.dark,
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              Get started free →
            </button>
            <p style={{ fontSize: 12, color: "#4A4E5A", margin: 0 }}>
              No credit card required · Set up in 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer
        style={{
          background: C.dark,
          borderTop: `1px solid rgba(255,255,255,.06)`,
          padding: isMobile ? "28px 20px" : "36px 24px",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr 1fr",
              gap: 28,
              marginBottom: 28,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: C.indigoLight,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  🧠
                </div>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>
                  Skill<span style={{ color: C.indigoMid }}>Lens</span>
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "#6B6F7B",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                AI-powered coding evaluation that connects developers with
                opportunities through provable skills.
              </p>
            </div>
            {[
              {
                title: "Platform",
                links: [
                  "Challenges",
                  "Leaderboard",
                  "Job Board",
                  "Certificates",
                ],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Legal",
                links: [
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "Contact",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  style={{
                    fontWeight: 500,
                    fontSize: 12.5,
                    color: "#8A8E99",
                    marginBottom: 12,
                    fontFamily: C.fontMono,
                  }}
                >
                  {col.title}
                </h4>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "#6B6F7B",
                      textDecoration: "none",
                      marginBottom: 8,
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#8A8E99")}
                    onMouseLeave={(e) => (e.target.style.color = "#6B6F7B")}
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.06)",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <p style={{ fontSize: 12, color: "#4A4E5A", margin: 0 }}>
              © 2025 SkillLens Technologies. All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: "#4A4E5A", margin: 0 }}>
              Prove your skills, not just your résumé.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
