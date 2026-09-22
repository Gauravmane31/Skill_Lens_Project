
import React, { useEffect, useMemo, useState } from "react";
import { C } from "../constants/constants.js";
import { scoreColor } from "../utils/scoring.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { PageHero, Card, SectionHeader, inputSt, Pill, Badge, ProgressBar } from "../components/common/Atoms.jsx";
import CompanyLogo from "../components/common/CompanyLogo.jsx";
import { fetchJobRecommendations } from "../services/api.js";

// ── Job Board Page ────────────────────────────────────────────────────────────
function JobBoardPage({ results, setPage }) {
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applied, setApplied] = useState(new Set());
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const types = ["All", "Full-time", "Internship"];
  const matchFilters = ["All", "90%+ Match", "80%+ Match", "70%+ Match"];

  useEffect(() => {
    let mounted = true;
    fetchJobRecommendations()
      .then((recommendations) => {
        if (!mounted) return;
        setJobs((recommendations || []).map(({ job, matchScore, matchReasons }) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: "See role description",
          salary: "Contact company",
          type: "Full-time",
          posted: job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently",
          skills: Array.isArray(job.required_skills) ? job.required_skills : [],
          domain: job.domain,
          match: Number(matchScore || 0),
          matchReasons: matchReasons || [],
          hot: Number(matchScore || 0) >= 85,
        })));
      })
      .catch((error) => {
        console.error("Failed to load live jobs:", error);
        if (mounted) setJobs([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = jobs
    .filter(j => typeFilter === "All" || j.type === typeFilter)
    .filter(j => matchFilter === "All" || (matchFilter === "90%+ Match" && j.match >= 90) || (matchFilter === "80%+ Match" && j.match >= 80) || (matchFilter === "70%+ Match" && j.match >= 70))
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(search.toLowerCase())));

  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.codeScore, 0) / results.length) : null;

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      <PageHero tag="💼 Job Board" title="Your Matched Opportunities" sub={`${jobs.length} live roles matched to your SkillLens profile.`}
        extras={avgScore ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "7px 12px" }}>
              <div style={{ fontSize: 9, color: "#6B6F7B", marginBottom: 1 }}>YOUR CODE SCORE</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: scoreColor(avgScore) }}>{avgScore}/100</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "7px 12px" }}>
              <div style={{ fontSize: 9, color: "#6B6F7B", marginBottom: 1 }}>TOP MATCH</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.green }}>95%</div>
            </div>
          </div>
        ) : null}
      />

      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
        {/* Resume prompt — analysis itself lives on the Resume page (single source of truth) */}
        <Card style={{ marginBottom: 16, background: C.indigoLight, border: `1px solid ${C.indigo}44`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 3 }}>🤖 Want stronger matches?</div>
            <div style={{ fontSize: 12.5, color: C.textMid }}>Upload your resume once on your Resume page — we'll use it here to refine every match score.</div>
          </div>
          <button onClick={() => setPage?.("resume")} className="sl-btn-hover" style={{ padding: "10px 18px", background: C.indigo, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
            Go to Resume →
          </button>
        </Card>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { v: jobs.length, l: "Live Roles", a: C.indigo },
            { v: jobs.filter(j => j.hot).length, l: "🔥 Hot", a: C.red },
            { v: jobs.filter(j => j.match >= 80).length, l: "Strong Match", a: C.green },
            { v: applied.size, l: "Applied", a: C.amber },
          ].map(s => (
            <Card key={s.l} style={{ padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: s.a }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search jobs, companies, or skills…"
            style={{ ...inputSt, marginBottom: 10, padding: "10px 14px" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {types.map(t => <Pill key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />)}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {matchFilters.map(m => <Pill key={m} label={m} active={matchFilter === m} onClick={() => setMatchFilter(m)} />)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedJob && !isMobile ? "1fr 380px" : "1fr", gap: 16 }}>
          {/* Job list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
              <Card style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 14, color: C.muted }}>Loading live jobs...</div>
              </Card>
            ) : filtered.length === 0 ? (
              <Card style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>💼</div>
                <h3 style={{ fontWeight: 600, marginBottom: 6 }}>{jobs.length ? "No matching jobs" : "No live jobs yet"}</h3>
                <p style={{ color: C.muted, fontSize: 13 }}>{jobs.length ? "Try adjusting your filters." : "Recruiter-posted roles will appear here when they are published."}</p>
              </Card>
            ) : filtered.map(job => (
              <div key={job.id} className="sl-card-hover" onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                style={{ background: C.white, borderRadius: 12, padding: "16px 18px", cursor: "pointer", boxShadow: selectedJob?.id === job.id ? `0 0 0 2px ${C.indigo}` : "none", border: `1.5px solid ${selectedJob?.id === job.id ? C.indigo : C.border}` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, background: job.company === "Palo Alto" ? "#000" : C.indigoLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CompanyLogo company={job.company} fallback={job.logo} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: 14, margin: "0 0 2px", color: C.text }}>{job.title}</h3>
                        <div style={{ fontSize: 12, color: C.muted }}>{job.company} · {job.location}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        {job.hot && <Badge label="🔥 Hot" color={C.red} />}
                        <div style={{ background: job.match >= 90 ? C.green : job.match >= 80 ? C.indigo : C.amber, color: "#fff", borderRadius: 8, padding: "4px 10px", fontWeight: 600, fontSize: 13 }}>
                          {job.match}%
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: C.textMid }}>💰 {job.salary}</span>
                      <span style={{ fontSize: 11, color: C.textMid }}>📌 {job.type}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>🕐 {job.posted}</span>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                      {job.skills.map(s => <span key={s} style={{ background: C.bg, borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: C.textMid, border: `1px solid ${C.border}` }}>{s}</span>)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); setApplied(a => { const n = new Set(a); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n; }); }} className="sl-btn-hover"
                        style={{ padding: "6px 14px", background: applied.has(job.id) ? C.green : C.indigo, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                        {applied.has(job.id) ? "✓ Applied" : "Apply Now"}
                      </button>
                      <button onClick={e => { e.stopPropagation(); setSelectedJob(selectedJob?.id === job.id ? null : job); }} style={{ padding: "6px 12px", background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {selectedJob?.id === job.id ? "Close" : "Details"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Job detail pane */}
          {selectedJob && !isMobile && (
            <div style={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
              <Card>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 52, height: 52, background: selectedJob.company === "Palo Alto" ? "#000" : C.indigoLight, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CompanyLogo company={selectedJob.company} fallback={selectedJob.logo} size={34} />
                  </div>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: 16, margin: "0 0 3px" }}>{selectedJob.title}</h2>
                    <div style={{ fontSize: 13, color: C.muted }}>{selectedJob.company}</div>
                  </div>
                </div>
                {[["Location", selectedJob.location], ["Type", selectedJob.type], ["Salary", selectedJob.salary], ["Posted", selectedJob.posted]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{v}</span>
                  </div>
                ))}
                <div style={{ margin: "14px 0" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: .5 }}>Required Skills</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedJob.skills.map(s => <Badge key={s} label={s} color={C.indigo} />)}
                  </div>
                </div>
                <div style={{ background: selectedJob.match >= 90 ? C.pastelGreen : selectedJob.match >= 80 ? C.indigoLight : C.pastelYellow, borderRadius: 10, padding: "12px", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4, color: selectedJob.match >= 90 ? C.green : C.indigo }}>Your Match Score</div>
                  <div style={{ fontWeight: 700, fontSize: 26, color: selectedJob.match >= 90 ? C.green : C.indigo, marginBottom: 6 }}>{selectedJob.match}%</div>
                  <ProgressBar value={selectedJob.match} color={selectedJob.match >= 90 ? C.green : C.indigo} height={6} />
                </div>
                <button onClick={() => setApplied(a => { const n = new Set(a); n.has(selectedJob.id) ? n.delete(selectedJob.id) : n.add(selectedJob.id); return n; })} className="sl-btn-hover"
                  style={{ width: "100%", padding: "11px", background: applied.has(selectedJob.id) ? C.green : C.indigo, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  {applied.has(selectedJob.id) ? "✓ Application Sent!" : "Apply with SkillLens Profile"}
                </button>
                <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>Your certificate & scores will be shared automatically.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



export default JobBoardPage;
