import React, { useState, useEffect } from "react";
import { C, CHALLENGES as STATIC_CHALLENGES } from "../data/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Card, Badge, ProgressBar, Pill, PageHero, inputSt } from "./shared/Atoms.jsx";
import { fetchProblems } from "../utils/api.js";

// ── Challenges Page ───────────────────────────────────────────────────────────
function ChallengesPage({setPage,setSelectedChallenge,results}){
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [diffFilter,setDiffFilter]=useState("All");
  const {isMobile}=useBreakpoint();
  const [dbProblems, setDbProblems] = useState([]);
  
  useEffect(() => {
    fetchProblems().then(data => {
      // Merge with static metadata for UI (icons, colors, etc.)
      const merged = data.map(dbP => {
        const staticMatch = STATIC_CHALLENGES.find(sc => sc.title === dbP.title) || STATIC_CHALLENGES[0];
        return {
          ...dbP,
          category: dbP.domain,
          xp: 100,
          timeLimit: 30,
          pastel: staticMatch.pastel || C.pastelBlue,
          accent: staticMatch.accent || C.indigo,
          icon: staticMatch.icon || "⌨️",
          tags: [dbP.domain, dbP.difficulty],
          starterCode: staticMatch.starterCode || {}
        };
      });
      setDbProblems(merged);
    }).catch(e => console.error("Failed to load problems", e));
  }, []);

  const cats=["All",...new Set(dbProblems.map(c=>c.category))];
  const diffs=["All","Easy","Medium","Hard"];
  const completedIds=new Set(results.map(r=>r.challenge.id));
  const filtered=dbProblems
    .filter(c=>filter==="All"||c.category===filter)
    .filter(c=>diffFilter==="All"||c.difficulty===diffFilter)
    .filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase())||c.tags.some(t=>t.toLowerCase().includes(search.toLowerCase())));
  const avgScore=results.length?Math.round(results.reduce((a,r)=>a+r.codeScore,0)/results.length):null;

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      <PageHero tag="⌨️ Coding Challenges" title="Solve. Prove. Certify." sub={`${dbProblems.length} challenges across categories. Earn XP and certificates.`}/>
      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(5,1fr)",gap:12,marginBottom:18}}>
          {[
            {v:dbProblems.length,l:"Total",a:C.indigo},
            {v:completedIds.size,l:"Solved",a:C.indigo},
            {v:dbProblems.length-completedIds.size,l:"Remaining",a:C.indigo},
            {v:avgScore??"—",l:"Avg Score",a:C.indigo},
            {v:dbProblems.filter(c=>c.difficulty==="Hard").length,l:"Hard",a:C.indigo},
          ].map(s=>(
            <Card key={s.l} style={{padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontWeight:900,fontSize:isMobile?18:22,color:s.a}}>{s.v}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Search & filters */}
        <div style={{marginBottom:14}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search challenges or tags…"
            style={{...inputSt,marginBottom:10,padding:"10px 14px"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {cats.map(c=><Pill key={c} label={c} active={filter===c} onClick={()=>setFilter(c)}/>)}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {diffs.map(d=>(
              <Pill key={d} label={d} active={diffFilter===d} onClick={()=>setDiffFilter(d)}/>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length===0?(
          <Card style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:40,marginBottom:10}}>🔍</div>
            <h3 style={{fontWeight:800,marginBottom:6}}>No challenges match</h3>
            <p style={{color:C.muted,fontSize:13}}>Try adjusting your search or filters.</p>
          </Card>
        ):(
          <div className="sl-grid-2">
            {filtered.map(ch=>{
              const done=results.find(r=>r.challenge.id===ch.id);
              return(
                <div key={ch.id} className="sl-card-hover" style={{background:C.white,borderRadius:18,padding:isMobile?16:22,minWidth:0,cursor:"pointer",position:"relative",border:`1px solid ${C.border}`,borderLeft:`4px solid ${done?C.indigo:C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}
                  onClick={()=>{setSelectedChallenge(ch);setPage("session");if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(e=>console.log(e));}}>
                  {done&&<div style={{position:"absolute",top:14,right:14,background:C.indigoLight,border:`1px solid ${C.indigo}33`,borderRadius:99,padding:"3px 9px",fontSize:11,fontWeight:700,color:C.indigo}}>✓ Solved</div>}
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}>
                    <div style={{width:42,height:42,background:C.indigoLight,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1px solid ${C.indigo}22`}}>{ch.icon}</div>
                    <div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        <Badge label={ch.category} color={C.indigo}/>
                        <Badge label={ch.difficulty} color={ch.difficulty==="Easy"?C.green:ch.difficulty==="Medium"?C.amber:C.red}/>
                      </div>
                    </div>
                  </div>
                  <h3 style={{fontWeight:800,fontSize:isMobile?15:17,margin:"0 0 5px",color:C.text}}>{ch.title}</h3>
                  <p style={{fontSize:12,color:C.muted,margin:"0 0 10px",lineHeight:1.6}}>{ch.description.split("\n")[0]}</p>
                  {/* Tags */}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                    {ch.tags.map(t=><span key={t} style={{background:C.indigoLight,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:600,color:C.indigo}}>{t}</span>)}
                  </div>
                  {done&&<div style={{marginBottom:10}}><ProgressBar value={done.codeScore} color={C.indigo} height={4}/><div style={{fontSize:10,color:C.muted,marginTop:3}}>Last score: {done.codeScore}/100</div></div>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.indigo}}>+{ch.xp} XP</span>
                      <span style={{fontSize:11,color:C.muted}}>⏱ {ch.timeLimit}min</span>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setSelectedChallenge(ch);setPage("session");if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(e=>console.log(e));}} className="sl-btn-hover"
                      style={{padding:"8px 16px",background:C.indigo,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                      {done?"Retry →":"Start →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


export default ChallengesPage;
