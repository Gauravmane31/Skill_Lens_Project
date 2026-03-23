
import React, { useEffect, useState, useRef } from "react";
import { C } from "../data/constants.js";
import { scoreColor, integrityLabel } from "../data/scoring.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { PageHero, Card, inputSt, ProgressBar, CircleScore, Avatar } from "./shared/Atoms.jsx";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser";
import { loadResumeProfile, saveResumeProfile } from "../utils/api.js";

const EMPTY_PROFILE={fullName:"",email:"",phone:"",location:"",headline:"",summary:"",linkedin:"",github:"",portfolio:"",jobTitle:"",jobType:"",remotePreference:"",availability:"",salaryMin:"",salaryMax:"",noticePeriod:"",experience:[],education:[],skills:[],languages:[],certifications:[]};

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const uniq = (arr = []) => Array.from(new Set(arr.filter(Boolean).map((v) => String(v).trim()).filter(Boolean)));
const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const safeUrl = (value = "") => {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const roleWordRx = /(engineer|developer|intern|analyst|consultant|architect|manager|lead|scientist|specialist|full.?stack|frontend|backend|sde)/i;
const dateRangeRx = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b[\w\s,.-]*\d{2,4}|\b\d{4}\b)\s*(?:-|to|–|—)\s*(present|current|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b[\w\s,.-]*\d{2,4}|\b\d{4}\b)/i;
const shortDateRangeRx = /\b(19|20)\d{2}\b\s*(?:-|to|–|—)\s*\b(19|20)\d{2}|present|current\b/i;

