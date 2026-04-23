// ============================================================
// services/aiService.js - Google Gemini AI Integration Service
// Uses Google Generative AI for real AI-powered features
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// ── AI Code Analysis ───────────────────────────────────────────
export async function analyzeCodeWithAI(code, language, challengeTitle = '') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `As an expert software engineer, analyze this ${language} code for the "${challengeTitle}" problem.

Provide a detailed analysis covering:
1. Code Quality (readability, structure, naming conventions)
2. Algorithm Efficiency (time/space complexity)
3. Correctness (logic, edge cases, potential bugs)
4. Best Practices (language-specific patterns, error handling)
5. Specific improvements with concrete suggestions

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format:
{
  "score": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<improvement 1>", "<improvement 2>", ...],
  "complexity": {
    "time": "<Big O notation>",
    "space": "<Big O notation>"
  },
  "suggestions": ["<specific suggestion 1>", "<specific suggestion 2>", ...]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed
      };
    } else {
      throw new Error('Invalid JSON response from Gemini');
    }

  } catch (error) {
    console.error('Gemini Code Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        score: 70,
        strengths: ["Code structure is present", "Attempted the problem"],
        improvements: ["Add more comments", "Consider edge cases"],
        complexity: { time: "O(n)", space: "O(1)" },
        suggestions: ["Review algorithm approach", "Test with edge cases"]
      }
    };
  }
}

// ── AI Job Suggestions ───────────────────────────────────────────
export async function getJobSuggestionsWithAI(userProfile, submissions = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const avgCodeScore = submissions.length 
      ? submissions.reduce((sum, s) => sum + Number(s.code_score || 0), 0) / submissions.length 
      : 50;
    const avgIntegrityScore = submissions.length
      ? submissions.reduce((sum, s) => sum + Number(s.integrity_score || 0), 0) / submissions.length
      : 50;

    const prompt = `As a career counselor and tech recruiter, analyze this candidate profile and suggest the most suitable job roles.

Candidate Profile:
- Average Code Score: ${avgCodeScore}/100
- Average Integrity Score: ${avgIntegrityScore}/100
- Total Submissions: ${submissions.length}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Experience Level: ${userProfile.experience || 'Entry level'}

Based on this profile, provide:
1. Top 3 recommended job roles with match percentages (0-100%)
2. Key strengths that make them suitable
3. Skills to develop for each role
4. Salary expectations (entry/mid/senior if applicable)

Respond in JSON format:
{
  "recommendations": [
    {
      "role": "<Job Role>",
      "matchPercentage": <number>,
      "strengths": ["<strength 1>", "<strength 2>"],
      "skillsToDevelop": ["<skill 1>", "<skill 2>"],
      "salaryRange": "<salary range>"
    }
  ],
  "overallAssessment": "<brief assessment>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed
      };
    } else {
      throw new Error('Invalid JSON response from Gemini');
    }

  } catch (error) {
    console.error('Gemini Job Suggestions Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        recommendations: [
          {
            role: "Junior Developer",
            matchPercentage: 65,
            strengths: ["Problem-solving skills", "Code submission consistency"],
            skillsToDevelop: ["System design", "Advanced algorithms"],
            salaryRange: "$60k-80k"
          }
        ],
        overallAssessment: "Candidate shows potential but needs more experience"
      }
    };
  }
}

