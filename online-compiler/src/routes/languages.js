// ============================================================
// routes/languages.js — GET /api/languages
// Returns metadata about supported languages
// ============================================================
import { Router } from "express";

const router = Router();

const LANGUAGES = [
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

router.get("/", (_req, res) => {
  res.json({ languages: LANGUAGES });
});

export default router;
