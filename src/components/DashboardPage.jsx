
import React from "react";
import { C, CHALLENGES, LEADERBOARD } from "../data/constants.js";
import { scoreColor, integrityLabel, jobSuggestions, skillGaps, aiAnalysis } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Badge, ProgressBar, CircleScore, Card, SectionHeader, Pill } from "./shared/Atoms.jsx";
import { Avatar } from "./shared/Atoms.jsx";
import { fetchUserProfile, fetchLearningPath, fetchCareerGuidance, fetchGapAnalysis } from "../utils/api.js";
import { useState, useEffect } from "react";

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardPage({results,user,setPage,setSelectedChallenge}){
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
      : (latest?jobSuggestions(latest.codeScore,latest.integrityScore):[]);
      
  const gaps = profileData?.weaknesses?.length 
      ? profileData.weaknesses.map(w => `Consider practicing more challenges in ${w} to improve your domain score.`)
      : (latest?skillGaps(latest.codeScore):[]);
  const completedIds=new Set(results.map(r=>r.challenge.id));
  const totalXP=results.reduce((a,r)=>a+(r.challenge.xp||100),0);
  const avgScore=results.length?Math.round(results.reduce((a,r)=>a+r.codeScore,0)/results.length):null;
  const avgIntegrity=results.length?Math.round(results.reduce((a,r)=>a+r.integrityScore,0)/results.length):null;
  const streak=user?.streak||5;
  const level=Math.floor(totalXP/500)+1;
  const levelXP=totalXP%500;

  // Activity heatmap — last 7 days dummy
  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const activity=[2,0,3,1,0,2,1];

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 60%, #312e81 100%)`,padding:isMobile?"28px 18px 24px":"38px 28px 30px",position:"relative",overflow:"hidden",flexShrink:0}}>
        <div style={{position:"absolute",top:-60,right:-60,width:240,height:240,background:C.indigo,borderRadius:"50%",opacity:.09}}/>
        <div style={{position:"absolute",bottom:-30,left:"60%",width:130,height:130,background:"#818cf8",borderRadius:"50%",opacity:.07}}/>
        <div style={{position:"relative",maxWidth:1240,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,.2)",border:"1px solid rgba(99,102,241,.35)",borderRadius:99,padding:"5px 14px",marginBottom:12}}>
            <span style={{width:6,height:6,background:"#818cf8",borderRadius:"50%",display:"inline-block"}}/>
            <span style={{fontSize:11,fontWeight:600,color:"#c7d2fe",letterSpacing:.3}}>👋 Welcome back, {user?.name?.split(" ")[0]}</span>
          </div>
          <h1 className="sl-fadeup" style={{fontWeight:900,fontSize:isMobile?22:32,color:"#fff",margin:"0 0 6px",letterSpacing:"-0.5px"}}>Your Coding Dashboard 🚀</h1>
          <p className="sl-fadeup-2" style={{color:"#64748b",fontSize:13,margin:"0 0 20px"}}>Level {level} Coder · {streak}-day streak 🔥 · {(user?.points||0).toLocaleString()} pts</p>
          {/* XP bar */}
          <div style={{maxWidth:360,marginBottom:20}} className="sl-fadeup-3">
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:6}}>
              <span style={{color:"#94a3b8",fontWeight:600}}>Level {level}</span><span style={{color:"#94a3b8"}}>{levelXP}/500 XP to Level {level+1}</span>
            </div>
            <div style={{height:6,background:"rgba(255,255,255,.08)",borderRadius:99,overflow:"hidden"}}>
              <div style={{width:`${(levelXP/500)*100}%`,height:"100%",background:`linear-gradient(90deg, ${C.indigo}, #818cf8)`,borderRadius:99,transition:"width .6s ease"}}/>
            </div>
          </div>
          <div className="sl-fadeup-4" style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {icon:"⌨️",label:"Challenges",val:CHALLENGES.length},
              {icon:"✅",label:"Solved",val:completedIds.size},
              {icon:"📊",label:"Avg Score",val:avgScore??"—"},
              {icon:"🛡",label:"Avg Integrity",val:avgIntegrity??"—"},
              {icon:"💎",label:"Total XP",val:totalXP},
              {icon:"🔥",label:"Streak",val:`${streak}d`},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:11,padding:"9px 14px",backdropFilter:"blur(4px)"}}>
                <div style={{fontSize:15,marginBottom:3}}>{s.icon}</div>
                <div style={{fontWeight:900,fontSize:16,color:"#e2e8f0"}}>{s.val}</div>
                <div style={{fontSize:10,color:"#64748b",fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        <div className="sl-two-col">
          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Challenge Grid */}
            <Card>
              <SectionHeader title="All Challenges" sub={`${completedIds.size}/${CHALLENGES.length} completed`} action={
                <button onClick={()=>setPage("challenges")} style={{background:"none",border:"none",color:C.indigo,fontWeight:700,fontSize:13,cursor:"pointer"}}>See all →</button>
              }/>
              <div className="sl-grid-4">
                {CHALLENGES.map(ch=>{
                  const done=results.find(r=>r.challenge.id===ch.id);
                  return(
                    <div key={ch.id} className="sl-card-hover" onClick={()=>{setSelectedChallenge(ch);setPage("session");}}
                      style={{background:done?C.indigoLight:C.bg,borderRadius:14,padding:"12px 10px",cursor:"pointer",position:"relative",border:`1.5px solid ${done?C.indigo+"40":C.border}`}}>
                      {done&&<div style={{position:"absolute",top:6,right:6,width:17,height:17,background:C.indigo,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:800}}>✓</div>}
                      <div style={{width:32,height:32,background:done?C.indigo+"20":C.white,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:7,border:`1px solid ${C.border}`}}>{ch.icon}</div>
                      <div style={{fontWeight:800,fontSize:10,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:C.text}}>{ch.title}</div>
                      <Badge label={ch.difficulty} color={ch.difficulty==="Easy"?C.green:ch.difficulty==="Medium"?C.amber:C.red}/>
                      <div style={{fontSize:9,color:C.muted,marginTop:4}}>+{ch.xp} XP</div>
                      {done&&<div style={{marginTop:6}}><ProgressBar value={done.codeScore} color={C.indigo} height={3}/></div>}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Results */}
            {results.length>0&&(
              <Card>
                <SectionHeader title="Recent Sessions" sub="Your latest submissions" action={
                  <button onClick={()=>setPage("results")} style={{background:"none",border:"none",color:C.indigo,fontWeight:700,fontSize:13,cursor:"pointer"}}>View all →</button>
                }/>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {results.slice(-5).reverse().map((r,i)=>{
                    const il=integrityLabel(r.integrityScore);
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
                        <div style={{width:36,height:36,background:C.indigoLight,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,border:`1px solid ${C.indigo}22`}}>{r.challenge.icon}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.challenge.title}</div>
                          <div style={{fontSize:11,color:C.muted}}>{r.lang} · {new Date(r.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontWeight:800,fontSize:14,color:scoreColor(r.codeScore)}}>{r.codeScore}</div>
                            <div style={{fontSize:9,color:C.muted}}>code</div>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontWeight:800,fontSize:14,color:il.color}}>{r.integrityScore}</div>
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
                {days.map((d,i)=>(
                  <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",background:activity[i]>0?C.indigo:C.border,borderRadius:"4px 4px 0 0",height:activity[i]*20+4,transition:"height .4s",minHeight:4}}/>
                    <span style={{fontSize:9,color:C.muted}}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,display:"flex",gap:16}}>
                <div style={{fontSize:12,color:C.muted}}>Total this week: <strong style={{color:C.text}}>{activity.reduce((a,b)=>a+b,0)} sessions</strong></div>
                <div style={{fontSize:12,color:C.muted}}>Best day: <strong style={{color:C.text}}>Wednesday</strong></div>
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
                          <span style={{fontSize:18,fontWeight:900,color:scoreColor(gapAnalysis.readinessScore)}}>{gapAnalysis.readinessScore}%</span>
                      </div>
                      <ProgressBar value={gapAnalysis.readinessScore} color={scoreColor(gapAnalysis.readinessScore)} height={6} />
                      <p style={{fontSize:11,color:C.muted,marginTop:10,marginBottom:14,borderLeft:`2px solid ${C.indigo}`,paddingLeft:8}}>{gapAnalysis.explanation}</p>
                      
                      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
                          <div style={{background:"rgba(239,68,68,.1)",borderRadius:10,padding:12,border:"1px solid rgba(239,68,68,.2)"}}>
                              <div style={{fontSize:10,fontWeight:800,color:"#ef4444",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14}}>⚠️</span> Missing Skills</div>
                              {(gapAnalysis.missingSkills || []).length
                                ? (gapAnalysis.missingSkills || []).map(s => <div key={s} style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:3}}>• {s}</div>)
                                : <div style={{fontSize:11,color:C.muted}}>No missing skills mapped yet!</div>}
                          </div>
                          <div style={{background:"rgba(245,158,11,.1)",borderRadius:10,padding:12,border:"1px solid rgba(245,158,11,.2)"}}>
                              <div style={{fontSize:10,fontWeight:800,color:"#f59e0b",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:14}}>📉</span> Weak Domains</div>
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

            {/* Learning Recommendations */}
            {learningPath && learningPath.length > 0 && (
              <Card>
                  <SectionHeader title="📚 Recommended Learning" sub="Curated resources to close your skill gaps"/>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {learningPath.map((item, i) => (
                          <div key={i} style={{padding:"12px 14px",background:C.indigoLight,borderRadius:10,border:`1px solid ${C.indigo}40`,display:"flex",alignItems:"center",gap:12}}>
                              <div style={{fontSize:20}}>{item.type==='course'?'🎓':item.type==='project'?'🛠️':'💻'}</div>
                              <div style={{flex:1}}>
                                  <div style={{fontSize:13,fontWeight:800,color:C.indigo,marginBottom:2}}>{item.title}</div>
                                    <div style={{fontSize:10,color:C.textMid,lineHeight:1.4}}>{item.reason || item.reasonTemplate}</div>
                              </div>
                              <button className="sl-btn-hover" style={{padding:"6px 14px",background:C.indigo,color:"#fff",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>Start</button>
                          </div>
                      ))}
                  </div>
              </Card>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Quick Start */}
            <Card>
              <SectionHeader title="Quick Start" sub="Jump right in"/>
              {CHALLENGES.slice(0,4).map((ch,i)=>(
                <div key={ch.id} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<3?`1px solid ${C.border}`:"none",alignItems:"center"}}>
                  <div style={{width:32,height:32,background:C.indigoLight,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,border:`1px solid ${C.indigo}22`}}>{ch.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.title}</div>
                    <div style={{fontSize:10,color:C.muted}}>{ch.difficulty} · +{ch.xp} XP</div>
                  </div>
                  <button onClick={()=>{setSelectedChallenge(ch);setPage("session");if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(e=>console.log(e));}} className="sl-btn-hover"
                    style={{padding:"4px 9px",background:C.indigo,color:"#fff",border:"none",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                    {completedIds.has(ch.id)?"Retry":"Start"}
                  </button>
                </div>
              ))}
            </Card>

            {/* Advanced AI Career Guidance */}
            <Card style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`,border:"1px solid rgba(255,255,255,.08)"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,.2)",border:"1px solid rgba(99,102,241,.35)",borderRadius:99,padding:"4px 12px",marginBottom:12}}>
                <span style={{width:5,height:5,background:"#818cf8",borderRadius:"50%",display:"inline-block",boxShadow:"0 0 8px #818cf8"}}/>
                <span style={{fontSize:10,fontWeight:700,color:"#c7d2fe",letterSpacing:.5,textTransform:"uppercase"}}>AI Career Mentor</span>
              </div>
              
              {careerGuidance ? (
                  <>
                        {(careerGuidance?.recommendedRoles || []).length > 0 && (
                          <div style={{marginBottom:14}}>
                              <div style={{fontSize:10,color:"#cbd5e1",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Top Recommended Role</div>
                              <div style={{fontSize:18,fontWeight:900,color:"#a5b4fc",marginBottom:6}}>{careerGuidance.recommendedRoles[0]}</div>
                              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                                  <div style={{fontSize:10,color:"#94a3b8"}}>Confidence</div>
                                  <div style={{flex:1,height:4,background:"rgba(255,255,255,.1)",borderRadius:99,overflow:"hidden"}}>
                                      <div style={{height:"100%",width:`${careerGuidance.confidenceScore}%`,background:scoreColor(careerGuidance.confidenceScore)}}/>
                                  </div>
                                  <div style={{fontSize:10,fontWeight:800,color:"#cbd5e1"}}>{careerGuidance.confidenceScore}%</div>
                              </div>
                          </div>
                      )}
                      
                      <div style={{background:"rgba(255,255,255,.05)",padding:"12px 14px",borderRadius:10,borderLeft:"3px solid #818cf8",marginBottom:12}}>
                          <div style={{fontSize:11,color:"#e2e8f0",lineHeight:1.5,fontWeight:500}}>"{careerGuidance.reasoning}"</div>
                      </div>
                      
                      {careerGuidance.growthPath && (
                          <div style={{marginBottom:12}}>
                              <div style={{fontSize:11,fontWeight:800,color:"#94a3b8",marginBottom:4,display:"flex",alignItems:"center",gap:4}}><span>📈</span> Suggested Growth Path</div>
                              <div style={{fontSize:11,color:"#cbd5e1",lineHeight:1.5}}>{careerGuidance.growthPath}</div>
                          </div>
                      )}
                      
                        {(careerGuidance?.alternativeRoles || []).length > 0 && (
                          <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:12}}>
                              <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",marginBottom:6}}>Alternative Pathways</div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                                  {careerGuidance.alternativeRoles.map((alt, i) => (
                                      <div key={i} style={{fontSize:10,fontWeight:600,color:"#cbd5e1",background:"rgba(255,255,255,.08)",padding:"3px 8px",borderRadius:6}}>{alt}</div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </>
              ) : (
                  <div style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:"16px",textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:8}}>🤖</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#cbd5e1",marginBottom:2}}>AI Mentor is thinking...</div>
                    <p style={{color:"#64748b",fontSize:11,margin:0,lineHeight:1.4}}>Submit your first challenge to get personalized AI career guidance.</p>
                  </div>
              )}
            </Card>

            {/* Badges */}
            <Card>
              <SectionHeader title="🏅 Badges" sub="Your achievements"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {icon:"🔥",name:"5-Day Streak",earned:true},
                  {icon:"⚡",name:"First Solve",earned:completedIds.size>0},
                  {icon:"🎯",name:"Perfect Score",earned:results.some(r=>r.codeScore>=95)},
                  {icon:"🏆",name:"Top 10 Rank",earned:true},
                  {icon:"💎",name:"500 XP Club",earned:totalXP>=500},
                  {icon:"🌟",name:"3 Challenges",earned:completedIds.size>=3},
                ].map(b=>(
                  <div key={b.name} style={{background:b.earned?C.indigoLight:C.bg,borderRadius:10,padding:"10px 8px",textAlign:"center",border:`1px solid ${b.earned?C.indigo+"33":C.border}`,opacity:b.earned?1:0.45}}>
                    <div style={{fontSize:20,marginBottom:4}}>{b.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,color:b.earned?C.indigo:C.muted}}>{b.name}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Skill Gaps */}
            {latest&&(
              <Card style={{background:C.indigoLight}}>
                <h3 style={{fontWeight:800,fontSize:14,margin:"0 0 10px",color:C.indigo}}>🚀 Next Steps</h3>
                {gaps.map((g,i)=>(
                  <div key={i} style={{display:"flex",gap:7,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:18,height:18,background:C.indigo,borderRadius:5,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{g}</span>
                  </div>
                ))}
              </Card>
            )}

            {/* Mini Leaderboard */}
            <Card style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`,border:"1px solid rgba(255,255,255,.08)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h3 style={{fontWeight:800,fontSize:14,color:"#fff",margin:0}}>🏆 Top Coders</h3>
                <button onClick={()=>setPage("leaderboard")} style={{fontSize:11,color:"#a5b4fc",fontWeight:700,background:"none",border:"none",cursor:"pointer"}}>See all →</button>
              </div>
              {LEADERBOARD.slice(0,5).map((p,i)=>(
                <div key={p.rank} style={{display:"flex",alignItems:"center",gap:9,marginBottom:i<4?"10px":0}}>
                  <div style={{width:20,textAlign:"center",fontWeight:900,fontSize:12,color:i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:"#4b5563"}}>{p.badge}</div>
                  <Avatar initials={p.avatar} size={26} bg={i===0?C.amber:i===1?C.muted:i===2?C.orange:C.indigo}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12,color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{fontSize:10,color:"#64748b"}}>{p.pts.toLocaleString()} pts</div>
                  </div>
                  <span style={{fontSize:10,color:"#64748b"}}>{p.country}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


export default DashboardPage;