// ── AI Skill Gap Analysis ────────────────────────────────────────
export async function analyzeSkillGapsWithAI(userProfile, targetRole, submissions = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `As a technical mentor, analyze this developer's profile and identify skill gaps for their target role.

Current Profile:
- Target Role: ${targetRole}
- Average Code Score: ${submissions.length ? submissions.reduce((sum, s) => sum + Number(s.code_score || 0), 0) / submissions.length : 50}/100
- Submissions: ${submissions.length} problems solved
- Current Skills: ${userProfile.skills?.join(', ') || 'Not specified'}

Provide a comprehensive skill gap analysis:
1. Missing critical skills for ${targetRole}
2. Recommended learning path (prioritized)
3. Specific projects/exercises to bridge gaps
4. Timeline estimation for readiness
5. Resources for each skill area

Respond in JSON format:
{
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "learningPath": [
    {
      "priority": "<High/Medium/Low>",
      "skill": "<skill name>",
      "resources": ["<resource 1>", "<resource 2>"],
      "estimatedTime": "<timeframe>",
      "practiceExercises": ["<exercise 1>", "<exercise 2>"]
    }
  ],
  "readinessTimeline": "<timeline>",
  "confidenceLevel": <number 0-100>
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed
      };
    } else {
      throw new Error('Invalid JSON response from Gemini');
    }

  } catch (error) {
    console.error('Gemini Skill Gap Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        missingSkills: ["System Design", "Database Optimization"],
        learningPath: [
          {
            priority: "High",
            skill: "System Design",
            resources: ["Designing Data-Intensive Applications", "System Design Primer"],
            estimatedTime: "2-3 months",
            practiceExercises: ["Design a URL shortener", "Design a messaging system"]
          }
        ],
        readinessTimeline: "6-8 months with consistent practice",
        confidenceLevel: 60
      }
    };
  }
}

// ── AI Career Guidance ───────────────────────────────────────────
export async function getCareerGuidanceWithAI(userProfile, submissions = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const avgScore = submissions.length 
      ? submissions.reduce((sum, s) => sum + Number(s.code_score || 0), 0) / submissions.length 
      : 50;

    const prompt = `As an experienced tech career coach, provide personalized career guidance based on this developer's profile.

Profile Analysis:
- Average Performance: ${avgScore}/100
- Problems Solved: ${submissions.length}
- Skills: ${userProfile.skills?.join(', ') || 'Developing'}
- Goals: ${userProfile.careerGoals || 'Not specified'}

Provide actionable career advice covering:
1. Current market position and competitiveness
2. Immediate next steps for career growth
3. Long-term career trajectory recommendations
4. Companies/roles to target based on current level
5. Networking and personal branding strategies

Respond in JSON format:
{
  "currentLevel": "<assessment of current level>",
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "longTermVision": "<5-year career outlook>",
  "targetCompanies": ["<company 1>", "<company 2>"],
  "networkingStrategies": ["<strategy 1>", "<strategy 2>"],
  "marketReadiness": <percentage 0-100>
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed
      };
    } else {
      throw new Error('Invalid JSON response from Gemini');
    }

  } catch (error) {
    console.error('Gemini Career Guidance Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        currentLevel: "Early career developer with foundational skills",
        nextSteps: ["Build portfolio projects", "Contribute to open source", "Network at tech meetups"],
        longTermVision: "Progress to mid-level developer role within 2-3 years",
        targetCompanies: "Startups and mid-sized tech companies",
        networkingStrategies: ["GitHub presence", "LinkedIn engagement", "Local tech communities"],
        marketReadiness: 65
      }
    };
  }
}

// ── AI Resume Analysis ───────────────────────────────────────────
export async function analyzeResumeWithAI(resumeText, targetRole = '') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `As an experienced technical recruiter, analyze this resume and provide detailed feedback.

Resume Content:
${resumeText}

Target Role: ${targetRole || 'Software Developer'}

Provide analysis on:
1. Resume structure and formatting
2. Technical skills presentation
3. Project descriptions and impact
4. Experience relevance
5. Areas for improvement

Respond in JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>"],
  "formattingFeedback": "<formatting advice>",
  "atsOptimization": "<ATS optimization tips>"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed
      };
    } else {
      throw new Error('Invalid JSON response from Gemini');
    }

  } catch (error) {
    console.error('Gemini Resume Analysis Error:', error);
    return {
      success: false,
      error: error.message,
      fallback: {
        overallScore: 70,
        strengths: ["Has technical content", "Includes experience section"],
        improvements: ["Add quantifiable achievements", "Improve formatting"],
        missingKeywords: ["Agile", "Cloud"],
        formattingFeedback: "Use consistent formatting and clear sections",
        atsOptimization: "Include standard section headers and keywords"
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
