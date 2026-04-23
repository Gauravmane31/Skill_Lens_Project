import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { C } from "../data/constants/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, SectionHeader, Badge, ProgressBar } from "./shared/Atoms.jsx";
import { fetchMyAssignedCompanyTests, fetchMyCompanyTestProgress } from "../utils/api.js";

function CompanyTestsPage({ setPage, setSelectedChallenge }) {
  const { isMobile } = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);

  const loadAssignedTests = async () => {
    try {
      setLoading(true);
      const rows = await fetchMyAssignedCompanyTests();
      setTests(rows || []);
      if ((rows || []).length && !selectedTestId) {
        setSelectedTestId(String(rows[0].id));
      }
    } catch (error) {
      toast.error(error.message || "Failed to load assigned tests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedTests();
  }, []);

  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedTestId) {
        setSelectedTestDetails(null);
        return;
      }
      try {
        const payload = await fetchMyCompanyTestProgress(selectedTestId);
        setSelectedTestDetails(payload);
      } catch (error) {
        toast.error(error.message || "Failed to load test progress.");
      }
    };

    loadProgress();
  }, [selectedTestId]);

  const openQuestion = (question) => {
    if (!question?.challengeId) return;

    setSelectedChallenge({
      id: Number(question.challengeId),
      title: question.title,
      difficulty: question.difficulty || "Easy",
      category: question.domain || "General",
      domain: question.domain || "General",
      description: `Assigned company test question for ${selectedTestDetails?.test?.company || "company"}`,
      xp: 120,
      timeLimit: 30,
      icon: "🧪",
      tags: ["Company Test", question.domain || "General"],
      testCases: [],
      hints: [],
      starterCode: {
        javascript: "function solve(input) {\n  // write your solution\n}",
        python: "def solve(input):\n    pass",
        java: "class Solution {\n  public String solve(String input) {\n    return \"\";\n  }\n}",
      },
    });

    setPage("session");
  };

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      <PageHero
        tag="🧪 Assigned Company Tests"
        title="Your Recruitment Assessments"
        sub="Track progress test-wise and attempt questions assigned by recruiting companies."
      />

      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
        {loading ? (
          <Card>
            <div style={{ fontSize: 12, color: C.muted }}>Loading assigned tests...</div>
          </Card>
        ) : !tests.length ? (
          <Card>
            <SectionHeader title="No Assigned Tests Yet" sub="You will see company role-based assessments here once recruiters assign them." />
            <div style={{ fontSize: 12, color: C.muted }}>Keep practicing in Challenges while waiting for assignments.</div>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.3fr", gap: 16 }}>
            <Card>
              <SectionHeader title="Assigned Tests" sub={`${tests.length} active assignments`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tests.map((test) => {
                  const selected = String(test.id) === String(selectedTestId);
                  const progress = test.progress || {};
                  return (
                    <button
                      key={test.id}
                      type="button"
                      onClick={() => setSelectedTestId(String(test.id))}
                      style={{
                        border: `1px solid ${selected ? `${C.indigo}66` : C.border}`,
                        background: selected ? C.indigoLight : C.white,
                        borderRadius: 10,
                        padding: "10px 12px",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 800, color: C.text, marginBottom: 4 }}>{test.company} - {test.roleTitle}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{test.questionCount || 0} questions</div>
                      <ProgressBar value={Number(progress.completionRate || 0)} color={C.indigo} height={4} />
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionHeader
                title={selectedTestDetails?.test ? `${selectedTestDetails.test.company} - ${selectedTestDetails.test.roleTitle}` : "Test Details"}
                sub={selectedTestDetails?.test?.description || "Select an assigned test to view details."}
              />

              {selectedTestDetails?.progress ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 12 }}>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>Completion</div>
                      <div style={{ fontWeight: 900, color: C.indigo }}>{selectedTestDetails.progress.completionRate}%</div>
                    </div>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>Final Score</div>
                      <div style={{ fontWeight: 900, color: C.green }}>{selectedTestDetails.progress.finalScore}%</div>
                    </div>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>Code Avg</div>
                      <div style={{ fontWeight: 900, color: C.text }}>{selectedTestDetails.progress.avgCode}%</div>
                    </div>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, color: C.muted }}>Integrity Avg</div>
                      <div style={{ fontWeight: 900, color: C.text }}>{selectedTestDetails.progress.avgIntegrity}%</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(selectedTestDetails.test?.questions || []).map((question) => {
                      const qProgress = (selectedTestDetails.progress.questions || []).find((q) => Number(q.challengeId) === Number(question.challengeId));
                      const attempted = Boolean(qProgress?.attempted);

                      return (
                        <div key={question.challengeId} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                            <div style={{ fontWeight: 700, color: C.text }}>Q{question.order}: {question.title}</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <Badge label={question.difficulty || "Easy"} color={question.difficulty === "Hard" ? C.red : question.difficulty === "Medium" ? C.amber : C.green} />
                              <Badge label={attempted ? "Attempted" : "Pending"} color={attempted ? C.indigo : C.muted} />
                            </div>
                          </div>

                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                            Domain: {question.domain || "General"}
                            {attempted && qProgress?.bestCodeScore != null ? ` • Best Score: ${qProgress.bestCodeScore}` : ""}
                          </div>

                          <button
                            type="button"
                            onClick={() => openQuestion(question)}
                            className="sl-btn-hover"
                            style={{
                              padding: "7px 12px",
                              border: "none",
                              borderRadius: 8,
                              background: C.indigo,
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {attempted ? "Retry Question" : "Start Question"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: C.muted }}>Select a test to load progress.</div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyTestsPage;
