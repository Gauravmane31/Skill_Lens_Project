
import React, { useState } from "react";
import { C, CHALLENGES, LEADERBOARD } from "../data/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, SectionHeader, Pill, Avatar } from "./shared/Atoms.jsx";

// ── Leaderboard Page ──────────────────────────────────────────────────────────
function LeaderboardPage({user,results}){
  const {isMobile}=useBreakpoint();
  const [tab,setTab]=useState("global");
  const totalXP=results.reduce((a,r)=>a+(r.challenge.xp||100),0);
  // Inject current user into leaderboard
  const userEntry={rank:4,name:user?.name||"You",avatar:user?.avatar||"U",pts:user?.points||4525,solved:results.length,streak:5,badge:"⭐",country:"🌍"};
  const board=LEADERBOARD.map(p=>p.rank===4&&user?.avatar==="AR"?{...p,pts:user.points,solved:results.length}:p);

  const rankColors=["#FFD700","#C0C0C0","#CD7F32"];
  const tabs=["global","weekly","friends"];

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      <PageHero tag="🏆 Leaderboard" title="Top Coders Worldwide" sub="Compete, climb, and prove your rank among the best."/>
      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>

        {/* Top 3 podium */}
        <Card style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:isMobile?12:24,padding:isMobile?"12px 0":"20px 0"}}>
            {[board[1],board[0],board[2]].map((p,i)=>{
              const order=[1,0,2];
              const heights=isMobile?[90,110,80]:[110,134,96];
              const podiumColors=["#C0C0C0","#FFD700","#CD7F32"];
              const realRank=order[i];
              return(
                <div key={p.rank} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:isMobile?16:20,marginBottom:2}}>{p.badge}</div>
                  <Avatar initials={p.avatar} size={isMobile?40:52} bg={podiumColors[i]}/>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontWeight:800,fontSize:isMobile?11:13,color:C.text,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.split(" ")[0]}</div>
                    <div style={{fontWeight:900,fontSize:isMobile?13:15,color:podiumColors[i]}}>{p.pts.toLocaleString()}</div>
                  </div>
                  <div style={{width:isMobile?60:80,background:podiumColors[i]+"33",border:`2px solid ${podiumColors[i]}`,borderRadius:"8px 8px 0 0",height:heights[i],display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontWeight:900,fontSize:isMobile?22:28,color:podiumColors[i]}}>#{realRank+1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {tabs.map(t=><Pill key={t} label={t.charAt(0).toUpperCase()+t.slice(1)} active={tab===t} onClick={()=>setTab(t)}/>)}
        </div>

        {/* Full table */}
        <Card>
          <SectionHeader title="Rankings" sub={tab==="global"?"All users worldwide":tab==="weekly"?"This week's top performers":"Your friend group"}/>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {/* Header */}
            <div style={{display:"grid",gridTemplateColumns:"40px 1fr 80px 70px 70px 60px",gap:8,padding:"8px 12px",background:C.bg,borderRadius:8,marginBottom:8}}>
              {["#","Name","Points","Solved","Streak","Country"].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5}}>{h}</div>
              ))}
            </div>
            {board.map((p,i)=>{
              const isYou=user?.name===p.name||("Alex Rudewel"===p.name&&user?.avatar==="AR");
              return(
                <div key={p.rank} style={{display:"grid",gridTemplateColumns:"40px 1fr 80px 70px 70px 60px",gap:8,padding:"10px 12px",borderRadius:10,background:isYou?C.indigoLight:"transparent",border:isYou?`1.5px solid ${C.indigo}33`:"1.5px solid transparent",marginBottom:4,alignItems:"center",transition:"background .15s"}}>
                  <div style={{fontWeight:900,fontSize:14,color:i<3?rankColors[i]:C.muted,textAlign:"center"}}>{i<3?["🥇","🥈","🥉"][i]:p.rank}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                    <Avatar initials={p.avatar} size={30} bg={i===0?C.amber:i===1?C.muted:i===2?C.orange:C.indigo}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isYou?C.indigo:C.text}}>{p.name}{isYou?" (You)":""}</div>
                    </div>
                  </div>
                  <div style={{fontWeight:800,fontSize:13,color:i<3?rankColors[i]:C.text}}>{p.pts.toLocaleString()}</div>
                  <div style={{fontSize:12,color:C.muted}}>{p.solved}/{CHALLENGES.length}</div>
                  <div style={{fontSize:12,color:C.amber}}>🔥 {p.streak}d</div>
                  <div style={{fontSize:16}}>{p.country}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Your stats card */}
        <Card style={{marginTop:14,background:C.dark}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <h3 style={{fontWeight:800,fontSize:15,color:"#fff",margin:"0 0 4px"}}>Your Standing</h3>
              <p style={{color:"#666",fontSize:12,margin:0}}>Keep solving to climb the ranks!</p>
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {[["Rank","#4",C.amber],["Points",(user?.points||4525).toLocaleString(),C.indigo],["Solved",results.length,C.green],["XP Earned",totalXP,C.orange]].map(([l,v,col])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontWeight:900,fontSize:18,color:col}}>{v}</div>
                  <div style={{fontSize:10,color:"#555"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


export default LeaderboardPage;
