# SkillLens Phase 2 Implementation

## 1. Updated System Architecture (Phase 1 + Phase 2)

### Components
- Frontend (Vite + React): challenge session, analytics, dashboard, job board, dedicated career guidance page.
- Spring Backend (`skilllens-backend`): core orchestration and intelligence logic.
- Node Backend (`backend`): auth/session bridge with Supabase.
- Online Compiler (`online-compiler`): external code execution service support.
- PostgreSQL (Supabase-hosted): persistent profiles, submissions, role requirements, learning resources.

### Runtime Pipeline
1. User submits code.
2. `SubmissionController` calls `EvaluationService` for score and deep feedback.
3. Submission is persisted.
4. `SkillProfileService` updates profile/domain scores/acquired skills.
5. Phase 2 orchestration auto-runs:
   - `CareerGuidanceService`
   - `SkillGapService` (for top recommended role)
   - `RecommendationService`
   - `ProfileSignalService` progress insights
6. Backend returns one response with score + mentor insights.
7. Frontend renders results, dashboard, and guidance views.

## 2. Updated Database Schema

### Existing + Extended Tables
- `profiles`
  - `id`, `email`, `total_problems_solved`, `average_score`
  - domain scores: `score_dsa`, `score_web`, `score_ai`, `score_backend`
- `profile_strengths`
- `profile_weaknesses`
- `profile_roles`
- `profile_acquired_skills`
- `submissions`
  - `id`, `user_id`, `problem_id`, `code`, `language`, `score`, `passed_test_cases`, `total_test_cases`, `feedback`, `created_at`
- `submission_strengths`
- `submission_weaknesses`
- `submission_tips`
- `submission_concept_gaps`
- `problems`
- `problem_skills`
- `problem_testcases`
- `role_requirements`
- `role_required_skills`
- `role_domain_thresholds`
- `learning_resources`

### Seed Data Enhanced
- Role requirements expanded: Backend, Frontend, Full-Stack, AI/ML Engineer, Data Analyst.
- Learning resources expanded with domain and skill mappings.

## 3. Backend APIs (Complete)

### Submission
- `POST /api/submissions/submit`
  - Input: `userId`, `problemId/problemTitle`, `code`, `language`
  - Output includes:
    - score feedback payload
    - strengths/weaknesses/tips/concept gaps
    - updated profile
    - gap analysis
    - recommended resources
    - career guidance
    - progress insights

### User Intelligence APIs
- `GET /api/users/profile?userId=...`
- `POST /api/users/sync`
- `GET /api/users/gap-analysis?userId=...&roleName=...`
- `GET /api/users/learning-path?userId=...`
- `GET /api/users/career-guidance?userId=...`
- `GET /api/users/progress?userId=...`

## 4. Skill Gap Algorithm

Implemented in `SkillGapService`:
- Inputs:
  - profile domain scores + acquired skills
  - selected role requirements (skills + per-domain thresholds)
  - submission-derived failure ratios and momentum from `ProfileSignalService`
- Logic:
  - Missing skills = required skills not present in acquired skill set.
  - Domain fit = `min((adjustedDomainScore / threshold), 1.0)` averaged over required domains.
  - `adjustedDomainScore = userDomainScore - (failureRatio * 20)`
  - Skill coverage = matchedSkills / totalRequiredSkills.
  - Momentum contribution from recent-vs-previous trend.
  - Final readiness:
    - `readiness = 100 * (0.45*skillCoverage + 0.40*domainCoverage + 0.15*momentum)`
  - Confidence score from data sufficiency + consistency.

## 5. Learning Recommendation Engine

Implemented in `RecommendationService`:
- New users / low activity:
  - receives starter recommendations designed to gather signal quickly.
- Personalized ranking uses:
  - weak domain scores
  - domain failure ratio from recent submissions
  - missing skills from target role gap analysis
- Recommendation output shape:
  - `type`, `title`, `reason`, `url`, `associatedSkill`, `associatedDomain`, `priority`
- Final list is sorted by priority and capped.

## 6. Advanced Career Guidance Logic

Implemented in `CareerGuidanceService`:
- Computes role-fit against all role requirements.
- Scoring combines:
  - domain fit
  - required skill coverage
  - momentum
  - consistency
- Produces:
  - top recommended roles
  - alternatives
  - narrative reasoning (including conflicting signal commentary)
  - growth path
  - confidence score

## 7. Enhanced Feedback System

Implemented in `EvaluationService` and persisted in `Submission`:
- Beyond score, returns:
  - `strengths[]`
  - `weaknesses[]`
  - `improvementTips[]`
  - `conceptGaps[]`
- Uses:
  - execution correctness (where executable)
  - static quality checks (line quality, placeholders, modern patterns)
  - complexity heuristics (nested loops, optimization usage)
  - language fallback estimation when runtime execution is unavailable

## 8. Frontend Integration

### Added/Updated
- New page: `CareerGuidancePage.jsx`
  - top roles
  - reasoning
  - growth path
  - role-specific gap snapshot
  - progress tracking
  - prioritized learning recommendations
- Updated navigation with Guidance tab.
- Dashboard recommendation cards now render `reason` with backward compatibility.
- Existing session/results flow continues with enhanced backend result payload.

## 9. Example Scenarios

### Scenario A: New user with no submissions
- Career guidance returns low-confidence onboarding path.
- Learning recommendations prioritize foundational practice.
- Gap analysis confidence is reduced and explanation states limited evidence.

### Scenario B: Strong DSA + weak backend
- Career guidance may suggest Backend/Full-Stack but flags inconsistent backend depth.
- Gap analysis highlights backend threshold deficits and missing systems skills.
- Recommendations prioritize backend resources and architecture projects.

### Scenario C: Conflicting signals
- High web score but high backend failure ratio:
  - guidance narrative explicitly calls out signal conflict.
  - growth path advises balancing stacks and project practice.

## 10. End-to-End Flow Summary

Submission -> Evaluation -> Enhanced Feedback -> Profile Update -> Skill Gap Analysis -> Learning Recommendations -> Career Guidance -> Progress Insights -> UI rendering.

This is orchestrated automatically on `POST /api/submissions/submit` and also available via dedicated read APIs for dashboard/guidance pages.
