// ============================================================
// utils/aiApi.js - Frontend AI API Integration
// Handles communication with backend AI endpoints
// ============================================================

import { supabase } from './supabase.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session found. Please log in again.');
  }

  return session.access_token;
};

// ── AI Code Analysis ───────────────────────────────────────────
export async function analyzeCodeWithAI(code, language, challengeTitle = '') {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${BACKEND_URL}/api/ai/analyze-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code, language, challengeTitle }),
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('AI Code Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        score: 70,
        strengths: ['Code structure is present', 'Attempted the problem'],
        improvements: ['Add more comments', 'Consider edge cases'],
        complexity: { time: 'O(n)', space: 'O(1)' },
        suggestions: ['Review algorithm approach', 'Test with edge cases']
      }
    };
  }
}

// ── AI Job Suggestions ───────────────────────────────────────────
export async function getJobSuggestionsWithAI(userProfile, submissions = []) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${BACKEND_URL}/api/ai/job-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userProfile, submissions }),
    });

    if (!response.ok) {
      throw new Error(`AI job suggestions failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('AI Job Suggestions Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        recommendations: [
          {
            role: 'Junior Developer',
            matchPercentage: 65,
            strengths: ['Problem-solving skills', 'Code submission consistency'],
            skillsToDevelop: ['System design', 'Advanced algorithms'],
            salaryRange: '$60k-80k'
          }
        ],
        overallAssessment: 'Candidate shows potential but needs more experience'
      }
    };
  }
}

// ── AI Skill Gap Analysis ────────────────────────────────────────
export async function analyzeSkillGapsWithAI(userProfile, targetRole, submissions = []) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${BACKEND_URL}/api/ai/skill-gaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userProfile, targetRole, submissions }),
    });

    if (!response.ok) {
      throw new Error(`AI skill gap analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('AI Skill Gap Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        missingSkills: ['System Design', 'Database Optimization'],
        learningPath: [
          {
            priority: 'High',
            skill: 'System Design',
            resources: ['Designing Data-Intensive Applications', 'System Design Primer'],
            estimatedTime: '2-3 months',
            practiceExercises: ['Design a URL shortener', 'Design a messaging system']
          }
        ],
        readinessTimeline: '6-8 months with consistent practice',
        confidenceLevel: 60
      }
    };
  }
}

// ── AI Career Guidance ───────────────────────────────────────────
export async function getCareerGuidanceWithAI(userProfile, submissions = []) {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${BACKEND_URL}/api/ai/career-guidance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userProfile, submissions }),
    });

    if (!response.ok) {
      throw new Error(`AI career guidance failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('AI Career Guidance Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        currentLevel: 'Early career developer with foundational skills',
        nextSteps: ['Build portfolio projects', 'Contribute to open source', 'Network at tech meetups'],
        longTermVision: 'Progress to mid-level developer role within 2-3 years',
        targetCompanies: 'Startups and mid-sized tech companies',
        networkingStrategies: ['GitHub presence', 'LinkedIn engagement', 'Local tech communities'],
        marketReadiness: 65
      }
    };
  }
}

// ── AI Resume Analysis ───────────────────────────────────────────
export async function analyzeResumeWithAI(resumeText, targetRole = '') {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${BACKEND_URL}/api/ai/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ resumeText, targetRole }),
    });

    if (!response.ok) {
      throw new Error(`AI resume analysis failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('AI Resume Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        overallScore: 70,
        strengths: ['Has technical content', 'Includes experience section'],
        improvements: ['Add quantifiable achievements', 'Improve formatting'],
        missingKeywords: ['Agile', 'Cloud'],
        formattingFeedback: 'Use consistent formatting and clear sections',
        atsOptimization: 'Include standard section headers and keywords'
      }
    };
  }
}

export default {
  analyzeCodeWithAI,
  getJobSuggestionsWithAI,
  analyzeSkillGapsWithAI,
  getCareerGuidanceWithAI,
  analyzeResumeWithAI
};
