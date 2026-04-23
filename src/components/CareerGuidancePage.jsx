import React, { useEffect, useState } from "react";
import { C } from "../data/constants/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Card, SectionHeader, PageHero, ProgressBar, Badge } from "./shared/Atoms.jsx";
import { fetchCareerGuidance, fetchGapAnalysis, fetchLearningPath, fetchProgressInsights } from "../utils/api.js";

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
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Gathering your career signals...</div>
              <div style={{ color: C.muted, fontSize: 12 }}>Complete more submissions for stronger confidence.</div>
            </div>
          </Card>
        ) : (
          <>
            <div className="sl-grid-2" style={{ marginBottom: 14 }}>
              <Card style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`, border: "1px solid rgba(255,255,255,.08)" }}>
                <SectionHeader title="Top Roles" sub="Ranked by fit and trajectory" />
                {guidance.recommendedRoles?.map((role, i) => (
                  <div key={role} style={{ marginBottom: 10, background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontWeight: 800, color: "#e2e8f0", fontSize: 13 }}>{i + 1}. {role}</div>
                      <Badge label={i === 0 ? "Primary" : "Alternative"} color={i === 0 ? C.indigo : "#64748b"} />
                    </div>
                    <ProgressBar
                      value={Math.max(45, Math.round(guidance.confidenceScore - i * 10))}
                      color={i === 0 ? C.indigo : "#64748b"}
                      height={4}
                    />
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8" }}>
                  Confidence: <strong style={{ color: "#cbd5e1" }}>{Math.round(guidance.confidenceScore)}%</strong>
                </div>
              </Card>

              <Card>
                <SectionHeader title="Reasoning" sub="How the recommendation was derived" />
                <p style={{ fontSize: 12, lineHeight: 1.7, color: C.textMid, marginTop: 0 }}>{guidance.reasoning}</p>
                <div style={{ marginTop: 12, padding: "10px 12px", background: C.indigoLight, borderRadius: 10, borderLeft: `3px solid ${C.indigo}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.indigo, marginBottom: 3 }}>Growth Path</div>
                  <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{guidance.growthPath}</div>
                </div>
              </Card>
            </div>

            <div className="sl-grid-2" style={{ marginBottom: 14 }}>
              <Card>
                <SectionHeader title="Skill Gap Snapshot" sub={gap ? "For your primary role" : "No role-specific gap available"} />
                {gap ? (
                  <>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ fontSize: 12, color: C.muted }}>Readiness</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.indigo }}>{gap.readinessScore}%</div>
                      </div>
                      <ProgressBar value={gap.readinessScore} color={C.indigo} height={6} />
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10 }}>{gap.explanation}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(gap.missingSkills || []).map((skill) => (
                        <Badge key={skill} label={skill} color={"#ef4444"} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: C.muted }}>Complete additional submissions to unlock role-specific gap analytics.</div>
                )}
              </Card>

              <Card>
                <SectionHeader title="Progress Tracking" sub="Improvement over your latest submissions" />
                {progress ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    {[
                      { label: "Recent Avg", value: progress.recentAverageScore },
                      { label: "Previous Avg", value: progress.previousAverageScore },
                      { label: "Momentum", value: `${Math.round(progress.momentumScore)}%` },
                      { label: "Consistency", value: `${Math.round(progress.consistencyScore)}%` },
                    ].map((m) => (
                      <div key={m.label} style={{ padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.white }}>
                        <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: C.indigo }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: C.muted }}>No trend data available yet.</div>
                )}
              </Card>
            </div>

            <Card>
              <SectionHeader title="Recommended Learning Actions" sub="Prioritized next steps based on weak signals" />
              {learning.length === 0 ? (
                <div style={{ fontSize: 12, color: C.muted }}>No recommendations yet. Solve more challenges to personalize your plan.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {learning.slice(0, 6).map((item, i) => (
                    <div key={`${item.title}-${i}`} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", background: C.white }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.indigo }}>{item.title}</div>
                        <Badge label={`${item.type || "resource"}`} color={C.indigo} />
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 5 }}>{item.reason || item.reasonTemplate}</div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: C.indigo }}>
                          Open resource →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default CareerGuidancePage;
