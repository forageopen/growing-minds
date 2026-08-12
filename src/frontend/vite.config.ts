import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path matches the GitHub Pages project URL: forageopen.github.io/growing-minds/
export default defineConfig({
  plugins: [react()],
  base: "/growing-minds/",
  server: {
    port: 4174,
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
});
