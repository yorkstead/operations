import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { applicationSecurityHeaders } from "./lib/security-headers";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));
const nextConfig: NextConfig = {
  // Vercel's adapter packages functions; standalone output is for containers.
  output: process.env.VERCEL === "1" ? undefined : "standalone",
  outputFileTracingRoot: repositoryRoot,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: applicationSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
