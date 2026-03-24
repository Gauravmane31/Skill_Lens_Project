
import React, { useState, useRef } from "react";
import { C } from "../data/constants.js";
import { integrityLabel, scoreColor } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Pill, Badge, CircleScore, Card, Avatar } from "./shared/Atoms.jsx";

// ── Certificate Page ──────────────────────────────────────────────────────────
function CertificatePage({results,user}){
  const [sel,setSel]=useState(0);
  const [copied,setCopied]=useState(false);
  const {isMobile}=useBreakpoint();
  const latest=results.length?results[sel]:null;
  const il=latest?integrityLabel(latest.integrityScore):null;
  const certId=useRef("SKL-"+(Math.random()*1e8|0).toString(16).toUpperCase().padEnd(8,"0"));

  const handleCopy=()=>{
    navigator.clipboard?.writeText(`https://skilllens.io/cert/${certId.current}`).catch(()=>{});
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      <PageHero tag="📜 Certificates" title="Your Achievements" sub="Verifiable proof-of-work. Share with recruiters and LinkedIn."/>
      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        {!latest?(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:60,marginBottom:16}}>📜</div>
            <h3 style={{fontWeight:800,color:C.text,marginBottom:8}}>No certificates yet</h3>
            <p style={{color:C.muted,marginBottom:20}}>Complete a challenge to earn your first verifiable certificate.</p>
            <button style={{padding:"10px 24px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer"}}>Start a Challenge →</button>
          </div>
        ):(
          <>
            {results.length>1&&(
              <div style={{display:"flex",gap:7,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
                {results.map((res,i)=><Pill key={i} label={res.challenge.title} active={sel===i} onClick={()=>setSel(i)}/>)}
              </div>
            )}
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {/* Certificate */}
              <div style={{flex:"1 1 400px"}}>
                <div style={{background:C.white,borderRadius:20,padding:isMobile?24:44,boxShadow:"0 4px 40px rgba(91,95,237,.12)",border:`2px solid ${C.indigoLight}`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,background:C.indigoLight,borderRadius:"50%",opacity:.7}}/>
                  <div style={{position:"absolute",bottom:-20,left:-20,width:90,height:90,background:latest.challenge.pastel,borderRadius:"50%",opacity:.8}}/>
                  <div style={{position:"relative"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:9}}>
                        <img src="MainLogo-removebg-preview.png" alt="logo" style={{ width: 100, height: 40, objectFit:"contain" }} />
                        <div style={{fontSize:10,color:C.muted}}>Proof-of-Work Platform</div>
                      </div>
                      <div style={{display:"flex",gap:5}}><Badge label="VERIFIED ✓" color={C.green}/><Badge label="AUTHENTIC" color={C.indigo}/></div>
                    </div>
                    <div style={{textAlign:"center",marginBottom:24}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>This certifies that</div>
                      <div style={{fontSize:isMobile?22:32,fontWeight:900,marginBottom:6}}>{user?.name}</div>
                      <div style={{fontSize:13,color:C.muted,marginBottom:10}}>has successfully completed the challenge</div>
                      <div style={{display:"inline-flex",alignItems:"center",gap:10,background:latest.challenge.pastel,borderRadius:14,padding:"10px 20px",marginBottom:8}}>
                        <span style={{fontSize:22}}>{latest.challenge.icon}</span>
                        <span style={{fontSize:isMobile?16:20,fontWeight:900}}>{latest.challenge.title}</span>
                      </div>
                      <div style={{fontSize:12,color:C.muted}}>Language: <strong>{latest.lang.charAt(0).toUpperCase()+latest.lang.slice(1)}</strong></div>
                    </div>
                    <div style={{display:"flex",justifyContent:"center",gap:isMobile?20:40,marginBottom:20}}>
                      <CircleScore value={latest.codeScore} size={isMobile?68:84} label="Code Score"/>
                      <CircleScore value={latest.integrityScore} size={isMobile?68:84} label="Integrity" color={il.color}/>
                    </div>
                    <div style={{textAlign:"center",marginBottom:20}}>
                      <span style={{display:"inline-block",padding:"7px 18px",borderRadius:99,background:il.color+"15",color:il.color,fontWeight:700,fontSize:13,border:`1.5px solid ${il.color}28`}}>
                        Integrity: {il.label} Confidence
                      </span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",paddingTop:16,borderTop:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}>
                      <div style={{fontSize:11,color:C.muted}}><div style={{fontWeight:700,marginBottom:2}}>Certificate ID</div><div style={{fontFamily:"monospace",color:C.text}}>{certId.current}</div></div>
                      <div style={{fontSize:11,color:C.muted,textAlign:"right"}}><div style={{fontWeight:700,marginBottom:2}}>Issued On</div><div>{new Date(latest.timestamp).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div></div>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
                  <button onClick={()=>window.print()} className="sl-btn-hover" style={{flex:1,padding:"10px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>⬇ Download PDF</button>
                  <button onClick={handleCopy} className="sl-btn-hover" style={{flex:1,padding:"10px",background:copied?C.green:C.white,color:copied?"#fff":C.text,border:`1.5px solid ${copied?C.green:C.border}`,borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                    {copied?"✓ Copied!":"🔗 Copy Share Link"}
                  </button>
                </div>
              </div>

              {/* Share & Stats sidebar */}
              <div style={{flex:"0 0 260px",display:"flex",flexDirection:"column",gap:12}}>
                <Card>
                  <h3 style={{fontWeight:800,fontSize:14,margin:"0 0 12px"}}>📤 Share Certificate</h3>
                  {[
                    {icon:"💼",label:"LinkedIn",color:"#0A66C2",bg:"#E8F0FE"},
                    {icon:"𝕏",label:"X / Twitter",color:"#000",bg:"#F3F4F6"},
                    {icon:"📧",label:"Email to Recruiter",color:C.indigo,bg:C.indigoLight},
                    {icon:"📋",label:"Copy Link",color:C.green,bg:C.pastelGreen},
                  ].map(s=>(
                    <button key={s.label} onClick={s.label==="Copy Link"?handleCopy:undefined} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:s.bg,border:"none",borderRadius:10,cursor:"pointer",marginBottom:6,fontWeight:600,fontSize:13,color:s.color}}>
                      <span style={{fontSize:18}}>{s.icon}</span>{s.label}
                    </button>
                  ))}
                </Card>

                <Card style={{background:C.dark}}>
                  <h3 style={{fontWeight:800,fontSize:14,margin:"0 0 12px",color:"#fff"}}>📊 Session Stats</h3>
                  {[
                    ["Code Score",`${latest.codeScore}/100`,scoreColor(latest.codeScore)],
                    ["Integrity",`${latest.integrityScore}/100`,il.color],
                    ["Time Taken",`${Math.floor(latest.metrics.typingDuration/60)}m ${latest.metrics.typingDuration%60}s`,"#aaa"],
                    ["Keystrokes",latest.metrics.keystrokes,"#aaa"],
                    ["XP Earned",`+${latest.challenge.xp}`,C.indigo],
                  ].map(([k,v,col])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid rgba(255,255,255,.06)`}}>
                      <span style={{fontSize:12,color:"#666"}}>{k}</span>
                      <span style={{fontSize:12,fontWeight:800,color:col}}>{v}</span>
                    </div>
                  ))}
                </Card>

                <Card style={{background:C.indigoLight}}>
                  <h3 style={{fontWeight:800,fontSize:13,margin:"0 0 8px",color:C.indigo}}>💡 Pro Tip</h3>
                  <p style={{fontSize:12,color:C.textMid,lineHeight:1.6,margin:0}}>Add this certificate to your LinkedIn profile under "Licences & Certifications" to stand out to recruiters browsing your profile.</p>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


export default CertificatePage;
