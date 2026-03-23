# 🎓 SkillLens - Setup Guide & Complete Documentation

**Project:** SkillLens - AI-Powered Coding Evaluation Platform  
**Version:** 2.0 (Supabase-only Backend)  
**Status:** ✅ Ready for Testing  
**Last Updated:** March 23, 2026  

---

## 📋 TABLE OF CONTENTS

1. [Quick Start (5 min)](#quick-start)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Setup Instructions](#setup-instructions)
5. [Features & Testing](#features--testing)
6. [Complete Feature Verification](#complete-feature-verification)
7. [Troubleshooting](#troubleshooting)
8. [Command Reference](#command-reference)

---

## 🚀 Quick Start

### What You Need First

**⚠️ CRITICAL: Enable Email Authentication**

Your Supabase project has Email auth disabled by default. Users cannot signup/login without this.

```
1. Go to: https://app.supabase.com/project/ihzgdbcayhwujtjdcjmn/auth/providers
2. Find "Email / Password" provider
3. Toggle: OFF → ON (turns GREEN)
4. Click SAVE
5. Wait 10-15 seconds
```

### Start Services

```powershell
Push-Location "d:\GDG hackthon\Skill_Lens\Skill_Lens"
npm run dev:all
```

**Expected Output:**
```
frontend | VITE v5.0.8 running at:
frontend | ➜  local:   http://localhost:3000/

compiler | listening on port 4000
```

### Verify Services

```powershell
# Frontend
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
# Should return: StatusCode 200

# Compiler
Invoke-WebRequest http://localhost:4000/api/languages -UseBasicParsing
# Should return: StatusCode 200 + list of languages
```

### Test in Browser

1. Open: http://localhost:3000
2. Click "Sign Up"
3. Enter: `demo@test.com` | Password: `Test123@Secure`
4. Click "Sign Up" → Should succeed
5. Go to "Challenges" page
6. Submit any code → Check results
7. Go to "Dashboard" → See updated points
8. Go to "Leaderboard" → See yourself ranked

✅ If all steps work → System is operational!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           SkillLens Frontend (React + Vite)             │
│              http://localhost:3000                      │
│                                                         │
│  • Signup/Login (Email Auth)                           │
│  • Challenges Page (Code Editor)                       │
│  • Dashboard (User Statistics)                         │
│  • Leaderboard (Real-time Rankings)                    │
│  • Code Submission & Execution                         │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌────────────┐
   │Supabase │  │ Supabase │  │  Compiler  │
   │  Auth   │  │PostgreSQL│  │  API       │
   │(Users)  │  │ Database │  │ (Port 4000)│
   │         │  │          │  │            │
   │•Email   │  │•Profiles │  │•JavaScript │
   │•Password│  │•Challenges│ │•Python     │
   │•Sessions│  │•Submissions│ │•Java       │
   └─────────┘  │•RLS      │  │•C++        │
                │Policies  │  │•C          │
                └──────────┘  └────────────┘
```

### Key Components

| Component | Tech Stack | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18 + Vite | User interface & Supabase client |
| **Auth** | Supabase Auth | Email/password user management |
| **Database** | Supabase PostgreSQL | Profiles, challenges, submissions |
| **Compiler** | Node.js (Port 4000) | Code execution for 5 languages |
| **API Layer** | Supabase REST API | Frontend↔Database communication |
| **RLS** | Row-Level Security | User data isolation |

---

## 📋 Prerequisites

### Environment Configuration

**Frontend (.env):**
```env
VITE_SUPABASE_URL=https://ihzgdbcayhwujtjdcjmn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloemdkYmNheWh3dWp0amRjam1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjQyMDEsImV4cCI6MjA4OTg0MDIwMX0.cuShEO9rEaCcgvMX89CjpIurq8ZK5PG8GZRY9YEOxxY
```

**Backend (backend/.env):**
```env
SUPABASE_URL=https://ihzgdbcayhwujtjdcjmn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status:** ✅ Already configured

### System Requirements

- Node.js v16+
- npm v8+
- Internet connection (Supabase is cloud-hosted)
- Ports available: 3000 (frontend), 4000 (compiler)
- Windows PowerShell (for commands)

**Status:** ✅ Verified

---

## 🔧 Setup Instructions

### Step 1: Enable Email Authentication (⚠️ CRITICAL)

1. **Login to Supabase**
   - URL: https://app.supabase.com/project/ihzgdbcayhwujtjdcjmn

2. **Navigate to Authentication → Providers**
   - Left sidebar → "Authentication"
   - Click "Providers"

3. **Enable Email Provider**
   - Find "Email / Password" row
   - Click the toggle switch (OFF → ON, turns GREEN)
   - Click "Save" button

4. **Verify**
   - Refresh page
   - Email provider toggle should be GREEN
   - Wait 10-15 seconds for changes to propagate

### Step 2: Start All Services

```powershell
Push-Location "d:\GDG hackthon\Skill_Lens\Skill_Lens"
npm run dev:all
```

**What happens:**
- Vite frontend starts on port 3000
- Compiler API starts on port 4000
- Both services idle, waiting for requests

**If ports busy:**
```powershell
# Kill existing Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
# Wait 2 seconds
Start-Sleep -Seconds 2
# Restart
npm run dev:all
```

### Step 3: Verify Services Running

```powershell
# Test Frontend
$response1 = Invoke-WebRequest http://localhost:3000 -UseBasicParsing
Write-Host "Frontend: HTTP $($response1.StatusCode)"

# Test Compiler
$response2 = Invoke-WebRequest http://localhost:4000/api/languages -UseBasicParsing
Write-Host "Compiler: HTTP $($response2.StatusCode)"
```

**Expected output:** Both return HTTP 200

### Step 4: Verify Database Connection

```powershell
# Open browser DevTools (F12)
# In Console tab, run:
# (These commands work in browser after login)

# Check database is accessible
const { data, error } = await supabase
  .from('challenges')
  .select('count')
  .limit(1);

console.log(data); // Should show data, no error
```

---

## ✨ Features & Testing

### Feature 1: User Management

**Test: Signup**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Enter email: `demo@test.com`
4. Enter password: `Test123@Secure`
5. Click "Sign Up"

**Expected:**
- ✅ User created (no error)
- ✅ Profile auto-created in database
- ✅ Redirected to app
- ✅ "Sign Up" button → "Sign Out" button

**Test: Login**
1. Click "Sign Out"
2. Click "Sign In"
3. Enter same credentials
4. Click "Sign In"

**Expected:**
- ✅ Login succeeds
- ✅ Redirected to Dashboard
- ✅ Profile data loads
- ✅ No authentication errors

### Feature 2: Challenges & Code Submission

**Test: Submit Code**
1. Navigate to "Challenges" page
2. Click on any challenge (e.g., "Two Sum")
3. Paste this code:
```javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```
4. Click "Run Tests"

**Expected:**
- ✅ Code compiles (Compiler API executes instantly)
- ✅ Test cases show results (pass/fail)
- ✅ Code Score displayed: 80-100/100
- ✅ Integrity Score displayed: 80-100/100
- ✅ Execution time shown (< 500ms)

**Real-Time Update Check:**
```javascript
// In browser console after submission
const { data: profile } = await supabase
  .from('profiles')
  .select('points, streak, challenges_completed')
  .eq('id', (await supabase.auth.getUser()).data.user.id)
  .single();

console.log(profile);
// Expected: { points: 100, streak: 1, challenges_completed: 1 }
```

### Feature 3: Real-Time Points & Streak

**Test: Points Update**
1. Before submission: Dashboard shows 0 points
2. Submit code: Points increase to 100+
3. Refresh dashboard: Points persist
4. Submit another challenge: Points increase again

**Expected:**
- ✅ Points add immediately (no refresh needed)
- ✅ After page refresh: Points still there
- ✅ Streak increments (1st challenge = streak: 1)

### Feature 4: Dashboard

**What to Check:**
- Total Points: Should show sum of all submissions
- Current Streak: Should show consecutive days
- Challenges Completed: Should show count
- Recent Submissions: Should show last 5 submissions
- Statistics: Code quality trends

**Expected:**
- ✅ All stats display correctly
- ✅ Numbers match database values
- ✅ Updates refresh without page reload

### Feature 5: Leaderboard (Real-Time)

**Test: Single User**
1. Go to "Leaderboard"
2. Find your username
3. Verify Points and Streak displayed correctly

**Test: Real-Time with Multiple Users**
1. Open 2 browser windows (different users)
2. Window A: Go to Leaderboard
3. Window B: Submit a challenge
4. Window A: **Without refreshing**, check if Window B's score appears
5. Score should appear within 1 second

**Expected:**
- ✅ Users ranked by points (highest first)
- ✅ Real-time update (<1 second)
- ✅ Leaderboard updates without refresh

### Feature 6: Multi-Language Compilation

**Test: Different Languages**

JavaScript:
```javascript
console.log('Hello');
```

Python:
```python
print('Hello')
```

Java:
```java
public class Main { 
  public static void main(String[] args) { 
    System.out.println("Hello"); 
  } 
}
```

C++:
```cpp
#include <iostream>
int main() { 
  std::cout << "Hello"; 
  return 0; 
}
```

**Expected:** All compile and run successfully

**Supported Languages:**
- ✅ JavaScript (Node.js)
- ✅ Python 3.x
- ✅ Java (OpenJDK)
- ✅ C++ (g++)
- ✅ C (gcc)

### Feature 7: Plagiarism Detection

**Test: Similar Code**
1. Go to a challenge
2. Paste very common/standard code (e.g., famous sorting algorithm)
3. Submit

**Expected:**
- ✅ Code Score: 85-90/100 (functionally correct)
- ✅ Integrity Score: 40-50/100 (detects similarity)
- ✅ Large difference = Plagiarism detected

---

## 📊 Complete Feature Verification Checklist

### User Management
- [ ] Signup with email works
- [ ] Login with email/password works
- [ ] Profile created automatically after signup
- [ ] Can logout
- [ ] Can login again with same credentials

### Challenges
- [ ] Challenges page loads
- [ ] 12+ challenges visible
- [ ] Can view challenge details
- [ ] Can edit code in editor

### Code Submission
- [ ] Code compiles (Compiler API responds)
- [ ] Test cases execute
- [ ] Code Score calculated (0-100)
- [ ] Integrity Score calculated (0-100)
- [ ] Execution time displayed

### Real-Time Database Updates
- [ ] Points increment after submission
- [ ] Streak increments after first submission
- [ ] Challenges Completed counter increases
- [ ] Submission stored in database immediately
- [ ] Data persists after page refresh

### Dashboard
- [ ] Shows Total Points
- [ ] Shows Current Streak
- [ ] Shows Challenges Completed
- [ ] Shows Recent Submissions
- [ ] Stats update in real-time (without refresh)

### Leaderboard
- [ ] All users displayed
- [ ] Ranked by points (highest first)
- [ ] Your rank shows correct position
- [ ] Real-time updates (<1 second)
- [ ] Multiple users' scores update simultaneously

### Multi-Language Support
- [ ] JavaScript compiles and runs
- [ ] Python compiles and runs
- [ ] Java compiles and runs
- [ ] C++ compiles and runs
- [ ] C compiles and runs

### Plagiarism Detection
- [ ] Original code: High integrity score
- [ ] Common code: Low integrity score
- [ ] Difference reflects in database

### Database Integrity
- [ ] All submissions stored
- [ ] User profiles persist
- [ ] RLS prevents cross-user data access
- [ ] No data corruption
- [ ] Timestamps accurate

**If all ✅ → System is fully operational!**

---

## 🛠️ Troubleshooting

### Problem: "Email signups are disabled"

**Cause:** Email provider not enabled in Supabase

**Solution:**
```
1. Go to: https://app.supabase.com/project/ihzgdbcayhwujtjdcjmn/auth/providers
2. Toggle Email provider: OFF → ON (green)
3. Click SAVE
4. Wait 10-15 seconds
5. Refresh browser and try again
```

### Problem: Frontend won't start (Port 3000 busy)

**Cause:** Another process using port 3000

**Solution:**
```powershell
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
npm run dev:all
```

### Problem: Compiler API not responding (Port 4000 busy)

**Cause:** Port 4000 already in use

**Solution:**
```powershell
# Kill Node processes
Get-Process node | Stop-Process -Force
Start-Sleep -Seconds 2
npm run dev:all
```

### Problem: Database connection timeout

**Cause:** Internet connection or Supabase down

**Solution:**
```powershell
# Verify .env files have correct credentials
Get-Content .env | grep VITE_SUPABASE
Get-Content backend\.env | grep SUPABASE

# Test connection manually
$headers = @{
  "apikey" = "YOUR_ANON_KEY"
  "Authorization" = "Bearer YOUR_ANON_KEY"
}
Invoke-WebRequest -Uri "https://ihzgdbcayhwujtjdcjmn.supabase.co/rest/v1/profiles?limit=1" `
  -Headers $headers -UseBasicParsing
```

### Problem: Leaderboard shows empty/stale data

**Cause:** Real-time subscriptions not syncing

**Solution:**
```javascript
// Refresh leaderboard in browser console
window.location.reload();
// Or manually query
const { data } = await supabase
  .from('profiles')
  .select('username, points, streak')
  .order('points', { ascending: false })
  .limit(10);
console.log(data);
```

### Problem: Points not updating after submission

**Cause:** Submission not stored or API error

**Solution:**
```javascript
// In browser console, check if submission was stored
const { data: subs } = await supabase
  .from('submissions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(1);

console.log(subs); // Should show latest submission

// Check for errors
// F12 → Console tab → Look for red errors
// Check terminal for API errors
```

### Problem: Code compilation error

**Cause:** Syntax error or compiler issue

**Solution:**
```
1. Check code syntax (especially for strict languages like Java)
2. Try simpler test: console.log("test");
3. Verify compiler is running: http://localhost:4000/api/languages → HTTP 200
4. Restart compiler: npm run dev:all
```

---

## 📖 Command Reference

### Service Management

**Start all services (Frontend + Compiler):**
```powershell
npm run dev:all
```

**Start only frontend:**
```powershell
npm run dev
```

**Start only compiler:**
```powershell
npm run compiler:dev
```

**Build for production:**
```powershell
npm run build
```

### Service Verification

**Test Frontend:**
```powershell
Invoke-WebRequest http://localhost:3000 -UseBasicParsing
```

**Test Compiler:**
```powershell
Invoke-WebRequest http://localhost:4000/api/languages -UseBasicParsing
```

**Test with payload:**
```powershell
$payload = @{
  language = "javascript"
  code = "console.log('test');"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/run" `
  -Method POST `
  -ContentType "application/json" `
  -Body $payload -UseBasicParsing
```

### Process Management

**Kill all Node processes:**
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Check running processes:**
```powershell
Get-Process node -ErrorAction SilentlyContinue
```

**Free up ports:**
```powershell
# Check what's using port 3000
Get-NetTcpConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# Check what's using port 4000
Get-NetTcpConnection -LocalPort 4000 -ErrorAction SilentlyContinue
```

### Environment Management

**View frontend environment:**
```powershell
Get-Content .env
```

**View backend environment:**
```powershell
Get-Content backend\.env
```

---

## 📁 Project Structure

```
d:\GDG hackthon\Skill_Lens\Skill_Lens\
│
├─ README.md (this file - complete setup guide)
│
├─ Frontend Configuration
│  ├─ .env (Supabase credentials)
│  ├─ vite.config.js (Vite configuration)
│  ├─ package.json (dependencies & scripts)
│  └─ index.html (HTML entry point)
│
├─ Source Code
│  └─ src/
│     ├─ App.jsx (main component)
│     ├─ main.jsx (entry point)
│     ├─ auth/
│     │  └─ AuthGate.jsx (login/signup UI)
│     ├─ components/
│     │  ├─ ChallengesPage.jsx (challenges list & editor)
│     │  ├─ DashboardPage.jsx (user statistics)
│     │  ├─ LeaderboardPage.jsx (rankings)
│     │  ├─ SessionPage.jsx (code execution)
│     │  └─ (other UI components)
│     ├─ utils/
│     │  ├─ api.js (Supabase API wrapper)
│     │  └─ supabase.js (client initialization)
│     └─ data/
│        ├─ constants.js (challenge definitions)
│        └─ scoring.js (score calculation)
│
├─ Code Compiler Service
│  └─ online-compiler/
│     ├─ package.json
│     └─ src/
│        ├─ server.js (API server on :4000)
│        ├─ routes/
│        │  ├─ run.js (code execution endpoint)
│        │  └─ languages.js (supported languages)
│        └─ utils/
│           └─ plagiarism.js (similarity detection)
│
├─ Backend Configuration
│  ├─ backend/.env (service role key)
│  └─ package.json
│
└─ Database
   └─ supabase/
      └─ schema.sql (RLS policies & seed data)
```

---

## ✅ Success Criteria

**System is fully operational when:**

- ✅ Services start without errors (Frontend 3000 + Compiler 4000)
- ✅ Email auth enabled and working
- ✅ Users can signup with email
- ✅ Users can login and see profile
- ✅ Code submission executes and scores display
- ✅ Points update in real-time
- ✅ Leaderboard shows correct rankings
- ✅ Multiple users see each other's scores instantly
- ✅ Dashboard stats reflect database values
- ✅ All 5 languages compile successfully
- ✅ Plagiarism detection shows lower integrity for common code
- ✅ No console errors (F12)
- ✅ No terminal errors

**If all ✅ → System ready for production!**

---

## 🚀 Next Steps

### Immediate (Today)
1. Enable Email auth (Supabase dashboard)
2. Start services: `npm run dev:all`
3. Test signup/login in browser
4. Submit test code and verify real-time updates
5. Check dashboard and leaderboard

### Short-term (This Week)
1. Load testing: Multiple concurrent users
2. Edge case testing: Invalid code, empty submissions
3. Performance profiling: Database query optimization
4. Error message improvement

### Medium-term (Next Week)
1. UI polish and responsive design
2. Browser compatibility testing
3. Mobile responsiveness
4. Accessibility audit (WCAG)

### Long-term (Next Month)
1. Production deployment
2. Monitoring & alerting
3. Analytics integration
4. Feature expansion

---

## 📞 Support

**Issue:** Services won't start  
**Solution:** Kill Node processes, clear npm cache, reinstall dependencies

**Issue:** Signup disabled  
**Solution:** Enable Email provider in Supabase authentication settings

**Issue:** Can't connect to database  
**Solution:** Verify .env files, check internet connection, verify Supabase project status

**Issue:** Real-time updates not working  
**Solution:** Refresh page, verify database connectivity, check browser console for errors

---

## 📝 Notes

- **Supabase Project ID:** ihzgdbcayhwujtjdcjmn
- **Supabase URL:** https://ihzgdbcayhwujtjdcjmn.supabase.co
- **Frontend Port:** 3000
- **Compiler Port:** 4000
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (Email/Password)
- **RLS:** Enabled (Row-Level Security for user data isolation)

---

**Status:** ✅ **READY FOR TESTING**

All services configured, database connected, environment variables set.  
**Just enable Email auth and you're ready to go!**

Frontend + online compiler service:

```bash
npm run dev:all
```

## 5) Verify Setup

1. Sign up in the app with email/password.
2. Log in and open dashboard.
3. Submit one challenge.
4. In Supabase Table Editor verify:
   - profiles has your user row
   - submissions has your new submission row

## Notes

- Social OAuth still uses Supabase Auth providers.
- Email sign-up may require email confirmation based on your Supabase auth settings.
- The Spring backend folder remains in the repository but is no longer required for runtime.
