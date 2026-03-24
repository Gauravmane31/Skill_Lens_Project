// ============================================================
// routes/run.js — POST /api/run
// Executes code directly using Judge0 FREE public instance
// (Bypassing Redis/Worker to allow running without Docker)
// ============================================================
import { Router } from "express";

const router = Router();

const SUPPORTED = ["cpp", "python", "java", "javascript", "c", "go", "rust"];

const JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  cpp: 54,        // C++ 17
  python: 71,     // Python 3
  java: 62,       // Java 13
  javascript: 63, // Node.js 12
  c: 50,          // C (GCC 9.2)
  go: 60,         // Go 1.13
  rust: 73,       // Rust 1.40
};

const STATUS = {
  1: { label: "Queued", error: false },
  2: { label: "Processing", error: false },
  3: { label: "Accepted", error: false },
  4: { label: "Wrong Answer", error: true },
  5: { label: "Time Limit Exceeded", error: true },
  6: { label: "Compilation Error", error: true },
  7: { label: "Runtime Error (SIGSEGV)", error: true },
  8: { label: "Runtime Error (SIGFPE)", error: true },
  9: { label: "Runtime Error (SIGABRT)", error: true },
  10: { label: "Runtime Error (NZEC)", error: true },
  11: { label: "Runtime Error (Other)", error: true },
  12: { label: "Internal Error", error: true },
  13: { label: "Exec Format Error", error: true },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function submitCode(language, code, stdin) {
  const url = `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`;
  const body = {
    source_code: code,
    language_id: LANGUAGE_IDS[language],
    stdin: stdin || "",
    cpu_time_limit: 10,
    memory_limit: 262144,
    wall_time_limit: 15,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Judge0 Submit Error (${res.status}):`, text);
    throw new Error(`Submit failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log("Judge0 Token Created:", data.token);
  if (!data.token) {
    throw new Error(`No token returned: ${JSON.stringify(data)}`);
  }
  return data.token;
}

async function pollResult(token) {
  const url = `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,status,time,memory,message`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Judge0 Poll Error (${res.status}) for token ${token}:`, text);
    throw new Error(`Poll failed (${res.status})`);
  }
  return await res.json();
}

router.post("/", async (req, res) => {
  const { language, code, stdin = "" } = req.body;

  if (!language || !SUPPORTED.includes(language)) {
    return res.status(400).json({
      error: `Unsupported language. Choose from: ${SUPPORTED.join(", ")}`,
    });
  }
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code field is required" });
  }
  if (code.length > 50_000) {
    return res.status(400).json({ error: "Code too large (max 50,000 chars)" });
  }

  const startTime = Date.now();
  let finalOutput = "";
  let isError = false;
  let timeStr = "0s";
  let memStr = "0MB";

  try {
    const token = await submitCode(language, code, stdin);
    const POLL_INTERVAL = 1000;
    const MAX_POLLS = 20;
    let result = null;

    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL);
      result = await pollResult(token);
      const statusId = result.status?.id;
      if (statusId !== 1 && statusId !== 2) break;
    }

    if (!result) throw new Error("Timed out waiting for result");

    const statusId = result.status?.id;
    const status = STATUS[statusId];

    if (statusId === 3) {
      finalOutput = result.stdout?.trim() || "(program ran successfully with no output)";
      isError = false;
    } else if (statusId === 6) {
      finalOutput = result.compile_output?.trim() || "Compilation Error";
      isError = true;
    } else if (statusId === 5) {
      finalOutput = `Time Limit Exceeded (${result.time || "?"}s)`;
      isError = true;
    } else {
      finalOutput = [
        result.stderr,
        result.compile_output,
        result.stdout,
        result.message,
        status?.label || "Unknown error",
      ].filter(Boolean).map(s => s.trim()).filter(Boolean).join("\n") || "Unknown error";
      isError = true;
    }

    timeStr = result.time ? `${result.time}s` : `${((Date.now() - startTime) / 1000).toFixed(2)}s`;
    memStr = result.memory ? `${(result.memory / 1024).toFixed(1)}MB` : "—";
    
  } catch (err) {
    isError = true;
    finalOutput = `Error executing code: ${err.message}`;
    console.error("Execution error:", err.message);
  }

  return res.json({
    output: finalOutput,
    error: isError,
    time: timeStr,
    memory: memStr
  });
});

export default router;