const isLikelyName = (line = "") => {
  if (!line) return false;
  if (line.length < 4 || line.length > 60) return false;
  if (!/^[A-Za-z][A-Za-z .'-]+$/.test(line)) return false;
  if (line.split(" ").length > 5) return false;
  if (/@|linkedin|github|http|resume|curriculum/i.test(line)) return false;
  if (roleWordRx.test(line)) return false;
  return true;
};

const splitDates = (line = "") => {
  const m = line.match(dateRangeRx);
  if (!m) {
    const years = line.match(/\b(19|20)\d{2}\b/g) || [];
    if (years.length >= 2) return { from: years[0], to: years[1] };
    if (years.length === 1 && /present|current/i.test(line)) return { from: years[0], to: "Present" };
    return { from: "", to: "" };
  }
  return { from: (m[1] || "").trim(), to: (m[2] || "").trim() };
};

const cleanLine = (line = "") =>
  String(line)
    .replace(/^[\u2022\-*\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();

const companyHintRx = /(inc\.?|llc|ltd\.?|pvt\.?\s*ltd\.?|technologies|tech|solutions|systems|labs|corp\.?|company|services|consulting|software|private limited)/i;
const locationHintRx = /(remote|on-?site|hybrid|india|usa|uk|canada|singapore|bangalore|bengaluru|hyderabad|mumbai|pune|delhi|gurugram|chennai)/i;

const looksLikeCompany = (line = "") => {
  if (!line || line.length < 2 || line.length > 90) return false;
  if (dateRangeRx.test(line) || /@|https?:\/\//i.test(line)) return false;
  if (companyHintRx.test(line)) return true;
  const words = line.split(" ");
  return words.length >= 2 && words.length <= 8 && /^[A-Za-z0-9&.,'()\-\s]+$/.test(line) && !roleWordRx.test(line);
};

const looksLikeLocation = (line = "") => {
  if (!line) return false;
  return locationHintRx.test(line) || /,\s*[A-Za-z]{2,}/.test(line);
};

const looksLikeContactNoise = (line = "") => /@|https?:\/\/|linkedin\.com|github\.com/i.test(line);

const splitByPipesOrBullets = (line = "") =>
  String(line)
    .split(/\||•|\u2022/)
    .map(cleanLine)
    .filter(Boolean);

const normalizeTextValue = (value = "") =>
  String(value)
    .replace(/\s+/g, " ")
    .replace(/^[,;|\-\s]+|[,;|\-\s]+$/g, "")
    .trim();

const placeholderValueRx = /^(n\/?a|na|none|null|nil|not\s+available|not\s+provided|unknown|tbd|--|-)$/i;

const toCleanTextOrEmpty = (value = "") => {
  const normalized = normalizeTextValue(value);
  if (!normalized || placeholderValueRx.test(normalized)) return "";
  return normalized;
};

const dedupeByKey = (arr = [], keyFn = (v) => v) => {
  const seen = new Set();
  const out = [];
  arr.forEach((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
};

const parseExperienceCompositeLine = (line = "") => {
  const parts = splitByPipesOrBullets(line);
  if (!parts.length) return null;

  const datePart = parts.find((p) => dateRangeRx.test(p) || shortDateRangeRx.test(p)) || "";
  const { from, to } = splitDates(datePart);
  const titlePart = parts.find((p) => roleWordRx.test(p)) || "";
  const companyPart = parts.find((p) => p !== titlePart && looksLikeCompany(p)) || "";
  const locationPart = parts.find((p) => looksLikeLocation(p)) || "";

  if (!titlePart || !companyPart) return null;
  return {
    title: normalizeTextValue(titlePart),
    company: normalizeTextValue(companyPart),
    location: normalizeTextValue(locationPart),
    from: normalizeTextValue(from),
    to: normalizeTextValue(to),
    description: "",
  };
};

const looksLikeDegree = (line = "") => degreeRx.test(line);
const looksLikeInstitution = (line = "") => instituteRx.test(line) || looksLikeCompany(line);

const splitFieldFromDegree = (degreeLine = "") => {
  if (!degreeLine) return { degree: "", field: "" };
  const inMatch = degreeLine.match(/\b(?:in|of)\s+([A-Za-z &/\-.]{3,})$/i);
  const bracketMatch = degreeLine.match(/\(([^)]+)\)/);
  const field = (inMatch?.[1] || bracketMatch?.[1] || "").trim();
  return {
    degree: degreeLine.trim(),
    field,
  };
};

const gpaRx = /(cgpa|gpa)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*[0-9]+(?:\.[0-9]+)?)?)/i;

const parseExperienceEntries = (lines = []) => {
  const clean = lines.map(cleanLine).filter(Boolean);
  const entries = [];

  // First pass: parse compact one-line patterns (Title | Company | Date | Location).
  clean.forEach((line) => {
    const parsed = parseExperienceCompositeLine(line);
    if (parsed) entries.push(parsed);
  });

  // Prefer date-anchored blocks because most resumes place a date range per role.
  for (let i = 0; i < clean.length; i += 1) {
    const line = clean[i];
    if (!dateRangeRx.test(line) && !shortDateRangeRx.test(line)) continue;

    const prev1 = clean[i - 1] || "";
    const prev2 = clean[i - 2] || "";
    const next1 = clean[i + 1] || "";
    const next2 = clean[i + 2] || "";

    const title = [prev1, prev2, next1].find((v) => roleWordRx.test(v) && v.length <= 90 && !looksLikeContactNoise(v)) || "";
    const company = [prev1, prev2, next1, next2].find((v) => v !== title && looksLikeCompany(v)) || "";
    const location = [prev1, prev2, next1, next2].find((v) => looksLikeLocation(v)) || "";
    const { from, to } = splitDates(line);

    const descLines = [];
    for (let j = i + 1; j < Math.min(i + 7, clean.length); j += 1) {
      const candidate = clean[j];
      if (dateRangeRx.test(candidate)) break;
      if (candidate === title || candidate === company || candidate === location) continue;
      if (candidate.length >= 20) descLines.push(candidate);
    }

    const description = descLines.join(" ").slice(0, 380);

    if (!title || !company) continue;
    if (title.toLowerCase() === company.toLowerCase()) continue;

    entries.push({
      title: normalizeTextValue(title),
      company: normalizeTextValue(company),
      location: normalizeTextValue(location),
      from: normalizeTextValue(from),
      to: normalizeTextValue(to),
      description,
    });

    if (entries.length >= 3) break;
  }

  // Fallback for resumes that omit date ranges.
  if (!entries.length) {
    for (let i = 0; i < clean.length; i += 1) {
      const line = clean[i];
      if (!roleWordRx.test(line)) continue;

      const next = clean[i + 1] || "";
      const n2 = clean[i + 2] || "";
      const dateSource = [line, next, n2].find((v) => dateRangeRx.test(v)) || "";
      const { from, to } = splitDates(dateSource);

      if (!looksLikeCompany(next)) continue;

      entries.push({
        title: normalizeTextValue(line),
        company: normalizeTextValue(next),
        location: normalizeTextValue(looksLikeLocation(next) ? next : looksLikeLocation(n2) ? n2 : ""),
        from: normalizeTextValue(from),
        to: normalizeTextValue(to),
        description: [n2, clean[i + 3] || ""].filter((v) => v && v.length >= 20).join(" ").slice(0, 320),
      });

      if (entries.length >= 3) break;
    }
  }

  return dedupeByKey(entries, (e) => `${(e.title || "").toLowerCase()}|${(e.company || "").toLowerCase()}|${e.from}|${e.to}`)
    .filter((e) => e.title && e.company)
    .slice(0, 4);
};

const degreeRx = /(b\.tech|btech|be\b|b\.e\.|m\.tech|mtech|bca|mca|bsc|msc|bachelor|master|mba|phd)/i;
const instituteRx = /(university|college|school|institute|iit|nit)/i;

const parseEducationEntries = (lines = []) => {
  const clean = lines.map(cleanLine).filter(Boolean);
  const entries = [];

  for (let i = 0; i < clean.length; i += 1) {
    const line = clean[i];
    const next = clean[i + 1] || "";
    const prev = clean[i - 1] || "";

    if (!looksLikeDegree(line) && !looksLikeInstitution(line) && !dateRangeRx.test(line)) continue;

    const degreeLine = [line, next, prev].find((v) => looksLikeDegree(v) && !looksLikeContactNoise(v)) || "";
    const institution = [line, next, prev].find((v) => looksLikeInstitution(v) && !looksLikeDegree(v) && !looksLikeContactNoise(v)) || "";
    const dateLine = [line, next, prev, clean[i + 2] || ""].find((v) => dateRangeRx.test(v) || /\b(19|20)\d{2}\b/.test(v)) || "";
    const { from, to } = splitDates(dateLine);
    const gpaLine = [line, next, prev, clean[i + 2] || ""].find((v) => gpaRx.test(v)) || "";
    const gpa = gpaLine.match(gpaRx)?.[2] || "";
    const { degree, field } = splitFieldFromDegree(degreeLine);

    const fromYear = from || (dateLine.match(/\b(19|20)\d{2}\b/)?.[0] || "");
    const toYear = to || (dateLine.match(/\b(19|20)\d{2}\b/g)?.[1] || "");

    if (!degree || !institution) continue;

    entries.push({
      degree: normalizeTextValue(degree),
      institution: normalizeTextValue(institution),
      field: normalizeTextValue(field),
      from: normalizeTextValue(fromYear),
      to: normalizeTextValue(toYear),
      gpa: normalizeTextValue(gpa),
    });

    if (entries.length >= 3) break;
  }
  return dedupeByKey(entries, (e) => `${(e.degree || "").toLowerCase()}|${(e.institution || "").toLowerCase()}|${e.from}|${e.to}`)
    .filter((e) => e.degree && e.institution)
    .slice(0, 4);
};

const mergeParsedProfile = (prev, parsed) => {
  const next = { ...prev };

  if (parsed.fullName && isLikelyName(parsed.fullName)) next.fullName = parsed.fullName;
  if (parsed.email && /@/.test(parsed.email)) next.email = parsed.email;
  if (parsed.phone && parsed.phone.replace(/\D/g, "").length >= 8) next.phone = parsed.phone;
  if (parsed.location && parsed.location.length >= 3) next.location = parsed.location;

  if (parsed.headline && roleWordRx.test(parsed.headline)) next.headline = parsed.headline;
  if (parsed.summary && parsed.summary.length >= 20) next.summary = parsed.summary;
  if (parsed.jobTitle && roleWordRx.test(parsed.jobTitle)) next.jobTitle = parsed.jobTitle;
  if (parsed.jobType) next.jobType = parsed.jobType;
  if (parsed.remotePreference) next.remotePreference = parsed.remotePreference;
  if (parsed.availability) next.availability = parsed.availability;

  if (parsed.linkedin && /linkedin\.com/i.test(parsed.linkedin)) next.linkedin = parsed.linkedin;
  if (parsed.github && /github\.com/i.test(parsed.github)) next.github = parsed.github;
  if (parsed.portfolio && !/linkedin\.com|github\.com/i.test(parsed.portfolio)) next.portfolio = parsed.portfolio;

  if (parsed.skills?.length) next.skills = parsed.skills;
  if (parsed.languages?.length) next.languages = parsed.languages;
  if (parsed.certifications?.length) next.certifications = parsed.certifications;
  if (parsed.experience?.length) next.experience = parsed.experience;
  if (parsed.education?.length) next.education = parsed.education;

  return next;
};

const sectionPatterns = {
  summary: [/^summary$/i, /^profile$/i, /^objective$/i],
  experience: [/^experience$/i, /^work experience$/i, /^professional experience$/i],
  education: [/^education$/i, /^academic background$/i],
  skills: [/^skills?$/i, /^technical skills?$/i, /^tech stack$/i],
  languages: [/^languages?$/i],
  certifications: [/^certifications?$/i, /^licenses?$/i],
};

const findSectionIndex = (lines, patterns) => lines.findIndex((line) => patterns.some((rx) => rx.test(line)));

const collectSectionLines = (lines, startIndex) => {
  if (startIndex < 0) return [];
  const collected = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const isNextHeader = Object.values(sectionPatterns).some((patterns) => patterns.some((rx) => rx.test(line)));
    if (isNextHeader) break;
    if (line) collected.push(line);
    if (collected.length >= 60) break;
  }
  return collected;
};

const extractResumeData = (rawText, fallbackName = "", fallbackEmail = "") => {
  const text = String(rawText || "").replace(/\r/g, "\n");
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const lower = text.toLowerCase();

  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,6}/);
  const linkedInMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[\w\-./?=&%]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-./?=&%]+/i);
  const allUrls = Array.from(text.matchAll(/https?:\/\/[^\s)\]]+/gi)).map((m) => m[0]);

  const topSlice = lines.slice(0, 12);
  const fullName = topSlice.find((line) => isLikelyName(line)) || fallbackName;

  const locationLine =
    topSlice.find(
      (line) =>
        /(,\s*[A-Za-z]{2,}|india|usa|united states|remote|bengaluru|bangalore|hyderabad|pune|mumbai|delhi|gurugram|chennai)/i.test(line) &&
        !line.includes("@")
    ) || "";

  const roleLine = topSlice.find((line) => roleWordRx.test(line) && !looksLikeContactNoise(line)) || "";

  const summaryIdx = findSectionIndex(lines, sectionPatterns.summary);
  const summaryLines = collectSectionLines(lines, summaryIdx);
  const summary = summaryLines.length ? summaryLines.slice(0, 3).join(" ").slice(0, 550) : "";

  const splitTokens = (values = []) =>
    values
      .join(",")
      .split(/[,|•/]/)
      .map((v) => v.trim())
      .filter((v) => v.length > 1 && v.length < 55 && !/^[-:]+$/.test(v));

  const skillKeywords = [
    "javascript", "typescript", "react", "node", "node.js", "python", "java", "c++", "c", "go", "rust",
    "sql", "mongodb", "postgresql", "mysql", "aws", "docker", "kubernetes", "html", "css", "tailwind",
    "git", "github", "redux", "next.js", "express", "spring", "django", "flask", "machine learning",
  ];

  const skillsFromKeywords = skillKeywords
    .filter((keyword) => lower.includes(keyword))
    .map((keyword) => {
      if (keyword === "node.js") return "Node.js";
      if (keyword === "next.js") return "Next.js";
      return keyword
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    });

  const skillsSection = collectSectionLines(lines, findSectionIndex(lines, sectionPatterns.skills));
  const languageSection = collectSectionLines(lines, findSectionIndex(lines, sectionPatterns.languages));
  const certSection = collectSectionLines(lines, findSectionIndex(lines, sectionPatterns.certifications));

  // Skills can be reliably inferred from a curated keyword list even when no explicit skills section exists.
  const skills = uniq(skillsSection.length ? [...splitTokens(skillsSection), ...skillsFromKeywords] : skillsFromKeywords).slice(0, 30);
  const languages = uniq(languageSection.length ? splitTokens(languageSection) : []).slice(0, 12);
  const certifications = uniq(certSection.length ? splitTokens(certSection) : []).slice(0, 16);

  const expLines = collectSectionLines(lines, findSectionIndex(lines, sectionPatterns.experience));
  const experience = parseExperienceEntries(expLines);

  const eduLines = collectSectionLines(lines, findSectionIndex(lines, sectionPatterns.education));
  const education = parseEducationEntries(eduLines);

  const topText = topSlice.join(" ");
  const topUrls = Array.from(topText.matchAll(/https?:\/\/[^\s)\]]+/gi)).map((m) => m[0]);
  const portfolio = topUrls.find((url) => !/linkedin\.com|github\.com/i.test(url)) || "";

  return {
    fullName: toTitleCase(toCleanTextOrEmpty(fullName || "")),
    email: toCleanTextOrEmpty(emailMatch?.[0] || fallbackEmail || ""),
    phone: toCleanTextOrEmpty(phoneMatch?.[0] || ""),
    location: toCleanTextOrEmpty(locationLine),
    headline: toCleanTextOrEmpty(roleLine),
    summary: toCleanTextOrEmpty(summary),
    linkedin: safeUrl(linkedInMatch?.[0] || ""),
    github: safeUrl(githubMatch?.[0] || ""),
    portfolio: safeUrl(portfolio),
    jobTitle: toCleanTextOrEmpty(roleLine),
    jobType: /internship|intern\b/i.test(lower) ? "Internship" : /part[- ]?time/i.test(lower) ? "Part-time" : /full[- ]?time/i.test(lower) ? "Full-time" : "",
    remotePreference: /hybrid/i.test(lower) ? "Hybrid" : /remote/i.test(lower) ? "Remote" : /on[- ]?site|onsite/i.test(lower) ? "On-site" : "",
    availability: /immediate/i.test(lower) ? "Immediate" : "",
    skills,
    languages,
    certifications,
    experience,
    education,
  };
};

