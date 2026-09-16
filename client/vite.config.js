import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("monaco-editor") ||
            id.includes("@monaco-editor/react")
          ) {
            return "monaco-editor";
          }

          if (id.includes("face-api.js")) {
            return "face-api";
          }

          if (id.includes("react-webcam")) {
            return "webcam";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
