import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Deliberately plain. The original theme project was a Replit monorepo that required
// PORT/BASE_PATH env vars and pnpm "catalog:" deps. None of that belongs here.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: { gsap: ["gsap", "@gsap/react"], router: ["react-router-dom"] },
      },
    },
  },
});
