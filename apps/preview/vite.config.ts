import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/ai-elements/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@repo/elements/": `${path.resolve(import.meta.dirname, "../../packages/elements/src")}/`,
      "@repo/shadcn-ui/": `${path.resolve(import.meta.dirname, "../../packages/shadcn-ui")}/`,
    },
  },
});
