
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import toast from "react-hot-toast";
import { checkPlagiarism } from "../utils/plagiarism.js";
import { C } from "../data/constants.js";
import { computeIntegrity, computeCodeScore } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Badge } from "./shared/Atoms.jsx";

const COMPILER_API = "http://localhost:4000";

// ── Session Page ──────────────────────────────────────────────────────────────
function SessionPage({challenge,onSubmit,setPage}){
  const [lang,setLang]=useState("javascript");
  const [code,setCode]=useState(challenge?.starterCode?.javascript||"");
  const [elapsed,setElapsed]=useState(0);
  const [output,setOutput]=useState("");
  const [running,setRunning]=useState(false);
  const [showProblem,setShowProblem]=useState(true);
  const [showHints,setShowHints]=useState(false);
  const [activeTab,setActiveTab]=useState("problem");
  const [testResults,setTestResults]=useState(null);
  const [stdin,setStdin]=useState("");
  const [showStdin,setShowStdin]=useState(false);
  const [terminalHeight,setTerminalHeight]=useState(160);
  const dragRef=useRef(null);
  const {isMobile}=useBreakpoint();
  const metricsRef=useRef({keystrokes:0,pasteEvents:0,largestPaste:0,pasteChars:0,tabSwitches:0});
  const editorRef=useRef(null);
  const [,tick]=useState(0);

  useEffect(()=>{if(challenge)setCode(challenge.starterCode[lang]||"");},[lang,challenge]);
  useEffect(()=>{const t=setInterval(()=>setElapsed(e=>e+1),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    const handleVisibilityChange = () => {
      if (document.hidden) {
        metricsRef.current.tabSwitches++;
        toast.error("⚠️ Warning: Tab switching detected! This lowers your integrity score.", { duration: 4000 });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    };
  }, []);

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if(!challenge) return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:C.bg,padding:24}}>
      <div style={{fontSize:56}}>⌨️</div>
      <h3 style={{fontWeight:800,color:C.text}}>No challenge selected</h3>
      <p style={{color:C.muted,textAlign:"center"}}>Go to Challenges to pick one and start solving!</p>
      <button onClick={()=>setPage("challenges")} style={{padding:"10px 24px",background:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>Browse Challenges →</button>
    </div>
  );

  const handleRun=async()=>{
    const currentCode=editorRef.current?.getValue()??code;
    setRunning(true);
    setOutput("");
    try{
      const {data}=await axios.post(
        `${COMPILER_API}/api/run`,
        {language:lang,code:currentCode,stdin:stdin},
        {timeout:30000}
      );
      setOutput(data.output||"(no output)");
      const tc=challenge.testCases||[];
      const results=tc.map((t,i)=>({...t,passed:data.output?.includes(t.expected.replace(/"/g,"")),actual:data.output||"no output"}));
      setTestResults(results);
      if(data.error) toast.error("Runtime error");
      else toast.success("Code executed!");
    }catch(err){
      setOutput(`Error: ${err.message}`);
      toast.error("Could not reach compiler — is the backend running?");
    }
    setRunning(false);
  };

  const handleSubmit=()=>{
    const m={...metricsRef.current,typingDuration:elapsed};
    onSubmit({challenge,code,lang,metrics:m,integrityScore:computeIntegrity(m),codeScore:computeCodeScore(code),timestamp:new Date().toISOString()});
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(e => console.log(e));
    }
    setPage("results");
  };

  const integrity=computeIntegrity(metricsRef.current);
  const codeScore=computeCodeScore(code);

  const handlePlagiarismCheck = () => {
    const sampleCode = "int main() { return 0; }";
    const result = checkPlagiarism(code, sampleCode);
    alert("Plagiarism Result: " + result);
  };

  return(
    <div className="sl-session">
      {/* Problem/Hints pane */}
      {(!isMobile||showProblem)&&(
        <div className="sl-prob-pane" style={{padding:isMobile?14:22}}>
          {/* Tabs */}
          <div style={{display:"flex",gap:4,marginBottom:14,background:C.bg,borderRadius:10,padding:4}}>
            {["problem","hints","tests"].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{flex:1,padding:"6px 4px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:activeTab===t?C.white:"transparent",color:activeTab===t?C.text:C.muted,textTransform:"capitalize"}}>
                {t==="problem"?"📋 Problem":t==="hints"?"💡 Hints":"🧪 Tests"}
              </button>
            ))}
          </div>

          {activeTab==="problem"&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <Badge label={challenge.category} color={challenge.accent}/>
                <span style={{fontWeight:800,fontSize:13,background:elapsed>challenge.timeLimit*60?"#FEE2E2":C.indigoLight,color:elapsed>challenge.timeLimit*60?C.red:C.indigo,padding:"4px 9px",borderRadius:8,fontFamily:"monospace"}}>⏱ {fmt(elapsed)}</span>
              </div>
              <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:12}}>
                <div style={{width:40,height:40,background:challenge.pastel,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{challenge.icon}</div>
                <div>
                  <h2 style={{fontWeight:900,fontSize:15,margin:"0 0 3px"}}>{challenge.title}</h2>
                  <div style={{display:"flex",gap:5}}>
                    <Badge label={challenge.difficulty} color={challenge.difficulty==="Easy"?C.green:challenge.difficulty==="Medium"?C.amber:C.red}/>
                    <Badge label={`+${challenge.xp} XP`} color={C.indigo}/>
                  </div>
                </div>
              </div>
              <pre style={{fontSize:12,color:C.textMid,whiteSpace:"pre-wrap",lineHeight:1.7,fontFamily:"inherit",margin:"0 0 14px",background:C.bg,borderRadius:10,padding:12}}>{challenge.description}</pre>
              {/* Tags */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>
                {challenge.tags.map(t=><span key={t} style={{background:C.border,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:600,color:C.textMid}}>{t}</span>)}
              </div>
              {/* Live metrics */}
              <div style={{background:C.indigoLight,borderRadius:10,padding:12}}>
                <h4 style={{fontWeight:700,fontSize:11,color:C.indigo,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:.5}}>Live Metrics</h4>
                {[["Keystrokes",metricsRef.current.keystrokes],["Paste Events",metricsRef.current.pasteEvents],["Est. Code Score",`${codeScore}/100`],["Est. Integrity",`${integrity}/100`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",borderBottom:`1px solid ${C.indigo}18`}}>
                    <span style={{color:C.textMid}}>{k}</span><span style={{fontWeight:800,color:C.indigo}}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab==="hints"&&(
            <div>
              <p style={{fontSize:12,color:C.muted,marginBottom:14}}>💡 Stuck? Here are some hints — use them sparingly for max integrity score.</p>
              {challenge.hints.map((h,i)=>(
                <div key={i} style={{background:C.pastelYellow,borderRadius:10,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.amber}33`}}>
                  <div style={{fontWeight:700,fontSize:11,color:C.amber,marginBottom:4}}>Hint {i+1}</div>
                  <div style={{fontSize:13,color:C.textMid,lineHeight:1.5}}>{h}</div>
                </div>
              ))}
              <div style={{background:C.bg,borderRadius:10,padding:12,marginTop:14}}>
                <p style={{fontSize:12,color:C.muted,margin:0}}>⚠️ Using hints may reduce your integrity score. Think it through first!</p>
              </div>
            </div>
          )}

          {activeTab==="tests"&&(
            <div>
              <p style={{fontSize:12,color:C.muted,marginBottom:12}}>🧪 Test cases — run your code to see results.</p>
              {challenge.testCases.map((tc,i)=>{
                const res=testResults?.[i];
                return(
                  <div key={i} style={{background:res?res.passed?C.pastelGreen:C.pastelYellow:C.bg,borderRadius:10,padding:"11px 13px",marginBottom:8,border:`1px solid ${res?res.passed?C.green:C.amber:C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontWeight:700,fontSize:12}}>Test {i+1}</span>
                      {res&&<Badge label={res.passed?"✅ PASS":"❌ FAIL"} color={res.passed?C.green:C.red}/>}
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:11,color:C.textMid}}><strong>Input:</strong> {tc.input}</div>
                    <div style={{fontFamily:"monospace",fontSize:11,color:C.textMid}}><strong>Expected:</strong> {tc.expected}</div>
                    {res&&<div style={{fontFamily:"monospace",fontSize:11,color:res.passed?C.green:C.red}}><strong>Got:</strong> {res.actual}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Editor pane */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:"#13131f",minWidth:0,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#0d0d1a",borderBottom:"1px solid #1e1e30",flexWrap:"wrap",gap:6}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {isMobile&&<button onClick={()=>setShowProblem(p=>!p)} style={{padding:"5px 9px",borderRadius:7,border:"none",background:"#1e1e30",color:"#aaa",fontWeight:600,fontSize:11,cursor:"pointer"}}>{showProblem?"Hide":"📋"}</button>}
            {["javascript","python","java","cpp","c","go","rust"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:lang===l?C.indigo:"#1e1e30",color:lang===l?"#fff":"#666",fontWeight:600,fontSize:11,cursor:"pointer"}}>{l==="cpp"?"C++":l==="c"?"C":l==="go"?"Go":l==="rust"?"Rust":l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={handleRun} disabled={running} className="sl-btn-hover"
              style={{padding:"6px 13px",background:running?"#1e1e30":C.green,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              {running?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>:"▶"} {running?"Running…":"Run Tests"}
            </button>
            <button onClick={handleSubmit} className="sl-btn-hover"
              style={{padding:"6px 14px",background:C.indigo,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>Submit ✓</button>
          </div>
        </div>
        <div style={{flex:1,overflow:"hidden",minHeight:0,position:"relative"}}>
          <Editor
            height="100%"
            language={lang==="cpp"?"cpp":lang==="c"?"c":lang==="python"?"python":lang==="java"?"java":lang==="go"?"go":lang==="rust"?"rust":"javascript"}
            value={code}
            onChange={(v)=>setCode(v||"")}
            onMount={(editor)=>{
              editorRef.current=editor;
              editor.onDidPaste((e)=>{
                const model=editor.getModel();
                if(!model) return;
                const pasted=model.getValueInRange(e.range);
                if(!pasted||pasted.trim().length<5) return;
                const result = checkPlagiarism(pasted, code);
                console.log("Paste Plagiarism:", result);
                metricsRef.current.pasteEvents++;
                metricsRef.current.pasteChars+=pasted.length;
                metricsRef.current.largestPaste=Math.max(metricsRef.current.largestPaste,pasted.split("\n").length);
                tick(t=>t+1);
              });
            }}
            theme="vs-dark"
            options={{fontSize:13,fontFamily:"'JetBrains Mono',monospace",minimap:{enabled:false},scrollBeyondLastLine:false,padding:{top:16},automaticLayout:true}}
          />
          <button 
            onClick={handlePlagiarismCheck}
            style={{
              position:"absolute",
              top:10,
              right:10,
              padding:"6px 10px",
              background:"#4F46E5",
              color:"#fff",
              border:"none",
              borderRadius:6,
              cursor:"pointer",
              fontSize:12
            }}
          >
            Check Plagiarism
          </button>
        </div>
        {/* ── Resizable Terminal Panel ─────────────────── */}
        <div style={{flexShrink:0,height:terminalHeight,display:"flex",flexDirection:"column",background:"#0a0a14",position:"relative"}}>

          {/* Drag handle */}
          <div
            style={{height:8,background:"#151520",cursor:"ns-resize",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",userSelect:"none",borderTop:"2px solid #2a2a3a",borderBottom:"1px solid #1e1e30"}}
            onMouseDown={(e)=>{
              e.preventDefault();
              const startY=e.clientY;
              const startH=terminalHeight;
              const onMove=(ev)=>{
                const delta=startY-ev.clientY;
                const newH=Math.min(600,Math.max(40,startH+delta));
                setTerminalHeight(newH);
              };
              const onUp=()=>{
                window.removeEventListener("mousemove",onMove);
                window.removeEventListener("mouseup",onUp);
              };
              window.addEventListener("mousemove",onMove);
              window.addEventListener("mouseup",onUp);
            }}
          >
            <div style={{width:40,height:3,background:"#3a3a5a",borderRadius:99}}/>
          </div>

          {/* Tab bar: stdin | output */}
          <div style={{display:"flex",borderBottom:"1px solid #1e1e30",flexShrink:0}}>
            <button onClick={()=>setShowStdin(false)}
              style={{padding:"5px 14px",background:"transparent",border:"none",borderBottom:!showStdin?"2px solid #4F46E5":"2px solid transparent",color:!showStdin?"#e2e8f0":"#555",fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:.5}}>
              Output
            </button>
            <button onClick={()=>setShowStdin(true)}
              style={{padding:"5px 14px",background:"transparent",border:"none",borderBottom:showStdin?"2px solid #4F46E5":"2px solid transparent",color:showStdin?"#e2e8f0":"#555",fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"uppercase",letterSpacing:.5}}>
              Stdin
            </button>
            <div style={{flex:1}}/>
            {!showStdin&&output&&<button onClick={()=>setOutput("")} style={{background:"none",border:"none",color:"#444",fontSize:10,cursor:"pointer",fontWeight:600,padding:"0 12px"}}>Clear</button>}
          </div>

          {/* Output tab */}
          {!showStdin&&(
            <div style={{flex:1,overflowY:"auto",padding:"10px 16px"}}>
              {running?(
                <div style={{color:"#666",fontSize:12}}>Running<span style={{animation:"pulse 1s infinite",display:"inline-block"}}> ...</span></div>
              ):output?(
                <pre style={{fontFamily:"monospace",fontSize:12,color:"#a0aec0",margin:0,whiteSpace:"pre-wrap",lineHeight:1.6}}>{output}</pre>
              ):(
                <div style={{color:"#333",fontSize:12,fontStyle:"italic"}}>Output will appear here after running your code</div>
              )}
            </div>
          )}

          {/* Stdin tab */}
          {showStdin&&(
            <textarea value={stdin} onChange={e=>setStdin(e.target.value)}
              placeholder="Enter custom input for your program here...&#10;Example: 4&#10;2 7 11 15&#10;9"
              spellCheck={false}
              style={{flex:1,background:"transparent",color:"#a0aec0",border:"none",outline:"none",resize:"none",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.6,padding:"10px 16px",boxSizing:"border-box"}}
            />
          )}
        </div>
      </div>
    </div>
  );
}


export default SessionPage;
