import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { C } from "../data/constants/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Card, SectionHeader, PageHero, inputSt, Badge, ProgressBar } from "./shared/Atoms.jsx";
import {
  assignRecruiterTestCandidates,
  createJob,
  createRecruiterTest,
  deleteRecruiterTest,
  downloadRecruiterTestLeaderboardCsv,
  fetchJobs,
  fetchProblems,
  fetchRecruiterCandidates,
  fetchRecruiterTestAssignments,
  fetchRecruiterTestLeaderboard,
  fetchRecruiterTests,
  setUserRole,
  updateRecruiterTest,
} from "../utils/api.js";

function RecruiterDashboardPage({ user, onRoleChange }) {
  const { isMobile } = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [recruiterTests, setRecruiterTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [testLeaderboard, setTestLeaderboard] = useState([]);
  const [selectedTestMeta, setSelectedTestMeta] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [editForm, setEditForm] = useState({
    company: "",
    roleTitle: "",
    description: "",
    isActive: true,
    challengeIds: [],
  });
  const [domainFilter, setDomainFilter] = useState("");
  const [minSkillScore, setMinSkillScore] = useState(50);
  const [minReadiness, setMinReadiness] = useState(60);
  const [testForm, setTestForm] = useState({
    company: "",
    roleTitle: "",
    description: "",
    challengeIds: [],
  });
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    requiredSkills: "React, Node.js, SQL",
    domain: "",
    minSkillScore: 60,
    notificationThreshold: 70,
  });

  const loadRecruiterData = async () => {
    try {
      setLoading(true);
      const [jobRows, candidateRows, questions, tests] = await Promise.all([
        fetchJobs(),
        fetchRecruiterCandidates({ domain: domainFilter, minSkillScore, minReadiness }),
        fetchProblems(),
        fetchRecruiterTests({ mine: true }),
      ]);
      setJobs(jobRows);
      setCandidates(candidateRows);
      setAllQuestions(questions || []);
      setRecruiterTests(tests || []);

      if ((tests || []).length && !selectedTestId) {
        setSelectedTestId(String(tests[0].id));
      }
    } catch (error) {
      toast.error(error.message || "Failed to load recruiter dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadRecruiterData();
  }, [user?.id]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedTestId) {
        setTestLeaderboard([]);
        setSelectedTestMeta(null);
        setAssignments([]);
        return;
      }

      try {
        setLeaderboardLoading(true);
        const [payload, assignmentRows] = await Promise.all([
          fetchRecruiterTestLeaderboard(selectedTestId),
          fetchRecruiterTestAssignments(selectedTestId),
        ]);
        setTestLeaderboard(payload.leaderboard || []);
        setSelectedTestMeta(payload.test || null);
        setAssignments(assignmentRows || []);
      } catch (error) {
        toast.error(error.message || "Failed to load test leaderboard.");
      } finally {
        setLeaderboardLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedTestId]);

  useEffect(() => {
    const selected = recruiterTests.find((test) => String(test.id) === String(selectedTestId));
    if (!selected) {
      setEditForm({ company: "", roleTitle: "", description: "", isActive: true, challengeIds: [] });
      return;
    }

    setEditForm({
      company: selected.company || "",
      roleTitle: selected.roleTitle || "",
      description: selected.description || "",
      isActive: selected.is_active !== false,
      challengeIds: (selected.questions || []).map((q) => Number(q.challengeId)).filter(Boolean),
    });
  }, [selectedTestId, recruiterTests]);

  const recruiterJobs = useMemo(
    () => jobs.filter((job) => !user?.id || job.created_by === user.id),
    [jobs, user?.id]
  );

  const topCandidates = useMemo(() => candidates.slice(0, 25), [candidates]);

  const switchToRecruiter = async () => {
    try {
      const role = await setUserRole("recruiter");
      if (typeof onRoleChange === "function") onRoleChange(role);
      toast.success("Recruiter mode enabled.");
      await loadRecruiterData();
    } catch (error) {
      toast.error(error.message || "Unable to switch role.");
    }
  };

  const submitJob = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: form.title,
        company: form.company,
        description: form.description,
        requiredSkills: String(form.requiredSkills || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        domain: form.domain,
        minSkillScore: Number(form.minSkillScore || 0),
        notificationThreshold: Number(form.notificationThreshold || 0),
      };

      const result = await createJob(payload);
      toast.success(`Job posted. ${result.matchedUsers || 0} candidates notified.`);
      setForm((prev) => ({ ...prev, title: "", description: "" }));
      await loadRecruiterData();
    } catch (error) {
      toast.error(error.message || "Failed to create job.");
    }
  };

  const toggleQuestionSelection = (challengeId) => {
    setTestForm((prev) => {
      const alreadySelected = prev.challengeIds.includes(challengeId);
      if (alreadySelected) {
        return {
          ...prev,
          challengeIds: prev.challengeIds.filter((id) => id !== challengeId),
        };
      }

      if (prev.challengeIds.length >= 10) {
        toast.error("You can add up to 10 questions per test.");
        return prev;
      }

      return {
        ...prev,
        challengeIds: [...prev.challengeIds, challengeId],
      };
    });
  };

  const submitRecruiterTest = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        company: testForm.company,
        roleTitle: testForm.roleTitle,
        description: testForm.description,
        challengeIds: testForm.challengeIds,
      };

      const result = await createRecruiterTest(payload);
      toast.success(`Test created with ${result.questionCount || testForm.challengeIds.length} questions.`);
      setTestForm({ company: "", roleTitle: "", description: "", challengeIds: [] });

      const tests = await fetchRecruiterTests({ mine: true });
      setRecruiterTests(tests || []);
      if (result?.test?.id) {
        setSelectedTestId(String(result.test.id));
      }
    } catch (error) {
      toast.error(error.message || "Failed to create company test.");
    }
  };

  const toggleEditQuestionSelection = (challengeId) => {
    setEditForm((prev) => {
      const exists = prev.challengeIds.includes(challengeId);
      if (exists) {
        return { ...prev, challengeIds: prev.challengeIds.filter((id) => id !== challengeId) };
      }
      if (prev.challengeIds.length >= 10) {
        toast.error("You can add up to 10 questions per test.");
        return prev;
      }
      return { ...prev, challengeIds: [...prev.challengeIds, challengeId] };
    });
  };

  const saveSelectedTestEdits = async () => {
    if (!selectedTestId) return;
    try {
      await updateRecruiterTest(selectedTestId, {
        company: editForm.company,
        roleTitle: editForm.roleTitle,
        description: editForm.description,
        isActive: editForm.isActive,
        challengeIds: editForm.challengeIds,
      });
      toast.success("Test updated.");
      await loadRecruiterData();
    } catch (error) {
      toast.error(error.message || "Failed to update test.");
    }
  };

  const deleteSelectedTest = async () => {
    if (!selectedTestId) return;
    const ok = window.confirm("Delete this test? This removes assignments and leaderboard data.");
    if (!ok) return;

    try {
      await deleteRecruiterTest(selectedTestId);
      toast.success("Test deleted.");
      setSelectedTestId("");
      await loadRecruiterData();
    } catch (error) {
      toast.error(error.message || "Failed to delete test.");
    }
  };

  const exportSelectedTestCsv = async () => {
    if (!selectedTestId) return;
    try {
      const csvText = await downloadRecruiterTestLeaderboardCsv(selectedTestId);
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = `${selectedTestMeta?.company || "company"}-${selectedTestMeta?.roleTitle || "test"}`.replace(/\s+/g, "_");
      link.setAttribute("href", url);
      link.setAttribute("download", `${safeName}-leaderboard.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded.");
    } catch (error) {
      toast.error(error.message || "Failed to export CSV.");
    }
  };

  const toggleCandidateSelection = (userId) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(userId)) return prev.filter((id) => id !== userId);
      return [...prev, userId];
    });
  };

  const assignSelectedCandidatesToTest = async () => {
    if (!selectedTestId) {
      toast.error("Select a company test first.");
      return;
    }
    if (!selectedCandidateIds.length) {
      toast.error("Select at least one candidate.");
      return;
    }

    try {
      setAssignmentLoading(true);
      const res = await assignRecruiterTestCandidates(selectedTestId, selectedCandidateIds);
      toast.success(`Assigned ${res.assigned || selectedCandidateIds.length} candidates.`);
      setSelectedCandidateIds([]);
      const assignmentRows = await fetchRecruiterTestAssignments(selectedTestId);
      setAssignments(assignmentRows || []);
    } catch (error) {
      toast.error(error.message || "Failed to assign candidates.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      <PageHero
        tag="Recruiter Console"
        title="Recruiter Dashboard"
        sub="Post jobs, discover ranked candidates, and trigger intelligent match notifications."
      />

      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
        {user?.role !== "recruiter" ? (
          <Card>
            <SectionHeader title="Enable Recruiter Access" sub="Switch your account role to recruiter to create jobs." />
            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7 }}>
              Your current account role is <strong>{user?.role || "student"}</strong>. Recruiter role gives access to job posting and candidate ranking.
            </p>
            <button
              className="sl-btn-hover"
              onClick={switchToRecruiter}
              style={{
                marginTop: 10,
                padding: "9px 14px",
                border: "none",
                borderRadius: 10,
                background: C.indigo,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Switch to Recruiter
            </button>
          </Card>
        ) : (
          <>
            <div className="sl-grid-2" style={{ marginBottom: 16 }}>
              <Card>
                <SectionHeader title="Create Job Posting" sub="Publishing a job triggers the matching engine and notifications." />
                <form onSubmit={submitJob}>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Job Title" style={inputSt} />
                  <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Company" style={inputSt} />
                  <input value={form.domain} onChange={(e) => setForm((p) => ({ ...p, domain: e.target.value }))} placeholder="Domain (e.g. Dynamic Programming)" style={inputSt} />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Role description"
                    style={{ ...inputSt, minHeight: 90, resize: "vertical" }}
                  />
                  <input
                    value={form.requiredSkills}
                    onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))}
                    placeholder="Required Skills (comma separated)"
                    style={inputSt}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input
                      value={form.minSkillScore}
                      onChange={(e) => setForm((p) => ({ ...p, minSkillScore: e.target.value }))}
                      placeholder="Min Skill Score"
                      type="number"
                      min={0}
                      max={100}
                      style={inputSt}
                    />
                    <input
                      value={form.notificationThreshold}
                      onChange={(e) => setForm((p) => ({ ...p, notificationThreshold: e.target.value }))}
                      placeholder="Notification Threshold"
                      type="number"
                      min={0}
                      max={100}
                      style={inputSt}
                    />
                  </div>
                  <button
                    type="submit"
                    className="sl-btn-hover"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: 10,
                      background: C.indigo,
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Publish Job
                  </button>
                </form>
              </Card>

              <Card>
                <SectionHeader title="Candidate Filters" sub="Find top candidates using your hiring criteria." />
                <input value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} placeholder="Filter domain" style={inputSt} />
                <input
                  value={minSkillScore}
                  onChange={(e) => setMinSkillScore(Number(e.target.value || 0))}
                  placeholder="Minimum skill score"
                  type="number"
                  min={0}
                  max={100}
                  style={inputSt}
                />
                <input
                  value={minReadiness}
                  onChange={(e) => setMinReadiness(Number(e.target.value || 0))}
                  placeholder="Minimum readiness"
                  type="number"
                  min={0}
                  max={100}
                  style={inputSt}
                />
                <button
                  className="sl-btn-hover"
                  onClick={loadRecruiterData}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    background: C.white,
                    color: C.text,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Refresh Candidate List
                </button>

                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, padding: 10 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Recruiter Jobs</div>
                    <div style={{ fontSize: 18, color: C.indigo, fontWeight: 900 }}>{recruiterJobs.length}</div>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, padding: 10 }}>
                    <div style={{ fontSize: 11, color: C.muted }}>Matching Candidates</div>
                    <div style={{ fontSize: 18, color: C.indigo, fontWeight: 900 }}>{topCandidates.length}</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="sl-grid-2" style={{ marginBottom: 16 }}>
              <Card>
                <SectionHeader title="Create Company Assessment Test" sub="Bundle 2 or more coding questions into one company-role test." />
                <form onSubmit={submitRecruiterTest}>
                  <input
                    value={testForm.company}
                    onChange={(e) => setTestForm((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder="Company Name"
                    style={inputSt}
                  />
                  <input
                    value={testForm.roleTitle}
                    onChange={(e) => setTestForm((prev) => ({ ...prev, roleTitle: e.target.value }))}
                    placeholder="Role Title (e.g. Backend Engineer II)"
                    style={inputSt}
                  />
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="What does this test evaluate?"
                    style={{ ...inputSt, minHeight: 80, resize: "vertical" }}
                  />

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Select Questions ({testForm.challengeIds.length} selected)
                    </div>
                    <div style={{ maxHeight: 220, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 10, padding: 8 }}>
                      {!allQuestions.length ? (
                        <div style={{ fontSize: 12, color: C.muted }}>No questions available.</div>
                      ) : (
                        allQuestions.map((question) => {
                          const selected = testForm.challengeIds.includes(Number(question.id));
                          return (
                            <label
                              key={question.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 4px",
                                borderRadius: 8,
                                cursor: "pointer",
                                background: selected ? C.indigoLight : "transparent",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleQuestionSelection(Number(question.id))}
                              />
                              <span style={{ fontSize: 12, color: C.text }}>{question.title}</span>
                              <Badge label={question.difficulty} color={question.difficulty === "Hard" ? C.red : question.difficulty === "Medium" ? C.amber : C.green} />
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="sl-btn-hover"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: 10,
                      background: C.indigo,
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Create Assessment Test
                  </button>
                </form>
              </Card>

              <Card>
                <SectionHeader title="Company Tests" sub="Select a test to view top ranked candidates." />
                {!recruiterTests.length ? (
                  <div style={{ fontSize: 12, color: C.muted }}>No tests created yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {recruiterTests.slice(0, 20).map((test) => {
                      const active = String(test.id) === String(selectedTestId);
                      return (
                        <button
                          key={test.id}
                          type="button"
                          onClick={() => setSelectedTestId(String(test.id))}
                          style={{
                            textAlign: "left",
                            border: `1px solid ${active ? `${C.indigo}66` : C.border}`,
                            background: active ? C.indigoLight : C.white,
                            borderRadius: 10,
                            padding: "10px 12px",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                            <div style={{ fontWeight: 800, color: C.text }}>{test.company} - {test.roleTitle}</div>
                            <Badge label={`${test.questions?.length || 0} Q`} color={C.indigo} />
                          </div>
                          <div style={{ fontSize: 11, color: C.muted }}>{test.description || "No description"}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedTestId ? (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 8 }}>Manage Selected Test</div>
                    <input
                      value={editForm.company}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="Company"
                      style={inputSt}
                    />
                    <input
                      value={editForm.roleTitle}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, roleTitle: e.target.value }))}
                      placeholder="Role Title"
                      style={inputSt}
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                      style={{ ...inputSt, minHeight: 72, resize: "vertical" }}
                    />

                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMid, marginBottom: 10 }}>
                      <input
                        type="checkbox"
                        checked={Boolean(editForm.isActive)}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      />
                      Active test
                    </label>

                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Edit Questions ({editForm.challengeIds.length} selected)
                    </div>
                    <div style={{ maxHeight: 160, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, marginBottom: 10 }}>
                      {allQuestions.map((question) => {
                        const selected = editForm.challengeIds.includes(Number(question.id));
                        return (
                          <label key={`edit-${question.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", borderRadius: 8, background: selected ? C.indigoLight : "transparent" }}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleEditQuestionSelection(Number(question.id))}
                            />
                            <span style={{ fontSize: 12, color: C.text }}>{question.title}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <button
                        type="button"
                        onClick={saveSelectedTestEdits}
                        className="sl-btn-hover"
                        style={{ padding: "9px 12px", border: "none", borderRadius: 9, background: C.indigo, color: "#fff", fontWeight: 700, cursor: "pointer" }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={exportSelectedTestCsv}
                        className="sl-btn-hover"
                        style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.white, color: C.text, fontWeight: 700, cursor: "pointer" }}
                      >
                        Export CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                        className="sl-btn-hover"
                        style={{ padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: 9, background: C.white, color: C.text, fontWeight: 700, cursor: "pointer" }}
                      >
                        {editForm.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={deleteSelectedTest}
                        className="sl-btn-hover"
                        style={{ padding: "9px 12px", border: "none", borderRadius: 9, background: C.red, color: "#fff", fontWeight: 700, cursor: "pointer" }}
                      >
                        Delete Test
                      </button>
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>

            <Card style={{ marginBottom: 16 }}>
              <SectionHeader
                title="Assessment Leaderboard"
                sub={selectedTestMeta ? `${selectedTestMeta.company} - ${selectedTestMeta.roleTitle}` : "Select a company test to see rankings."}
              />

              {leaderboardLoading ? (
                <div style={{ fontSize: 12, color: C.muted }}>Loading leaderboard...</div>
              ) : !selectedTestId ? (
                <div style={{ fontSize: 12, color: C.muted }}>No test selected.</div>
              ) : !testLeaderboard.length ? (
                <div style={{ fontSize: 12, color: C.muted }}>No candidates attempted this test yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {testLeaderboard.map((row, index) => (
                    <div key={row.userId} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, color: C.text }}>#{index + 1} {row.name}</div>
                        <Badge label={`${row.finalScore}% final`} color={C.green} />
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{row.email}</div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Code</div>
                          <ProgressBar value={row.avgCode} color={C.indigo} height={5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Integrity</div>
                          <ProgressBar value={row.avgIntegrity} color={C.amber} height={5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Completion</div>
                          <ProgressBar value={row.completionRate} color={C.green} height={5} />
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: C.textMid, marginTop: 8 }}>
                        Attempted: {row.attemptedQuestions}/{row.totalQuestions} questions
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <SectionHeader title="Your Job Postings" sub="Jobs created by recruiter accounts." />
              {!recruiterJobs.length ? (
                <div style={{ fontSize: 12, color: C.muted }}>No jobs posted yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recruiterJobs.slice(0, 10).map((job) => (
                    <div key={job.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800, color: C.text }}>{job.title}</div>
                        <Badge label={job.domain} color={C.indigo} />
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>{job.company}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>
                        Min Skill Score: {job.min_skill_score} • {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader title="Top Candidates" sub="Ranked by readiness, score, and platform momentum." />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {selectedCandidateIds.length} candidate(s) selected for assignment
                </div>
                <button
                  type="button"
                  onClick={assignSelectedCandidatesToTest}
                  disabled={assignmentLoading}
                  className="sl-btn-hover"
                  style={{
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 9,
                    background: C.indigo,
                    color: "#fff",
                    fontWeight: 700,
                    cursor: assignmentLoading ? "wait" : "pointer",
                  }}
                >
                  {assignmentLoading ? "Assigning..." : "Assign Selected To Test"}
                </button>
              </div>
              {loading ? (
                <div style={{ fontSize: 12, color: C.muted }}>Loading candidates...</div>
              ) : !topCandidates.length ? (
                <div style={{ fontSize: 12, color: C.muted }}>No candidates match your current filters.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {topCandidates.map((candidate) => (
                    <div key={candidate.userId} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ marginBottom: 6 }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textMid, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={selectedCandidateIds.includes(candidate.userId)}
                            onChange={() => toggleCandidateSelection(candidate.userId)}
                          />
                          Select for assignment
                        </label>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, color: C.text }}>{candidate.name}</div>
                        <Badge label={`${candidate.readinessScore}% readiness`} color={C.green} />
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{candidate.email}</div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Skill Score</div>
                          <ProgressBar value={candidate.avgCode} color={C.indigo} height={5} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>Readiness</div>
                          <ProgressBar value={candidate.readinessScore} color={C.green} height={5} />
                        </div>
                      </div>
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(candidate.topDomains || []).slice(0, 3).map((domain) => (
                          <Badge key={domain} label={domain} color={C.indigo} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!!selectedTestId && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.text, marginBottom: 8 }}>Assigned Candidates For Selected Test</div>
                  {!assignments.length ? (
                    <div style={{ fontSize: 12, color: C.muted }}>No assignments yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {assignments.slice(0, 20).map((row) => (
                        <div key={row.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                          <div style={{ fontSize: 12, color: C.text }}>{row.name} <span style={{ color: C.muted }}>({row.email})</span></div>
                          <Badge label={row.status} color={row.status === "completed" ? C.green : row.status === "in_progress" ? C.amber : C.indigo} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboardPage;