const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pages = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const chunks = [];
    textContent.items.forEach((item) => {
      if (!item || typeof item.str !== "string") return;
      const token = item.str.trim();
      if (token) chunks.push(token);
      if (item.hasEOL) chunks.push("\n");
    });

    const pageText = chunks
      .join(" ")
      .replace(/\s*\n\s*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (pageText) pages.push(pageText);
  }

  return pages.join("\n");
};

const extractTextFromDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result?.value || "";
};

const extractTextFromResumeFile = async (file) => {
  const name = (file?.name || "").toLowerCase();
  const type = (file?.type || "").toLowerCase();

  if (name.endsWith(".pdf") || type.includes("pdf")) {
    return extractTextFromPdf(file);
  }

  if (
    name.endsWith(".docx") ||
    type.includes("wordprocessingml") ||
    type.includes("officedocument.wordprocessingml")
  ) {
    return extractTextFromDocx(file);
  }

  return file.text();
};

const extractBase64FromFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",").slice(1).join(",") : result;
      resolve(base64 || "");
    };
    reader.onerror = () => reject(new Error("Failed to read resume file."));
    reader.readAsDataURL(file);
  });


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
  const [saving,setSaving]=useState(false);
  const [saveMessage,setSaveMessage]=useState("");
  const [resumeText,setResumeText]=useState("");
  const {isMobile}=useBreakpoint();
  const fileRef=useRef();
  const latest=results.length?results[results.length-1]:null;
  const localResumeKey = `skilllens_resume_profile_${user?.id || user?.email || "guest"}`;

  const up=fields=>setProfile(p=>({...p,...fields}));

  const completeness=Math.round([
    profile.fullName,profile.email,profile.phone,profile.location,profile.headline,profile.summary,
    profile.skills.length,profile.experience.length,profile.education.length,profile.jobTitle,
  ].filter(Boolean).length/10*100);

  const handleFile=async f=>{
    if(!f)return;
    setFile(f);setParsing(true);setParseSuccess(false);
    try{
      const text=await extractTextFromResumeFile(f);
      if(!text || !text.trim()){
        throw new Error("Could not extract text from the uploaded file.");
      }
      setResumeText(text);
      const parsed=extractResumeData(text,user?.name||"",user?.email||"");
      setProfile(p=>mergeParsedProfile(p,parsed));
      setParseSuccess(true);
    }catch{
      setResumeText("");
      setProfile(p=>({
        ...p,
        fullName: p.fullName || user?.name || "",
        email: p.email || user?.email || "",
      }));
      setParseSuccess(true);
    }
    setParsing(false);
  };

  useEffect(()=>{
    let mounted=true;
    const hydrate=async()=>{
      try{
        const saved=await loadResumeProfile();
        if(!mounted || !saved || typeof saved!=="object") return;
        setProfile(p=>({
          ...EMPTY_PROFILE,
          ...p,
          ...saved,
        }));
      }catch{
        // Fallback to local draft if backend persistence is unavailable.
        try{
          const localRaw=localStorage.getItem(localResumeKey);
          if(!mounted || !localRaw) return;
          const localSaved=JSON.parse(localRaw);
          if(!localSaved || typeof localSaved!=="object") return;
          setProfile(p=>({
            ...EMPTY_PROFILE,
            ...p,
            ...localSaved,
          }));
        }catch{
          // Ignore malformed local cache.
        }
      }
    };
    hydrate();
    return ()=>{mounted=false;};
  },[user?.id, user?.email, localResumeKey]);

  const handleSave=async()=>{
    setSaving(true);
    setSaveMessage("");
    try{
      let resumeFileData="";
      let resumeFileMime="";
      let resumeFileSize=0;
      if(file){
        resumeFileData=await extractBase64FromFile(file);
        resumeFileMime=String(file.type||"").slice(0,120);
        resumeFileSize=Number(file.size||0);
      }

      await saveResumeProfile({
        profile,
        resumeText,
        resumeFileName:file?.name||"",
        resumeFileData,
        resumeFileMime,
        resumeFileSize,
      });
      localStorage.setItem(localResumeKey, JSON.stringify(profile));
      setSaveMessage("Profile saved to backend successfully.");
    }catch(err){
      const message=String(err?.message||"");
      const missingTable=/resume_profiles|public\.resume_profiles|schema cache|table not found/i.test(message);
      if(missingTable){
        localStorage.setItem(localResumeKey, JSON.stringify(profile));
        setSaveMessage("Backend resume table is missing. Profile saved locally in this browser. Run supabase/schema.sql in Supabase SQL Editor to enable cloud save.");
      }else{
        setSaveMessage(message || "Failed to save profile.");
      }
    }
    setSaving(false);
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

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,gap:10,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:saveMessage.includes("success")?C.green:C.muted}}>{saveMessage}</span>
              <button onClick={handleSave} disabled={saving} className="sl-btn-hover" style={{padding:"11px 28px",background:saving?C.border:C.indigo,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:saving?"not-allowed":"pointer"}}>{saving?"Saving...":"💾 Save Profile"}</button>
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
