
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { C } from "../data/constants.js";
import { scoreColor } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, SectionHeader, inputSt, Pill, Badge, ProgressBar } from "./shared/Atoms.jsx";
import { fetchJobRecommendations } from "../utils/api.js";

// ── Job Board Page ────────────────────────────────────────────────────────────
function JobBoardPage({results}){
  const {isMobile}=useBreakpoint();
  const [search,setSearch]=useState("");
  const [domainFilter,setDomainFilter]=useState("All");
  const [matchFilter,setMatchFilter]=useState("All");
  const [selectedJob,setSelectedJob]=useState(null);
  const [applied,setApplied]=useState(new Set());
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [apiKey,setApiKey] = useState(localStorage.getItem("GEMINI_API_KEY")||import.meta.env.VITE_GEMINI_API_KEY||"");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!apiKey) {
      toast.error("Please enter your Gemini API Key first!");
      return;
    }
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
         const base64Data = reader.result.split(',')[1];
         const { GoogleGenerativeAI } = await import("@google/generative-ai");
         const genAI = new GoogleGenerativeAI(apiKey);
         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
         const prompt = `You are an expert technical recruiter. Analyze the resume provided and return a JSON object with EXACTLY these keys (all string arrays):
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": ["...", "..."],
  "job_suggestions": ["...", "..."]
}`;
         const result = await model.generateContent([
             prompt,
             { inlineData: { data: base64Data, mimeType: file.type } }
         ]);
         const text = result.response.text();
         const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
         setResumeAnalysis(JSON.parse(cleanText));
         toast.success("Resume analyzed successfully!");
         setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze resume. Check API key and format.");
      setIsAnalyzing(false);
    }
  };

  const domains = useMemo(() => {
    const values = Array.from(new Set(recommendations.map((item) => item.job?.domain).filter(Boolean)));
    return ["All", ...values];
  }, [recommendations]);
  const matchFilters=["All","90%+ Match","80%+ Match","70%+ Match"];

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const rows = await fetchJobRecommendations();
        setRecommendations(rows);
      } catch (error) {
        toast.error(error.message || "Failed to load job recommendations.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const filtered = recommendations
    .filter((entry) => domainFilter === "All" || entry.job?.domain === domainFilter)
    .filter((entry) =>
      matchFilter === "All" ||
      (matchFilter === "90%+ Match" && entry.matchScore >= 90) ||
      (matchFilter === "80%+ Match" && entry.matchScore >= 80) ||
      (matchFilter === "70%+ Match" && entry.matchScore >= 70)
    )
    .filter((entry) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const required = Array.isArray(entry.job?.required_skills) ? entry.job.required_skills : [];
      return (
        String(entry.job?.title || "").toLowerCase().includes(q) ||
        String(entry.job?.company || "").toLowerCase().includes(q) ||
        required.some((skill) => String(skill).toLowerCase().includes(q))
      );
    });

  const avgScore=results.length?Math.round(results.reduce((a,r)=>a+r.codeScore,0)/results.length):null;

  return(
    <div style={{overflowY:"auto",flex:1,background:C.bg}}>
      <PageHero tag="💼 Job Recommendations" title="Your Matched Opportunities" sub={`${recommendations.length} roles ranked by the AI matching engine.`}
        extras={avgScore?(
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <div style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"7px 12px"}}>
              <div style={{fontSize:9,color:"#666",marginBottom:1}}>YOUR CODE SCORE</div>
              <div style={{fontWeight:900,fontSize:16,color:scoreColor(avgScore)}}>{avgScore}/100</div>
            </div>
            <div style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"7px 12px"}}>
              <div style={{fontSize:9,color:"#666",marginBottom:1}}>TOP MATCH</div>
              <div style={{fontWeight:900,fontSize:16,color:C.green}}>{recommendations[0]?.matchScore || 0}%</div>
            </div>
          </div>
        ):null}
      />

      <div className="sl-page-wrap" style={{padding:isMobile?"16px 14px":"20px 24px"}}>
        {/* AI Resume Analyzer */}
        <Card style={{marginBottom: 16, background: C.indigoLight, border: `1px solid ${C.indigo}44`}}>
          <SectionHeader title="🤖 AI Resume Matcher" sub="Upload your resume (PDF) to get instant actionable feedback and personalized job matches." />
          <div style={{display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center"}}>
            <input type="file" accept="application/pdf, text/plain" id="resume-upload" style={{display:"none"}} onChange={handleResumeUpload} />
            <button onClick={()=>document.getElementById("resume-upload").click()} disabled={isAnalyzing} className="sl-btn-hover" style={{padding:"10px 16px", background: C.indigo, color: "#fff", border:"none", borderRadius: 10, fontWeight:700, cursor: isAnalyzing ? "wait" : "pointer"}}>
              {isAnalyzing ? "⏳ Analyzing using Gemini..." : "📤 Upload Resume (PDF)"}
            </button>
          </div>
          {resumeAnalysis && (
            <div className="sl-fadein" style={{marginTop: 18, display: "grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap: 12}}>
              <div style={{background:C.bg, padding:14, borderRadius:10, border:`1px solid ${C.border}`}}>
                <h4 style={{fontWeight:800, color:C.green, marginBottom:8, fontSize:13}}>💪 Strengths</h4>
                <ul style={{fontSize:12, paddingLeft:16, color:C.textMid, lineHeight: 1.5}}>
                  {resumeAnalysis.strengths.map((s,i) => <li key={i} style={{marginBottom:4}}>{s}</li>)}
                </ul>
              </div>
              <div style={{background:C.bg, padding:14, borderRadius:10, border:`1px solid ${C.border}`}}>
                <h4 style={{fontWeight:800, color:C.red, marginBottom:8, fontSize:13}}>⚠️ Weaknesses</h4>
                <ul style={{fontSize:12, paddingLeft:16, color:C.textMid, lineHeight: 1.5}}>
                  {resumeAnalysis.weaknesses.map((s,i) => <li key={i} style={{marginBottom:4}}>{s}</li>)}
                </ul>
              </div>
              <div style={{background:C.bg, padding:14, borderRadius:10, border:`1px solid ${C.border}`}}>
                <h4 style={{fontWeight:800, color:C.amber, marginBottom:8, fontSize:13}}>📈 Improvements</h4>
                <ul style={{fontSize:12, paddingLeft:16, color:C.textMid, lineHeight: 1.5}}>
                  {resumeAnalysis.improvements.map((s,i) => <li key={i} style={{marginBottom:4}}>{s}</li>)}
                </ul>
              </div>
              <div style={{background:C.bg, padding:14, borderRadius:10, border:`1px solid ${C.border}`}}>
                <h4 style={{fontWeight:800, color:C.indigo, marginBottom:8, fontSize:13}}>🎯 Suggested Roles</h4>
                <ul style={{fontSize:12, paddingLeft:16, color:C.textMid, lineHeight: 1.5}}>
                  {resumeAnalysis.job_suggestions.map((s,i) => <li key={i} style={{marginBottom:4}}>{s}</li>)}
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:16}}>
          {[
            {v:recommendations.length,l:"Live Roles",a:C.indigo},
            {v:recommendations.filter((entry)=>entry.matchScore>=90).length,l:"🔥 Hot",a:C.red},
            {v:recommendations.filter((entry)=>entry.matchScore>=80).length,l:"Strong Match",a:C.green},
            {v:applied.size,l:"Applied",a:C.amber},
          ].map(s=>(
            <Card key={s.l} style={{padding:"12px 14px",textAlign:"center"}}>
              <div style={{fontWeight:900,fontSize:20,color:s.a}}>{s.v}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div style={{marginBottom:14}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search jobs, companies, or skills…"
            style={{...inputSt,marginBottom:10,padding:"10px 14px"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {domains.map((d) => <Pill key={d} label={d} active={domainFilter===d} onClick={() => setDomainFilter(d)} />)}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {matchFilters.map(m=><Pill key={m} label={m} active={matchFilter===m} onClick={()=>setMatchFilter(m)}/>)}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:selectedJob&&!isMobile?"1fr 380px":"1fr",gap:16}}>
          {/* Job list */}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {loading ? (
              <Card style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:32,marginBottom:10}}>⏳</div>
                <h3 style={{fontWeight:800,marginBottom:6}}>Loading recommendations...</h3>
              </Card>
            ) : filtered.length===0?(
              <Card style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:40,marginBottom:10}}>💼</div>
                <h3 style={{fontWeight:800,marginBottom:6}}>No matching jobs</h3>
                <p style={{color:C.muted,fontSize:13}}>Try adjusting your filters.</p>
              </Card>
            ):filtered.map(entry=>{
              const job = entry.job;
              const skills = Array.isArray(job.required_skills) ? job.required_skills : [];
              return (
              <div key={job.id} className="sl-card-hover" onClick={()=>setSelectedJob(selectedJob?.job?.id===job.id?null:entry)}
                style={{background:C.white,borderRadius:14,padding:"16px 18px",cursor:"pointer",boxShadow:selectedJob?.job?.id===job.id?`0 0 0 2px ${C.indigo}`:"0 1px 4px rgba(0,0,0,.06)",border:`1.5px solid ${selectedJob?.job?.id===job.id?C.indigo:C.border}`}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:44,height:44,background:C.indigoLight,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>💼</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6,marginBottom:4}}>
                      <div>
                        <h3 style={{fontWeight:800,fontSize:14,margin:"0 0 2px",color:C.text}}>{job.title}</h3>
                        <div style={{fontSize:12,color:C.muted}}>{job.company} · {job.domain}</div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                        {entry.matchScore>=90&&<Badge label="🔥 Hot" color={C.red}/>}
                        <div style={{background:entry.matchScore>=90?C.green:entry.matchScore>=80?C.indigo:C.amber,color:"#fff",borderRadius:8,padding:"4px 10px",fontWeight:800,fontSize:13}}>
                          {entry.matchScore}%
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                      <span style={{fontSize:11,color:C.textMid}}>📌 Min Skill: {job.min_skill_score}%</span>
                      <span style={{fontSize:11,color:C.textMid}}>🧭 Domain Align: {entry.domainAlignment}%</span>
                      <span style={{fontSize:11,color:C.muted}}>🕐 {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                      {skills.map(s=><span key={s} style={{background:C.bg,borderRadius:99,padding:"2px 8px",fontSize:11,fontWeight:600,color:C.textMid,border:`1px solid ${C.border}`}}>{s}</span>)}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={e=>{e.stopPropagation();setApplied(a=>{const n=new Set(a);n.has(job.id)?n.delete(job.id):n.add(job.id);return n;});}} className="sl-btn-hover"
                        style={{padding:"6px 14px",background:applied.has(job.id)?C.green:C.indigo,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                        {applied.has(job.id)?"✓ Applied":"Apply Now"}
                      </button>
                      <button onClick={e=>{e.stopPropagation();setSelectedJob(selectedJob?.job?.id===job.id?null:entry);}} style={{padding:"6px 12px",background:C.bg,color:C.text,border:`1px solid ${C.border}`,borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer"}}>
                        {selectedJob?.job?.id===job.id?"Close":"Details"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* Job detail pane */}
          {selectedJob&&!isMobile&&(
            <div style={{position:"sticky",top:0,alignSelf:"flex-start"}}>
              <Card>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{width:52,height:52,background:C.indigoLight,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>💼</div>
                  <div>
                    <h2 style={{fontWeight:900,fontSize:16,margin:"0 0 3px"}}>{selectedJob.job.title}</h2>
                    <div style={{fontSize:13,color:C.muted}}>{selectedJob.job.company}</div>
                  </div>
                </div>
                {[["Domain",selectedJob.job.domain],["Min Skill Score",`${selectedJob.job.min_skill_score}%`],["Posted",new Date(selectedJob.job.created_at).toLocaleDateString()],["Readiness",`${selectedJob.readinessScore}%`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:12,color:C.muted}}>{k}</span>
                    <span style={{fontSize:12,fontWeight:700,color:C.text}}>{v}</span>
                  </div>
                ))}
                <div style={{margin:"14px 0"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Required Skills</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {(selectedJob.job.required_skills || []).map(s=><Badge key={s} label={s} color={C.indigo}/>)}
                  </div>
                </div>
                <div style={{background:selectedJob.matchScore>=90?C.pastelGreen:selectedJob.matchScore>=80?C.indigoLight:C.pastelYellow,borderRadius:10,padding:"12px",marginBottom:14}}>
                  <div style={{fontWeight:700,fontSize:12,marginBottom:4,color:selectedJob.matchScore>=90?C.green:C.indigo}}>Your Match Score</div>
                  <div style={{fontWeight:900,fontSize:26,color:selectedJob.matchScore>=90?C.green:C.indigo,marginBottom:6}}>{selectedJob.matchScore}%</div>
                  <ProgressBar value={selectedJob.matchScore} color={selectedJob.matchScore>=90?C.green:C.indigo} height={6}/>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Match Reasons</div>
                  {(selectedJob.matchReasons || []).map((reason) => (
                    <div key={reason} style={{fontSize:12,color:C.textMid,marginBottom:3}}>• {reason}</div>
                  ))}
                </div>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Missing Skills</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {(selectedJob.missingSkills || []).length
                      ? (selectedJob.missingSkills || []).map((s) => <Badge key={s} label={s} color={C.red} />)
                      : <span style={{fontSize:12,color:C.green,fontWeight:700}}>No major skill gaps 🎉</span>}
                  </div>
                </div>
                <button onClick={()=>setApplied(a=>{const n=new Set(a);n.has(selectedJob.job.id)?n.delete(selectedJob.job.id):n.add(selectedJob.job.id);return n;})} className="sl-btn-hover"
                  style={{width:"100%",padding:"11px",background:applied.has(selectedJob.job.id)?C.green:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  {applied.has(selectedJob.job.id)?"✓ Application Sent!":"Apply with SkillLens Profile"}
                </button>
                <p style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:8}}>Your certificate & scores will be shared automatically.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



export default JobBoardPage;
