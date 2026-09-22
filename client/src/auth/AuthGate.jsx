
import React, { useState } from "react";
import { C } from "../constants/constants.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { inputSt } from "../components/common/Atoms.jsx";
import { supabase } from "../services/supabase.js";
import { loginWithEmail, signupWithEmail, requestPasswordReset } from "../services/api.js";

function AuthGate({ onLogin, onBack, mode: initMode = "login" }) {
  const [mode, setMode] = useState(initMode);
  const [accountType, setAccountType] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { isMobile } = useBreakpoint();

  const normalizeAuthError = (authError) => {
    const message = String(authError?.message || "Authentication failed.");

    if (/email is not verified|email not confirmed|verify your email/i.test(message)) {
      return "Your email is not verified yet. Check your inbox for the verification link, then log in.";
    }

    if (/too many login attempts|too many requests|rate limit/i.test(message)) {
      return "Too many login attempts. Please wait a few minutes, then try again.";
    }

    if (/email rate limit exceeded|email send limit reached/i.test(message)) {
      return "Too many verification emails were requested. Please wait a few minutes, then try again. If your account already exists, use Log in.";
    }

    if (/already registered/i.test(message)) {
      return "This email is already registered. Please switch to Log in.";
    }

    return message;
  };

  const FREE_EMAIL_DOMAINS = ["gmail.com","yahoo.com","hotmail.com","outlook.com","live.com","icloud.com","aol.com","protonmail.com","proton.me","mail.com","gmx.com","yandex.com","rediffmail.com","zoho.com"];

  const handleEmail=async ()=>{
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    if (mode === "signup" && accountType === "recruiter") {
      if (!companyName.trim()) { setError("Please enter your company name."); return; }
      const domain = email.split("@")[1]?.toLowerCase() || "";
      if (FREE_EMAIL_DOMAINS.includes(domain)) { setError("Please sign up with your company (work) email, not a personal email provider."); return; }
    }

    setLoading(true);
    try {
      if(mode==="login"){
        const data = await loginWithEmail({ email, password });

        if (data?.user) {
          const resolvedName = data.user.name || data.user.email;
          onLogin({
            id: data.user.id,
            name: resolvedName,
            email: data.user.email,
            avatar: data.user.avatar || resolvedName?.charAt(0)?.toUpperCase() || "U",
            points: 0,
            streak: 0,
            role: data.user.role || "student",
            company: data.user.company || null,
            provider: data.user.provider || "email",
          });
        }
      } else {
        if (accountType === "student" && !name.trim()) { setError("Please enter your name."); return; }

        const data = await signupWithEmail({
          name: accountType === "recruiter" ? companyName : name,
          email,
          password,
          accountType,
          company: accountType === "recruiter" ? companyName : undefined,
        });

        if (data?.user || data?.requiresConfirmation) {
          const needsVerification = !data?.accessToken;
          if (needsVerification) {
            setError("Sign-up successful. Check your inbox to verify your email, then log in.");
            setMode("login");
          } else if (data?.user) {
            onLogin({
              id: data.user.id,
              name: data.user.name || data.user.email,
              email: data.user.email,
              avatar: data.user.avatar || (accountType === "recruiter" ? companyName : name).charAt(0).toUpperCase(),
              points: 0,
              streak: 0,
              role: data.user.role || accountType,
              company: data.user.company || (accountType === "recruiter" ? companyName : null),
              provider: data.user.provider || "email",
            });
          }
        }
      }
    } catch (authError) {
      setError(normalizeAuthError(authError));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    if (!email.includes("@")) { setError("Enter your account email first."); return; }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (authError) {
      setError(normalizeAuthError(authError));
    } finally {
      setLoading(false);
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
    <div style={{flex:1,display:"flex",overflowY:"auto",background:C.bg,justifyContent:"center",alignItems:isMobile?"stretch":"center",padding:isMobile?"16px":"28px 20px"}}>
      <div style={{width:"100%",maxWidth:isMobile?520:1100,display:"flex",minHeight:isMobile?"auto":680,borderRadius:isMobile?0:20,overflow:"hidden",boxShadow:isMobile?"none":"0 16px 38px rgba(18,20,28,.12)"}}>
        {!isMobile&&(
          <div style={{flex:"0 0 42%",background:`linear-gradient(160deg, ${C.dark} 0%, #1B1E2C 50%, #262B47 100%)`,display:"flex",flexDirection:"column",justifyContent:"center",padding:"52px 48px",position:"relative",overflow:"hidden",borderRight:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{position:"absolute",top:-60,right:-60,width:240,height:240,background:C.indigo,borderRadius:"50%",opacity:.08}}/>
            <div style={{position:"absolute",bottom:-40,left:-40,width:160,height:160,background:"#7A70E0",borderRadius:"50%",opacity:.06}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
                <img src="Main-Dark-logo.png" alt="logo" style={{ width: 120, height: 50, objectFit:"contain" }} />
              </div>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(58,47,201,.16)",border:"1px solid rgba(58,47,201,.35)",borderRadius:99,padding:"5px 16px",marginBottom:20}}>
                <span style={{width:6,height:6,background:"#7A70E0",borderRadius:"50%",display:"inline-block"}}/>
                <span style={{fontSize:11,fontWeight:600,color:"#C9C2F5",letterSpacing:.5}}>{accountType==="recruiter"?"For Companies & Recruiters":"AI-Powered Coding Platform"}</span>
              </div>
              {accountType==="recruiter"?(
                <h1 style={{fontWeight:700,fontSize:30,lineHeight:1.15,margin:"0 0 16px",color:"#fff",letterSpacing:"-0.5px"}}>
                  Judge Candidates.<br/><span style={{color:"#A79CEE"}}>On Real Performance.</span>
                </h1>
              ):(
                <h1 style={{fontWeight:700,fontSize:30,lineHeight:1.15,margin:"0 0 16px",color:"#fff",letterSpacing:"-0.5px"}}>
                  Prove Your Skills.<br/><span style={{color:"#A79CEE"}}>Land Your Dream Job.</span>
                </h1>
              )}
              <p style={{fontSize:14,color:"#8A8E99",lineHeight:1.75,margin:"0 0 36px"}}>{accountType==="recruiter"?"Build a company-branded assessment, assign it to candidates, and review a live ranked leaderboard scored on real performance.":"Solve real coding challenges, earn verifiable certificates, and get matched to live job openings."}</p>
              {(accountType==="recruiter"?[
                {icon:"🧪",text:"Build custom, branded assessments"},
                {icon:"📤",text:"Assign tests to candidates directly"},
                {icon:"🏆",text:"Live ranked candidate leaderboard"},
                {icon:"🔍",text:"Every score backed by integrity checks"},
              ]:[
                {icon:"⌨️",text:"12 real interview-style challenges"},
                {icon:"🔍",text:"AI integrity & code quality scoring"},
                {icon:"📜",text:"Verifiable certificates for LinkedIn"},
                {icon:"💼",text:"Live job matching based on your score"},
              ]).map(f=>(
                <div key={f.text} style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{width:34,height:34,background:"rgba(58,47,201,.16)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{f.icon}</div>
                  <span style={{fontSize:13,color:"#D2D2CE",fontWeight:500}}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,padding:isMobile?"0":"28px 20px",overflowY:"auto"}}>
          <div style={{width:"100%",maxWidth:420}}>
          {onBack && (
            <button onClick={onBack}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${C.border}`, cursor: "pointer", color: C.textMid, fontSize: 13, fontWeight: 600, marginBottom: 24, padding: "7px 14px", borderRadius: 8, transition: "all .15s", width: "fit-content" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.indigo; e.currentTarget.style.color = C.indigo; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; }}>
              ← Back to Home
            </button>
          )}
          <div style={{ marginBottom: 28 }}>
            {isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <img src="MainLogo-removebg-preview.png" alt="logo" style={{ width: 90, height: 50, objectFit: "contain" }} />
              </div>
            )}
            <h2 style={{ fontWeight: 700, fontSize: 24, color: C.text, margin: "0 0 6px" }}>{mode === "login" ? "Welcome back" : mode === "forgotPassword" ? "Reset your password" : "Create your account"}</h2>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{mode === "login" ? "Log in to continue your coding journey" : mode === "forgotPassword" ? "We'll email you a secure link" : "Start earning verifiable certificates today — free"}</p>
          </div>

          {/* Animated Student / Recruiter toggle */}
          {mode !== "forgotPassword" && (
          <div
            role="tablist"
            aria-label="Account type"
            style={{
              position: "relative",
              display: "flex",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 4,
              marginBottom: 22,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 4,
                bottom: 4,
                left: accountType === "student" ? 4 : "50%",
                width: "calc(50% - 4px)",
                background: C.dark,
                borderRadius: 9,
                transition: "left .28s cubic-bezier(.65,0,.35,1)",
                boxShadow: "0 2px 8px rgba(18,20,28,.25)",
              }}
            />
            {[
              { id: "student", label: "🎓 I'm a Student" },
              { id: "recruiter", label: "🏢 I'm a Recruiter" },
            ].map((opt) => (
              <button
                key={opt.id}
                role="tab"
                aria-selected={accountType === opt.id}
                onClick={() => { setAccountType(opt.id); setError(""); }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  padding: "9px 10px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: accountType === opt.id ? "#fff" : C.textMid,
                  transition: "color .28s ease",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          )}

          <div style={{ background: C.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
            {mode === "forgotPassword" ? (
              resetSent ? (
                <div style={{ textAlign: "center", padding: "10px 4px" }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>📬</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 6 }}>Check your email</div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 18 }}>
                    If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
                  </p>
                  <button onClick={() => { setMode("login"); setResetSent(false); setError(""); }} style={{ color: C.indigo, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>← Back to log in</button>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 16px" }}>
                    Enter the email on your account and we'll send you a link to reset your password.
                  </p>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inputSt}
                    onKeyDown={e => e.key === "Enter" && handleForgotPassword()} />
                  {error && <div style={{ background: "#FBEAE8", border: "1px solid #F0BEB9", borderRadius: 9, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: C.red }}>{error}</div>}
                  <button onClick={handleForgotPassword} disabled={loading} className="sl-btn-hover"
                    style={{ width: "100%", padding: "13px", background: loading ? C.muted : `linear-gradient(135deg,${C.indigo} 0%,#4438D6 100%)`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 14 }}>
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                  <div style={{ textAlign: "center", fontSize: 13 }}>
                    <button onClick={() => { setMode("login"); setError(""); }} style={{ color: C.indigo, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>← Back to log in</button>
                  </div>
                </>
              )
            ) : (
              <>
            {/* Social — student only; OAuth can't carry a company/work-email requirement */}
            {accountType === "student" && (
              <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
              {[
                {p:"google", label:"Google", icon:(
                  <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                )},
                {p:"github", label:"GitHub", icon:(
                  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                  </svg>
                )},
              ].map(s=>(
                <button key={s.p} onClick={()=>handleSocial(s.p)} disabled={loading}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px 12px",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:13,color:C.text,opacity:loading ? 0.6 : 1,transition:"all .15s"}}>
                  {s.icon}{s.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
              </>
            )}

            {mode === "signup" && accountType === "student" && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputSt} />}
            {mode === "signup" && accountType === "recruiter" && <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" style={inputSt} />}
            {mode === "signup" && accountType === "recruiter" && (
              <p style={{ fontSize: 11.5, color: C.muted, margin: "-6px 0 10px", lineHeight: 1.5 }}>
                Use your company email — personal providers like Gmail or Yahoo aren't accepted for recruiter accounts.
              </p>
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder={mode === "signup" && accountType === "recruiter" ? "Work email address" : "Email address"} type="email" style={inputSt} />
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type={showPw ? "text" : "password"}
                style={{ ...inputSt, marginBottom: 0, paddingRight: 44 }}
                onKeyDown={e => e.key === "Enter" && handleEmail()} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.muted }}>{showPw ? "🙈" : "👁"}</button>
            </div>
            {mode === "login" && (
              <div style={{ textAlign: "right", marginBottom: 10 }}>
                <button onClick={() => { setMode("forgotPassword"); setError(""); }} style={{ color: C.muted, fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Forgot password?</button>
              </div>
            )}

            {error && <div style={{ background: "#FBEAE8", border: "1px solid #F0BEB9", borderRadius: 9, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: C.red }}>{error}</div>}

            <button onClick={handleEmail} disabled={loading} className="sl-btn-hover"
              style={{ width: "100%", padding: "13px", background: loading ? C.muted : `linear-gradient(135deg,${C.indigo} 0%,#4438D6 100%)`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 14, boxShadow: loading ? "none" : "0 4px 14px rgba(58,47,201,.35)" }}>
              {loading ? "Please wait…" : mode === "login" ? "Log In →" : "Create Account →"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13 }}>
              {mode === "login" ? (
                <><span style={{ color: C.muted }}>Don't have an account? </span><button onClick={() => { setMode("signup"); setError(""); }} style={{ color: C.indigo, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Sign up free</button></>
              ) : (
                <><span style={{ color: C.muted }}>Already have an account? </span><button onClick={() => { setMode("login"); setError(""); }} style={{ color: C.indigo, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Log in</button></>
              )}
            </div>
              </>
            )}
          </div>

          {mode === "login" && (
            <div style={{ marginTop: 16, padding: "10px 12px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 12, lineHeight: 1.6 }}>
              Tip: Use Sign up to create an account with Supabase Auth, then log in here.
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default AuthGate;
