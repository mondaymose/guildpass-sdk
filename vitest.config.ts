import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["packages/*/tests/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      "@lumenpass/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@lumenpass/sdk": path.resolve(__dirname, "packages/sdk/src/index.ts"),
      "@guildpass/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@guildpass/sdk": path.resolve(__dirname, "packages/sdk/src/index.ts"),
    },
  },
});
