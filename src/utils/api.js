import { supabase } from './supabase.js';
import { CHALLENGES } from '../data/constants.js';
import { aiAnalysis, jobSuggestions, skillGaps } from '../data/scoring.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CHALLENGE_BY_ID = new Map(CHALLENGES.map((challenge) => [Number(challenge.id), challenge]));
const CHALLENGE_BY_TITLE = new Map(CHALLENGES.map((challenge) => [challenge.title, challenge]));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const startOfDayUtc = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const dayDiff = (a, b) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDayUtc(a).getTime() - startOfDayUtc(b).getTime()) / msPerDay);
};

const normalizeChallenge = (challenge = {}) => {
  const meta = CHALLENGE_BY_ID.get(Number(challenge.id)) || CHALLENGE_BY_TITLE.get(challenge.title);
  const domain = challenge.domain || challenge.category || meta?.category || 'General';

  return {
    ...meta,
    ...challenge,
    id: Number(challenge.id ?? meta?.id),
    title: challenge.title || meta?.title || 'Untitled Challenge',
    description: challenge.description || meta?.description || 'No description available.',
    domain,
    category: domain,
    difficulty: challenge.difficulty || meta?.difficulty || 'Easy',
    xp: Number(challenge.xp ?? meta?.xp ?? 100),
    timeLimit: Number(challenge.timeLimit ?? challenge.time_limit ?? meta?.timeLimit ?? 30),
    starterCode: challenge.starterCode || challenge.starter_code || meta?.starterCode || {},
    testCases: challenge.testCases || challenge.test_cases || meta?.testCases || [],
    hints: challenge.hints || meta?.hints || [],
    tags: challenge.tags || meta?.tags || [domain],
  };
};

const mapWeaknessToSkill = (weakness) => {
  const value = (weakness || '').toLowerCase();
  if (value.includes('array')) return 'Arrays and Hashing';
  if (value.includes('dynamic')) return 'Dynamic Programming';
  if (value.includes('graph')) return 'Graphs and Traversals';
  if (value.includes('time complexity')) return 'Complexity Analysis';
  if (value.includes('edge case')) return 'Edge-Case Testing';
  if (value.includes('error handling')) return 'Robust Error Handling';
  return 'Problem Solving Fundamentals';
};

const buildAnalysis = (submissions = []) => {
  if (!submissions.length) {
    return {
      avgCode: 0,
      avgIntegrity: 0,
      confidenceScore: 40,
      recommendedRoles: ['Intern / Trainee'],
      weaknesses: ['General'],
      strengths: ['Keep solving challenges to unlock detailed strengths.'],
      growthPath: 'Complete at least 3 coding sessions to unlock better career recommendations.',
      reasoning: 'Not enough submission data yet. Continue coding to build your profile.',
      readinessScore: 35,
      consistencyScore: 35,
      momentumScore: 35,
    };
  }

  const avgCode = Math.round(submissions.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / submissions.length);
  const avgIntegrity = Math.round(submissions.reduce((sum, item) => sum + Number(item.integrity_score || 0), 0) / submissions.length);
  const confidenceScore = clamp(Math.round(avgCode * 0.7 + avgIntegrity * 0.3), 0, 100);

  const categoryMap = new Map();
  submissions.forEach((submission) => {
    const challenge = CHALLENGE_BY_ID.get(Number(submission.challenge_id));
    const category = challenge?.category || 'General';
    const current = categoryMap.get(category) || { total: 0, count: 0 };
    current.total += Number(submission.code_score || 0);
    current.count += 1;
    categoryMap.set(category, current);
  });

  const sortedCategories = Array.from(categoryMap.entries())
    .map(([category, values]) => ({ category, avg: values.total / values.count }))
    .sort((a, b) => a.avg - b.avg);

  const weaknesses = sortedCategories.slice(0, 3).map((entry) => entry.category);
  const roleSuggestions = jobSuggestions(avgCode, avgIntegrity);
  const recommendedRoles = roleSuggestions.map((role) => role.role);
  const strengths = aiAnalysis(avgCode).strengths;

  const recent = submissions.slice(0, 5);
  const previous = submissions.slice(5, 10);
  const recentAvg = recent.length
    ? recent.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / recent.length
    : avgCode;
  const previousAvg = previous.length
    ? previous.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / previous.length
    : recentAvg;

  const momentumScore = clamp(50 + (recentAvg - previousAvg), 0, 100);
  const variance = recent.length
    ? recent.reduce((sum, item) => {
        const score = Number(item.code_score || 0);
        return sum + Math.pow(score - recentAvg, 2);
      }, 0) / recent.length
    : 0;
  const consistencyScore = clamp(Math.round(100 - Math.sqrt(variance)), 0, 100);
  const readinessScore = clamp(Math.round((avgCode + avgIntegrity + momentumScore) / 3), 0, 100);

  return {
    avgCode,
    avgIntegrity,
    confidenceScore,
    recommendedRoles,
    weaknesses: weaknesses.length ? weaknesses : skillGaps(avgCode),
    strengths,
    growthPath:
      confidenceScore >= 80
        ? 'You are close to interview-ready. Focus on system design and production-grade practices.'
        : confidenceScore >= 65
          ? 'Build consistency with medium-level problems and improve edge-case handling.'
          : 'Strengthen fundamentals with easy and medium problems before attempting advanced topics.',
    reasoning: `Based on ${submissions.length} submissions, your average code score is ${avgCode} and integrity is ${avgIntegrity}.`,
    readinessScore,
    consistencyScore,
    momentumScore,
  };
};

const ensureAuthenticatedUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('You must be logged in to use this feature.');
  }

  return user;
};

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session found. Please log in again.');
  }

  return session.access_token;
};

const backendRequest = async (path, options = {}) => {
  const token = await getAccessToken();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}`);
  }

  return payload;
};

const ensureProfile = async (user, overrides = {}) => {
  const name = overrides.name || user.user_metadata?.full_name || user.email;
  const avatar = overrides.avatar || user.user_metadata?.avatar_url || (name ? name.charAt(0).toUpperCase() : 'U');

  const upsertPayload = {
    id: user.id,
    email: overrides.email || user.email,
    name,
    avatar,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const fetchUserSubmissions = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
};

export const fetchProblems = async (domain = '') => {
  const { data, error } = await supabase.from('challenges').select('*').order('id', { ascending: true });

  const sourceChallenges = error || !data?.length ? CHALLENGES : data;
  const challenges = sourceChallenges.map(normalizeChallenge);

  if (!domain) {
    return challenges;
  }

  return challenges.filter((item) => item.domain === domain || item.category === domain);
};

export const fetchProblemById = async (id) => {
  const normalizedId = Number(id);
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', normalizedId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return normalizeChallenge(data);
  }

  const fallback = CHALLENGE_BY_ID.get(normalizedId);
  return normalizeChallenge(fallback || {});
};

export const syncUserProfile = async (_userId, _email, name = '', avatar = '') => {
  const user = await ensureAuthenticatedUser();
  return ensureProfile(user, { name, avatar });
};

export const submitCode = async (payload) => {
  const user = await ensureAuthenticatedUser();
  const profile = await ensureProfile(user);

  const challengeId = Number(payload.challengeId ?? payload.problemId);
  const codeScore = Number(payload.codeScore ?? 0);
  const integrityScore = Number(payload.integrityScore ?? 0);
  const timeTaken = Number(payload.timeTaken ?? 0);
  const lang = payload.lang || payload.language || 'javascript';
  const code = payload.code || '';
  const metrics = payload.metrics || {
    keystrokes: 0,
    pasteEvents: 0,
    largestPaste: 0,
    pasteChars: 0,
    tabSwitches: 0,
    typingDuration: 0,
  };

  const challenge = CHALLENGE_BY_ID.get(challengeId);
  const challengeTitle = payload.challengeTitle || challenge?.title || 'Challenge';
  const createdAt = new Date().toISOString();

  const insertPayload = {
    user_id: user.id,
    challenge_id: challengeId,
    challenge_title: challengeTitle,
    lang,
    code,
    code_score: codeScore,
    integrity_score: integrityScore,
    time_taken: timeTaken,
    metrics,
    created_at: createdAt,
  };

  const { error: insertError } = await supabase.from('submissions').insert(insertPayload);
  if (insertError) {
    throw insertError;
  }

  const { data: latestSubmissionBeforeCurrent } = await supabase
    .from('submissions')
    .select('created_at')
    .eq('user_id', user.id)
    .lt('created_at', createdAt)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextStreak = Number(profile.streak || 0);
  if (!latestSubmissionBeforeCurrent?.created_at) {
    nextStreak = 1;
  } else {
    const diff = dayDiff(createdAt, latestSubmissionBeforeCurrent.created_at);
    if (diff === 0) {
      nextStreak = Math.max(nextStreak, 1);
    } else if (diff === 1) {
      nextStreak = Math.max(nextStreak + 1, 1);
    } else {
      nextStreak = 1;
    }
  }

  const pointsEarned = Number(challenge?.xp ?? 100);
  const nextPoints = Number(profile.points || 0) + pointsEarned;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points: nextPoints, streak: nextStreak, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateError) {
    throw updateError;
  }

  const ai = aiAnalysis(codeScore);
  return {
    score: codeScore,
    strengths: ai.strengths,
    weaknesses: ai.improvements,
    improvementTips: ai.improvements,
    conceptGaps: skillGaps(codeScore),
  };
};

export const fetchUserProfile = async () => {
  const user = await ensureAuthenticatedUser();
  const profile = await ensureProfile(user);
  const submissions = await fetchUserSubmissions(user.id, 50);
  const analysis = buildAnalysis(submissions);

  return {
    ...profile,
    averageCodeScore: analysis.avgCode,
    averageIntegrityScore: analysis.avgIntegrity,
    recommendedRoles: analysis.recommendedRoles,
    weaknesses: analysis.weaknesses,
    strengths: analysis.strengths,
    totalSubmissions: submissions.length,
  };
};

export const fetchCareerGuidance = async () => {
  const user = await ensureAuthenticatedUser();
  const submissions = await fetchUserSubmissions(user.id, 50);
  const analysis = buildAnalysis(submissions);

  return {
    recommendedRoles: analysis.recommendedRoles,
    confidenceScore: analysis.confidenceScore,
    reasoning: analysis.reasoning,
    growthPath: analysis.growthPath,
  };
};

export const fetchGapAnalysis = async (_userId, roleName = 'Target Role') => {
  const user = await ensureAuthenticatedUser();
  const submissions = await fetchUserSubmissions(user.id, 50);
  const analysis = buildAnalysis(submissions);

  return {
    roleName,
    readinessScore: analysis.readinessScore,
    explanation: `Your current readiness for ${roleName} is based on code quality, integrity, and recent momentum.`,
    missingSkills: analysis.weaknesses.map(mapWeaknessToSkill),
  };
};

export const fetchLearningPath = async () => {
  const user = await ensureAuthenticatedUser();
  const submissions = await fetchUserSubmissions(user.id, 50);
  const analysis = buildAnalysis(submissions);

  const recommendations = analysis.weaknesses.flatMap((weakness, index) => [
    {
      title: `${weakness} Deep Practice`,
      type: index === 0 ? 'priority' : 'practice',
      reason: `Focus area identified from your recent submissions in ${weakness}.`,
      reasonTemplate: `Practice more ${weakness} problems to improve your confidence and speed.`,
      url: 'https://neetcode.io/roadmap',
    },
    {
      title: `${mapWeaknessToSkill(weakness)} Fundamentals`,
      type: 'learning',
      reason: `Strengthen theoretical understanding to avoid repeated mistakes in ${weakness}.`,
      reasonTemplate: 'Review core concepts and then solve 3-5 targeted challenges.',
      url: 'https://www.geeksforgeeks.org/explore?page=1&sortBy=submissions',
    },
  ]);

  return recommendations.slice(0, 8);
};

export const fetchProgressInsights = async () => {
  const user = await ensureAuthenticatedUser();
  const submissions = await fetchUserSubmissions(user.id, 20);

  if (!submissions.length) {
    return {
      recentAverageScore: 0,
      previousAverageScore: 0,
      momentumScore: 0,
      consistencyScore: 0,
    };
  }

  const recent = submissions.slice(0, 5);
  const previous = submissions.slice(5, 10);

  const recentAverageScore = Math.round(
    recent.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / recent.length,
  );
  const previousAverageScore = previous.length
    ? Math.round(previous.reduce((sum, item) => sum + Number(item.code_score || 0), 0) / previous.length)
    : recentAverageScore;

  const momentumScore = clamp(50 + (recentAverageScore - previousAverageScore), 0, 100);
  const variance = recent.reduce((sum, item) => {
    const score = Number(item.code_score || 0);
    return sum + Math.pow(score - recentAverageScore, 2);
  }, 0) / recent.length;
  const consistencyScore = clamp(Math.round(100 - Math.sqrt(variance)), 0, 100);

  return {
    recentAverageScore,
    previousAverageScore,
    momentumScore,
    consistencyScore,
  };
};

export const loadResumeProfile = async () => {
  const payload = await backendRequest('/api/profile/resume', { method: 'GET' });
  return payload?.profile || null;
};

export const saveResumeProfile = async ({
  profile,
  resumeText = '',
  resumeFileName = '',
  resumeFileData = '',
  resumeFileMime = '',
  resumeFileSize = 0,
}) => {
  return backendRequest('/api/profile/resume', {
    method: 'PUT',
    body: JSON.stringify({
      profile,
      resumeText,
      resumeFileName,
      resumeFileData,
      resumeFileMime,
      resumeFileSize,
    }),
  });
};
