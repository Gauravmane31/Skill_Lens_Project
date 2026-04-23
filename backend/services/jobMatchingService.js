const DOMAIN_SKILL_MAP = {
  Arrays: ["Array", "HashMap", "Two Pointers", "JavaScript", "Python"],
  "Linked Lists": ["Pointers", "Data Structures", "Java", "C++"],
  Search: ["Binary Search", "Problem Solving", "Complexity Analysis"],
  Stack: ["Stack", "String Parsing", "Validation"],
  "Dynamic Programming": ["Dynamic Programming", "Recursion", "Optimization"],
  Strings: ["String", "Regex", "Pattern Matching"],
  Graphs: ["Graph", "BFS", "DFS"],
  Design: ["System Design", "Caching", "OOP"],
};

const ROLE_KEYWORDS = {
  "Frontend Engineer": ["react", "javascript", "typescript", "css", "frontend"],
  "Backend Engineer": ["node", "express", "sql", "postgresql", "backend", "api"],
  "Full-Stack Developer": ["react", "node", "api", "javascript", "sql"],
  "Data Engineer": ["python", "sql", "spark", "etl", "kafka"],
  "ML Engineer": ["python", "machine learning", "pytorch", "tensorflow", "nlp"],
};

const toSafeString = (value = "") => String(value || "").trim();

const normalizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];
  return Array.from(
    new Set(
      skills
        .map((skill) => toSafeString(skill).toLowerCase())
        .filter(Boolean)
    )
  );
};

export function deriveRoleRecommendations(avgCode = 0, avgIntegrity = 0) {
  const confidence = Math.round(avgCode * 0.7 + avgIntegrity * 0.3);
  if (confidence >= 88) return ["Backend Engineer", "Full-Stack Developer", "ML Engineer"];
  if (confidence >= 75) return ["Full-Stack Developer", "Frontend Engineer", "Data Engineer"];
  if (confidence >= 62) return ["Frontend Engineer", "Backend Engineer", "Software Engineer Intern"];
  return ["Software Engineer Intern", "Junior Developer", "Trainee Engineer"];
}

export function buildDomainScores(submissions = [], challengeDomainMap = new Map()) {
  const tally = new Map();

  submissions.forEach((item) => {
    const domain = challengeDomainMap.get(Number(item.challenge_id)) || "General";
    const prev = tally.get(domain) || { total: 0, count: 0 };
    prev.total += Number(item.code_score || 0);
    prev.count += 1;
    tally.set(domain, prev);
  });

  return Array.from(tally.entries())
    .map(([domain, stats]) => ({
      domain,
      score: stats.count ? Math.round(stats.total / stats.count) : 0,
    }))
    .sort((a, b) => b.score - a.score);
}

export function buildCandidateSignals({
  profile = {},
  resumeProfile = {},
  submissions = [],
  challengeDomainMap = new Map(),
}) {
  const avgCode = submissions.length
    ? Math.round(submissions.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / submissions.length)
    : 0;
  const avgIntegrity = submissions.length
    ? Math.round(submissions.reduce((sum, item) => sum + Number(item.integrity_score || 0), 0) / submissions.length)
    : 0;

  const readinessScore = Math.min(100, Math.max(0, Math.round(avgCode * 0.65 + avgIntegrity * 0.35)));

  const domainScores = buildDomainScores(submissions, challengeDomainMap);
  const topDomains = domainScores.slice(0, 3).map((entry) => entry.domain);

  const parsedProfile = resumeProfile?.profile && typeof resumeProfile.profile === "object"
    ? resumeProfile.profile
    : {};
  const resumeSkills = Array.isArray(parsedProfile.skills) ? parsedProfile.skills : [];

  const inferredSkills = topDomains.flatMap((domain) => DOMAIN_SKILL_MAP[domain] || []);
  const knownSkills = normalizeSkills([...(resumeSkills || []), ...inferredSkills]);

  return {
    userId: profile.id,
    name: profile.name || profile.email || "Candidate",
    email: profile.email || "",
    points: Number(profile.points || 0),
    avgCode,
    avgIntegrity,
    readinessScore,
    topDomains,
    knownSkills,
    roleRecommendations: deriveRoleRecommendations(avgCode, avgIntegrity),
  };
}

export function calculateJobMatch(job = {}, candidateSignals = {}) {
  const requiredSkills = normalizeSkills(job.required_skills || job.requiredSkills || []);
  const candidateSkills = normalizeSkills(candidateSignals.knownSkills || []);

  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(skill));
  const skillMatchPercent = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const domain = toSafeString(job.domain);
  const topDomains = Array.isArray(candidateSignals.topDomains) ? candidateSignals.topDomains : [];
  const domainAlignment = !domain
    ? 60
    : topDomains.includes(domain)
      ? 100
      : topDomains.length
        ? 55
        : 35;

  const readinessScore = Number(candidateSignals.readinessScore || 0);

  const roleHints = (candidateSignals.roleRecommendations || [])
    .flatMap((role) => ROLE_KEYWORDS[role] || []);
  const roleKeywordHits = requiredSkills.filter((skill) => roleHints.includes(skill)).length;
  const roleAlignment = requiredSkills.length
    ? Math.round((roleKeywordHits / requiredSkills.length) * 100)
    : 0;

  const matchScore = Math.round(
    skillMatchPercent * 0.45 + domainAlignment * 0.2 + readinessScore * 0.25 + roleAlignment * 0.1
  );

  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.includes(skill));

  const matchReasons = [];
  if (skillMatchPercent >= 75) matchReasons.push("Strong required-skill overlap");
  if (domainAlignment >= 90) matchReasons.push("High domain alignment with your submissions");
  if (readinessScore >= 70) matchReasons.push("Readiness score indicates interview preparedness");
  if (roleAlignment >= 60) matchReasons.push("Role recommendations align with job expectations");
  if (!matchReasons.length) matchReasons.push("Partial match found, focus on missing skills for better fit");

  return {
    matchScore: Math.min(100, Math.max(0, matchScore)),
    skillMatchPercent,
    domainAlignment,
    readinessScore,
    matchReasons,
    missingSkills,
  };
}
