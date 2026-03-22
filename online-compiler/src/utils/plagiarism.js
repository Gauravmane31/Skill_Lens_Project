import { checkPlagiarism } from "../utils/plagiarism";
// Exact Match
export function exactMatch(code1, code2) {
  return code1.trim() === code2.trim();
}

// Text Similarity (Jaccard)
export function textSimilarity(code1, code2) {
  const words1 = new Set(code1.split(/\W+/));
  const words2 = new Set(code2.split(/\W+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Semantic Pattern Detection
function detectPattern(code) {
  if (code.includes("for") && code.includes("for")) return "nested_loop";
  if (code.includes("while")) return "loop";
  if (code.includes("map") || code.includes("reduce")) return "functional";
  return "unknown";
}

export function semanticCheck(code1, code2) {
  return detectPattern(code1) === detectPattern(code2);
}

// Final Combined Check
export function checkPlagiarism(code1, code2) {
  if (exactMatch(code1, code2)) return "🚨 100% Copy";

  const similarity = textSimilarity(code1, code2);

  if (similarity > 0.8) return "⚠️ High Similarity";

  if (semanticCheck(code1, code2)) return "🤖 Same Logic Detected";

  return "✅ Original Code";
}