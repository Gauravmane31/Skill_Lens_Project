import React, { useEffect, useState } from "react";
import { C } from "../constants/constants.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { Card, SectionHeader, PageHero, ProgressBar, Badge, CircleScore } from "../components/common/Atoms.jsx";
import { fetchCareerGuidance, fetchGapAnalysis, fetchLearningPath, fetchProgressInsights } from "../services/api.js";

function CareerGuidancePage({ user }) {
  const { isMobile } = useBreakpoint();
  const [guidance, setGuidance] = useState(null);
  const [gap, setGap] = useState(null);
  const [learning, setLearning] = useState([]);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    fetchCareerGuidance(user.id)
      .then((data) => {
        setGuidance(data);
        if (data?.recommendedRoles?.length) {
          fetchGapAnalysis(user.id, data.recommendedRoles[0]).then(setGap).catch(console.error);
        }
      })
      .catch(console.error);

    fetchLearningPath(user.id).then(setLearning).catch(console.error);
    fetchProgressInsights(user.id).then(setProgress).catch(console.error);
  }, [user?.id]);

  const primaryRole = guidance?.recommendedRoles?.[0];
  const altRoles = guidance?.recommendedRoles?.slice(1) || [];

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      <PageHero
        tag="AI Mentor"
        title="Career Guidance"
        sub="Personalized reasoning over your coding evidence, trends, and role requirements."
      />

      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
        {!guidance ? (
          <Card>
            <div style={{ textAlign: "center", padding: "26px 14px" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>🤖</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Gathering your career signals...</div>
              <div style={{ color: C.muted, fontSize: 12 }}>Complete more submissions for stronger confidence.</div>
            </div>
          </Card>
        ) : (
          <>
            {/* 1. THE VERDICT — role, confidence, and why, read together as one story */}
            <Card style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1B1E2C 100%)`, border: "1px solid rgba(255,255,255,.08)", marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 18 : 28, alignItems: isMobile ? "flex-start" : "center" }}>
                <div style={{ flexShrink: 0 }}>
                  <CircleScore value={Math.round(guidance.confidenceScore)} size={92} color="#7A70E0" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontFamily: C.fontMono, color: "#8A8E99", marginBottom: 6 }}>Recommended role</div>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 19 : 23, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{primaryRole}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: "#B8BAC4", margin: 0 }}>{guidance.reasoning}</p>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#A79CEE", marginBottom: 4 }}>Growth path</div>
                <div style={{ fontSize: 12.5, color: "#B8BAC4", lineHeight: 1.6 }}>{guidance.growthPath}</div>
              </div>
            </Card>

            {/* 2. WHAT'S BLOCKING YOU — the most actionable info, given the most visual weight */}
            <Card style={{ marginBottom: 14 }}>
              <SectionHeader title="⚠️ What's holding you back" sub={gap ? `Gap analysis for ${primaryRole}` : "No role-specific gap available yet"} />
              {gap ? (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 12.5, color: C.textMid }}>Readiness for this role</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.indigo }}>{gap.readinessScore}%</div>
                    </div>
                    <ProgressBar value={gap.readinessScore} color={C.indigo} height={7} />
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid, marginBottom: 12, lineHeight: 1.6 }}>{gap.explanation}</div>
                  {(gap.missingSkills || []).length > 0 && (
                    <>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 8, fontFamily: C.fontMono }}>Missing skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {gap.missingSkills.map((skill) => (
                          <Badge key={skill} label={skill} color={"#D6473F"} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12, color: C.muted }}>Complete additional submissions to unlock role-specific gap analytics.</div>
              )}
            </Card>

            {/* 3. YOUR TRAJECTORY — inline stat row, consistent with the rest of the app's data-bar convention */}
            <Card style={{ marginBottom: 14 }}>
              <SectionHeader title="📈 Your trajectory" sub="Improvement over your latest submissions" />
              {progress ? (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {[
                    { label: "Recent avg", value: progress.recentAverageScore },
                    { label: "Previous avg", value: progress.previousAverageScore },
                    { label: "Momentum", value: `${Math.round(progress.momentumScore)}%` },
                    { label: "Consistency", value: `${Math.round(progress.consistencyScore)}%` },
                  ].map((m, i) => (
                    <div key={m.label} style={{ flex: isMobile ? "1 1 45%" : 1, padding: isMobile ? "0 14px 14px 0" : "0 22px", borderLeft: i === 0 ? "none" : `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: C.fontMono, fontWeight: 500, fontSize: 22, color: C.text }}>{m.value}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.muted }}>No trend data available yet.</div>
              )}
            </Card>

            {/* 4. WHAT TO DO NEXT — numbered, prioritized, most important action first */}
            <Card style={{ marginBottom: 14 }}>
              <SectionHeader title="✅ Recommended next steps" sub="Prioritized by impact on your weakest signals" />
              {learning.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted }}>No recommendations yet. Solve more challenges to personalize your plan.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {learning.slice(0, 6).map((item, i, arr) => (
                    <div key={`${item.title}-${i}`} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: C.fontMono, fontSize: 12.5, color: C.muted, flexShrink: 0, paddingTop: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{item.title}</div>
                          <Badge label={`${item.type || "resource"}`} color={C.indigo} />
                        </div>
                        <div style={{ fontSize: 12.5, color: C.textMid, marginBottom: item.url ? 6 : 0, lineHeight: 1.55 }}>{item.reason || item.reasonTemplate}</div>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, fontWeight: 700, color: C.indigo }}>
                            Open resource →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 5. ALTERNATIVE ROLES — secondary, lower visual weight than the primary verdict above */}
            {altRoles.length > 0 && (
              <Card>
                <SectionHeader title="Other roles worth considering" sub="Ranked by fit and trajectory" />
                {altRoles.map((role, i) => (
                  <div key={role} style={{ marginBottom: i === altRoles.length - 1 ? 0 : 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{role}</div>
                      <Badge label="Alternative" color="#6B6F7B" />
                    </div>
                    <ProgressBar value={Math.max(45, Math.round(guidance.confidenceScore - (i + 1) * 10))} color="#6B6F7B" height={4} />
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CareerGuidancePage;
