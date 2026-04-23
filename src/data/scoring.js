import { C } from './constants/constants.js';
import { analyzeCodeWithAI } from '../utils/aiApi.js';

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

// ── AI-Powered Analysis Functions ─────────────────────────────────────────────────

// Replace dummy aiAnalysis with real AI integration
async function aiAnalysis(codeScore, code = '', language = 'javascript', challengeTitle = '') {
  try {
    // Try to get AI analysis first
    const aiResult = await analyzeCodeWithAI(code, language, challengeTitle);
    
    if (aiResult.success) {
      return {
        strengths: aiResult.data.strengths || ['Good attempt'],
        improvements: aiResult.data.improvements || ['Keep practicing'],
        score: aiResult.data.score || codeScore,
        complexity: aiResult.data.complexity || { time: 'O(n)', space: 'O(1)' },
        suggestions: aiResult.data.suggestions || ['Review algorithm approach']
      };
    } else {
      // Fallback to rule-based if AI fails
      return fallbackAIAnalysis(codeScore);
    }
  } catch (error) {
    console.error('AI Analysis failed, using fallback:', error);
    return fallbackAIAnalysis(codeScore);
  }
}

// Fallback function when AI is unavailable
function fallbackAIAnalysis(codeScore) {
  if (codeScore >= 75) {
    return { 
      strengths: ["Clean modular structure", "Readable variable names", "Correct logic flow"], 
      improvements: ["Add error handling", "Optimise nested loops", "Improve inline comments"],
      suggestions: ["Consider edge cases", "Add input validation", "Document your approach"]
    };
  }
  return { 
    strengths: ["Attempted problem", "Basic structure in place"], 
    improvements: ["Study algorithm first", "Test edge cases carefully", "Refactor variable names"],
    suggestions: ["Review similar problems", "Practice with simpler cases", "Study solution patterns"]
  };
}

// Replace dummy jobSuggestions with AI integration
async function jobSuggestions(avgCode, avgIntegrity, userProfile = {}, submissions = []) {
  try {
    const { getJobSuggestionsWithAI } = await import('../utils/aiApi.js');
    const aiResult = await getJobSuggestionsWithAI(userProfile, submissions);
    
    if (aiResult.success) {
      return aiResult.data.recommendations.map(rec => ({
        role: rec.role,
        prob: rec.matchPercentage,
        color: rec.matchPercentage >= 75 ? C.indigo : rec.matchPercentage >= 60 ? C.green : C.amber
      }));
    } else {
      return fallbackJobSuggestions(avgCode, avgIntegrity);
    }
  } catch (error) {
    console.error('AI Job Suggestions failed, using fallback:', error);
    return fallbackJobSuggestions(avgCode, avgIntegrity);
  }
}

// Fallback job suggestions
function fallbackJobSuggestions(avgCode, avgIntegrity) {
  const avg = (avgCode + avgIntegrity) / 2;
  if (avg >= 80) return [{ role: "Backend Developer", prob: 78, color: C.indigo }, { role: "Full-Stack Engineer", prob: 71, color: C.green }, { role: "Software Engineer II", prob: 65, color: C.amber }];
  if (avg >= 65) return [{ role: "Junior Developer", prob: 72, color: C.indigo }, { role: "Frontend Developer", prob: 61, color: "#3B82F6" }, { role: "QA Engineer", prob: 55, color: C.green }];
  return [{ role: "Intern / Trainee", prob: 68, color: C.indigo }, { role: "Technical Support", prob: 60, color: "#3B82F6" }];
}

// Replace dummy skillGaps with AI integration
async function skillGaps(codeScore, userProfile = {}, targetRole = '') {
  try {
    const { analyzeSkillGapsWithAI } = await import('../utils/aiApi.js');
    const aiResult = await analyzeSkillGapsWithAI(userProfile, targetRole);
    
    if (aiResult.success) {
      return aiResult.data.missingSkills || ['Keep practicing core concepts'];
    } else {
      return fallbackSkillGaps(codeScore);
    }
  } catch (error) {
    console.error('AI Skill Gaps failed, using fallback:', error);
    return fallbackSkillGaps(codeScore);
  }
}

// Fallback skill gaps
function fallbackSkillGaps(codeScore) {
  if (codeScore >= 80) return ["Practise system design patterns", "Learn Docker & Kubernetes", "Improve API security"];
  if (codeScore >= 60) return ["Add error handling to functions", "Practise data structures daily", "Learn async/await"];
  return ["Study Big-O complexity", "Practise LeetCode Easy problems", "Read Clean Code (Robert Martin)"];
}

export { scoreColor, integrityLabel, computeIntegrity, computeCodeScore, jobSuggestions, skillGaps, aiAnalysis };
