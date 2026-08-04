import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves the app from /<repo>/, so assets need that prefix.
// BASE_PATH is set by the Pages workflow; local dev keeps the root.
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  },
});
