import packageMetadata from "../../../package.json";

export const applicationMetadata = {
  service: "yorkstead-operations",
  version: process.env.APP_VERSION?.trim() || process.env.GIT_SHA?.trim() || packageMetadata.version,
} as const;
