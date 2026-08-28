import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applicationSecurityHeaders } from "./lib/security-headers";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  output: "standalone",
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

