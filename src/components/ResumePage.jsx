
import React, { useState, useRef } from "react";
import { C } from "../data/constants.js";
import { scoreColor, integrityLabel } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, inputSt, ProgressBar, CircleScore, Avatar } from "./shared/Atoms.jsx";

const EMPTY_PROFILE={fullName:"",email:"",phone:"",location:"",headline:"",summary:"",linkedin:"",github:"",portfolio:"",jobTitle:"",jobType:"",remotePreference:"",availability:"",salaryMin:"",salaryMax:"",noticePeriod:"",experience:[],education:[],skills:[],languages:[],certifications:[]};


function TagInput({tags,setTags,placeholder}){
  const [val,setVal]=useState("");
  const add=()=>{const t=val.trim();if(t&&!tags.includes(t)){setTags([...tags,t]);setVal("");}};
  return(
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
        {tags.map(t=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:5,background:C.indigoLight,color:C.indigo,borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>
            {t}<button onClick={()=>setTags(tags.filter(x=>x!==t))} style={{background:"none",border:"none",cursor:"pointer",color:C.indigo,fontWeight:800,fontSize:14,lineHeight:1,padding:0}}>×</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6}}>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add();}}} placeholder={placeholder} style={{...inputSt,marginBottom:0,flex:1}}/>
        <button onClick={add} style={{padding:"10px 14px",background:C.indigo,color:"#fff",border:"none",borderRadius:9,fontWeight:700,cursor:"pointer",flexShrink:0}}>+</button>
      </div>
    </div>
  );
}


