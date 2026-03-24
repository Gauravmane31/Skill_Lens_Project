
import { C } from './constants/constants.js';

// ── Scoring ───────────────────────────────────────────────────────────────────
const scoreColor = s => s >= 80 ? C.green : s >= 60 ? C.amber : C.red;
const integrityLabel = s => s >= 85 ? { label: "High", color: C.green } : s >= 65 ? { label: "Medium", color: C.amber } : { label: "Low", color: C.red };
function computeIntegrity(m) {
  let score = 100;

  // 🔹 Balanced Penalty Config
  const PENALTY = {
    FAST_SUBMISSION: 30,   // thoda kam kiya
    PASTE_EVENT: 5,
    LARGE_PASTE: 10,
    PASTE_CHARS: 5,
    TAB_SWITCH: 10          // 👈 reduced (pehle 15 tha)
  };

  const BONUS = {
    HONEST_TYPING: 15
  };

  // =========================
  // 🔻 PENALTIES
  // =========================

  // 1. Time penalty
  if (m.typingDuration < 15) {
    score -= PENALTY.FAST_SUBMISSION;
  }

  // 2. Paste usage
  if (m.pasteEvents > 0) {
    score -= PENALTY.PASTE_EVENT;
  }

  // 3. Paste size
  if (m.largestPaste > 10) {
    score -= PENALTY.LARGE_PASTE;
  }

  if (m.pasteChars > 150) {
    score -= PENALTY.PASTE_CHARS;
  }

  // 4. Tab switching (👈 light impact)
  score -= Math.min(20, m.tabSwitches * 5);

  // =========================
  // 🔺 BONUS
  // =========================

  const typingRatio =
    m.keystrokes / Math.max(1, m.keystrokes + m.pasteChars);

  if (typingRatio > 0.8 && m.typingDuration > 30) {
    score += BONUS.HONEST_TYPING;
  }

  // =========================
  // 🔒 FINAL SCORE
  // =========================

  return Math.max(0, Math.min(100, score));
}
function computeCodeScore(code) {
  let s = 55;
  if (code.length > 50) s += 12;
  if (code.includes("//") || code.includes("#")) s += 8;
  if (/function|def|class/.test(code)) s += 8;
  if (code.includes("return")) s += 7;
  if (!/console\.log|print/.test(code)) s += 5;
  if (code.length > 200) s += 5;
  if (/for|while|map|filter|reduce/.test(code)) s += 3;
  return Math.min(100, s);
}
const jobSuggestions = (cs, is) => {
  const avg = (cs + is) / 2;
  if (avg >= 80) return [{ role: "Backend Developer", prob: 78, color: C.indigo }, { role: "Full-Stack Engineer", prob: 71, color: C.green }, { role: "Software Engineer II", prob: 65, color: C.amber }];
  if (avg >= 65) return [{ role: "Junior Developer", prob: 72, color: C.indigo }, { role: "Frontend Developer", prob: 61, color: "#3B82F6" }, { role: "QA Engineer", prob: 55, color: C.green }];
  return [{ role: "Intern / Trainee", prob: 68, color: C.indigo }, { role: "Technical Support", prob: 60, color: "#3B82F6" }];
};
const skillGaps = cs => cs >= 80 ? ["Practise system design patterns", "Learn Docker & Kubernetes", "Improve API security"] : cs >= 60 ? ["Add error handling to functions", "Practise data structures daily", "Learn async/await"] : ["Study Big-O complexity", "Practise LeetCode Easy problems", "Read Clean Code (Robert Martin)"];
const aiAnalysis = cs => cs >= 75 ? { strengths: ["Clean modular structure", "Readable variable names", "Correct logic flow"], improvements: ["Add error handling", "Optimise nested loops", "Improve inline comments"] } : { strengths: ["Attempted the problem", "Basic structure in place"], improvements: ["Study the algorithm first", "Test edge cases carefully", "Refactor variable names"] };


export { scoreColor, integrityLabel, computeIntegrity, computeCodeScore, jobSuggestions, skillGaps, aiAnalysis };
