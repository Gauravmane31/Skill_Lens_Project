// ============================================================
// utils/codeExecution.js — Judge0 Code Execution Utilities
// ============================================================

const JUDGE0_URL = "https://ce.judge0.com";

export const SUPPORTED_LANGUAGES = ["cpp", "python", "java", "javascript", "c", "go", "rust"];

export const LANGUAGE_IDS = {
  cpp: 54,        // C++ 17
  python: 71,     // Python 3
  java: 62,       // Java 13
  javascript: 63, // Node.js 12
  c: 50,          // C (GCC 9.2)
  go: 60,         // Go 1.13
  rust: 73,       // Rust 1.40
};

export const LANGUAGES = [
  {
    id: "cpp",
    label: "C++",
    version: "GCC 13",
    icon: "⚡",
    monacoId: "cpp",
    ext: ".cpp",
  },
  {
    id: "python",
    label: "Python 3",
    version: "3.12",
    icon: "🐍",
    monacoId: "python",
    ext: ".py",
  },
  {
    id: "java",
    label: "Java",
    version: "OpenJDK 21",
    icon: "☕",
    monacoId: "java",
    ext: ".java",
  },
  {
    id: "javascript",
    label: "JavaScript",
    version: "Node.js 20",
    icon: "🟨",
    monacoId: "javascript",
    ext: ".js",
  },
  {
    id: "c",
    label: "C",
    version: "GCC 9.2",
    icon: "⚡",
    monacoId: "c",
    ext: ".c",
  },
  {
    id: "go",
    label: "Go",
    version: "1.13",
    icon: "🐹",
    monacoId: "go",
    ext: ".go",
  },
  {
    id: "rust",
    label: "Rust",
    version: "1.40",
    icon: "🦀",
    monacoId: "rust",
    ext: ".rs",
  },
];

export const STATUS = {
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

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function submitCode(language, code, stdin) {
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
    throw new Error(`Submit failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.token) {
    throw new Error(`No token returned: ${JSON.stringify(data)}`);
  }
  return data.token;
}

export async function pollResult(token) {
  const url = `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,status,time,memory,message`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Poll failed (${res.status})`);
  }
  return await res.json();
}

export async function executeCode(language, code, stdin) {
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

  return {
    output: finalOutput,
    error: isError,
    time: timeStr,
    memory: memStr
  };
}
