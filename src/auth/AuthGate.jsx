
import React, { useState } from "react";
import { C, DUMMY_USERS, DUMMY_SOCIAL } from "../data/constants.js";
import useBreakpoint from "../components/shared/useBreakpoint.js";
import { inputSt, Avatar } from "../components/shared/Atoms.jsx";
import { supabase } from "../utils/supabase.js";

function AuthGate({onLogin,onBack,mode:initMode="login"}){
  const [mode,setMode]=useState(initMode);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [showPw,setShowPw]=useState(false);
  const {isMobile}=useBreakpoint();

  const handleEmail=()=>{
    setError("");
    if(mode==="login"){
      const u=DUMMY_USERS.find(u=>u.email===email&&u.password===password);
      if(!u){setError("Invalid email or password. Try alex@skilllens.io / password123");return;}
      onLogin(u);
    } else {
      if(!name.trim()){setError("Please enter your name.");return;}
      if(!email.includes("@")){setError("Enter a valid email.");return;}
      if(password.length<6){setError("Password must be at least 6 characters.");return;}
      const newUser={id:Date.now(),name,email,password,avatar:name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),points:0,streak:0,provider:"email"};
      onLogin(newUser);
    }
  };

  const handleSocial = async provider => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
       console.error(error);
       setError(error.message);
       setLoading(false);
    }
  };

  return(
    <div style={{flex:1,display:"flex",overflowY:"auto",background:C.dark}}>
      {/* Left panel — branding/features (hidden on mobile) */}
      {!isMobile&&(
        <div style={{flex:"0 0 42%",background:`linear-gradient(160deg, ${C.dark} 0%, #1e1b4b 50%, #312e81 100%)`,display:"flex",flexDirection:"column",justifyContent:"center",padding:"52px 48px",position:"relative",overflow:"hidden",borderRight:"1px solid rgba(255,255,255,.07)"}}>
          {/* Decorative blobs */}
          <div style={{position:"absolute",top:-60,right:-60,width:240,height:240,background:C.indigo,borderRadius:"50%",opacity:.08}}/>
          <div style={{position:"absolute",bottom:-40,left:-40,width:160,height:160,background:"#818cf8",borderRadius:"50%",opacity:.06}}/>
          <div style={{position:"relative"}}>
            {/* Logo */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
              <img src="Main-Dark-logo.png" alt="logo" style={{ width: 120, height: 50, objectFit:"contain" }} />
            </div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(99,102,241,.2)",border:"1px solid rgba(99,102,241,.35)",borderRadius:99,padding:"5px 16px",marginBottom:20}}>
              <span style={{width:6,height:6,background:"#818cf8",borderRadius:"50%",display:"inline-block"}}/>
              <span style={{fontSize:11,fontWeight:600,color:"#c7d2fe",letterSpacing:.5}}>AI-Powered Coding Platform</span>
            </div>
            <h1 style={{fontWeight:900,fontSize:30,lineHeight:1.15,margin:"0 0 16px",color:"#fff",letterSpacing:"-0.5px"}}>
              Prove Your Skills.<br/><span style={{color:"#a5b4fc"}}>Land Your Dream Job.</span>
            </h1>
            <p style={{fontSize:14,color:"#64748b",lineHeight:1.75,margin:"0 0 36px"}}>Solve real coding challenges, earn verifiable certificates, and get matched to live job openings.</p>
            {/* Feature bullets */}
            {[
              {icon:"⌨️",text:"12 real interview-style challenges"},
              {icon:"🔍",text:"AI integrity & code quality scoring"},
              {icon:"📜",text:"Verifiable certificates for LinkedIn"},
              {icon:"💼",text:"Live job matching based on your score"},
            ].map(f=>(
              <div key={f.text} style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:34,height:34,background:"rgba(99,102,241,.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{f.icon}</div>
                <span style={{fontSize:13,color:"#94a3b8",fontWeight:500}}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right panel — auth form */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,padding:"28px 20px",overflowY:"auto"}}>
        <div style={{width:"100%",maxWidth:420}}>
          {/* Back to home */}
          {onBack&&(
            <button onClick={onBack}
              style={{display:"flex",alignItems:"center",gap:6,background:"none",border:`1px solid ${C.border}`,cursor:"pointer",color:C.textMid,fontSize:13,fontWeight:600,marginBottom:24,padding:"7px 14px",borderRadius:8,transition:"all .15s",width:"fit-content"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.indigo;e.currentTarget.style.color=C.indigo;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textMid;}}>
              ← Back to Home
            </button>
          )}
          {/* Header */}
          <div style={{marginBottom:28}}>
            {isMobile&&(
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <img src="MainLogo-removebg-preview.png" alt="logo" style={{ width: 90, height: 50, objectFit:"contain" }} />
              </div>
            )}
            <h2 style={{fontWeight:900,fontSize:24,color:C.text,margin:"0 0 6px"}}>{mode==="login"?"Welcome back":"Create your account"}</h2>
            <p style={{color:C.muted,fontSize:13,margin:0}}>{mode==="login"?"Log in to continue your coding journey":"Start earning verifiable certificates today — free"}</p>
          </div>

          <div style={{background:C.white,borderRadius:16,padding:24,boxShadow:"0 1px 6px rgba(0,0,0,.06)"}}>
            {/* Social */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
              {[
                {p:"google",  icon:"🇬",label:"Google"},
                {p:"github",  icon:"⌥",label:"GitHub"},
                {p:"linkedin",icon:"💼",label:"LinkedIn"},
                {p:"apple",   icon:"🍎",label:"Apple"},
              ].map(s=>(
                <button key={s.p} onClick={()=>handleSocial(s.p)} disabled={loading}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px 12px",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:13,color:C.text,opacity:loading?.6:1,transition:"all .15s"}}>
                  <span style={{fontSize:15}}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:12,color:C.muted,flexShrink:0}}>or continue with email</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            {mode==="signup"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" style={inputSt}/>}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inputSt}/>
            <div style={{position:"relative",marginBottom:10}}>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type={showPw?"text":"password"}
                style={{...inputSt,marginBottom:0,paddingRight:44}}
                onKeyDown={e=>e.key==="Enter"&&handleEmail()}/>
              <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:15,color:C.muted}}>{showPw?"🙈":"👁"}</button>
            </div>

            {error&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:9,padding:"9px 12px",marginBottom:12,fontSize:12,color:C.red}}>{error}</div>}

            <button onClick={handleEmail} disabled={loading} className="sl-btn-hover"
              style={{width:"100%",padding:"13px",background:loading?C.muted:`linear-gradient(135deg,${C.indigo} 0%,#6366f1 100%)`,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:14,boxShadow:loading?"none":"0 4px 14px rgba(79,70,229,.35)"}}>
              {loading?"Please wait…":mode==="login"?"Log In →":"Create Account →"}
            </button>

            <div style={{textAlign:"center",fontSize:13}}>
              {mode==="login"?(
                <><span style={{color:C.muted}}>Don't have an account? </span><button onClick={()=>{setMode("signup");setError("");}} style={{color:C.indigo,fontWeight:700,background:"none",border:"none",cursor:"pointer"}}>Sign up free</button></>
              ):(
                <><span style={{color:C.muted}}>Already have an account? </span><button onClick={()=>{setMode("login");setError("");}} style={{color:C.indigo,fontWeight:700,background:"none",border:"none",cursor:"pointer"}}>Log in</button></>
              )}
            </div>
          </div>

          {/* Demo accounts */}
          {mode==="login"&&(
            <div style={{marginTop:16}}>
              <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:8}}>⚡ Quick demo accounts:</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {DUMMY_USERS.map(u=>(
                  <button key={u.id} onClick={()=>{setEmail(u.email);setPassword(u.password);}}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:C.white,border:`1px solid ${C.border}`,borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.indigo}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <Avatar initials={u.avatar} size={28}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:12}}>{u.name}</div>
                      <div style={{fontSize:11,color:C.muted}}>{u.email}</div>
                    </div>
                    <span style={{fontSize:11,color:C.indigo,fontWeight:600}}>Use →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default AuthGate;
