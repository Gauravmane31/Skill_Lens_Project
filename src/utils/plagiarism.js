export function checkPlagiarism(code1, code2) {
  if (!code1 || !code2) return "0%";
  
  // Simple token-based similarity check
  const getTokens = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0);

  const tokens1 = getTokens(code1);
  const tokens2 = getTokens(code2);

  if (tokens1.length === 0 || tokens2.length === 0) return "0%";

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  const similarity = Math.round((intersection / Math.max(union, 1)) * 100);

  return `${similarity}%`;
}