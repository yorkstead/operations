import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "**/.next/**",
    ".open-next/**",
    "**/.open-next/**",
    ".wrangler/**",
    "**/.wrangler/**",
    ".vinext/**",
    "**/.vinext/**",
    "dist/**",
    "**/dist/**",
    ".netlify/**",
    "**/.netlify/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
