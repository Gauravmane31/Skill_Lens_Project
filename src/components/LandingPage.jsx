
import React from "react";
import { C, CHALLENGES } from "../data/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Avatar, Badge, ProgressBar } from "./shared/Atoms.jsx";

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({onGetStarted,onLogin}){
  const {isMobile,isTablet}=useBreakpoint();
  const cols3=isMobile?"1fr":isTablet?"1fr 1fr":"1fr 1fr 1fr";

  const features=[
    {icon:"⌨️",title:"12 Real Challenges",pastel:C.pastelYellow,desc:"Arrays, DP, graphs, design patterns — LeetCode-style problems with full descriptions."},
    {icon:"🔍",title:"Integrity Detection",pastel:C.pastelPurple,desc:"Every keystroke and paste tracked. AI flags suspicious patterns and issues an Integrity Score."},
    {icon:"📊",title:"AI-Powered Analysis",pastel:C.pastelBlue,desc:"Instant strengths, improvements, and skill gap analysis after every submission."},
    {icon:"💼",title:"Live Job Board",pastel:C.pastelGreen,desc:"12+ real roles from Stripe, Google, Razorpay matched to your actual performance."},
    {icon:"📜",title:"Proof-of-Work Certs",pastel:C.pastelYellow,desc:"Earn a verifiable certificate per challenge — shareable on LinkedIn instantly."},
    {icon:"🏆",title:"Global Leaderboard",pastel:C.pastelPurple,desc:"Compete with developers worldwide. Climb the weekly and all-time rankings."},
  ];
  const steps=[
    {n:"01",title:"Pick a Challenge",pastel:C.pastelBlue,accent:"#3B82F6",desc:"Browse 12 challenges by category and difficulty with full problem statements."},
    {n:"02",title:"Solve in Live Editor",pastel:C.pastelPurple,accent:C.indigo,desc:"Write in JS, Python, or Java. Real-time metrics track your authentic effort."},
    {n:"03",title:"Get Results + Jobs",pastel:C.pastelGreen,accent:C.green,desc:"AI analysis, job matches, leaderboard rank, and a certificate — instantly."},
  ];
  const jobRoles=[
    {role:"Backend Developer",      prob:78,icon:"⚙️",pastel:C.pastelPurple,accent:C.indigo,   score:"80+",desc:"Servers, APIs & databases"},
    {role:"Full-Stack Engineer",    prob:71,icon:"🌐",pastel:C.pastelBlue,  accent:"#3B82F6",score:"80+",desc:"End-to-end web products"},
    {role:"Junior Developer",       prob:72,icon:"🚀",pastel:C.pastelGreen, accent:C.green,   score:"65+",desc:"Entry-level, fast growth track"},
    {role:"Frontend Developer",     prob:61,icon:"🎨",pastel:C.pastelYellow,accent:C.amber,   score:"65+",desc:"UIs and user experience"},
    {role:"QA Automation Engineer", prob:55,icon:"🔍",pastel:C.pastelPurple,accent:C.indigo,   score:"65+",desc:"Quality & test automation"},
    {role:"Software Engineer II",   prob:65,icon:"💻",pastel:C.pastelBlue,  accent:"#3B82F6",score:"80+",desc:"Mid-level feature ownership"},
  ];

  return(
    <div style={{background:C.bg,overflowY:"auto",flex:1}}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 60%, #312e81 100%)`,padding:isMobile?"56px 20px 48px":"80px 24px 72px",position:"relative",overflow:"hidden"}}>
        {/* Decorative blobs */}
        <div style={{position:"absolute",top:-80,right:-80,width:340,height:340,background:C.indigo,borderRadius:"50%",opacity:.08}}/>
        <div style={{position:"absolute",bottom:-60,left:"40%",width:200,height:200,background:"#818CF8",borderRadius:"50%",opacity:.06}}/>
        <div style={{maxWidth:860,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,.25)",border:"1px solid rgba(99,102,241,.4)",borderRadius:99,padding:"6px 18px",marginBottom:24}}>
            <span style={{width:7,height:7,background:C.indigoMid,borderRadius:"50%",display:"inline-block"}}/>
            <span style={{fontSize:12,fontWeight:600,color:"#c7d2fe",letterSpacing:.5}}>AI-Powered Coding Evaluation Platform</span>
          </div>
          <h1 style={{fontSize:isMobile?30:54,fontWeight:900,lineHeight:1.08,margin:"0 0 20px",color:"#fff",letterSpacing:"-1px"}}>
            Prove Your Skills.<br/>
            <span style={{color:"#a5b4fc"}}>Land Your Dream Job.</span>
          </h1>
          <p style={{fontSize:isMobile?15:17,color:"#94a3b8",maxWidth:560,margin:"0 auto 32px",lineHeight:1.75,fontWeight:400}}>
            Solve real coding challenges, get AI-powered integrity scoring, earn verifiable certificates,
            and get matched to live job openings — all in one platform.
          </p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
            <button onClick={onGetStarted} className="sl-btn-hover" style={{padding:"14px 34px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 14px rgba(79,70,229,.4)"}}>Get Started Free →</button>
            <button onClick={onLogin} style={{padding:"14px 28px",background:"rgba(255,255,255,.08)",color:"#e2e8f0",border:"1px solid rgba(255,255,255,.18)",borderRadius:10,fontWeight:600,fontSize:15,cursor:"pointer"}}>Log In</button>
          </div>
          <p style={{fontSize:12,color:"#64748b"}}>No credit card required · Free forever for 2 challenges · Instant results</p>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <section style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"18px 24px"}}>
        <div style={{maxWidth:1040,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",gap:isMobile?20:48,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase"}}>Developers hired at</span>
          {["Google","Stripe","Razorpay","Flipkart","Freshworks","Atlassian"].map(c=>(
            <span key={c} style={{fontSize:13,fontWeight:700,color:C.textMid,opacity:.75}}>{c}</span>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{padding:isMobile?"28px 20px":"40px 24px",maxWidth:1040,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:16}}>
          {[
            {v:"12",l:"Practice Challenges",sub:"Across 8 categories",a:C.indigo},
            {v:"15",l:"Global Leaderboard",sub:"Compete worldwide",a:"#0EA5E9"},
            {v:"12+",l:"Live Job Openings",sub:"Matched to your score",a:C.green},
            {v:"100%",l:"Verified Certificates",sub:"Shareable on LinkedIn",a:C.amber},
          ].map(s=>(
            <div key={s.l} style={{background:C.white,borderRadius:16,padding:"22px 20px",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontWeight:900,fontSize:isMobile?28:36,color:s.a,lineHeight:1,marginBottom:6}}>{s.v}</div>
              <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:11,color:C.muted}}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section style={{padding:isMobile?"0 20px 36px":"0 24px 52px",maxWidth:1040,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.indigoLight,borderRadius:99,padding:"4px 14px",marginBottom:12}}>
            <span style={{fontSize:11,fontWeight:700,color:C.indigo}}>Platform Features</span>
          </div>
          <h2 style={{fontWeight:800,fontSize:isMobile?20:28,color:C.text,margin:"0 0 8px",letterSpacing:"-0.5px"}}>Everything you need to prove your worth</h2>
          <p style={{color:C.muted,fontSize:14,maxWidth:480,margin:"0 auto"}}>A complete evaluation ecosystem — from first keystroke to job offer.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:cols3,gap:16}}>
          {features.map(f=>(
            <div key={f.title} className="sl-card-hover" style={{background:C.white,borderRadius:16,padding:"24px 20px",border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{width:46,height:46,background:f.pastel,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14}}>{f.icon}</div>
              <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 7px",color:C.text}}>{f.title}</h3>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{background:C.dark,padding:isMobile?"36px 20px":"60px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:220,height:220,background:C.indigo,borderRadius:"50%",opacity:.06}}/>
        <div style={{maxWidth:860,margin:"0 auto",position:"relative"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.08)",borderRadius:99,padding:"4px 14px",marginBottom:12}}>
              <span style={{fontSize:11,fontWeight:700,color:"#a5b4fc"}}>Simple Process</span>
            </div>
            <h2 style={{fontWeight:800,fontSize:isMobile?20:28,color:"#fff",margin:"0 0 8px",letterSpacing:"-0.5px"}}>From Code to Certificate in 3 Steps</h2>
            <p style={{color:"#64748b",fontSize:14}}>Takes less than an hour. Results last a lifetime.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:cols3,gap:20}}>
            {steps.map((s,i)=>(
              <div key={s.n} style={{background:"rgba(255,255,255,.05)",borderRadius:16,padding:"28px 22px",border:"1px solid rgba(255,255,255,.08)",position:"relative"}}>
                <div style={{width:44,height:44,background:C.indigo,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,fontWeight:900,fontSize:16,color:"#fff"}}>{i+1}</div>
                <h3 style={{fontWeight:700,fontSize:15,margin:"0 0 8px",color:"#e2e8f0"}}>{s.title}</h3>
                <p style={{fontSize:13,color:"#64748b",lineHeight:1.65,margin:0}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHALLENGES PREVIEW ────────────────────────────────── */}
      <section style={{padding:isMobile?"36px 20px":"60px 24px",maxWidth:1040,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12,marginBottom:28}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.indigoLight,borderRadius:99,padding:"4px 14px",marginBottom:10}}>
              <span style={{fontSize:11,fontWeight:700,color:C.indigo}}>Coding Challenges</span>
            </div>
            <h2 style={{fontWeight:800,fontSize:isMobile?20:28,color:C.text,margin:"0 0 6px",letterSpacing:"-0.5px"}}>Practice with Real Interview Problems</h2>
            <p style={{color:C.muted,fontSize:14,margin:0}}>First 2 challenges are free. Sign up to unlock all 12.</p>
          </div>
          <button onClick={onGetStarted} style={{padding:"10px 20px",background:C.indigo,color:"#fff",border:"none",borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer",flexShrink:0}}>Unlock All 12 →</button>
        </div>
        <div className="sl-grid-2">
          {CHALLENGES.slice(0,6).map((ch,idx)=>{
            const locked=idx>=2;
            return(
              <div key={ch.id} className="sl-card-hover" style={{background:C.white,borderRadius:14,padding:isMobile?14:20,position:"relative",border:`1px solid ${locked?"#E2E8F0":C.indigo+"26"}`,boxShadow:"0 1px 3px rgba(0,0,0,.05)",opacity:locked?.8:1}}>
                {locked&&<div style={{position:"absolute",top:14,right:14}}><Badge label="🔒 Sign up" color={C.indigo}/></div>}
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:40,height:40,background:locked?C.border:ch.pastel,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{locked?"🔒":ch.icon}</div>
                  <div>
                    <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 4px",color:locked?C.muted:C.text}}>{ch.title}</h3>
                    <div style={{display:"flex",gap:5}}>
                      <Badge label={ch.category} color={locked?C.muted:ch.accent}/>
                      <Badge label={ch.difficulty} color={ch.difficulty==="Easy"?C.green:ch.difficulty==="Medium"?C.amber:C.red}/>
                    </div>
                  </div>
                </div>
                <p style={{fontSize:12,color:C.muted,margin:"0 0 12px",lineHeight:1.5}}>{ch.description.split("\n")[0]}</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:12,fontSize:12,color:C.muted}}>
                    <span style={{fontWeight:700,color:locked?C.muted:ch.accent}}>+{ch.xp} XP</span>
                    <span>⏱ {ch.timeLimit} min</span>
                  </div>
                  <button onClick={onGetStarted} style={{padding:"6px 14px",background:locked?C.bg:C.indigo,color:locked?C.indigo:"#fff",border:`1px solid ${locked?C.border:C.indigo}`,borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>{locked?"Sign up →":"Try Free →"}</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CAREER MATCHING ───────────────────────────────────── */}
      <section style={{background:C.indigoLight,padding:isMobile?"36px 20px":"60px 24px"}}>
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:16,marginBottom:32}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.indigo+"18",borderRadius:99,padding:"4px 14px",marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,color:C.indigo}}>Career Pathways</span>
              </div>
              <h2 style={{fontWeight:800,fontSize:isMobile?20:28,color:C.text,margin:"0 0 6px",letterSpacing:"-0.5px"}}>Jobs You Can Land with SkillLens</h2>
              <p style={{color:C.muted,fontSize:14,margin:0}}>Performance-based matching — not just keywords on a résumé.</p>
            </div>
            <button onClick={onGetStarted} style={{padding:"10px 22px",background:C.indigo,color:"#fff",border:"none",borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer",flexShrink:0}}>Get Matched →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:cols3,gap:14,marginBottom:20}}>
            {jobRoles.map(j=>(
              <div key={j.role} className="sl-card-hover" style={{background:C.white,borderRadius:14,padding:"20px 18px",border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{width:42,height:42,background:j.pastel,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{j.icon}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:900,fontSize:22,color:C.indigo,lineHeight:1}}>{j.prob}%</div>
                    <div style={{fontSize:10,color:C.muted,fontWeight:600}}>match rate</div>
                  </div>
                </div>
                <h3 style={{fontWeight:700,fontSize:14,margin:"0 0 4px",color:C.text}}>{j.role}</h3>
                <p style={{fontSize:12,color:C.muted,margin:"0 0 12px",lineHeight:1.5}}>{j.desc}</p>
                <ProgressBar value={j.prob} color={C.indigo} height={4}/>
                <div style={{marginTop:8,fontSize:11,color:C.indigo,fontWeight:600}}>Score {j.score}+ to qualify</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section style={{padding:isMobile?"36px 20px":"60px 24px",maxWidth:1040,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <h2 style={{fontWeight:800,fontSize:isMobile?20:28,color:C.text,margin:"0 0 8px",letterSpacing:"-0.5px"}}>Trusted by Developers Who Got Hired</h2>
          <p style={{color:C.muted,fontSize:14}}>Real stories. Real results.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:16}}>
          {[
            {name:"Rohan Verma",  role:"Software Engineer · Razorpay",  avatar:"RV",text:"SkillLens showed recruiters my actual abilities. Got my offer in just 3 weeks.",stars:5},
            {name:"Emma Clarke",  role:"Junior Dev · Shopify",           avatar:"EC",text:"The AI feedback pinpointed exactly what I was doing wrong. Total game-changer.",stars:5},
            {name:"David Kim",    role:"SWE II · Google",                avatar:"DK",text:"Integrity score gave me confidence to share results publicly. Huge credibility boost.",stars:5},
            {name:"Ananya Nair",  role:"Engineering Intern · Freshworks",avatar:"AN",text:"As a fresher, the certificate helped me stand out from 500+ applicants.",stars:5},
          ].map(t=>(
            <div key={t.name} style={{background:C.white,borderRadius:16,padding:"22px 18px",border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{display:"flex",gap:2,marginBottom:12}}>
                {"★★★★★".split("").map((_,i)=>(
                  <span key={i} style={{fontSize:14,color:C.amber}}>★</span>
                ))}
              </div>
              <p style={{fontSize:13,color:C.textMid,lineHeight:1.7,margin:"0 0 16px",fontStyle:"italic"}}>"{t.text}"</p>
              <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
                <Avatar initials={t.avatar} size={34}/>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:C.text}}>{t.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{padding:isMobile?"0 20px 48px":"0 24px 72px",maxWidth:860,margin:"0 auto"}}>
        <div style={{background:`linear-gradient(135deg, ${C.dark} 0%, #1e1b4b 100%)`,borderRadius:20,padding:isMobile?"36px 24px":"56px 48px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,background:C.indigo,borderRadius:"50%",opacity:.12}}/>
          <div style={{position:"relative"}}>
            <h2 style={{fontWeight:900,fontSize:isMobile?22:32,color:"#fff",margin:"0 0 12px",letterSpacing:"-0.5px"}}>Ready to Prove Your Skills?</h2>
            <p style={{color:"#64748b",fontSize:15,margin:"0 0 28px",lineHeight:1.6}}>Join thousands of developers earning certificates that actually matter to recruiters.</p>
            <button onClick={onGetStarted} className="sl-btn-hover" style={{padding:"14px 36px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 14px rgba(79,70,229,.4)",marginBottom:12}}>Create Free Account →</button>
            <p style={{fontSize:12,color:"#475569",margin:0}}>No credit card required · Set up in 30 seconds</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{background:C.dark,borderTop:`1px solid rgba(255,255,255,.06)`,padding:isMobile?"28px 20px":"36px 24px"}}>
        <div style={{maxWidth:1040,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr 1fr",gap:28,marginBottom:28}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:28,height:28,background:C.indigoLight,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🧠</div>
                <span style={{fontWeight:800,fontSize:14,color:"#fff"}}>Skill<span style={{color:C.indigoMid}}>Lens</span></span>
              </div>
              <p style={{fontSize:12,color:"#64748b",lineHeight:1.7,margin:0}}>AI-powered coding evaluation that connects developers with opportunities through provable skills.</p>
            </div>
            {[
              {title:"Platform",links:["Challenges","Leaderboard","Job Board","Certificates"]},
              {title:"Company",links:["About","Blog","Careers","Press"]},
              {title:"Legal",links:["Privacy Policy","Terms of Service","Cookie Policy","Contact"]},
            ].map(col=>(
              <div key={col.title}>
                <h4 style={{fontWeight:700,fontSize:12,color:"#94a3b8",marginBottom:12,textTransform:"uppercase",letterSpacing:.6}}>{col.title}</h4>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{display:"block",fontSize:13,color:"#64748b",textDecoration:"none",marginBottom:8,transition:"color .15s"}}
                    onMouseEnter={e=>e.target.style.color="#94a3b8"} onMouseLeave={e=>e.target.style.color="#64748b"}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <p style={{fontSize:12,color:"#475569",margin:0}}>© 2025 SkillLens Technologies. All rights reserved.</p>
            <p style={{fontSize:12,color:"#475569",margin:0}}>Prove your skills, not just your résumé.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default LandingPage;
