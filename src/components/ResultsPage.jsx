
import React, { useState } from "react";
import { C } from "../data/constants/constants.js";
import { scoreColor, integrityLabel, aiAnalysis, jobSuggestions, skillGaps } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, SectionHeader, CircleScore, ProgressBar, Pill, Badge } from "./shared/Atoms.jsx";

// ── Results / Analytics Page ──────────────────────────────────────────────────
function ResultsPage({results,setPage}){
  const [sel,setSel]=useState(0);
  const {isMobile}=useBreakpoint();

  if(!results.length) return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,background:C.bg,padding:24}}>
      <div style={{fontSize:56}}>📊</div>
      <h3 style={{fontWeight:800,color:C.text}}>No results yet</h3>
      <p style={{color:C.muted,textAlign:"center"}}>Complete a challenge to see your analytics.</p>
      <button onClick={()=>setPage("challenges")} style={{padding:"10px 24px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>Start a Challenge →</button>
    </div>
  );

  const r = results[sel];
  const il = integrityLabel(r.integrityScore);

  const backend = r.backendResult || {};
  const strengths = (backend.strengths && backend.strengths.length > 0) ? backend.strengths : aiAnalysis(r.codeScore).strengths;
  const improvements = (backend.improvementTips && backend.improvementTips.length > 0) ? backend.improvementTips :
                       (backend.weaknesses && backend.weaknesses.length > 0) ? backend.weaknesses : aiAnalysis(r.codeScore).improvements;
  const gaps = (backend.conceptGaps && backend.conceptGaps.length > 0) ? backend.conceptGaps : skillGaps(r.codeScore);

  const roles = jobSuggestions(r.codeScore, r.integrityScore);

  // Overall stats across all results
  const avgCode=Math.round(results.reduce((a,x)=>a+x.codeScore,0)/results.length);
  const avgInt=Math.round(results.reduce((a,x)=>a+x.integrityScore,0)/results.length);
  const bestCode=Math.max(...results.map(x=>x.codeScore));
  const totalXP=results.reduce((a,x)=>a+(x.challenge.xp||100),0);

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      <PageHero tag="📊 Analytics" title="Your Performance Report" sub="AI-powered evaluation of your coding sessions."
        extras={
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {label:"CODE SCORE",val:r.codeScore,color:scoreColor(r.codeScore)},
              {label:"INTEGRITY",val:r.integrityScore,color:il.color},
              {label:"CHALLENGE",val:r.challenge.title,color:"#ccc",small:true},
              {label:"LANGUAGE",val:r.lang,color:"#aaa",small:true},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"8px 13px",backdropFilter:"blur(4px)"}}>
                <div style={{fontSize:9,color:"#666",marginBottom:2,textTransform:"uppercase",letterSpacing:.5}}>{s.label}</div>
                <div style={{fontWeight:900,fontSize:s.small?12:20,color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>
        }
      />

      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        {/* Overall stats */}
        {results.length>1&&(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:16}}>
            {[
              {icon:"📊",v:avgCode,l:"Avg Code Score",a:C.indigo},
              {icon:"🛡",v:avgInt,l:"Avg Integrity",a:C.indigo},
              {icon:"🏆",v:bestCode,l:"Best Score",a:C.indigo},
              {icon:"💎",v:totalXP,l:"Total XP Earned",a:C.indigo},
            ].map(s=>(
              <Card key={s.l} style={{padding:"12px 14px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                <div style={{fontWeight:900,fontSize:20,color:s.a}}>{s.v}</div>
                <div style={{fontSize:11,color:C.muted}}>{s.l}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Session selector */}
        {results.length>1&&(
          <div style={{display:"flex",gap:7,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
            {results.map((res,i)=><Pill key={i} label={res.challenge.title} active={sel===i} onClick={()=>setSel(i)}/>)}
          </div>
        )}

        <div className="sl-grid-2" style={{marginBottom:14}}>
          {/* Performance */}
          <Card>
            <SectionHeader title="Performance Overview" sub={`${r.challenge.title} · ${r.lang}`}/>
            <div style={{display:"flex",justifyContent:"center",gap:28,marginBottom:16}}>
              <CircleScore value={r.codeScore} size={80} label="Code Score"/>
              <CircleScore value={r.integrityScore} size={80} label="Integrity" color={il.color}/>
              <CircleScore value={Math.round((r.codeScore+r.integrityScore)/2)} size={80} label="Combined"/>
            </div>
            <div style={{background:il.color+"12",borderRadius:10,padding:"10px 13px",borderLeft:`3px solid ${il.color}`,marginBottom:10}}>
              <div style={{fontWeight:700,color:il.color,fontSize:13}}>Integrity: {il.label}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{r.metrics.pasteEvents} pastes · {r.metrics.keystrokes} keystrokes · {Math.floor(r.metrics.typingDuration/60)}min {r.metrics.typingDuration%60}s</div>
            </div>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Time spent</div>
              <div style={{fontWeight:800,fontSize:16}}>{Math.floor(r.metrics.typingDuration/60)}m {r.metrics.typingDuration%60}s</div>
            </div>
          </Card>

          {/* AI Analysis */}
          <Card>
            <SectionHeader title="🤖 AI Code Analysis" sub="Automated feedback on your solution"/>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.5,marginBottom:7,textTransform:"uppercase"}}>Strengths</div>
              {strengths.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:6,padding:"7px 10px",background:C.indigoLight,borderRadius:8,alignItems:"flex-start",border:`1px solid ${C.indigo}20`}}>
                  <span style={{color:C.indigo,fontWeight:800,flexShrink:0}}>✓</span>
                  <span style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:.5,marginBottom:7,textTransform:"uppercase"}}>Areas to Improve</div>
            {improvements.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:6,padding:"7px 10px",background:C.bg,borderRadius:8,alignItems:"flex-start",border:`1px solid ${C.border}`}}>
                <span style={{color:C.indigo,fontWeight:800,flexShrink:0}}>→</span>
                <span style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{s}</span>
              </div>
            ))}
          </Card>
        </div>

        <div className="sl-grid-2" style={{marginBottom:14}}>
          {/* Job Matches */}
          <Card style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`,border:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,.2)",border:"1px solid rgba(99,102,241,.35)",borderRadius:99,padding:"4px 12px",marginBottom:10}}>
              <span style={{width:5,height:5,background:"#818cf8",borderRadius:"50%",display:"inline-block"}}/>
              <span style={{fontSize:10,fontWeight:600,color:"#c7d2fe",letterSpacing:.3}}>Job Matches</span>
            </div>
            <h3 style={{fontWeight:800,fontSize:14,color:"#fff",margin:"0 0 12px"}}>Career Pathways</h3>
            {roles.map(ro=>(
              <div key={ro.role} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,gap:6}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ro.role}</span>
                  <span style={{fontSize:12,fontWeight:800,color:"#a5b4fc",flexShrink:0}}>{ro.prob}%</span>
                </div>
                <ProgressBar value={ro.prob} color={C.indigo} height={5}/>
              </div>
            ))}
            <div style={{marginTop:12,background:"rgba(255,255,255,.06)",borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:9,color:"#64748b",marginBottom:2,textTransform:"uppercase"}}>Top Match</div>
              <div style={{fontWeight:800,fontSize:14,color:"#a5b4fc"}}>{roles[0].role}</div>
              <div style={{fontSize:11,color:"#64748b"}}>Win Probability: {roles[0].prob}%</div>
            </div>
            <button onClick={()=>setPage("jobs")} style={{marginTop:12,width:"100%",padding:"9px",background:C.indigo,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>Browse Matching Jobs →</button>
          </Card>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Paste Detection */}
            <Card>
              <SectionHeader title="🔍 Integrity Breakdown" sub="Paste & typing analysis"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  {label:"Tab Switches",value:r.metrics.tabSwitches||0,flag:(r.metrics.tabSwitches||0)>0},
                  {label:"Paste Events",value:r.metrics.pasteEvents,flag:r.metrics.pasteEvents>0},
                  {label:"Largest Paste",value:`${r.metrics.largestPaste}L`,flag:r.metrics.largestPaste>10},
                  {label:"Paste Chars",value:r.metrics.pasteChars,flag:r.metrics.pasteChars>150},
                ].map(m=>(
                  <div key={m.label} style={{background:m.flag?"#FEF2F2":C.bg,border:`1.5px solid ${m.flag?"#FECACA":C.border}`,borderRadius:10,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:C.muted,marginBottom:2,fontWeight:600}}>{m.label}</div>
                    <div style={{fontWeight:900,fontSize:16,color:m.flag?C.red:C.text}}>{m.value}</div>
                    {m.flag&&<div style={{fontSize:9,color:C.red,fontWeight:700}}>⚠ Suspicious</div>}
                  </div>
                ))}
              </div>
            </Card>

            {/* Skill Gaps */}
            <Card style={{background:C.indigoLight}}>
              <h3 style={{fontWeight:800,fontSize:14,margin:"0 0 10px",color:C.indigo}}>🎯 Skill Gaps to Close</h3>
              {gaps.map((g,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                  <div style={{width:18,height:18,background:C.indigo,borderRadius:5,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{g}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`,borderRadius:16,padding:isMobile?"20px 16px":"24px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,border:"1px solid rgba(255,255,255,.08)"}}>
          <div>
            <h3 style={{fontWeight:800,fontSize:15,color:"#fff",margin:"0 0 3px"}}>Ready for your certificate?</h3>
            <p style={{color:"#64748b",fontSize:13,margin:0}}>Earn a shareable proof-of-work from this session.</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>setPage("certificate")} className="sl-btn-hover"
              style={{padding:"10px 20px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>📜 Get Certificate →</button>
            <button onClick={()=>setPage("jobs")} className="sl-btn-hover"
              style={{padding:"10px 20px",background:"rgba(255,255,255,.08)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.15)",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>💼 Browse Jobs →</button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default ResultsPage;
