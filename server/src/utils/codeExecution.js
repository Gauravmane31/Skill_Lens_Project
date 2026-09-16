// ============================================================
// utils/codeExecution.js — Judge0 Code Execution Utilities
// Synchronous mode (wait=true) — no polling required
// ============================================================

import { wrapCodeForTesting } from './testRunner.js';

const JUDGE0_INSTANCES = [
  "https://ce.judge0.com",
  "https://judge0.sda1.net",
];

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
  { id: "cpp",        label: "C++",        version: "GCC 13",    icon: "⚡", monacoId: "cpp",        ext: ".cpp" },
  { id: "python",     label: "Python 3",   version: "3.12",      icon: "🐍", monacoId: "python",     ext: ".py"  },
  { id: "java",       label: "Java",       version: "OpenJDK 21",icon: "☕", monacoId: "java",       ext: ".java"},
  { id: "javascript", label: "JavaScript", version: "Node.js 20",icon: "🟨", monacoId: "javascript", ext: ".js"  },
  { id: "c",          label: "C",          version: "GCC 9.2",   icon: "⚡", monacoId: "c",          ext: ".c"   },
  { id: "go",         label: "Go",         version: "1.13",      icon: "🐹", monacoId: "go",         ext: ".go"  },
  { id: "rust",       label: "Rust",       version: "1.40",      icon: "🦀", monacoId: "rust",       ext: ".rs"  },
];

export const STATUS = {
  1:  { label: "Queued",                   error: false },
  2:  { label: "Processing",               error: false },
  3:  { label: "Accepted",                 error: false },
  4:  { label: "Wrong Answer",             error: true  },
  5:  { label: "Time Limit Exceeded",      error: true  },
  6:  { label: "Compilation Error",        error: true  },
  7:  { label: "Runtime Error (SIGSEGV)",  error: true  },
  8:  { label: "Runtime Error (SIGFPE)",   error: true  },
  9:  { label: "Runtime Error (SIGABRT)",  error: true  },
  10: { label: "Runtime Error (NZEC)",     error: true  },
  11: { label: "Runtime Error (Other)",    error: true  },
  12: { label: "Internal Error",           error: true  },
  13: { label: "Exec Format Error",        error: true  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Synchronous execution — result returned immediately ─────
export async function executeCode(language, code, stdin, challengeData = null) {
  const startTime = Date.now();

  // If challenge data is provided, wrap the code with test runner
  let finalCode = code;
  if (challengeData && challengeData.testCases) {
    try {
      finalCode = wrapCodeForTesting(language, code, null, challengeData.testCases);
    } catch (error) {
      console.warn('[TestRunner] Failed to wrap code:', error.message);
      // Fall back to original code if wrapping fails
    }
  }

  const body = {
    source_code: finalCode,
    language_id: LANGUAGE_IDS[language],
    stdin: stdin || "",
    cpu_time_limit: 10,
    memory_limit: 262144,
    wall_time_limit: 15,
  };

  let lastError = null;

  for (const baseUrl of JUDGE0_INSTANCES) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const url = `${baseUrl}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status,time,memory,message`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const text = await res.text();
          lastError = `${baseUrl} returned ${res.status}: ${text}`;
          console.warn(`[Judge0] ${lastError}`);
          if (attempt < 2) await sleep(1500);
          continue;
        }

        const result = await res.json();
        console.log(`[Judge0] Success via ${baseUrl} | ${result.status?.description}`);

        const statusId = result.status?.id;
        const status = STATUS[statusId];
        let finalOutput = "";
        let isError = false;

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

        return {
          output: finalOutput,
          error: isError,
          time: result.time ? `${result.time}s` : `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
          memory: result.memory ? `${(result.memory / 1024).toFixed(1)}MB` : "—",
        };

      } catch (err) {
        lastError = err.message;
        console.warn(`[Judge0] ${baseUrl} attempt ${attempt} error:`, err.message);
        if (attempt < 2) await sleep(1500);
      }
    }
  }

  return {
    output: `Error: All Judge0 instances unavailable — ${lastError}`,
    error: true,
    time: "0s",
    memory: "—",
  };
}
