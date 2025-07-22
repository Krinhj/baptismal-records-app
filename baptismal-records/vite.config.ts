import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@tauri-apps/api": resolve(__dirname, "node_modules/@tauri-apps/api"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});