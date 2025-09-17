import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    slowTestThreshold: 1200,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: true,
    testTimeout: 15000,
    exclude: [
      "tests-e2e/**",
      "node_modules/**",
      "dist/**",
      "playwright-report/**",
      "test-results/**",
    ],
    reporters: "default",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/app": path.resolve(__dirname, "./app"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/types": path.resolve(__dirname, "./types"),
    },
  },
});