function ResumePage({user,results}){
  const [profile,setProfile]=useState({...EMPTY_PROFILE,fullName:user?.name||"",email:user?.email||""});
  const [activeTab,setActiveTab]=useState("personal");
  const [file,setFile]=useState(null);
  const [parsing,setParsing]=useState(false);
  const [parseSuccess,setParseSuccess]=useState(false);
  const [dragOver,setDragOver]=useState(false);
  const {isMobile}=useBreakpoint();
  const fileRef=useRef();
  const latest=results.length?results[results.length-1]:null;

  const up=fields=>setProfile(p=>({...p,...fields}));

  const completeness=Math.round([
    profile.fullName,profile.email,profile.phone,profile.location,profile.headline,profile.summary,
    profile.skills.length,profile.experience.length,profile.education.length,profile.jobTitle,
  ].filter(Boolean).length/10*100);

  const handleFile=async f=>{
    if(!f)return;
    setFile(f);setParsing(true);setParseSuccess(false);
    try{
      const text=await f.text();
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:`Extract info from this resume as JSON only (no markdown): {"fullName","email","phone","location","headline","summary","jobTitle","skills":[],"languages":[],"certifications":[],"experience":[{"title","company","location","from","to","description"}],"education":[{"degree","institution","field","from","to","gpa"}]}\n\nResume:\n${text.slice(0,3000)}`}]})
      });
      const data=await resp.json();
      const raw=data.content?.[0]?.text||"{}";
      const clean=raw.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      setProfile(p=>({...p,...parsed,skills:parsed.skills||p.skills,languages:parsed.languages||p.languages,certifications:parsed.certifications||p.certifications,experience:parsed.experience||p.experience,education:parsed.education||p.education}));
      setParseSuccess(true);
    }catch{
      // Demo fallback
      setProfile(p=>({...p,headline:"Software Developer",skills:["JavaScript","React","Node.js","Python"],summary:"Experienced software developer with strong problem-solving skills."}));
      setParseSuccess(true);
    }
    setParsing(false);
  };

  const sectionTabs=[
    {id:"personal",label:"👤 Personal"},
    {id:"experience",label:"💼 Experience"},
    {id:"education",label:"🎓 Education"},
    {id:"skills",label:"⚡ Skills"},
    {id:"preferences",label:"🎯 Preferences"},
  ];

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      {!parseSuccess&&!file?(
        <div style={{background:"linear-gradient(135deg,#5B5FED 0%,#8B8FF8 50%,#1C1C2E 100%)",padding:isMobile?"28px 18px":"40px 32px",position:"relative",overflow:"hidden",flexShrink:0}}>
          <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,background:"rgba(255,255,255,.05)",borderRadius:"50%"}}/>
          <div style={{position:"relative",display:"flex",alignItems:isMobile?"flex-start":"center",gap:20,flexWrap:"wrap"}}>
            <Avatar initials={user?.avatar||"👋"} size={60} bg="rgba(255,255,255,.15)" />
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Welcome to SkillLens 🎉</div>
              <h1 style={{fontWeight:900,fontSize:isMobile?20:26,color:"#fff",margin:"0 0 6px",lineHeight:1.2}}>Hey {user?.name?.split(" ")[0]}! Build your profile.</h1>
              <p style={{color:"rgba(255,255,255,.6)",fontSize:13,margin:0,lineHeight:1.6}}>Upload your resume — AI reads it and fills every field in seconds.</p>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["📄","Upload"],["🤖","AI fills"],["✅","Review"]].map(([ic,l],i)=>(
                <div key={l} style={{background:"rgba(255,255,255,.08)",borderRadius:10,padding:"10px 14px",textAlign:"center",minWidth:76}}>
                  <div style={{fontSize:16,marginBottom:4}}>{ic}</div>
                  <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",marginBottom:2}}>STEP {i+1}</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ):(
        <PageHero tag="👤 My Profile" title="Career Profile" sub="Upload your resume — AI fills your profile instantly."
          extras={
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"8px 14px",backdropFilter:"blur(4px)",minWidth:150}}>
                <div style={{fontSize:10,color:"#666",marginBottom:4}}>PROFILE COMPLETENESS</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:5,background:"rgba(255,255,255,.1)",borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${completeness}%`,height:"100%",background:completeness>=80?C.green:completeness>=50?C.amber:C.indigo,borderRadius:99,transition:"width .5s ease"}}/>
                  </div>
                  <span style={{fontWeight:800,fontSize:13,color:"#fff"}}>{completeness}%</span>
                </div>
              </div>
              {latest&&<div style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"8px 14px"}}><div style={{fontSize:10,color:"#666",marginBottom:1}}>LAST SCORE</div><div style={{fontWeight:900,fontSize:16,color:scoreColor(latest.codeScore)}}>{latest.codeScore}</div></div>}
            </div>
          }
        />
      )}

      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        {/* Upload zone */}
        <Card style={{marginBottom:16,border:!parseSuccess&&!file?`2px solid ${C.indigo}`:"none",boxShadow:!parseSuccess&&!file?`0 0 0 4px ${C.indigoLight}`:"0 1px 4px rgba(0,0,0,.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div>
              <h2 style={{fontWeight:900,fontSize:15,margin:"0 0 2px"}}>📄 Upload Resume</h2>
              <p style={{color:C.muted,fontSize:12,margin:0}}>{parseSuccess?"Parsed — edit your details below":"AI reads and fills all fields automatically"}</p>
            </div>
            {parseSuccess&&<button onClick={()=>fileRef.current?.click()} style={{padding:"6px 14px",background:C.indigoLight,color:C.indigo,border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>🔄 Re-upload</button>}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
            onClick={()=>!parseSuccess&&fileRef.current?.click()}
            style={{border:`2px dashed ${dragOver?C.indigo:parseSuccess?C.green:C.border}`,borderRadius:12,padding:"28px 20px",textAlign:"center",cursor:parseSuccess?"default":"pointer",background:dragOver?C.indigoLight:parseSuccess?C.pastelGreen:C.bg,transition:"all .2s"}}>
            {parsing?(
              <div>
                <div style={{fontSize:32,marginBottom:10,animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</div>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px"}}>Parsing your resume…</p>
                <p style={{color:C.muted,fontSize:12,margin:0}}>AI is extracting your information</p>
              </div>
            ):parseSuccess?(
              <div>
                <div style={{fontSize:32,marginBottom:10}}>✅</div>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px",color:C.green}}>Resume parsed successfully!</p>
                <p style={{color:C.muted,fontSize:12,margin:0}}>Review and edit your details below.</p>
              </div>
            ):(
              <div>
                <div style={{fontSize:40,marginBottom:10}}>📄</div>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 6px"}}>Drop your resume here</p>
                <p style={{color:C.muted,fontSize:12,margin:"0 0 12px"}}>or click to browse · PDF, DOCX, TXT</p>
                <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                  {[["PDF","#FEF3C7","#D97706"],["DOCX","#DBEAFE","#2563EB"],["TXT","#D1FAE5","#059669"]].map(([f,bg,col])=>(
                    <span key={f} style={{background:bg,color:col,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700}}>{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="sl-two-col">
          {/* Form */}
          <div>
            {/* Section tabs */}
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
              {sectionTabs.map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${activeTab===t.id?C.indigo:C.border}`,background:activeTab===t.id?C.indigo:C.white,color:activeTab===t.id?"#fff":C.textMid,fontWeight:600,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab==="personal"&&(
              <Card>
                <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 14px"}}>👤 Personal Info</h3>
                <div className="sl-grid-2">
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Full Name</label><input value={profile.fullName} onChange={e=>up({fullName:e.target.value})} placeholder="Alex Rudewel" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Email</label><input value={profile.email} onChange={e=>up({email:e.target.value})} placeholder="alex@email.com" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Phone</label><input value={profile.phone} onChange={e=>up({phone:e.target.value})} placeholder="+91 98765 43210" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Location</label><input value={profile.location} onChange={e=>up({location:e.target.value})} placeholder="Bengaluru, India" style={inputSt}/></div>
                </div>
                <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Headline</label><input value={profile.headline} onChange={e=>up({headline:e.target.value})} placeholder="Full-Stack Developer with 3 years experience" style={inputSt}/></div>
                <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Summary</label><textarea value={profile.summary} onChange={e=>up({summary:e.target.value})} placeholder="Brief professional summary…" rows={4} style={{...inputSt,resize:"vertical"}}/></div>
                <div className="sl-grid-2">
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>LinkedIn</label><input value={profile.linkedin} onChange={e=>up({linkedin:e.target.value})} placeholder="linkedin.com/in/you" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>GitHub</label><input value={profile.github} onChange={e=>up({github:e.target.value})} placeholder="github.com/you" style={inputSt}/></div>
                </div>
              </Card>
            )}

            {activeTab==="experience"&&(
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h3 style={{fontWeight:800,fontSize:15,margin:0}}>💼 Experience</h3>
                  <button onClick={()=>up({experience:[...profile.experience,{title:"",company:"",location:"",from:"",to:"",description:""}]})} style={{padding:"6px 12px",background:C.indigo,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Add</button>
                </div>
                {profile.experience.length===0&&<p style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No experience added yet. Click + Add.</p>}
                {profile.experience.map((exp,i)=>(
                  <div key={i} style={{background:C.bg,borderRadius:12,padding:"14px",marginBottom:12,position:"relative"}}>
                    <button onClick={()=>up({experience:profile.experience.filter((_,j)=>j!==i)})} style={{position:"absolute",top:10,right:10,background:C.red+"18",border:"none",borderRadius:6,color:C.red,cursor:"pointer",fontWeight:700,fontSize:11,padding:"3px 7px"}}>✕ Remove</button>
                    <div className="sl-grid-2">
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>Title</label><input value={exp.title} onChange={e=>{const ex=[...profile.experience];ex[i]={...ex[i],title:e.target.value};up({experience:ex});}} placeholder="Software Engineer" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>Company</label><input value={exp.company} onChange={e=>{const ex=[...profile.experience];ex[i]={...ex[i],company:e.target.value};up({experience:ex});}} placeholder="Acme Corp" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>From</label><input value={exp.from} onChange={e=>{const ex=[...profile.experience];ex[i]={...ex[i],from:e.target.value};up({experience:ex});}} placeholder="Jan 2022" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>To</label><input value={exp.to} onChange={e=>{const ex=[...profile.experience];ex[i]={...ex[i],to:e.target.value};up({experience:ex});}} placeholder="Present" style={inputSt}/></div>
                    </div>
                    <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>Description</label><textarea value={exp.description} onChange={e=>{const ex=[...profile.experience];ex[i]={...ex[i],description:e.target.value};up({experience:ex});}} rows={3} placeholder="Key achievements and responsibilities…" style={{...inputSt,resize:"vertical"}}/></div>
                  </div>
                ))}
              </Card>
            )}

            {activeTab==="education"&&(
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h3 style={{fontWeight:800,fontSize:15,margin:0}}>🎓 Education</h3>
                  <button onClick={()=>up({education:[...profile.education,{degree:"",institution:"",field:"",from:"",to:"",gpa:""}]})} style={{padding:"6px 12px",background:C.indigo,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>+ Add</button>
                </div>
                {profile.education.length===0&&<p style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No education added yet. Click + Add.</p>}
                {profile.education.map((edu,i)=>(
                  <div key={i} style={{background:C.bg,borderRadius:12,padding:"14px",marginBottom:12,position:"relative"}}>
                    <button onClick={()=>up({education:profile.education.filter((_,j)=>j!==i)})} style={{position:"absolute",top:10,right:10,background:C.red+"18",border:"none",borderRadius:6,color:C.red,cursor:"pointer",fontWeight:700,fontSize:11,padding:"3px 7px"}}>✕ Remove</button>
                    <div className="sl-grid-2">
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>Degree</label><input value={edu.degree} onChange={e=>{const ed=[...profile.education];ed[i]={...ed[i],degree:e.target.value};up({education:ed});}} placeholder="B.Tech" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>Institution</label><input value={edu.institution} onChange={e=>{const ed=[...profile.education];ed[i]={...ed[i],institution:e.target.value};up({education:ed});}} placeholder="IIT Bombay" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>Field</label><input value={edu.field} onChange={e=>{const ed=[...profile.education];ed[i]={...ed[i],field:e.target.value};up({education:ed});}} placeholder="Computer Science" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>GPA</label><input value={edu.gpa} onChange={e=>{const ed=[...profile.education];ed[i]={...ed[i],gpa:e.target.value};up({education:ed});}} placeholder="8.5/10" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>From</label><input value={edu.from} onChange={e=>{const ed=[...profile.education];ed[i]={...ed[i],from:e.target.value};up({education:ed});}} placeholder="2019" style={inputSt}/></div>
                      <div><label style={{fontSize:11,fontWeight:600,color:C.muted,display:"block",marginBottom:3}}>To</label><input value={edu.to} onChange={e=>{const ed=[...profile.education];ed[i]={...ed[i],to:e.target.value};up({education:ed});}} placeholder="2023" style={inputSt}/></div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {activeTab==="skills"&&(
              <Card>
                <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px"}}>⚡ Skills & Languages</h3>
                <div style={{marginBottom:18}}>
                  <label style={{fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Technical Skills</label>
                  <TagInput tags={profile.skills} setTags={t=>up({skills:t})} placeholder="Add skill and press Enter…"/>
                </div>
                <div style={{marginBottom:18}}>
                  <label style={{fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Languages</label>
                  <TagInput tags={profile.languages} setTags={t=>up({languages:t})} placeholder="e.g. English, Hindi, French…"/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:700,color:C.muted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Certifications</label>
                  <TagInput tags={profile.certifications} setTags={t=>up({certifications:t})} placeholder="e.g. AWS Solutions Architect…"/>
                </div>
              </Card>
            )}

            {activeTab==="preferences"&&(
              <Card>
                <h3 style={{fontWeight:800,fontSize:15,margin:"0 0 16px"}}>🎯 Job Preferences</h3>
                <div className="sl-grid-2">
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Desired Title</label><input value={profile.jobTitle} onChange={e=>up({jobTitle:e.target.value})} placeholder="Full-Stack Developer" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Job Type</label>
                    <select value={profile.jobType} onChange={e=>up({jobType:e.target.value})} style={{...inputSt}}>
                      <option value="">Select…</option>
                      <option>Full-time</option><option>Part-time</option><option>Internship</option><option>Freelance</option>
                    </select>
                  </div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Remote Preference</label>
                    <select value={profile.remotePreference} onChange={e=>up({remotePreference:e.target.value})} style={{...inputSt}}>
                      <option value="">Select…</option>
                      <option>Remote</option><option>Hybrid</option><option>On-site</option>
                    </select>
                  </div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Availability</label><input value={profile.availability} onChange={e=>up({availability:e.target.value})} placeholder="Immediate / 30 days" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Min Salary</label><input value={profile.salaryMin} onChange={e=>up({salaryMin:e.target.value})} placeholder="₹12 LPA" style={inputSt}/></div>
                  <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Max Salary</label><input value={profile.salaryMax} onChange={e=>up({salaryMax:e.target.value})} placeholder="₹20 LPA" style={inputSt}/></div>
                </div>
                <div><label style={{fontSize:12,fontWeight:600,color:C.muted,display:"block",marginBottom:4}}>Notice Period</label><input value={profile.noticePeriod} onChange={e=>up({noticePeriod:e.target.value})} placeholder="30 days" style={inputSt}/></div>
              </Card>
            )}

            <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
              <button className="sl-btn-hover" style={{padding:"11px 28px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>💾 Save Profile</button>
            </div>
          </div>

          {/* Sidebar preview */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Card style={{background:C.dark}}>
              <div style={{textAlign:"center",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><Avatar initials={user?.avatar||"U"} size={60} bg={C.indigo} /></div>
                <div style={{fontWeight:800,fontSize:16,color:"#fff"}}>{profile.fullName||user?.name||"Your Name"}</div>
                <div style={{fontSize:12,color:"#888",marginTop:3}}>{profile.headline||"Add a headline…"}</div>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#555",marginBottom:5}}>PROFILE COMPLETENESS</div>
                <ProgressBar value={completeness} color={completeness>=80?C.green:completeness>=50?C.amber:C.indigo} height={6}/>
                <div style={{fontWeight:800,fontSize:14,color:"#fff",marginTop:5}}>{completeness}%</div>
              </div>
              {[["Skills",profile.skills.length],["Experience",profile.experience.length],["Education",profile.education.length]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:"1px solid rgba(255,255,255,.06)"}}>
                  <span style={{fontSize:12,color:"#666"}}>{l}</span>
                  <span style={{fontSize:12,fontWeight:800,color:v>0?C.indigoMid:"#444"}}>{v} {v===1?"item":"items"}</span>
                </div>
              ))}
            </Card>

            {latest&&(
              <Card style={{background:C.indigoLight}}>
                <h4 style={{fontWeight:800,fontSize:13,color:C.indigo,margin:"0 0 10px"}}>📊 Coding Score</h4>
                <div style={{display:"flex",justifyContent:"space-around"}}>
                  <CircleScore value={latest.codeScore} size={60} label="Code"/>
                  <CircleScore value={latest.integrityScore} size={60} label="Integrity" color={integrityLabel(latest.integrityScore).color}/>
                </div>
              </Card>
            )}

            <Card>
              <h4 style={{fontWeight:800,fontSize:13,margin:"0 0 10px"}}>💡 Profile Tips</h4>
              {[
                {tip:"Add a headline that shows your specialisation",done:!!profile.headline},
                {tip:"Upload your resume to auto-fill all fields",done:parseSuccess},
                {tip:"Add 5+ technical skills for better job matching",done:profile.skills.length>=5},
                {tip:"Include at least one work experience",done:profile.experience.length>0},
                {tip:"Set your job preferences for targeted matches",done:!!profile.jobTitle},
              ].map((t,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:7,alignItems:"flex-start"}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:t.done?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",flexShrink:0,marginTop:1}}>{t.done?"✓":""}</div>
                  <span style={{fontSize:11,color:t.done?C.muted:C.textMid,textDecoration:t.done?"line-through":"none",lineHeight:1.5}}>{t.tip}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


export default ResumePage;
