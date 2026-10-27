/**
 * @file vitest.config.ts
 * @description Konfigurasi Vitest untuk unit test, integration test, dan coverage threshold.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/types.ts",
        "src/core/platform/types.ts",
        "src/**/*.test.ts",
        "src/__tests__/**",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
      },
    },
  },
});
