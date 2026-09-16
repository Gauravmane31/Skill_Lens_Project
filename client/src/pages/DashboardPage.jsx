
import React from "react";
import { C, CHALLENGES } from "../constants/constants.js";
import { scoreColor, integrityLabel, jobSuggestionsFallback, skillGapsFallback, aiAnalysisFallback } from "../utils/scoring.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { Badge, ProgressBar, CircleScore, Card, SectionHeader, Pill, LensCorners } from "../components/common/Atoms.jsx";
import CompanyLogo from "../components/common/CompanyLogo.jsx";
import { fetchUserProfile, fetchLearningPath, fetchCareerGuidance, fetchGapAnalysis } from "../services/api.js";
import { useState, useEffect } from "react";

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardPage({results,user,setPage}){
  const {isMobile}=useBreakpoint();
  const latest=results.length?results[results.length-1]:null;
  const [profileData, setProfileData] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [careerGuidance, setCareerGuidance] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);

  useEffect(() => {
    if (user?.id) {
       fetchUserProfile(user.id).then(setProfileData).catch(console.error);
       fetchLearningPath(user.id).then(setLearningPath).catch(console.error);
       fetchCareerGuidance(user.id).then(setCareerGuidance).catch(console.error);
    }
  }, [user?.id]);

    useEffect(() => {
      if (user?.id && careerGuidance?.recommendedRoles?.length > 0) {
        fetchGapAnalysis(user.id, careerGuidance.recommendedRoles[0]).then(setGapAnalysis).catch(console.error);
      }
    }, [careerGuidance, user?.id]);

  const roles = profileData?.recommendedRoles?.length
      ? profileData.recommendedRoles.map(r => ({role: r, prob: 95, color: C.indigo}))
      : (latest?jobSuggestionsFallback(latest.codeScore,latest.integrityScore):[]);

  const gaps = profileData?.weaknesses?.length
      ? profileData.weaknesses.map(w => `Consider practicing more challenges in ${w} to improve your domain score.`)
      : (latest?skillGapsFallback(latest.codeScore):[]);

  // `results` (loaded once centrally on login) is the reliable source of truth
  // for a user's actual submission history. `profileData` comes from a separate
  // fetch that can fail independently (network hiccup, timing, etc.) — when it
  // does, everything below used to silently show blank/zero instead of falling
  // back to the data we already have. Use profileData only to enrich (e.g. it
  // may know about submissions made from another device), never as the sole source.
  const submissions = results.length
    ? results.map((r) => ({
      challenge_id: r.challenge?.id,
      challenge_title: r.challenge?.title,
      code_score: r.codeScore,
      integrity_score: r.integrityScore,
      created_at: r.timestamp,
      lang: r.lang,
    }))
    : (profileData?.submissions || []);
  const recentSessions = results.length
    ? results.slice(-5).reverse()
    : submissions.slice(0, 5).map((submission) => ({
        ...submission,
        challenge: CHALLENGES.find((challenge) => Number(challenge.id) === Number(submission.challenge_id)) || {
          id: submission.challenge_id,
          title: submission.challenge_title,
          icon: "💻",
          xp: 0,
        },
        codeScore: Number(submission.code_score || 0),
        integrityScore: Number(submission.integrity_score || 0),
        timestamp: submission.created_at,
        lang: submission.lang,
      }))
    ;
  const completedIds=new Set(submissions.map((submission) => Number(submission.challenge_id)));
  const totalXP = submissions.reduce((sum, submission) => {
    const challenge = CHALLENGES.find((item) => Number(item.id) === Number(submission.challenge_id));
    return sum + Number(challenge?.xp || 0);
  }, 0) || Number(profileData?.points ?? user?.points ?? 0);
  const avgScore = submissions.length
    ? Math.round(submissions.reduce((sum, submission) => sum + Number(submission.code_score || 0), 0) / submissions.length)
    : null;
  const avgIntegrity = submissions.length
    ? Math.round(submissions.reduce((sum, submission) => sum + Number(submission.integrity_score || 0), 0) / submissions.length)
    : null;
  const streak=Number(profileData?.streak ?? user?.streak ?? 0);
  const level=Math.floor(totalXP/500)+1;
  const levelXP=totalXP%500;

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const key = date.toDateString();
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: submissions.filter((submission) => submission.created_at && new Date(submission.created_at).toDateString() === key).length,
    };
  });
  const activityTotal = activityDays.reduce((sum, day) => sum + day.count, 0);
  const bestActivityDay = activityDays.reduce((best, day) => day.count > best.count ? day : best, { label: "—", count: 0 });

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      {/* Hero */}
      <div style={{background:C.dark,padding:isMobile?"24px 18px 20px":"50px 28px 50px 20px",position:"relative",flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{position:"relative",maxWidth:1240,margin:"0 auto",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <span style={{width:6,height:6,background:C.teal,borderRadius:"50%",display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:15,fontWeight:500,color:"#8A8E99",fontFamily:C.fontMono}}>Welcome back, {user?.name?.split(" ")[0]}</span>
            </div>
            <h1 className="sl-fadeup" style={{fontWeight:700,fontSize:isMobile?22:40,color:"#fff",margin:"0 0 6px",letterSpacing:"-0.02em"}}>Your coding dashboard</h1>
            <p className="sl-fadeup-2" style={{color:"#A6A9B4",fontSize:13.5,margin:"0px 0px 20px"}}>Level {level} coder · {streak}-day streak · {(user?.points||0).toLocaleString()} pts</p>
          </div>
          {!isMobile && <LensCorners size={40} style={{marginTop:4}}/>}
        </div>
        <div style={{position:"relative",maxWidth:1240,margin:"10px auto"}}>
          {/* XP bar */}
          <div style={{maxWidth:360,marginBottom:22}} className="sl-fadeup-3">
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B6F7B",marginBottom:6}}>
              <span style={{color:"#8A8E99",fontWeight:600}}>Level {level}</span><span style={{color:"#8A8E99"}}>{levelXP}/500 XP to level {level+1}</span>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:`${(levelXP/500)*100}%`,height:"100%",background:C.teal,borderRadius:2,transition:"width .6s ease"}}/>
            </div>
          </div>
          {/* Inline stat bar */}
          <div className="sl-fadeup-4" style={{display:"flex",flexWrap:"wrap"}}>
            {[
              {label:"Challenges",val:CHALLENGES.length},
              {label:"Solved",val:completedIds.size},
              {label:"Avg score",val:avgScore??"—"},
              {label:"Avg integrity",val:avgIntegrity??"—"},
              {label:"Total XP",val:totalXP},
              {label:"Streak",val:`${streak}d`},
            ].map((s,i)=>(
              <div key={s.label} style={{padding:isMobile?(i===0?"12px 16px 14px 0":"12px 16px 14px"):(i===0?"12px 20px 16px 0px":"12px 20px 16px"),borderLeft:i===0?"none":"1px solid rgba(255,255,255,.1)",minWidth:isMobile?"33%":undefined}}>
                <div style={{fontFamily:C.fontMono,fontWeight:500,fontSize:20,color:"#fff"}}>{s.val}</div>
                <div style={{fontSize:11.5,color:"#8A8E99",marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Recent Results */}
            {recentSessions.length>0&&(
              <Card>
                <SectionHeader title="Recent Sessions" sub="Your latest submissions" action={
                  <button onClick={()=>setPage("results")} style={{background:"none",border:"none",color:C.indigo,fontWeight:700,fontSize:13,cursor:"pointer"}}>View all →</button>
                }/>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {recentSessions.map((r,i)=>{
                    const il=integrityLabel(r.integrityScore);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
                        <CompanyLogo company={r.challenge.tags?.[0]} fallback={r.challenge.icon} size={28} />
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.challenge.title}</div>
                          <div style={{fontSize:11,color:C.muted}}>{r.lang} · {new Date(r.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontWeight:600,fontSize:14,color:scoreColor(r.codeScore)}}>{r.codeScore}</div>
                            <div style={{fontSize:9,color:C.muted}}>code</div>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontWeight:600,fontSize:14,color:il.color}}>{r.integrityScore}</div>
                            <div style={{fontSize:9,color:C.muted}}>integrity</div>
                          </div>
                          <Badge label={`+${r.challenge.xp} XP`} color={C.indigo}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Activity */}
            <Card>
              <SectionHeader title="Weekly Activity" sub="Sessions per day this week"/>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:70}}>
                {activityDays.map((day)=>(
                  <div key={day.label} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",background:day.count>0?C.indigo:C.border,borderRadius:"4px 4px 0 0",height:day.count ? Math.min(60, day.count*20+4) : 4,transition:"height .4s",minHeight:4}}/>
                    <span style={{fontSize:9,color:C.muted}}>{day.label}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,display:"flex",gap:16}}>
                <div style={{fontSize:12,color:C.muted}}>Total this week: <strong style={{color:C.text}}>{activityTotal} sessions</strong></div>
                <div style={{fontSize:12,color:C.muted}}>Best day: <strong style={{color:C.text}}>{bestActivityDay.count ? bestActivityDay.label : "—"}</strong></div>
              </div>
            </Card>

            {/* Skill Gap Analysis / Target Role */}
            <Card>
              <SectionHeader title="🎯 Target Role Analysis" sub={careerGuidance?.recommendedRoles?.length > 0 ? `Evaluating readiness for: ${careerGuidance.recommendedRoles[0]}` : "Identify your skill gaps"} action={
                <button onClick={()=>setPage("jobs")} style={{background:"none",border:"none",color:C.indigo,fontWeight:700,fontSize:13,cursor:"pointer"}}>View all skills →</button>
              }/>

              {gapAnalysis ? (
                  <>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                          <span style={{fontSize:13,fontWeight:700,color:C.text}}>Overall Readiness</span>
                          <span style={{fontSize:18,fontWeight:700,color:scoreColor(gapAnalysis.readinessScore)}}>{gapAnalysis.readinessScore}%</span>
                      </div>
                      <ProgressBar value={gapAnalysis.readinessScore} color={scoreColor(gapAnalysis.readinessScore)} height={6} />
                      <p style={{fontSize:11,color:C.muted,marginTop:10,marginBottom:14,borderLeft:`2px solid ${C.indigo}`,paddingLeft:8}}>{gapAnalysis.explanation}</p>

                      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                          <div style={{background:"rgba(239,68,68,.1)",borderRadius:10,padding:12,border:"1px solid rgba(239,68,68,.2)"}}>
                              <div style={{fontSize:10,fontWeight:600,color:"#D6473F",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14}}>⚠️</span> Missing Skills</div>
                              {(gapAnalysis.missingSkills || []).length
                                ? (gapAnalysis.missingSkills || []).map(s => <div key={s} style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:3}}>• {s}</div>)
                                : <div style={{fontSize:11,color:C.muted}}>No missing skills mapped yet!</div>}
                          </div>
                          <div style={{background:"rgba(245,158,11,.1)",borderRadius:10,padding:12,border:"1px solid rgba(245,158,11,.2)"}}>
                              <div style={{fontSize:10,fontWeight:600,color:"#C97A1D",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14}}>📉</span> Weak Domains</div>
                              {(gapAnalysis.weakAreas || []).length
                                ? (gapAnalysis.weakAreas || []).map(a => <div key={a} style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:3}}>• {a.split('(')[0].trim()}</div>)
                                : <div style={{fontSize:11,color:C.muted}}>No weak domains!</div>}
                          </div>
                      </div>
                  </>
              ) : (
                  <div style={{padding:"20px",textAlign:"center",background:C.bg,borderRadius:10}}>
                      <div style={{fontSize:24,marginBottom:6}}>🔍</div>
                      <div style={{fontSize:12,color:C.muted}}>Complete your first phase of evaluation to unlock AI gap analysis.</div>
                  </div>
              )}
            </Card>
            
            {/* AI Career Guidance */}
            <Card style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1B1E2C 100%)`,border:"1px solid rgba(255,255,255,.08)"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(58,47,201,.16)",border:"1px solid rgba(58,47,201,.35)",borderRadius:99,padding:"4px 12px",marginBottom:12}}>
              <span style={{width:5,height:5,background:"#7A70E0",borderRadius:"50%",display:"inline-block",boxShadow:"0 0 8px #7A70E0"}}/>
              <span style={{fontSize:10,fontWeight:700,color:"#C9C2F5",letterSpacing:.5,textTransform:"uppercase"}}>AI Career Mentor</span>
              </div>

              {careerGuidance ? (
                <>
                  {(careerGuidance?.recommendedRoles || []).length > 0 && (
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:10,color:"#D2D2CE",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Top Recommended Role</div>
                      <div style={{fontSize:18,fontWeight:700,color:"#A79CEE",marginBottom:6}}>{careerGuidance.recommendedRoles[0]}</div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                        <div style={{fontSize:10,color:"#8A8E99"}}>Confidence</div>
                        <div style={{flex:1,height:4,background:"rgba(255,255,255,.1)",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${careerGuidance.confidenceScore}%`,background:scoreColor(careerGuidance.confidenceScore)}}/>
                        </div>
                        <div style={{fontSize:10,fontWeight:600,color:"#D2D2CE"}}>{careerGuidance.confidenceScore}%</div>
                      </div>
                    </div>
                  )}

                  <div style={{background:"rgba(255,255,255,.05)",padding:"12px 14px",borderRadius:10,borderLeft:"3px solid #7A70E0",marginBottom:12}}>
                    <div style={{fontSize:11,color:"#E4E4E1",lineHeight:1.5,fontWeight:500}}>&quot;{careerGuidance.reasoning}&quot;</div>
                  </div>

                  {careerGuidance.growthPath && (
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#8A8E99",marginBottom:4,display:"flex",alignItems:"center",gap:4}}><span>📈</span> Suggested Growth Path</div>
                      <div style={{fontSize:11,color:"#D2D2CE",lineHeight:1.5}}>{careerGuidance.growthPath}</div>
                    </div>
                  )}

                  {(careerGuidance?.alternativeRoles || []).length > 0 && (
                    <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:12}}>
                      <div style={{fontSize:10,color:"#6B6F7B",textTransform:"uppercase",marginBottom:6}}>Alternative Pathways</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {careerGuidance.alternativeRoles.map((alt, i) => (
                          <div key={i} style={{fontSize:10,fontWeight:600,color:"#D2D2CE",background:"rgba(255,255,255,.08)",padding:"3px 8px",borderRadius:6}}>{alt}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:"16px",textAlign:"center"}}>
                <div style={{fontSize:22,marginBottom:8}}>🤖</div>
                <div style={{fontSize:12,fontWeight:700,color:"#D2D2CE",marginBottom:2}}>AI Mentor is thinking...</div>
                <p style={{color:"#6B6F7B",fontSize:11,margin:0,lineHeight:1.4}}>Submit your first challenge to get personalized AI career guidance.</p>
                </div>
              )}
            </Card>

            {/* Learning Recommendations */}
            {learningPath && learningPath.length > 0 && (
              <Card>
                  <SectionHeader title="📚 Recommended Learning" sub="Curated resources to close your skill gaps"/>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {learningPath.map((item, i) => (
                          <div key={i} style={{padding:"12px 14px",background:C.indigoLight,borderRadius:10,border:`1px solid ${C.indigo}40`,display:"flex",alignItems:"center",gap:12}}>
                              <div style={{fontSize:20}}>{item.type==='course'?'🎓':item.type==='project'?'🛠️':'💻'}</div>
                              <div style={{flex:1}}>
                                  <div style={{fontSize:13,fontWeight:600,color:C.indigo,marginBottom:2}}>{item.title}</div>
                                    <div style={{fontSize:10,color:C.textMid,lineHeight:1.4}}>{item.reason || item.reasonTemplate}</div>
                              </div>
                              <button className="sl-btn-hover" style={{padding:"6px 14px",background:C.indigo,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>Start</button>
                          </div>
                      ))}
                  </div>
              </Card>
            )}
          </div>

          {/* Next Steps */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Skill Gaps */}
            {latest&&(
              <Card style={{background:C.indigoLight}}>
                <h3 style={{fontWeight:600,fontSize:14,margin:"0 0 10px",color:C.indigo}}>🚀 Next Steps</h3>
                {gaps.map((g,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:18,height:18,background:C.indigo,borderRadius:5,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{g}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default DashboardPage;
